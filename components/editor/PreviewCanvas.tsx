'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import type { Project, Layer, TextLayer, ImageLayer, ShapeLayer, ParticleLayer } from '@/types/project';

interface PreviewCanvasProps {
  project: Project;
  isPlaying: boolean;
  currentTime: number;
  onTimeUpdate: (t: number) => void;
  onPlayEnd: () => void;
  selectedLayerId: string | null;
  onLayerSelect: (id: string | null) => void;
}

export function PreviewCanvas({
  project,
  isPlaying,
  currentTime,
  onTimeUpdate,
  onPlayEnd,
  selectedLayerId,
  onLayerSelect,
}: PreviewCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const playheadRef = useRef(currentTime);

  playheadRef.current = currentTime;

  // Compute scale to fit canvas within container safely on client
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const updateScale = () => {
      const maxW = Math.min(window.innerWidth * 0.55, 500);
      const maxH = window.innerHeight * 0.72;
      const scaleW = maxW / (project.canvas.width || 1080);
      const scaleH = maxH / (project.canvas.height || 1920);
      setScale(Math.min(scaleW, scaleH, 1));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [project.canvas.width, project.canvas.height]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      startTimeRef.current = null;
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        const startOffset = playheadRef.current >= project.duration - 40 ? 0 : playheadRef.current;
        startTimeRef.current = timestamp - startOffset;
      }
      const elapsed = timestamp - startTimeRef.current;

      if (elapsed >= project.duration) {
        onTimeUpdate(project.duration);
        onPlayEnd();
        startTimeRef.current = null;
        return;
      }

      onTimeUpdate(elapsed);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, project.duration, onTimeUpdate, onPlayEnd]);

  // Compute layer visibility and transform at current time
  const getLayerStyle = useCallback((layer: Layer): React.CSSProperties & { _visible: boolean } => {
    const { start, duration: dur, easing = 'ease' } = layer.timeline;
    const end = start + dur;
    const enterDur = layer.animation?.enterDuration ?? 600;
    const exitDur = layer.animation?.exitDuration ?? 400;

    if (currentTime < start || currentTime > end) {
      return { _visible: false, opacity: 0, pointerEvents: 'none' };
    }

    const elapsed = currentTime - start;
    const timeLeft = end - currentTime;

    // Enter progress
    const enterProgress = Math.min(1, elapsed / enterDur);
    // Exit progress
    const exitProgress = Math.min(1, Math.max(0, 1 - timeLeft / exitDur));

    const baseOpacity = (layer.opacity === undefined || (layer.opacity === 0 && !!layer.animation?.enter)) ? 1 : layer.opacity;
    let opacity = baseOpacity;
    let transform = `translate(-50%, -50%)`;

    const enter = layer.animation?.enter || 'none';
    const exit = layer.animation?.exit || 'none';

    // Enter animations
    if (elapsed < enterDur) {
      const t = easeFunc(easing, enterProgress);
      opacity = baseOpacity * t;

      if (enter === 'fade') {
        // just opacity
      } else if (enter === 'scaleFade') {
        const s = 0.7 + 0.3 * t;
        transform = `translate(-50%, -50%) scale(${s})`;
      } else if (enter === 'slideUp') {
        const y = 40 * (1 - t);
        transform = `translate(-50%, calc(-50% + ${y}px))`;
      } else if (enter === 'slideDown') {
        const y = -40 * (1 - t);
        transform = `translate(-50%, calc(-50% + ${y}px))`;
      } else if (enter === 'slideLeft') {
        const x = 40 * (1 - t);
        transform = `translate(calc(-50% + ${x}px), -50%)`;
      } else if (enter === 'slideRight') {
        const x = -40 * (1 - t);
        transform = `translate(calc(-50% + ${x}px), -50%)`;
      } else if (enter === 'zoomIn') {
        const s = 0.5 + 0.5 * t;
        transform = `translate(-50%, -50%) scale(${s})`;
      } else if (enter === 'zoomOut') {
        const s = 1.35 - 0.35 * t;
        transform = `translate(-50%, -50%) scale(${s})`;
      } else if (enter === 'glow') {
        opacity = baseOpacity * t;
      }
    }

    // Exit animations
    if (timeLeft < exitDur && timeLeft >= 0) {
      const t = 1 - easeFunc(easing, exitProgress);
      opacity = baseOpacity * t;

      if (exit === 'fade') {
        // just opacity
      } else if (exit === 'slideUp') {
        const y = -40 * (1 - t);
        transform = `translate(-50%, calc(-50% + ${y}px))`;
      } else if (exit === 'slideDown') {
        const y = 40 * (1 - t);
        transform = `translate(-50%, calc(-50% + ${y}px))`;
      } else if (exit === 'zoomOut') {
        const s = 1 - 0.3 * (1 - t);
        transform = `translate(-50%, -50%) scale(${s})`;
      } else if (exit === 'scaleFade') {
        const s = 1 - 0.25 * (1 - t);
        transform = `translate(-50%, -50%) scale(${s})`;
      }
    }

    return {
      _visible: true,
      opacity,
      transform,
      rotation: layer.rotation ? `${layer.rotation}deg` : undefined,
    } as any;
  }, [currentTime]);

  const renderLayer = (layer: Layer) => {
    const style = getLayerStyle(layer);
    if (!style._visible) return null;

    const { _visible, ...cssStyle } = style;
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: layer.position.x * scale,
      top: layer.position.y * scale,
      transform: cssStyle.transform,
      opacity: cssStyle.opacity as number,
      cursor: 'pointer',
      outline: selectedLayerId === layer.id ? '2px solid #14B45A' : 'none',
      outlineOffset: 2,
      transition: isPlaying ? 'none' : 'outline 0.1s ease',
    };

    const sizeStyle: React.CSSProperties = layer.size ? {
      width: layer.size.width * scale,
      height: layer.size.height * scale,
    } : {};

    if (layer.scale && layer.scale !== 1) {
      baseStyle.transform = `${baseStyle.transform} scale(${layer.scale})`;
    }

    if (layer.type === 'text') {
      const tl = layer as TextLayer;
      return (
        <div
          key={layer.id}
          style={{
            ...baseStyle,
            fontFamily: tl.props.fontFamily,
            fontSize: tl.props.fontSize * scale,
            fontWeight: tl.props.fontWeight,
            color: tl.props.color,
            textAlign: tl.props.align,
            letterSpacing: tl.props.letterSpacing ? `${tl.props.letterSpacing}em` : undefined,
            lineHeight: tl.props.lineHeight ? tl.props.lineHeight : undefined,
            textShadow: tl.props.textShadow,
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
          onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
        >
          {tl.props.content}
        </div>
      );
    }

    if (layer.type === 'image') {
      const il = layer as ImageLayer;
      return (
        <div
          key={layer.id}
          style={{
            ...baseStyle,
            ...sizeStyle,
            filter: [
              il.props.blur ? `blur(${il.props.blur}px)` : '',
              il.props.brightness ? `brightness(${il.props.brightness})` : '',
            ].filter(Boolean).join(' ') || undefined,
          }}
          onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={il.props.src}
            alt={il.props.alt || layer.name}
            style={{ width: '100%', height: '100%', objectFit: il.props.objectFit || 'contain' }}
          />
        </div>
      );
    }

    if (layer.type === 'shape') {
      const sl = layer as ShapeLayer;
      const w = (layer.size?.width || 100) * scale;
      const h = (layer.size?.height || 100) * scale;
      return (
        <div
          key={layer.id}
          style={{
            ...baseStyle,
            width: w,
            height: h,
            background: sl.props.variant === 'line' ? undefined : sl.props.fill,
            borderRadius: sl.props.variant === 'circle' ? '50%' :
              sl.props.variant === 'rect' && sl.props.borderRadius ? sl.props.borderRadius * scale : undefined,
            border: sl.props.stroke ? `${(sl.props.strokeWidth || 1) * scale}px solid ${sl.props.stroke}` : undefined,
          }}
          onClick={(e) => { e.stopPropagation(); onLayerSelect(layer.id); }}
        />
      );
    }

    if (layer.type === 'particle') {
      const pl = layer as ParticleLayer;
      // Simplified particle rendering
      const particles = Array.from({ length: Math.min(pl.props.count, 30) }, (_, i) => ({
        id: i,
        x: Math.sin(i * 137.5) * (layer.size?.width || project.canvas.width) / 2 * pl.props.spread * scale,
        y: Math.cos(i * 137.5) * (layer.size?.height || project.canvas.height) / 2 * pl.props.spread * scale,
        size: pl.props.size * scale * (0.5 + Math.random() * 0.5),
      }));

      return (
        <div
          key={layer.id}
          style={{ ...baseStyle, ...sizeStyle, pointerEvents: 'none' }}
        >
          {particles.map(p => (
            <div
              key={p.id}
              style={{
                position: 'absolute',
                left: `calc(50% + ${p.x}px)`,
                top: `calc(50% + ${p.y}px)`,
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                background: pl.props.color,
                transform: 'translate(-50%, -50%)',
                opacity: 0.6 + Math.random() * 0.4,
              }}
            />
          ))}
        </div>
      );
    }

    return null;
  };

  const renderBackground = () => {
    const bg = project.background;
    if (bg.type === 'solid') {
      return { background: bg.color };
    }
    if (bg.type === 'gradient') {
      const dir = bg.direction === 'radial' ? 'radial-gradient' : 'linear-gradient';
      if (bg.direction === 'radial') {
        const stops = bg.stops.map(s => `${s.color} ${s.position}%`).join(', ');
        return { background: `radial-gradient(circle, ${stops})` };
      }
      const cssDir = bg.direction === 'to-bottom' ? 'to bottom' :
        bg.direction === 'to-right' ? 'to right' : 'to top right';
      const stops = bg.stops.map(s => `${s.color} ${s.position}%`).join(', ');
      return { background: `linear-gradient(${cssDir}, ${stops})` };
    }
    return { background: '#000' };
  };

  const sortedLayers = [...project.layers].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  return (
    <div ref={containerRef} style={{ position: 'relative' }} onClick={() => onLayerSelect(null)}>
      {/* Canvas */}
      <div style={{
        width: project.canvas.width * scale,
        height: project.canvas.height * scale,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 8,
        boxShadow: '0 20px 80px rgba(0,0,0,0.8)',
        ...renderBackground(),
      }}>
        {sortedLayers.map(layer => {
          if (layer.visible === false) return null;
          return renderLayer(layer);
        })}
      </div>

      {/* Canvas info overlay */}
      <div style={{
        position: 'absolute',
        bottom: -28,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '0.75rem',
        color: 'var(--color-text-muted)',
        whiteSpace: 'nowrap',
      }}>
        {project.canvas.width} × {project.canvas.height} · {(project.canvas.fps)}fps · {Math.round(scale * 100)}%
      </div>
    </div>
  );
}

function easeFunc(type: string, t: number): number {
  switch (type) {
    case 'linear': return t;
    case 'ease': return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    case 'ease-in': return t * t * t;
    case 'ease-out': return 1 - Math.pow(1 - t, 3);
    case 'ease-in-out': return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    default: return t;
  }
}
