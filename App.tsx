
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BodyPlacement, AppTier, TattooStyle, CollectionSize, DesignData, PortfolioState, AppView, AppSettings, PaperSize, ProjectMode, ClientWaiver } from './types';
import { generateTattooDesign } from './services/geminiService';
import { purchaseSubscription, restorePurchases, setPurchaseFlag } from './services/storeService';
import { LoadingOverlay } from './components/LoadingOverlay';
import { UpgradeModal } from './components/UpgradeModal';
import { GeneratorForm } from './components/GeneratorForm';
import { Tooltip } from './components/Tooltip';
import { Settings as SettingsIcon, Home, Zap } from 'lucide-react';

// Lazy load heavy views to improve initial load performance
const BookViewer = React.lazy(() => import('./components/BookViewer').then(module => ({ default: module.BookViewer })));
const SettingsView = React.lazy(() => import('./components/SettingsView').then(module => ({ default: module.SettingsView })));

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

  // Ref to hold latest state for emergency save on close
  const portfolioStateRef = useRef(portfolioState);
  useEffect(() => {
      portfolioStateRef.current = portfolioState;
  }, [portfolioState]);

  // Save on unload to prevent data loss from debounce delay
  useEffect(() => {
      const handleBeforeUnload = () => {
          if (portfolioStateRef.current.designs.length > 0) {
 palette-a11y-fix-app-6281512874906153979
             try {
                localStorage.setItem('tc_portfolio_state', JSON.stringify(portfolioStateRef.current));
             } catch (e) {
                console.error("Failed to save on unload", e);
             }

             localStorage.setItem('tc_portfolio_state', JSON.stringify(portfolioStateRef.current));
 palette-skip-link-nav-16199029736191852184

 sentinel/input-validation-fix-10639127908878875387
 main
          }
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const lastQuotaAlert = useRef(0);

  useEffect(() => {
      if (portfolioState.designs.length > 0) {
          try {
            localStorage.setItem('tc_portfolio_state', JSON.stringify(portfolioState));
          } catch (e: any) {
            if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                console.warn("Storage quota exceeded. Attempting to trim old data.");

                // Iteratively remove oldest designs until it fits
                let trimmedDesigns = [...portfolioState.designs];
                let saved = false;

                while (trimmedDesigns.length > 0 && !saved) {
                    trimmedDesigns.shift(); // Remove oldest
                    const newState = { ...portfolioState, designs: trimmedDesigns };
                    try {
                        localStorage.setItem('tc_portfolio_state', JSON.stringify(newState));
                        saved = true;

                        // Update state to match persistence so we don't try saving the big one again next render
                        setPortfolioState(newState);

                        // Throttle alert to avoid spamming
                        const now = Date.now();
                        if (now - lastQuotaAlert.current > 30000) {
                            alert("Storage limit reached. Oldest designs were automatically removed to make space.");
                            lastQuotaAlert.current = now;
                        }
                    } catch (retryError) {
                        // Continue loop
                    }
                }

                if (!saved && trimmedDesigns.length === 0) {
                     console.error("Storage full. Could not save even after clearing designs.");
                     // This implies other keys are taking up all space or quota is 0.
                     const now = Date.now();
                     if (now - lastQuotaAlert.current > 30000) {
                         alert("Storage completely full. Unable to save your work.");
                         lastQuotaAlert.current = now;
                     }
                }
            } else {
                console.error("Failed to save portfolio:", e);
            }
 palette-skip-link-nav-16199029736191852184
          }
      }
  }, [portfolioState]); // Added dependency to trigger the quota check/save


 main
 main
          }
      }
  }, [portfolioState]); // Added dependency to trigger on change

  const lastQuotaAlert = useRef(0);

  const lastQuotaAlert = useRef(0);
 main

  useEffect(() => {
      // Debounce persistence to prevent blocking main thread with heavy JSON serialization
      // during rapid state updates (e.g. generating multiple designs).
      // Note: The immediate save above handles quota errors more robustly,
      // but this debounce handles the "happy path" performance.
      // However, having both might be redundant or conflicting if not careful.
      // The block above seems to be intended as the MAIN save logic but is inside useEffect without debounce?
      // Wait, the original code had a debounce useEffect AND the quota logic.
      // Let's look at the original structure in memory/context.
      // The quota logic was likely the intended replacement or enhancement for the simple debounce.
      const timeoutId = setTimeout(() => {
          if (portfolioState.designs.length > 0) {
              try {
                localStorage.setItem('tc_portfolio_state', JSON.stringify(portfolioState));
              } catch (e: any) {
                if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    console.warn("Storage quota exceeded. Attempting to trim old data.");

                    // Iteratively remove oldest designs until it fits
                    let trimmedDesigns = [...portfolioState.designs];
                    let saved = false;

                    while (trimmedDesigns.length > 0 && !saved) {
                        trimmedDesigns.shift(); // Remove oldest
                        const newState = { ...portfolioState, designs: trimmedDesigns };
                        try {
                            localStorage.setItem('tc_portfolio_state', JSON.stringify(newState));
                            saved = true;

                            // Update state to match persistence so we don't try saving the big one again next render
                            setPortfolioState(newState);

                            // Throttle alert to avoid spamming
                            const now = Date.now();
                            if (now - lastQuotaAlert.current > 30000) {
                                alert("Storage limit reached. Oldest designs were automatically removed to make space.");
                                lastQuotaAlert.current = now;
                            }
                        } catch (retryError) {
                            // Continue loop
                        }
                    }

                    if (!saved && trimmedDesigns.length === 0) {
 palette-a11y-fix-app-6281512874906153979
                        console.error("Storage full. Could not save even after clearing designs.");
                        // This implies other keys are taking up all space or quota is 0.
                        const now = Date.now();
                        if (now - lastQuotaAlert.current > 30000) {
                            alert("Storage completely full. Unable to save your work.");
                            lastQuotaAlert.current = now;
                        }

                         console.error("Storage full. Could not save even after clearing designs.");
                         // This implies other keys are taking up all space or quota is 0.
                         const now = Date.now();
                         if (now - lastQuotaAlert.current > 30000) {
                             alert("Storage completely full. Unable to save your work.");
                             lastQuotaAlert.current = now;
                         }
 main
                    }
                } else {
                    console.error("Failed to save portfolio:", e);
                }
              }
          }
      }, 1000);

      // For now, I will keep the quota logic as the primary saver since it handles errors.
      // I will REMOVE the simple debounce useEffect to avoid double saving/race conditions.

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

  const handleGenerate = useCallback(async (concept: string, placement: BodyPlacement, style: TattooStyle, size: number, mode: ProjectMode) => {
    if (tier === AppTier.FREE && size > 1) {
        setShowUpgradeModal(true);
        return;
    }

    setLoading(true);
    // Initialize loading progress
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
    let permissionDenied = false;

    // Helper to generate a single item.
    // NOTE: generateTattooDesign handles rate limiting internally using variationIndex * delay
    const generateItem = async (i: number) => {
        if (permissionDenied) return;

        try {
            const result = await generateTattooDesign({
                concept,
                placement,
                style,
                tier,
                variationIndex: i,
                isProjectItem: mode === ProjectMode.PROJECT
            });

            if (permissionDenied) return;

            const design: DesignData = {
                id: Date.now().toString() + i,
                originalUrl: result.imageUrl,
                modifiedUrl: null,
                promptUsed: concept,
                fullPrompt: result.prompt,
                placement: placement,
                createdAt: Date.now()
            };
            
            // Functional update handles concurrency safely
            setPortfolioState(prev => ({ ...prev, designs: [...prev.designs, design] }));
            successCount++;

            if (size > 1) {
                setLoadingProgress(prev => prev ? { ...prev, current: prev.current + 1 } : undefined);
            }

        } catch (err: any) {
            console.error(`Failed to generate item ${i+1}:`, err);
            
            if (err.message === "PERMISSION_DENIED") {
                if (!permissionDenied) {
                    permissionDenied = true;
                    setLoading(false);
                    setLoadingProgress(undefined);
                    if (window.aistudio && window.aistudio.openSelectKey) {
                        await window.aistudio.openSelectKey();
                        alert("API Key updated. Please try again!");
                    } else {
                        alert("Access Denied. Please check your API Key settings.");
                    }
                }
                return;
            }
            // Continue loop/promises for other errors (like transient server errors)
        }
    };

    // Execute requests in parallel.
    // The internal delay in generateTattooDesign ensures we respect rate limits.
    const promises = [];
    for (let i = 0; i < size; i++) {
        promises.push(generateItem(i));
    }

    await Promise.all(promises);

    if (permissionDenied) return;

    setLoading(false);
    setLoadingProgress(undefined);

    if (successCount === 0 && size > 0) {
        alert("Could not generate designs. Please try a different concept or check your connection.");
    }
  }, [tier]);

  const handleRegenerateSinglePage = useCallback(async (pageId: string) => {
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
  }, [portfolioState.designs, portfolioState.concept, portfolioState.placement, portfolioState.style, portfolioState.mode, tier]);

  const handleUpdatePage = useCallback((pageId: string, newUrl: string) => {
      setPortfolioState(prev => ({
          ...prev,
          designs: prev.designs.map(p => p.id === pageId ? { ...p, modifiedUrl: newUrl } : p)
      }));
  }, []);

  const handleWaiverUpdate = useCallback((waiver: ClientWaiver) => {
      setPortfolioState(prev => ({ ...prev, waiver }));
  }, []);

  const handleShowUpgrade = useCallback(() => setShowUpgradeModal(true), []);

  return (
    <div className="min-h-screen font-sans bg-ink-900 text-ink-50 selection:bg-accent-gold selection:text-black pb-20 md:pb-0">
      
      {/* Skip to Content */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-accent-gold focus:text-black focus:font-bold focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white">
          Skip to content
      </a>

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-ink-950/80 backdrop-blur-lg border-b border-ink-800 safe-top">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Tooltip content="Reset Studio" position="bottom">
                  <button type="button" aria-label="Reset Studio" className="flex items-center gap-2 cursor-pointer group" onClick={handleReset}>
                      <div className="w-8 h-8 bg-accent-gold text-black rounded flex items-center justify-center shadow-lg shadow-accent-gold/20 transform group-hover:rotate-180 transition-transform duration-500">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </div>
                      <span className="font-display font-black text-xl tracking-wider text-white hidden md:block">TATTOO<span className="text-accent-gold">CRATE</span></span>
                  </button>
              </Tooltip>
              
              <div className="hidden md:flex bg-ink-900 rounded border border-ink-800 p-0.5">
                 <button 
                   onClick={() => setView('home')}
                   aria-current={view === 'home' ? 'page' : undefined}
                   className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all uppercase tracking-wide ${view === 'home' ? 'bg-ink-800 text-white shadow-sm' : 'text-ink-500 hover:text-white'}`}
                 >
                    <Home className="w-3 h-3" /> Studio
                 </button>
                 <button 
                   onClick={() => setView('settings')}
                   aria-current={view === 'settings' ? 'page' : undefined}
                   className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 transition-all uppercase tracking-wide ${view === 'settings' ? 'bg-ink-800 text-white shadow-sm' : 'text-ink-500 hover:text-white'}`}
                 >
                    <SettingsIcon className="w-3 h-3" /> Settings
                 </button>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setView(view === 'home' ? 'settings' : 'home')}
                aria-label={view === 'home' ? "Open Settings" : "Open Studio"}
                className="md:hidden p-2 text-ink-400 hover:bg-ink-800 rounded-full"
              >
                  {view === 'home' ? <SettingsIcon className="w-5 h-5" /> : <Home className="w-5 h-5" />}
              </button>

              <button 
                  onClick={() => tier === AppTier.FREE && setShowUpgradeModal(true)}
                  aria-label="Upgrade to Pro"
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
      <main id="main-content" className="max-w-7xl mx-auto px-4 py-8 md:py-12 space-y-16" tabIndex={-1}>
        
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
                    onUpgrade={handleShowUpgrade}
                />
            </div>

            {/* Results */}
            {portfolioState.designs.length > 0 && (
                <div className="border-t border-ink-800 pt-16">
                    <React.Suspense fallback={<div className="h-96 flex items-center justify-center text-accent-gold animate-pulse">Loading Studio...</div>}>
                        <BookViewer
                            designs={portfolioState.designs}
                            concept={portfolioState.concept}
                            tier={tier}
                            paperSize={appSettings.paperSize}
                            mode={portfolioState.mode}
                            placement={portfolioState.placement}
                            waiver={portfolioState.waiver}
                            onRegeneratePage={handleRegenerateSinglePage}
                            onUpdatePage={handleUpdatePage}
                            onUpgrade={() => setShowUpgradeModal(true)}
                            onWaiverUpdate={handleWaiverUpdate}
                        />
                    </React.Suspense>
                </div>
            )}
          </>
        ) : (
          <React.Suspense fallback={<div className="h-96 flex items-center justify-center text-accent-gold animate-pulse">Loading Settings...</div>}>
            <SettingsView
                settings={appSettings}
                onUpdateSettings={setAppSettings}
                tier={tier}
                onResetApp={handleFullReset}
                onRestorePurchases={handleRestore}
            />
          </React.Suspense>
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
