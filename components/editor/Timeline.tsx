'use client';

import { useRef, useMemo } from 'react';
import type { Project, Layer } from '@/types/project';

const LAYER_COLORS: Record<string, string> = {
  text: '#14B45A',
  image: '#3B82F6',
  shape: '#F97316',
  particle: '#9D4EDD',
};

const TRACK_HEIGHT = 32;
const LABEL_WIDTH = 140;
const RULER_HEIGHT = 28;

interface TimelineProps {
  project: Project;
  currentTime: number;
  selectedLayerId: string | null;
  onTimeChange: (t: number) => void;
  onLayerSelect: (id: string | null) => void;
  onLayerUpdate: (id: string, changes: Partial<Layer>) => void;
}

export function Timeline({
  project,
  currentTime,
  selectedLayerId,
  onTimeChange,
  onLayerSelect,
  onLayerUpdate,
}: TimelineProps) {
  const rulerRef = useRef<HTMLDivElement>(null);

  const totalMs = project.duration;
  const pxPerMs = 0.18; // pixels per millisecond

  const totalWidth = Math.max(totalMs * pxPerMs, 400);

  // Generate ruler marks
  const marks = useMemo(() => {
    const result = [];
    const interval = 500; // every 500ms
    for (let ms = 0; ms <= totalMs; ms += interval) {
      result.push(ms);
    }
    return result;
  }, [totalMs]);

  const handleRulerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ms = Math.max(0, Math.min(totalMs, x / pxPerMs));
    onTimeChange(ms);
  };

  const handleBlockMouseDown = (e: React.MouseEvent, layer: Layer) => {
    e.stopPropagation();
    onLayerSelect(layer.id);

    const startX = e.clientX;
    const originalStart = layer.timeline.start;

    const onMouseMove = (me: MouseEvent) => {
      const dx = me.clientX - startX;
      const dms = dx / pxPerMs;
      const newStart = Math.max(0, Math.round(originalStart + dms));
      onLayerUpdate(layer.id, { timeline: { ...layer.timeline, start: newStart } });
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const playheadX = currentTime * pxPerMs;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-mono)' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 1rem',
        height: 36,
        borderBottom: '1px solid var(--color-border)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          Timeline
        </span>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--color-accent)', fontFamily: 'var(--font-mono)' }}>
          {(currentTime / 1000).toFixed(3)}s / {(totalMs / 1000).toFixed(1)}s
        </span>
      </div>

      {/* Tracks area */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex' }}>
        {/* Layer labels */}
        <div style={{ width: LABEL_WIDTH, flexShrink: 0, borderRight: '1px solid var(--color-border)' }}>
          {/* Spacer for ruler */}
          <div style={{ height: RULER_HEIGHT, borderBottom: '1px solid var(--color-border)' }} />
          {/* Layer names */}
          {[...project.layers].reverse().map(layer => (
            <div
              key={layer.id}
              onClick={() => onLayerSelect(layer.id === selectedLayerId ? null : layer.id)}
              style={{
                height: TRACK_HEIGHT,
                display: 'flex',
                alignItems: 'center',
                paddingLeft: '0.75rem',
                cursor: 'pointer',
                background: layer.id === selectedLayerId ? 'var(--color-bg-elevated)' : 'transparent',
                borderBottom: '1px solid var(--color-border)',
                borderLeft: layer.id === selectedLayerId ? `2px solid ${LAYER_COLORS[layer.type] || '#14B45A'}` : '2px solid transparent',
                transition: 'all 0.1s ease',
              }}
            >
              <span style={{
                fontSize: '0.75rem',
                color: layer.id === selectedLayerId ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: LABEL_WIDTH - 20,
              }}>
                {layer.name}
              </span>
            </div>
          ))}
        </div>

        {/* Timeline tracks */}
        <div style={{ flex: 1, overflowX: 'auto', position: 'relative' }}>
          <div style={{ width: totalWidth, position: 'relative', minWidth: '100%' }}>
            {/* Ruler */}
            <div
              ref={rulerRef}
              onClick={handleRulerClick}
              style={{
                height: RULER_HEIGHT,
                position: 'sticky',
                top: 0,
                background: 'var(--color-bg-surface)',
                borderBottom: '1px solid var(--color-border)',
                cursor: 'crosshair',
                zIndex: 10,
                width: totalWidth,
              }}
            >
              {marks.map(ms => (
                <div
                  key={ms}
                  style={{
                    position: 'absolute',
                    left: ms * pxPerMs,
                    top: 0,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    paddingLeft: 4,
                  }}
                >
                  <div style={{ width: 1, height: ms % 1000 === 0 ? 10 : 6, background: 'var(--color-border-active)', marginTop: ms % 1000 === 0 ? 0 : 4 }} />
                  {ms % 1000 === 0 && (
                    <span style={{ fontSize: '0.6rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
                      {ms / 1000}s
                    </span>
                  )}
                </div>
              ))}

              {/* Playhead on ruler */}
              <div style={{
                position: 'absolute',
                left: playheadX,
                top: 0,
                width: 2,
                height: '100%',
                background: 'var(--color-accent)',
                zIndex: 20,
              }} />
            </div>

            {/* Track rows */}
            <div style={{ position: 'relative' }}>
              {[...project.layers].reverse().map(layer => {
                const color = LAYER_COLORS[layer.type] || '#14B45A';
                const blockLeft = layer.timeline.start * pxPerMs;
                const blockWidth = Math.max(layer.timeline.duration * pxPerMs, 20);
                const isSelected = layer.id === selectedLayerId;

                return (
                  <div
                    key={layer.id}
                    style={{
                      height: TRACK_HEIGHT,
                      position: 'relative',
                      borderBottom: '1px solid var(--color-border)',
                      background: isSelected ? 'rgba(255,255,255,0.02)' : 'transparent',
                    }}
                  >
                    {/* Block */}
                    <div
                      onMouseDown={e => handleBlockMouseDown(e, layer)}
                      style={{
                        position: 'absolute',
                        left: blockLeft,
                        top: 4,
                        width: blockWidth,
                        height: TRACK_HEIGHT - 8,
                        background: `${color}30`,
                        border: `1px solid ${color}60`,
                        borderRadius: 4,
                        cursor: 'grab',
                        display: 'flex',
                        alignItems: 'center',
                        paddingLeft: 6,
                        overflow: 'hidden',
                        transition: 'filter 0.1s ease',
                        boxShadow: isSelected ? `0 0 0 1px ${color}` : 'none',
                      }}
                    >
                      <span style={{
                        fontSize: '0.68rem',
                        color,
                        whiteSpace: 'nowrap',
                        fontWeight: 500,
                      }}>
                        {layer.name}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Playhead line */}
              <div style={{
                position: 'absolute',
                left: playheadX,
                top: 0,
                width: 1,
                height: '100%',
                background: 'var(--color-accent)',
                zIndex: 10,
                pointerEvents: 'none',
              }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
