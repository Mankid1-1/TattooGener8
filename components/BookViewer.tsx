

import React, { useState } from 'react';
import { DesignData, AppTier, PaperSize, BodyPlacement, ProjectMode } from '../types';
import { Printer, Download, RefreshCw, Edit3, X, ZoomIn, Lock, Layers, Palette, FileSignature, Info } from 'lucide-react';
import { CreativeEditor } from './CreativeEditor';
import { PlacementCanvas } from './PlacementCanvas';
import { ClientWaiverModal } from './ClientWaiverModal';
import { Tooltip } from './Tooltip';
import { DesignGridItem } from './DesignGridItem';
import { escapeHtml } from '../utils/security';

interface DesignViewerProps {
  designs: DesignData[];
  concept: string;
  tier: AppTier;
  paperSize: PaperSize;
  mode: ProjectMode;
  placement: BodyPlacement;
  onRegeneratePage: (id: string) => void;
  onUpdatePage: (id: string, newUrl: string) => void;
  onUpgrade: () => void;
}

export const BookViewer: React.FC<DesignViewerProps> = ({ 
  designs, concept, tier, paperSize, mode, placement, onRegeneratePage, onUpdatePage, onUpgrade 
}) => {
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isWaiverOpen, setIsWaiverOpen] = useState(false);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const focusedDesign = designs.find(p => p.id === focusedId);

  const handleSelectDesign = React.useCallback((id: string) => {
    setFocusedId(id);
  }, []);

  const handlePrint = (design?: DesignData) => {
    // Before printing, check if waiver is signed? 
    // In this app, we just allow printing, but maybe we should show a warning.
    const list = design ? [design] : designs;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${escapeHtml(concept)} - Tattoo Flash</title>
          <style>
            @media print {
               @page { size: ${paperSize.toLowerCase()}; margin: 0; }
               body { margin: 0; padding: 0; font-family: 'Courier New', monospace; }
               .page { width: 100vw; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; page-break-after: always; }
               img { max-width: 80%; max-height: 80%; object-fit: contain; filter: grayscale(100%) contrast(150%); }
               .meta { margin-top: 20px; font-size: 12px; border-top: 1px solid #000; padding-top: 10px; }
            }
            body { background: #fff; color: #000; text-align: center; }
            .no-print { padding: 20px; background: #000; color: #fff; margin-bottom: 20px; }
            .page { border: 1px solid #eee; margin: 20px auto; width: ${paperSize === PaperSize.A4 ? '210mm' : '8.5in'}; height: ${paperSize === PaperSize.A4 ? '297mm' : '11in'}; display: flex; align-items: center; justify-content: center; flex-direction: column; }
            img { max-width: 90%; max-height: 85%; }
          </style>
        </head>
        <body>
          <div class="no-print">
            <h1>TATTOO STENCIL READY</h1>
            <p>Print scale set to ${paperSize}. Contrast boosted for transfer.</p>
          </div>
          ${list.map(p => `
            <div class="page">
              <img src="${p.modifiedUrl || p.originalUrl}" />
              <div class="meta">
                 TATTOOCRATE REF: ${p.id} | CONCEPT: ${escapeHtml(concept.toUpperCase())}
              </div>
            </div>
          `).join('')}
          <script>window.onload = () => setTimeout(() => window.print(), 500)</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = (design: DesignData) => {
    const link = document.createElement('a');
    link.href = design.modifiedUrl || design.originalUrl;
    link.download = `TattooCrate-${concept.replace(/\s+/g, '-')}-${design.id}.png`;
    link.click();
  };

  const handleRegenerateClick = async (id: string) => {
      setRegeneratingId(id);
      await onRegeneratePage(id);
      setRegeneratingId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header Toolbar */}
      <div className="bg-ink-800 rounded-xl shadow-lg border border-ink-700 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
           <h2 className="text-xl font-display font-bold text-white uppercase tracking-wider">{concept}</h2>
           <p className="text-xs text-ink-400 font-mono">
               {mode === ProjectMode.PROJECT ? 'SLEEVE PROJECT' : 'SINGLE SESSION'} • {designs.length} ELEMENTS
           </p>
        </div>
        <div className="flex gap-2">
            <Tooltip content="Sign Client Intake Form">
              <button 
                onClick={() => setIsWaiverOpen(true)}
                className="flex items-center gap-2 bg-ink-900 text-ink-300 hover:text-white px-4 py-3 rounded-lg font-bold border border-ink-700 hover:border-ink-500 transition-colors"
              >
                <FileSignature className="w-4 h-4" />
                <span className="hidden md:inline">INTAKE FORM</span>
              </button>
            </Tooltip>

            {mode === ProjectMode.PROJECT && (
                <Tooltip content="Open Sleeve Builder">
                <button 
                    onClick={() => setIsBuilderOpen(true)}
                    className="flex items-center gap-2 bg-accent-gold text-black px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-yellow-400 transition-colors"
                >
                    <Palette className="w-4 h-4" />
                    <span>BUILD SLEEVE</span>
                </button>
                </Tooltip>
            )}
            
            <Tooltip content="Print Flash Sheet">
              <button 
                 onClick={() => handlePrint()}
                 className={`flex items-center gap-2 bg-ink-950 text-white px-6 py-3 rounded-lg font-bold border border-ink-700 hover:border-accent-gold transition-colors ${mode === ProjectMode.PROJECT ? 'hidden md:flex' : ''}`}
              >
                 <Layers className="w-4 h-4 text-accent-gold" />
                 <span>PRINT FLASH</span>
              </button>
            </Tooltip>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {designs.map((design, idx) => (
          <DesignGridItem
            key={design.id}
            design={design}
            index={idx}
            onSelect={handleSelectDesign}
          />
        ))}
      </div>

      {/* Focus Modal */}
      {focusedDesign && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
            <div className="relative w-full max-w-6xl h-full flex flex-col md:flex-row gap-6 items-center justify-center">
                
                {/* Close Button */}
                <Tooltip content="Close" position="bottom" className="absolute top-0 right-0 md:-top-4 md:-right-4 z-50">
                  <button 
                      onClick={() => setFocusedId(null)}
                      className="p-2 bg-white/10 text-white hover:bg-white/20 rounded-full transition-colors"
                  >
                      <X className="w-6 h-6" />
                  </button>
                </Tooltip>

                {/* Main Image */}
                <div className="flex-1 w-full h-full flex items-center justify-center relative">
                    <img 
                        src={focusedDesign.modifiedUrl || focusedDesign.originalUrl} 
                        className={`max-w-full max-h-full object-contain rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.5)] ${regeneratingId === focusedDesign.id ? 'opacity-50 blur-sm' : ''}`}
                    />
                    {regeneratingId === focusedDesign.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-accent-gold border-t-transparent"></div>
                        </div>
                    )}
                </div>

                {/* Sidebar Controls */}
                <div className="w-full md:w-80 bg-ink-900 border border-ink-700 rounded-xl p-6 flex flex-col gap-4 text-white overflow-y-auto">
                    <h3 className="font-display font-bold text-xl mb-2 text-accent-gold">DESIGN CONTROLS</h3>
                    
                    <Tooltip content={tier === AppTier.FREE ? "Unlock Pro to customize" : "Add details, text, or extra motifs"}>
                      <button 
                          onClick={() => {
                              if (tier === AppTier.FREE) {
                                  onUpgrade();
                              } else {
                                  setIsEditorOpen(true);
                              }
                          }}
                          className="w-full py-4 bg-ink-800 border border-ink-600 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-ink-700 hover:border-accent-gold transition-all"
                      >
                          <Edit3 className="w-4 h-4 text-accent-gold" />
                          OPEN EDITOR
                          {tier === AppTier.FREE && <Lock className="w-3 h-3 ml-2 text-ink-500" />}
                      </button>
                    </Tooltip>

                    <Tooltip content="Generate a new variation">
                      <button 
                          onClick={() => handleRegenerateClick(focusedDesign.id)}
                          disabled={!!regeneratingId}
                          className="w-full py-4 bg-transparent border border-ink-700 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-ink-800 transition-colors"
                      >
                          <RefreshCw className={`w-4 h-4 ${regeneratingId ? 'animate-spin' : ''}`} />
                          RE-ROLL DESIGN
                      </button>
                    </Tooltip>

                    <div className="h-px bg-ink-800 my-2"></div>

                    <Tooltip content="Print single stencil">
                      <button 
                          onClick={() => handlePrint(focusedDesign)}
                          className="w-full py-3 bg-accent-gold text-black rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-yellow-400 transition-colors"
                      >
                          <Printer className="w-4 h-4" />
                          PRINT STENCIL
                      </button>
                    </Tooltip>

                    <Tooltip content="Save High-Res PNG">
                      <button 
                          onClick={() => handleDownload(focusedDesign)}
                          className="w-full py-3 bg-white/10 text-white rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
                      >
                          <Download className="w-4 h-4" />
                          DOWNLOAD
                      </button>
                    </Tooltip>

                    {focusedDesign.fullPrompt && (
                        <div className="mt-4 pt-4 border-t border-ink-800">
                           <div className="flex items-center gap-2 mb-2 text-ink-500 text-[10px] uppercase font-bold tracking-wider">
                              <Info className="w-3 h-3" /> Generator Prompt
                           </div>
                           <div className="bg-ink-950 rounded p-3 text-[10px] font-mono text-ink-400 leading-relaxed border border-ink-800 max-h-32 overflow-y-auto custom-scrollbar select-text">
                              {focusedDesign.fullPrompt}
                           </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Editor Overlay */}
      {isEditorOpen && focusedDesign && (
          <CreativeEditor 
            pageId={focusedDesign.id}
            baseImage={focusedDesign.modifiedUrl || focusedDesign.originalUrl}
            onClose={() => setIsEditorOpen(false)}
            onSave={(newUrl) => {
                onUpdatePage(focusedDesign.id, newUrl);
                setIsEditorOpen(false);
            }}
          />
      )}

      {/* Sleeve Builder Overlay */}
      {isBuilderOpen && mode === ProjectMode.PROJECT && (
          <PlacementCanvas 
            placement={placement}
            availableDesigns={designs}
            onSave={(layers) => {
                alert("Sleeve saved to project file.");
                setIsBuilderOpen(false);
            }}
            onClose={() => setIsBuilderOpen(false)}
          />
      )}

      {/* Intake Waiver Overlay */}
      {isWaiverOpen && (
          <ClientWaiverModal 
             onSign={(waiver) => {
                 console.log("Waiver Signed:", waiver);
                 setIsWaiverOpen(false);
                 alert(`Waiver signed by ${waiver.clientName}`);
             }}
             onClose={() => setIsWaiverOpen(false)}
          />
      )}
    </div>
  );
};