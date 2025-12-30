import React, { useEffect, useRef, useState } from 'react';
import { EditorItem, EditorTool } from '../types';
import { MousePointer2, Type, Sticker, PenTool, X, Check, Trash2 } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface CreativeEditorProps {
  pageId: string;
  baseImage: string;
  onClose: () => void;
  onSave: (newImage: string) => void;
}

const MOTIFS = [
  '💀', '🌹', '⚡', '👁️', '🗡️', '❤️', '⚓', '🦋', '🐍', '💎', '🌙', '⭐'
];

export const CreativeEditor: React.FC<CreativeEditorProps> = ({ pageId, baseImage, onClose, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [items, setItems] = useState<EditorItem[]>([]);
  const [tool, setTool] = useState<EditorTool>('move');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  
  // Drawing State
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{x: number, y: number}[]>([]);

  // Persistence Key
  const STORAGE_KEY = `tc_editor_draft_${pageId}`;

  // Load Draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.items)) setItems(parsed.items);
      }
    } catch (e) {
      console.error("Failed to load editor draft", e);
    }
  }, [pageId]);

  // Save Draft
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, timestamp: Date.now() }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [items, pageId]);

  // Canvas Setup
  useEffect(() => {
    drawCanvas();
  }, [baseImage, items, currentPath, selectedId]);

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
    }

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Load base image
    const img = new Image();
    img.src = baseImage;
    img.crossOrigin = "anonymous"; 
    
    // Draw background white (for stencils) or keep transparent? 
    // TattooCrate implies stencils often have white backgrounds, but on-body has color.
    // Let's use white to be safe for saving.
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (img.complete) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawItems(ctx);
    } else {
        img.onload = () => {
             ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
             drawItems(ctx);
        }
    }
  };

  const drawItems = (ctx: CanvasRenderingContext2D) => {
    items.forEach(item => {
        ctx.save();
        if (item.type === 'path' && item.points) {
            ctx.beginPath();
            ctx.moveTo(item.points[0].x, item.points[0].y);
            for (let i = 1; i < item.points.length; i++) {
                ctx.lineTo(item.points[i].x, item.points[i].y);
            }
            ctx.strokeStyle = item.color;
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.stroke();
        } else {
            ctx.translate(item.x, item.y);
            ctx.scale(item.scale, item.scale);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            if (item.type === 'text' || item.type === 'motif') {
                ctx.font = item.type === 'motif' ? '60px sans-serif' : 'bold 50px "Courier New"';
                ctx.fillStyle = item.color;
                ctx.fillText(item.content, 0, 0);
            }

            // Selection Outline
            if (item.id === selectedId) {
                ctx.strokeStyle = '#fbbf24'; // Gold
                ctx.lineWidth = 3 / item.scale;
                ctx.setLineDash([5, 5]);
                ctx.strokeRect(-70, -40, 140, 80); 
            }
        }
        ctx.restore();
    });

    if (currentPath.length > 0) {
        ctx.beginPath();
        ctx.moveTo(currentPath[0].x, currentPath[0].y);
        for (let i = 1; i < currentPath.length; i++) {
            ctx.lineTo(currentPath[i].x, currentPath[i].y);
        }
        ctx.strokeStyle = '#000000'; // Default ink color
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    }
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
      if (tool === 'draw') {
          setIsDrawing(true);
          const coords = getCanvasCoordinates(e);
          setCurrentPath([coords]);
      } else if (tool === 'move') {
          const coords = getCanvasCoordinates(e);
          const hit = items.find(item => Math.abs(item.x - coords.x) < 50 && Math.abs(item.y - coords.y) < 50);
          if (hit) setSelectedId(hit.id);
          else setSelectedId(null);
      }
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
      if (isDrawing && tool === 'draw') {
          const coords = getCanvasCoordinates(e);
          setCurrentPath(prev => [...prev, coords]);
      } else if (tool === 'move' && selectedId) {
           let isDragging = false;
           if ('buttons' in e) isDragging = e.buttons === 1;
           else if ('touches' in e) isDragging = true;
           
           if (isDragging) {
             const coords = getCanvasCoordinates(e);
             setItems(items.map(item => item.id === selectedId ? { ...item, x: coords.x, y: coords.y } : item));
           }
      }
  };

  const handlePointerUp = () => {
      if (isDrawing) {
          setIsDrawing(false);
          if (currentPath.length > 2) {
            const newItem: EditorItem = {
                id: Date.now().toString(),
                type: 'path',
                content: 'path',
                x: 0, 
                y: 0,
                scale: 1,
                color: '#000000',
                points: currentPath
            };
            setItems([...items, newItem]);
          }
          setCurrentPath([]);
      }
  };

  const addMotif = (emoji: string) => {
      const canvas = canvasRef.current;
      setItems([...items, {
          id: Date.now().toString(),
          type: 'motif',
          content: emoji,
          x: canvas ? canvas.width / 2 : 100,
          y: canvas ? canvas.height / 2 : 100,
          scale: 1,
          color: '#000000'
      }]);
      setTool('move');
  };

  const addText = () => {
      if (!textInput.trim()) return;
      const canvas = canvasRef.current;
      setItems([...items, {
        id: Date.now().toString(),
        type: 'text',
        content: textInput,
        x: canvas ? canvas.width / 2 : 100,
        y: canvas ? canvas.height / 2 : 100,
        scale: 1,
        color: '#000000'
      }]);
      setTextInput('');
      setTool('move');
  };

  const handleDelete = () => {
      if (selectedId) {
          setItems(items.filter(i => i.id !== selectedId));
          setSelectedId(null);
      }
  };

  const handleSave = () => {
    setSelectedId(null);
    setTimeout(() => {
        drawCanvas();
        if (canvasRef.current) {
            localStorage.removeItem(STORAGE_KEY);
            onSave(canvasRef.current.toDataURL('image/png'));
        }
    }, 50);
  }

  return (
    <div className="fixed inset-0 z-50 bg-ink-950 flex flex-col text-white">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-ink-900 border-b border-ink-800">
            <Tooltip content="Close without saving" position="bottom">
              <button onClick={onClose} className="p-2 hover:bg-ink-800 rounded-full" aria-label="Close without saving"><X /></button>
            </Tooltip>
            <h3 className="font-bold font-display tracking-widest uppercase">Design Studio</h3>
            <Tooltip content="Commit Changes">
              <button onClick={handleSave} className="px-6 py-2 bg-accent-gold text-black rounded font-bold hover:bg-yellow-400 flex items-center gap-2">
                  <Check className="w-4 h-4" /> DONE
              </button>
            </Tooltip>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-hidden relative bg-ink-950 flex items-center justify-center p-4">
             <canvas 
                ref={canvasRef}
                width={1000} 
                height={1333} 
                className="max-h-full max-w-full bg-white shadow-2xl rounded-sm touch-none"
                onMouseDown={handlePointerDown}
                onMouseMove={handlePointerMove}
                onMouseUp={handlePointerUp}
                onTouchStart={handlePointerDown}
                onTouchMove={handlePointerMove}
                onTouchEnd={handlePointerUp}
             />
        </div>

        {/* Toolbar */}
        <div className="bg-ink-900 p-4 pb-8 border-t border-ink-800">
            <div className="flex justify-center space-x-6 mb-6">
                <Tooltip content="Select & Move">
                  <button onClick={() => setTool('move')} className={`p-4 rounded-lg flex flex-col items-center gap-1 transition-all ${tool === 'move' ? 'bg-accent-gold text-black' : 'text-ink-400 hover:bg-ink-800'}`}>
                      <MousePointer2 className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase">Move</span>
                  </button>
                </Tooltip>
                <Tooltip content="Ink Pen">
                  <button onClick={() => setTool('draw')} className={`p-4 rounded-lg flex flex-col items-center gap-1 transition-all ${tool === 'draw' ? 'bg-accent-gold text-black' : 'text-ink-400 hover:bg-ink-800'}`}>
                      <PenTool className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase">Draw</span>
                  </button>
                </Tooltip>
                <Tooltip content="Add Motifs">
                  <button onClick={() => setTool('motif')} className={`p-4 rounded-lg flex flex-col items-center gap-1 transition-all ${tool === 'motif' ? 'bg-accent-gold text-black' : 'text-ink-400 hover:bg-ink-800'}`}>
                      <Sticker className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase">Motif</span>
                  </button>
                </Tooltip>
                <Tooltip content="Add Typography">
                  <button onClick={() => setTool('text')} className={`p-4 rounded-lg flex flex-col items-center gap-1 transition-all ${tool === 'text' ? 'bg-accent-gold text-black' : 'text-ink-400 hover:bg-ink-800'}`}>
                      <Type className="w-5 h-5" />
                      <span className="text-[10px] font-bold uppercase">Type</span>
                  </button>
                </Tooltip>
            </div>

            {/* Sub-tools */}
            <div className="min-h-[60px]">
                {tool === 'motif' && (
                    <div className="flex gap-4 overflow-x-auto pb-2 px-2 scrollbar-hide">
                        {MOTIFS.map(s => (
                            <button key={s} onClick={() => addMotif(s)} className="text-2xl hover:scale-125 transition-transform p-1" aria-label={`Add motif ${s}`}>{s}</button>
                        ))}
                    </div>
                )}

                {tool === 'text' && (
                    <div className="flex gap-2">
                        <input 
                            value={textInput} 
                            onChange={e => setTextInput(e.target.value)} 
                            className="flex-1 bg-ink-800 border border-ink-600 rounded px-4 py-2 outline-none focus:border-accent-gold text-white"
                            placeholder="Enter text..."
                            aria-label="Text to add"
                        />
                        <button onClick={addText} className="bg-accent-gold text-black px-4 rounded font-bold uppercase text-xs">Add</button>
                    </div>
                )}

                {tool === 'move' && selectedId && (
                     <div className="flex justify-center">
                        <button onClick={handleDelete} className="flex items-center gap-2 text-red-500 bg-red-500/10 px-6 py-2 rounded font-bold border border-red-500/50 uppercase text-xs hover:bg-red-500 hover:text-white transition-colors">
                            <Trash2 className="w-4 h-4" /> Delete Layer
                        </button>
                     </div>
                )}
            </div>
        </div>
    </div>
  );
};