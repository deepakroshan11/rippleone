'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { Project, Layer, TextLayer, ImageLayer, ShapeLayer } from '@/types/project';

interface TemplateMotionPlayerProps {
  project: Project;
  autoplayOnHover?: boolean;
  loop?: boolean;
  initialTime?: number;
  className?: string;
  onSelect?: () => void;
}

export function TemplateMotionPlayer({
  project,
  autoplayOnHover = true,
  loop = true,
  initialTime,
  className = '',
  onSelect,
}: TemplateMotionPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Default display frame: 1200ms where logo & tagline are fully revealed
  const defaultPeakTime = initialTime !== undefined ? initialTime : Math.min(1300, project.duration * 0.45);
  const [currentTime, setCurrentTime] = useState<number>(defaultPeakTime);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [scale, setScale] = useState<number>(0.26);

  const playheadRef = useRef<number>(defaultPeakTime);
  playheadRef.current = currentTime;

  // Responsive scale computation to fit smartphone card container
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && project.canvas?.width > 0) {
        setScale(rect.width / project.canvas.width);
      }
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', updateScale);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [project.canvas.width]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      startTimeRef.current = null;
      return;
    }

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp - playheadRef.current;
      }
      let elapsed = timestamp - startTimeRef.current;

      if (elapsed >= project.duration) {
        if (loop) {
          startTimeRef.current = timestamp;
          elapsed = 0;
        } else {
          setCurrentTime(project.duration);
          setIsPlaying(false);
          startTimeRef.current = null;
          return;
        }
      }

      setCurrentTime(elapsed);
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, loop, project.duration]);

  const handleMouseEnter = () => {
    if (autoplayOnHover) {
      setCurrentTime(0);
      playheadRef.current = 0;
      startTimeRef.current = null;
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (autoplayOnHover) {
      setIsPlaying(false);
      setCurrentTime(defaultPeakTime);
      playheadRef.current = defaultPeakTime;
    }
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (currentTime >= project.duration - 50) {
        setCurrentTime(0);
        playheadRef.current = 0;
        startTimeRef.current = null;
      }
      setIsPlaying(true);
    }
  };

  // Compute layer visibility & animation transforms
  const getLayerStyle = useCallback((layer: Layer) => {
    const { start, duration: dur, easing = 'ease' } = layer.timeline;
    const end = start + dur;
    const enterDur = layer.animation?.enterDuration ?? 600;
    const exitDur = layer.animation?.exitDuration ?? 400;

    if (currentTime < start || currentTime > end) {
      return { _visible: false, opacity: 0 };
    }

    const elapsed = currentTime - start;
    const timeLeft = end - currentTime;
    const enterProgress = Math.min(1, elapsed / enterDur);
    const exitProgress = Math.min(1, Math.max(0, 1 - timeLeft / exitDur));

    const baseOpacity = (layer.opacity === undefined || (layer.opacity === 0 && !!layer.animation?.enter)) ? 1 : layer.opacity;
    let opacity = baseOpacity;
    let transform = 'translate(-50%, -50%)';

    const enter = layer.animation?.enter || 'none';
    const exit = layer.animation?.exit || 'none';

    // Enter
    if (elapsed < enterDur) {
      const t = easeFunc(easing, enterProgress);
      opacity = baseOpacity * t;

      if (enter === 'scaleFade') {
        const s = 0.82 + 0.18 * t;
        transform = `translate(-50%, -50%) scale(${s})`;
      } else if (enter === 'slideUp') {
        const y = 30 * (1 - t);
        transform = `translate(-50%, calc(-50% + ${y}px))`;
      } else if (enter === 'slideDown') {
        const y = -30 * (1 - t);
        transform = `translate(-50%, calc(-50% + ${y}px))`;
      } else if (enter === 'slideLeft') {
        const x = 30 * (1 - t);
        transform = `translate(calc(-50% + ${x}px), -50%)`;
      } else if (enter === 'slideRight') {
        const x = -30 * (1 - t);
        transform = `translate(calc(-50% - ${x}px), -50%)`;
      } else if (enter === 'zoomIn') {
        const s = 0.6 + 0.4 * t;
        transform = `translate(-50%, -50%) scale(${s})`;
      } else if (enter === 'zoomOut') {
        const s = 1.3 - 0.3 * t;
        transform = `translate(-50%, -50%) scale(${s})`;
      }
    }

    // Exit
    if (timeLeft < exitDur && timeLeft >= 0) {
      const t = 1 - easeFunc(easing, exitProgress);
      opacity = baseOpacity * t;
      if (exit === 'slideUp') {
        const y = -25 * (1 - t);
        transform = `translate(-50%, calc(-50% + ${y}px))`;
      } else if (exit === 'slideDown') {
        const y = 25 * (1 - t);
        transform = `translate(-50%, calc(-50% + ${y}px))`;
      } else if (exit === 'zoomOut') {
        const s = 1 - 0.25 * (1 - t);
        transform = `translate(-50%, -50%) scale(${s})`;
      } else if (exit === 'scaleFade') {
        const s = 1 - 0.2 * (1 - t);
        transform = `translate(-50%, -50%) scale(${s})`;
      }
    }

    return { _visible: true, opacity, transform };
  }, [currentTime]);

  const renderBackground = () => {
    const bg = project.background;
    if (bg.type === 'solid') return { background: bg.color };
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
    return { background: '#FFFFFF' };
  };

  const renderLayer = (layer: Layer) => {
    const style = getLayerStyle(layer);
    if (!style._visible) return null;

    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: layer.position.x * scale,
      top: layer.position.y * scale,
      transform: style.transform,
      opacity: style.opacity,
      pointerEvents: 'none',
      userSelect: 'none',
    };

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
            whiteSpace: 'nowrap',
          }}
        >
          {tl.props.content}
        </div>
      );
    }

    if (layer.type === 'image') {
      const il = layer as ImageLayer;
      const w = (layer.size?.width || 180) * scale;
      const h = (layer.size?.height || 180) * scale;
      return (
        <div key={layer.id} style={{ ...baseStyle, width: w, height: h }}>
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
            border: sl.props.stroke ? `${Math.max(1, (sl.props.strokeWidth || 1) * scale)}px solid ${sl.props.stroke}` : undefined,
          }}
        />
      );
    }

    return null;
  };

  const sortedLayers = [...project.layers].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onSelect || togglePlay}
      className={`phone-splash-frame ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '9 / 16',
        borderRadius: 24,
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 8px 30px rgba(0,0,0,0.18), 0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid rgba(255,255,255,0.15)',
        background: '#FFFFFF',
      }}
    >
      {/* Smartphone Speaker Ear-Piece Slit */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 50,
          height: 4,
          borderRadius: 3,
          background: 'rgba(0,0,0,0.12)',
          zIndex: 20,
          pointerEvents: 'none',
        }}
      />

      {/* Actual Splash Screen Canvas Content */}
      <div
        style={{
          width: project.canvas.width * scale,
          height: project.canvas.height * scale,
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          overflow: 'hidden',
          ...renderBackground(),
        }}
      >
        {sortedLayers.map(layer => {
          if (layer.visible === false) return null;
          return renderLayer(layer);
        })}
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
