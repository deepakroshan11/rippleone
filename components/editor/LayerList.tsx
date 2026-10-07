'use client';

import type { Layer } from '@/types/project';

const LAYER_ICONS: Record<string, string> = {
  text: 'TXT',
  image: 'IMG',
  shape: 'SHP',
  particle: 'DOT',
  video: 'VID',
};

const LAYER_COLORS: Record<string, string> = {
  text: '#14B45A',
  image: '#3B82F6',
  shape: '#F97316',
  particle: '#9D4EDD',
};

interface LayerListProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelect: (id: string | null) => void;
  onReorder: (layers: Layer[]) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export function LayerList({
  layers,
  selectedLayerId,
  onSelect,
  onDelete,
  onDuplicate,
}: LayerListProps) {
  // Reverse for display (top layer = last in array but first visually)
  const displayLayers = [...layers].reverse();

  return (
    <div style={{ padding: '0.75rem', height: '100%', overflow: 'auto' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem',
      }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          Layers ({layers.length})
        </span>
        <button
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-accent)',
            cursor: 'pointer',
            fontSize: '1rem',
            lineHeight: 1,
            padding: '0.25rem',
          }}
          title="Add layer"
          aria-label="Add new layer"
        >
          +
        </button>
      </div>

      {displayLayers.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: 'var(--color-text-muted)',
          fontSize: '0.8rem',
        }}>
          No layers yet. Add elements from the toolbar or use AI.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {displayLayers.map(layer => {
          const isSelected = layer.id === selectedLayerId;
          const color = LAYER_COLORS[layer.type] || '#8B949E';
          const icon = LAYER_ICONS[layer.type] || '?';

          return (
            <div
              key={layer.id}
              className="layer-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 0.625rem',
                borderRadius: 6,
                cursor: 'pointer',
                background: isSelected ? `${color}15` : 'transparent',
                borderLeft: isSelected ? `2px solid ${color}` : '2px solid transparent',
                color: isSelected ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                fontSize: '0.85rem',
                transition: 'all 0.1s ease',
                userSelect: 'none',
              }}
              onClick={() => onSelect(isSelected ? null : layer.id)}
            >
              {/* Type icon */}
              <div style={{
                width: 22,
                height: 22,
                borderRadius: 5,
                background: `${color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                color,
                flexShrink: 0,
                fontWeight: 700,
              }}>
                {icon}
              </div>

              {/* Name */}
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.82rem' }}>
                {layer.name}
              </span>

              {/* Visibility indicator */}
              {layer.visible === false && (
                <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Hidden</span>
              )}

              {/* Actions (show on hover via group) */}
              {isSelected && (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDuplicate(layer.id); }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-text-muted)',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      borderRadius: 4,
                      fontSize: '0.7rem',
                    }}
                    title="Duplicate"
                    aria-label="Duplicate layer"
                  >
                    Copy
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(layer.id); }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'rgba(239,68,68,0.8)',
                      cursor: 'pointer',
                      padding: '2px 4px',
                      borderRadius: 4,
                      fontSize: '0.7rem',
                    }}
                    title="Delete"
                    aria-label="Delete layer"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
