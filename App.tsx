

import React, { useState, useEffect } from 'react';
import { BodyPlacement, AppTier, TattooStyle, CollectionSize, DesignData, PortfolioState, AppView, AppSettings, PaperSize, ProjectMode } from './types';
import { generateTattooDesign } from './services/geminiService';
import { purchaseSubscription, restorePurchases, setPurchaseFlag } from './services/storeService';
import { LoadingOverlay } from './components/LoadingOverlay';
import { UpgradeModal } from './components/UpgradeModal';
import { GeneratorForm } from './components/GeneratorForm';
import { BookViewer } from './components/BookViewer';
import { Tooltip } from './components/Tooltip';
import { SettingsView } from './components/SettingsView';
import { Settings as SettingsIcon, Home, Zap } from 'lucide-react';

const App: React.FC = () => {
  // Global State
  const [tier, setTier] = useState<AppTier>(AppTier.FREE);
  const [view, setView] = useState<AppView>('home');
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<{current: number, total: number} | undefined>(undefined);
  
  // Settings State
  const [appSettings, setAppSettings] = useState<AppSettings>({
    paperSize: PaperSize.A4,
    defaultPlacement: BodyPlacement.PAPER
  });

  // Portfolio Data
  const [portfolioState, setPortfolioState] = useState<PortfolioState>({
      concept: '',
      placement: BodyPlacement.PAPER,
      style: TattooStyle.TRADITIONAL,
      designs: [],
      lastUpdated: 0,
      mode: ProjectMode.SINGLE,
      projectLayers: []
  });

  // UI
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Load persistence
  useEffect(() => {
      const savedPortfolio = localStorage.getItem('tc_portfolio_state');
      if (savedPortfolio) {
          try {
              setPortfolioState(JSON.parse(savedPortfolio));
          } catch (e) { console.error("Failed to load portfolio"); }
      }

      const savedSettings = localStorage.getItem('tc_app_settings');
      if (savedSettings) {
          try {
              setAppSettings(JSON.parse(savedSettings));
          } catch(e) { console.error("Failed to load settings"); }
      }

      const hasPurchased = localStorage.getItem('tc_has_purchased') === 'true';
      if (hasPurchased) setTier(AppTier.PRO);

      checkApiKey();
  }, []);

  const checkApiKey = async () => {
    if (window.aistudio && window.aistudio.hasSelectedApiKey) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      if (!hasKey) console.log("No API Key selected yet.");
    }
  };

  useEffect(() => {
      if (portfolioState.designs.length > 0) {
          try {
            localStorage.setItem('tc_portfolio_state', JSON.stringify(portfolioState));
          } catch (e) {
            console.error("Storage full or quota exceeded", e);
            // Optional: alert user or trim old data
          }
      }
  }, [portfolioState]);

  useEffect(() => {
      localStorage.setItem('tc_app_settings', JSON.stringify(appSettings));
  }, [appSettings]);

  // --- Actions ---

  const handleReset = () => {
    localStorage.removeItem('tc_portfolio_state');
    setPortfolioState({
        concept: '',
        placement: appSettings.defaultPlacement,
        style: TattooStyle.TRADITIONAL,
        designs: [],
        lastUpdated: 0,
        mode: ProjectMode.SINGLE,
        projectLayers: []
    });
    setView('home');
  };

  const handleFullReset = () => {
    localStorage.clear();
    // Soft reset state instead of hard reload to avoid 404s in some environments
    setTier(AppTier.FREE);
    handleReset();
  };

  const handleUpgrade = async () => {
      await purchaseSubscription();
      setPurchaseFlag();
      setTier(AppTier.PRO);
  };

  const handleRestore = async () => {
      const restoredTier = await restorePurchases();
      if (restoredTier === AppTier.PRO) {
          setTier(AppTier.PRO);
          alert("License restored.");
      } else {
          alert("No previous license found.");
      }
  };

  const handleGenerate = async (concept: string, placement: BodyPlacement, style: TattooStyle, size: number, mode: ProjectMode) => {
    if (tier === AppTier.FREE && size > 1) {
        setShowUpgradeModal(true);
        return;
    }

    setLoading(true);
    setLoadingProgress(size > 1 ? { current: 0, total: size } : undefined);
    
    // If starting a new project or switching concepts, reset logic can be here. 
    // For now we overwrite to ensure clean state.
    setPortfolioState({ 
        concept, placement, style, 
        designs: [], 
        lastUpdated: Date.now(),
        mode,
        projectLayers: []
    });

    let successCount = 0;

    for (let i = 0; i < size; i++) {
        if (size > 1) setLoadingProgress({ current: i + 1, total: size });
        
        try {
            const result = await generateTattooDesign({
                concept,
                placement,
                style,
                tier,
                variationIndex: i,
                isProjectItem: mode === ProjectMode.PROJECT
            });

            const design: DesignData = {
                id: Date.now().toString() + i,
                originalUrl: result.imageUrl,
                modifiedUrl: null,
                promptUsed: concept,
                fullPrompt: result.prompt,
                placement: placement,
                createdAt: Date.now()
            };
            
            setPortfolioState(prev => ({ ...prev, designs: [...prev.designs, design] }));
            successCount++;

        } catch (err: any) {
            console.error(`Failed to generate item ${i+1}:`, err);
            
            if (err.message === "PERMISSION_DENIED") {
                setLoading(false);
                setLoadingProgress(undefined);
                if (window.aistudio && window.aistudio.openSelectKey) {
                    await window.aistudio.openSelectKey();
                    alert("API Key updated. Please try again!");
                } else {
                    alert("Access Denied. Please check your API Key settings.");
                }
                return; // Stop completely on permission error
            }
            // Continue loop for other errors (like transient server errors)
        }
    }

    setLoading(false);
    setLoadingProgress(undefined);

    if (successCount === 0 && size > 0) {
        alert("Could not generate designs. Please try a different concept or check your connection.");
    }
  };

  const handleRegenerateSinglePage = async (pageId: string) => {
      const pageIndex = portfolioState.designs.findIndex(p => p.id === pageId);
      if (pageIndex === -1) return;

      try {
          const result = await generateTattooDesign({
              concept: portfolioState.concept,
              placement: portfolioState.placement,
              style: portfolioState.style,
              tier,
              variationIndex: Math.floor(Math.random() * 1000),
              isProjectItem: portfolioState.mode === ProjectMode.PROJECT
          });

          setPortfolioState(prev => {
              const newPages = [...prev.designs];
              newPages[pageIndex] = {
                  ...newPages[pageIndex],
                  originalUrl: result.imageUrl,
                  modifiedUrl: null,
                  fullPrompt: result.prompt
              };
              return { ...prev, designs: newPages };
          });
      } catch (e: any) {
          if (e.message === "PERMISSION_DENIED") {
             if (window.aistudio && window.aistudio.openSelectKey) await window.aistudio.openSelectKey();
          }
          console.error("Failed to regenerate", e);
          alert("Failed to regenerate design.");
      }
  };

  const handleUpdatePage = (pageId: string, newUrl: string) => {
      setPortfolioState(prev => ({
          ...prev,
          designs: prev.designs.map(p => p.id === pageId ? { ...p, modifiedUrl: newUrl } : p)
      }));
  };

  return (
    <div className="min-h-screen font-sans bg-ink-900 text-ink-50 selection:bg-accent-gold selection:text-black pb-20 md:pb-0">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-ink-950/80 backdrop-blur-lg border-b border-ink-800 safe-top">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Tooltip content="Reset Studio" position="bottom">
                  <button type="button" className="flex items-center gap-2 cursor-pointer group" onClick={handleReset}>
                      <div className="w-8 h-8 bg-accent-gold text-black rounded flex items-center justify-center shadow-lg shadow-accent-gold/20 transform group-hover:rotate-180 transition-transform duration-500">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </div>
                      <span className="font-display font-black text-xl tracking-wider text-white hidden md:block">TATTOO<span className="text-accent-gold">CRATE</span></span>
                  </button>
              </Tooltip>
              
              <div className="hidden md:flex bg-ink-900 rounded border border-ink-800 p-0.5">
                 <button 
                   onClick={() => setView('home')}
                   className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all uppercase tracking-wide ${view === 'home' ? 'bg-ink-800 text-white shadow-sm' : 'text-ink-500 hover:text-white'}`}
                 >
                    <Home className="w-3 h-3" /> Studio
                 </button>
                 <button 
                   onClick={() => setView('settings')}
                   className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all uppercase tracking-wide ${view === 'settings' ? 'bg-ink-800 text-white shadow-sm' : 'text-ink-500 hover:text-white'}`}
                 >
                    <SettingsIcon className="w-3 h-3" /> Settings
                 </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setView(view === 'home' ? 'settings' : 'home')}
                className="md:hidden p-2 text-ink-400 hover:bg-ink-800 rounded-full"
              >
                  {view === 'home' ? <SettingsIcon className="w-5 h-5" /> : <Home className="w-5 h-5" />}
              </button>

              <button 
                  onClick={() => tier === AppTier.FREE && setShowUpgradeModal(true)}
                  className={`px-4 py-2 rounded font-bold text-xs transition-all transform hover:scale-105 active:scale-95 uppercase tracking-widest ${
                      tier === AppTier.PRO 
                      ? 'bg-ink-800 text-accent-gold border border-accent-gold/50 cursor-default'
                      : 'bg-accent-gold text-black hover:bg-yellow-400 shadow-lg shadow-accent-gold/20'
                  }`}
              >
                  {tier === AppTier.PRO ? 'PRO ARTIST' : 'GO PRO'}
              </button>
            </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-16">
        
        {view === 'home' ? (
          <>
            {/* Intro Hero */}
            {portfolioState.designs.length === 0 && (
                <div className="text-center space-y-6 max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-700 mt-8 md:mt-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-ink-700 bg-ink-800/50 text-accent-gold text-[10px] font-bold uppercase tracking-widest mb-4">
                        <span>AI POWERED INK DESIGNER</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-display font-black text-white tracking-tight leading-none">
                        DESIGN YOUR <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-accent-gold to-yellow-600">NEXT TATTOO</span>
                    </h1>
                    <p className="text-lg text-ink-400 font-light max-w-xl mx-auto">
                        Generate professional flash sheets, visualize ink on body parts, and create custom stencils in seconds.
                    </p>
                </div>
            )}

            {/* Generator Form */}
            <div id="generator" className="max-w-4xl mx-auto">
                <GeneratorForm 
                    onGenerate={handleGenerate} 
                    isLoading={loading}
                    tier={tier}
                    onUpgrade={() => setShowUpgradeModal(true)}
                />
            </div>

            {/* Results */}
            {portfolioState.designs.length > 0 && (
                <div className="border-t border-ink-800 pt-16">
                    <BookViewer 
                        designs={portfolioState.designs}
                        concept={portfolioState.concept}
                        tier={tier}
                        paperSize={appSettings.paperSize}
                        mode={portfolioState.mode}
                        placement={portfolioState.placement}
                        onRegeneratePage={handleRegenerateSinglePage}
                        onUpdatePage={handleUpdatePage}
                        onUpgrade={() => setShowUpgradeModal(true)}
                    />
                </div>
            )}
          </>
        ) : (
          <SettingsView 
            settings={appSettings} 
            onUpdateSettings={setAppSettings}
            tier={tier}
            onResetApp={handleFullReset}
            onRestorePurchases={handleRestore}
          />
        )}

      </main>

      {/* Overlays */}
      {loading && <LoadingOverlay current={loadingProgress?.current} total={loadingProgress?.total} />}
      
      <UpgradeModal 
        isOpen={showUpgradeModal} 
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
        onRestore={handleRestore}
      />
    </div>
  );
};

export default App;