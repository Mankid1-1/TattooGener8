import React, { useState, useRef } from 'react';
import { DesignData, BodyPlacement, PlacedLayer } from '../types';
import { X, Save, RotateCw, Scaling, Trash2, Plus, Move } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface PlacementCanvasProps {
  placement: BodyPlacement;
  availableDesigns: DesignData[];
  onSave: (layers: PlacedLayer[]) => void;
  onClose: () => void;
}

export const PlacementCanvas: React.FC<PlacementCanvasProps> = ({ placement, availableDesigns, onSave, onClose }) => {
  const [layers, setLayers] = useState<PlacedLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Dragging State
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleAddDesign = (design: DesignData) => {
    const newLayer: PlacedLayer = {
        id: Date.now().toString(),
        designId: design.id,
        imageUrl: design.originalUrl,
        x: 50, // Percent
        y: 50, // Percent
        scale: 1,
        rotation: 0,
        zIndex: layers.length + 1
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
  };

  const updateLayer = (id: string, updates: Partial<PlacedLayer>) => {
    setLayers(layers.map(l => l.id === id ? { ...l, ...updates } : l));
  };

  const removeLayer = (id: string) => {
      setLayers(layers.filter(l => l.id !== id));
      setSelectedLayerId(null);
  };

  // Touch/Mouse Handlers for Dragging
  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent, layerId: string) => {
      e.stopPropagation();
      setSelectedLayerId(layerId);
      setIsDragging(true);
      
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      setDragStart({ x: clientX, y: clientY });
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging || !selectedLayerId || !canvasRef.current) return;
      
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      
      const deltaX = clientX - dragStart.x;
      const deltaY = clientY - dragStart.y;
      
      const rect = canvasRef.current.getBoundingClientRect();
      const percentX = (deltaX / rect.width) * 100;
      const percentY = (deltaY / rect.height) * 100;

      const layer = layers.find(l => l.id === selectedLayerId);
      if (layer) {
          updateLayer(selectedLayerId, {
              x: layer.x + percentX,
              y: layer.y + percentY
          });
      }
      setDragStart({ x: clientX, y: clientY });
  };

  const handlePointerUp = () => {
      setIsDragging(false);
  };

  // Get Background SVG based on placement
  const getBodyOutline = () => {
      // Simplified SVG paths for demo
      switch (placement) {
          case BodyPlacement.ARM: 
            return "M100,50 Q180,50 200,300 Q220,600 180,800 Q140,850 100,800 Q60,600 80,300 Q100,50 100,50";
          case BodyPlacement.LEG:
            return "M150,50 Q250,50 260,400 Q270,800 200,900 Q130,800 140,400 Q150,50 150,50";
          default:
            return "M50,50 L250,50 L250,400 L50,400 Z";
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink-950 flex flex-col md:flex-row">
        
        {/* Sidebar - Design Picker */}
        <div className="w-full md:w-64 bg-ink-900 border-r border-ink-800 p-4 flex flex-col gap-4 overflow-y-auto max-h-[30vh] md:max-h-full">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-accent-gold uppercase tracking-wider text-sm">Flash Queue</h3>
                <button onClick={onClose} className="md:hidden"><X className="text-white" /></button>
            </div>
            <p className="text-xs text-ink-500">Tap to add to sleeve</p>
            <div className="grid grid-cols-3 md:grid-cols-2 gap-2">
                {availableDesigns.map(d => (
                    <button key={d.id} onClick={() => handleAddDesign(d)} className="aspect-[3/4] bg-white rounded overflow-hidden hover:ring-2 hover:ring-accent-gold transition-all relative group">
                        <img src={d.originalUrl} className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                            <Plus className="text-white w-6 h-6" />
                        </div>
                    </button>
                ))}
            </div>
        </div>

        {/* Main Canvas Area */}
        <div 
            className="flex-1 relative bg-ink-950 overflow-hidden touch-none flex items-center justify-center"
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
        >
             {/* Controls Header */}
             <div className="absolute top-4 left-4 right-4 flex justify-between z-10 pointer-events-none">
                 <div className="pointer-events-auto flex gap-2">
                    <button onClick={onClose} className="p-2 bg-black/50 text-white rounded-full hover:bg-black/80"><X /></button>
                 </div>
                 <div className="pointer-events-auto">
                    <button onClick={() => onSave(layers)} className="px-6 py-2 bg-accent-gold text-black font-bold rounded shadow-lg hover:bg-yellow-400 flex items-center gap-2">
                        <Save className="w-4 h-4" /> SAVE SLEEVE
                    </button>
                 </div>
             </div>

             {/* The Body Canvas */}
             <div 
                ref={canvasRef}
                className="relative w-[300px] h-[600px] md:w-[400px] md:h-[800px] bg-ink-100 shadow-2xl rounded-xl overflow-hidden"
             >
                {/* Body Outline Background */}
                <svg className="absolute inset-0 w-full h-full text-ink-300 fill-current opacity-20 pointer-events-none" viewBox="0 0 300 900" preserveAspectRatio="none">
                    <path d={getBodyOutline()} />
                </svg>
                <div className="absolute inset-0 pointer-events-none border-2 border-ink-900/10 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/skin-side-up.png')]"></div>

                {/* Layers */}
                {layers.map(layer => (
                    <div
                        key={layer.id}
                        className={`absolute w-40 h-40 flex items-center justify-center cursor-move transition-shadow ${selectedLayerId === layer.id ? 'ring-2 ring-accent-gold z-50' : ''}`}
                        style={{
                            left: `${layer.x}%`,
                            top: `${layer.y}%`,
                            transform: `translate(-50%, -50%) rotate(${layer.rotation}deg) scale(${layer.scale})`,
                            zIndex: layer.zIndex
                        }}
                        onMouseDown={(e) => handlePointerDown(e, layer.id)}
                        onTouchStart={(e) => handlePointerDown(e, layer.id)}
                    >
                        <img 
                            src={layer.imageUrl} 
                            className="w-full h-full object-contain pointer-events-none blend-multiply"
                            style={{ filter: 'contrast(1.2) brightness(0.95) sepia(0.2)' }} // Make it look like ink
                        />
                    </div>
                ))}
             </div>

             {/* Selected Layer Controls (Floating) */}
             {selectedLayerId && (
                 <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-ink-900/90 backdrop-blur border border-ink-700 p-2 rounded-xl flex gap-4 text-white shadow-2xl">
                     <div className="flex flex-col items-center">
                        <label className="text-[10px] uppercase font-bold text-ink-400">Size</label>
                        <input 
                            type="range" min="0.2" max="2" step="0.1" 
                            value={layers.find(l => l.id === selectedLayerId)?.scale || 1}
                            onChange={(e) => updateLayer(selectedLayerId, { scale: parseFloat(e.target.value) })}
                            className="w-24 accent-accent-gold"
                        />
                     </div>
                     <div className="flex flex-col items-center">
                        <label className="text-[10px] uppercase font-bold text-ink-400">Rotate</label>
                        <input 
                            type="range" min="0" max="360" step="5" 
                            value={layers.find(l => l.id === selectedLayerId)?.rotation || 0}
                            onChange={(e) => updateLayer(selectedLayerId, { rotation: parseInt(e.target.value) })}
                            className="w-24 accent-accent-gold"
                        />
                     </div>
                     <div className="w-px bg-ink-700"></div>
                     <button onClick={() => removeLayer(selectedLayerId)} className="text-red-500 hover:text-red-400 p-1">
                         <Trash2 />
                     </button>
                 </div>
             )}
        </div>
    </div>
  );
};