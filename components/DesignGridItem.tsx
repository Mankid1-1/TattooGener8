import React from 'react';
import { DesignData } from '../types';
import { ZoomIn } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface DesignGridItemProps {
  design: DesignData;
  index: number;
  onSelect: (id: string) => void;
}

export const DesignGridItem: React.FC<DesignGridItemProps> = React.memo(({ design, index, onSelect }) => {
  return (
    <div className="group relative aspect-[3/4] bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-2xl transition-all">
      <img
        src={design.modifiedUrl || design.originalUrl}
        className="w-full h-full object-cover"
        alt={design.promptUsed || design.fullPrompt || `Design ${index + 1}`}
        loading="lazy"
        decoding="async"
      />

      {/* Number Badge */}
      <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 text-white text-[10px] font-mono rounded">
          #{index + 1}
      </div>

      {/* Hover Overlay - Visible on Hover OR when button inside has focus */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
          <Tooltip content="Inspect & Edit">
            <button
                onClick={() => onSelect(design.id)}
                className="p-3 bg-white rounded-full text-black hover:scale-110 transition-transform shadow-lg"
                aria-label={`Inspect design ${index + 1}`}
            >
                <ZoomIn className="w-5 h-5" />
            </button>
          </Tooltip>
      </div>
    </div>
  );
});

DesignGridItem.displayName = 'DesignGridItem';
