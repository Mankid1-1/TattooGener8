
import React, { useState } from 'react';
import { BodyPlacement, AppTier, TattooStyle, CollectionSize, ProjectMode } from '../types';
import { Sparkles, Zap, Lock, Layers, Palette } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface GeneratorFormProps {
  onGenerate: (concept: string, placement: BodyPlacement, style: TattooStyle, size: number, mode: ProjectMode) => void;
  isLoading: boolean;
  tier: AppTier;
  onUpgrade: () => void;
}

const INSPIRATION_PROMPTS = [
  { emoji: '💀', text: 'Geometric Skull & Roses' },
  { emoji: '🐉', text: 'Japanese Dragon Sleeve' },
  { emoji: '⚓', text: 'Traditional Anchor & Swallow' },
  { emoji: '🐺', text: 'Realistic Wolf in Forest' },
  { emoji: '🗡️', text: 'Dagger through Heart' },
  { emoji: '👁️', text: 'Abstract Cyberpunk Eye' },
];

const PLACEMENT_ICONS: Record<BodyPlacement, string> = {
  [BodyPlacement.PAPER]: '📄',
  [BodyPlacement.ARM]: '💪',
  [BodyPlacement.LEG]: '🦵',
  [BodyPlacement.BACK]: '🔙',
  [BodyPlacement.CHEST]: '👕',
  [BodyPlacement.HAND]: '✋',
  [BodyPlacement.NECK]: '👤',
};

export const GeneratorForm: React.FC<GeneratorFormProps> = ({ onGenerate, isLoading, tier, onUpgrade }) => {
  const [concept, setConcept] = useState('');
  const [placement, setPlacement] = useState<BodyPlacement>(BodyPlacement.ARM); // Default to Arm for Sleeve
  const [style, setStyle] = useState<TattooStyle>(TattooStyle.TRADITIONAL);
  const [mode, setMode] = useState<ProjectMode>(ProjectMode.SINGLE);
  const [projectSize, setProjectSize] = useState(4); // Default 4 items for project

  const handleSubmit = () => {
    if (!concept) return;
    const size = mode === ProjectMode.SINGLE ? 1 : projectSize;
    onGenerate(concept, placement, style, size, mode);
  };

  return (
    <div className="bg-ink-800 rounded-xl shadow-2xl shadow-black border border-ink-700 overflow-hidden text-ink-50">
      
      {/* Mode Tabs */}
      <div className="flex border-b border-ink-700">
          <button 
             onClick={() => setMode(ProjectMode.SINGLE)}
             className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${mode === ProjectMode.SINGLE ? 'bg-ink-800 text-accent-gold border-b-2 border-accent-gold' : 'bg-ink-900 text-ink-500 hover:text-white'}`}
          >
              <Zap className="w-4 h-4" /> Single Design
          </button>
          <button 
             onClick={() => setMode(ProjectMode.PROJECT)}
             className={`flex-1 py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${mode === ProjectMode.PROJECT ? 'bg-ink-800 text-accent-gold border-b-2 border-accent-gold' : 'bg-ink-900 text-ink-500 hover:text-white'}`}
          >
              <Layers className="w-4 h-4" /> Sleeve Project
          </button>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        
        {/* Concept Section */}
        <div className="space-y-4">
          <label htmlFor="concept-input" className="flex items-center space-x-2 text-xs font-bold text-ink-400 uppercase tracking-widest cursor-pointer">
            <span className="text-accent-gold">01.</span>
            <span>Tattoo Concept</span>
          </label>
          
          <Tooltip content="Describe your tattoo idea" position="top" className="w-full">
            <div className="relative group w-full">
              <input 
                id="concept-input"
                type="text" 
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder={mode === ProjectMode.PROJECT ? "e.g. Ocean theme sleeve with ships and kraken..." : "e.g. A roaring tiger, black and grey..."}
                aria-describedby="concept-helper"
                className="w-full px-6 py-5 rounded-lg bg-ink-900 border border-ink-600 focus:border-accent-gold focus:ring-1 focus:ring-accent-gold outline-none transition-all text-lg font-medium text-white placeholder:text-ink-600"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-600 pointer-events-none group-focus-within:text-accent-gold transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
          </Tooltip>

          {/* Smart Input Guidance */}
          <div className="flex items-center justify-between px-1">
             <p id="concept-helper" className={`text-xs font-medium transition-colors ${!concept ? 'text-ink-400' : concept.length < 10 ? 'text-blue-400' : 'text-green-400'}`}>
                {!concept && "Describe the subject, style, and mood."}
                {concept && concept.length < 10 && "Tip: Add more details for better results..."}
                {concept && concept.length >= 10 && "✨ Great description! Ready to generate."}
             </p>
             <span className={`text-xs font-mono ${concept.length > 1000 ? 'text-red-400' : 'text-ink-600'}`}>
                {concept.length}/1000
             </span>
          </div>

          {/* Inspiration Rail */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
            {INSPIRATION_PROMPTS.map((prompt) => (
              <Tooltip key={prompt.text} content="Use this concept">
                <button
                  onClick={() => setConcept(prompt.text)}
                  className="snap-start flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-ink-900 border border-ink-700 rounded-md hover:border-accent-gold/50 hover:text-accent-gold transition-all text-xs font-bold text-ink-400 shadow-sm active:scale-95 uppercase tracking-wide"
                >
                  <span>{prompt.emoji}</span>
                  <span>{prompt.text}</span>
                </button>
              </Tooltip>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Settings Column */}
          <div className="space-y-6">
            
            {/* Placement - Only strictly relevant for context, or selecting canvas type */}
            <div className="space-y-3">
              <label className="flex items-center space-x-2 text-xs font-bold text-ink-400 uppercase tracking-widest">
                <span className="text-accent-gold">02.</span>
                <span>{mode === ProjectMode.PROJECT ? 'Sleeve Canvas' : 'Placement'}</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(BodyPlacement).filter(p => mode === ProjectMode.SINGLE ? true : p !== BodyPlacement.PAPER).map((place) => (
                  <Tooltip key={place} content={`Select ${place}`} className="w-full h-full">
                    <button
                      onClick={() => setPlacement(place)}
                      className={`w-full h-full px-3 py-3 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        placement === place 
                          ? 'border-accent-gold bg-accent-gold/10 text-accent-gold' 
                          : 'border-ink-700 bg-ink-900 text-ink-400 hover:border-ink-500'
                      }`}
                    >
                      <span className="text-lg">{PLACEMENT_ICONS[place]}</span>
                      {place.split(' (')[0].split(' / ')[0]}
                    </button>
                  </Tooltip>
                ))}
              </div>
            </div>

            {/* Complexity / Size */}
            {mode === ProjectMode.PROJECT && (
                <div className="space-y-3">
                <label className="flex items-center justify-between text-xs font-bold text-ink-400 uppercase tracking-widest">
                    <div className="flex items-center space-x-2">
                    <span className="text-accent-gold">03.</span>
                    <span>Project Complexity</span>
                    </div>
                </label>
                <div className="grid grid-cols-4 gap-2">
                    {[4, 6, 8, 10].map((s) => {
                    const isLocked = tier === AppTier.FREE && s > 4;
                    return (
                        <Tooltip key={s} content={isLocked ? "Upgrade for larger sleeves" : `${s} Design Elements`} className="w-full">
                        <button 
                            disabled={isLocked}
                            onClick={() => setProjectSize(s)}
                            className={`w-full relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                                projectSize === s && !isLocked
                                ? 'border-accent-gold bg-accent-gold/10 text-accent-gold' 
                                : 'border-ink-700 bg-ink-900 text-ink-500'
                            } ${!isLocked && 'hover:border-ink-500'} ${isLocked && 'opacity-40 cursor-not-allowed'}`}
                        >
                            <span className="font-black text-lg">{s}</span>
                            {isLocked && (
                                <div onClick={(e) => { e.stopPropagation(); onUpgrade(); }} className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[1px] cursor-pointer hover:bg-black/30 rounded-lg">
                                    <Lock className="w-3 h-3 text-ink-300" />
                                </div>
                            )}
                        </button>
                        </Tooltip>
                    );
                    })}
                </div>
                </div>
            )}
          </div>

          {/* Style Column */}
          <div className="space-y-3">
            <label className="flex items-center space-x-2 text-xs font-bold text-ink-400 uppercase tracking-widest">
                <span className="text-accent-gold">04.</span>
                <span>Tattoo Style</span>
            </label>
            <div className="grid grid-cols-2 gap-2 h-64 overflow-y-auto pr-1 custom-scrollbar">
                {Object.values(TattooStyle).map((s) => (
                    <Tooltip key={s} content={s} position="top" className="w-full">
                      <button 
                          onClick={() => setStyle(s)}
                          className={`w-full p-3 rounded-lg border text-left transition-all group ${
                              style === s 
                              ? 'border-accent-gold bg-accent-gold/10' 
                              : 'border-ink-700 bg-ink-900 hover:border-ink-500'
                          }`}
                      >
                          <div className={`w-full h-12 rounded bg-ink-950 overflow-hidden relative mb-2 flex items-center justify-center ${style === s ? 'ring-1 ring-accent-gold' : ''}`}>
                             <span className="text-2xl filter grayscale contrast-125 group-hover:filter-none transition-all">{getStyleEmoji(s)}</span>
                          </div>
                          <span className={`text-[10px] uppercase font-bold tracking-wider ${style === s ? 'text-accent-gold' : 'text-ink-400'}`}>
                              {s.split(' ')[0]}
                          </span>
                      </button>
                    </Tooltip>
                ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Tooltip content={!concept ? "Enter a concept first" : "Start Generation"} className="w-full">
          <button
            onClick={handleSubmit}
            disabled={!concept || isLoading}
            className={`w-full py-5 rounded-lg text-ink-950 font-black text-lg shadow-lg shadow-accent-gold/10 transition-all transform active:scale-[0.98] hover:-translate-y-1 relative overflow-hidden ${
              !concept || isLoading 
                ? 'bg-ink-700 cursor-not-allowed shadow-none text-ink-500' 
                : 'bg-accent-gold hover:bg-yellow-400'
            }`}
          >
              <div className="flex items-center justify-center gap-3 relative z-10">
                  {isLoading ? (
                      <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-ink-900"></div>
                          <span>PREPARING STENCILS...</span>
                      </>
                  ) : (
                      <>
                          <Zap className="w-5 h-5 fill-current" />
                          <span>{mode === ProjectMode.PROJECT ? 'BUILD SLEEVE PROJECT' : 'GENERATE DESIGN'}</span>
                      </>
                  )}
              </div>
          </button>
        </Tooltip>

      </div>
    </div>
  );
};

// Helper for style visuals
const getStyleEmoji = (style: TattooStyle) => {
    switch(style) {
        case TattooStyle.TRADITIONAL: return '⚓';
        case TattooStyle.NEO_TRADITIONAL: return '🦅';
        case TattooStyle.JAPANESE: return '👹';
        case TattooStyle.BLACK_GREY: return '🎭';
        case TattooStyle.NEW_SCHOOL: return '🛹';
        case TattooStyle.BIOMECHANICAL: return '🦾';
        case TattooStyle.TRASH_POLKA: return '🔴';
        case TattooStyle.WATERCOLOR: return '🎨';
        case TattooStyle.GEOMETRIC: return '📐';
        case TattooStyle.TRIBAL: return '🗿';
        case TattooStyle.BLACKWORK: return '⚫';
        case TattooStyle.REALISM: return '📸';
        case TattooStyle.FINE_LINE: return '✨';
        case TattooStyle.IGNORANT: return '🖍️';
        case TattooStyle.SKETCH: return '✏️';
        case TattooStyle.GLITCH: return '📺';
        default: return '🖋️';
    }
}
