'use client';

import type { Layer, Project, TextLayer, ImageLayer, ShapeLayer } from '@/types/project';

interface PropertiesPanelProps {
  layer: Layer | null;
  project: Project;
  onLayerUpdate: (id: string, changes: Partial<Layer>) => void;
  onProjectUpdate: (changes: Partial<Project>) => void;
}

export function PropertiesPanel({ layer, project, onLayerUpdate, onProjectUpdate }: PropertiesPanelProps) {
  if (!layer) {
    return (
      <div style={{ padding: '1rem', height: '100%', overflow: 'auto' }}>
        <SectionTitle>Canvas</SectionTitle>
        <PropRow label="Width">
          <NumInput
            value={project.canvas.width}
            min={540}
            max={4096}
            onChange={v => onProjectUpdate({ canvas: { ...project.canvas, width: v } })}
          />
        </PropRow>
        <PropRow label="Height">
          <NumInput
            value={project.canvas.height}
            min={960}
            max={2304}
            onChange={v => onProjectUpdate({ canvas: { ...project.canvas, height: v } })}
          />
        </PropRow>
        <PropRow label="FPS">
          <NumInput
            value={project.canvas.fps}
            min={12}
            max={60}
            onChange={v => onProjectUpdate({ canvas: { ...project.canvas, fps: v } })}
          />
        </PropRow>
        <PropRow label="Duration (ms)">
          <NumInput
            value={project.duration}
            min={500}
            max={30000}
            step={100}
            onChange={v => onProjectUpdate({ duration: v })}
          />
        </PropRow>

        <div style={{ height: '1px', background: 'var(--color-border)', margin: '1rem 0' }} />

        <SectionTitle>Background</SectionTitle>
        {project.background.type === 'solid' && (
          <PropRow label="Color">
            <ColorInput
              value={project.background.color}
              onChange={v => onProjectUpdate({ background: { type: 'solid', color: v } })}
            />
          </PropRow>
        )}

        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          background: 'var(--color-bg-elevated)',
          borderRadius: 8,
          border: '1px solid var(--color-border)',
          fontSize: '0.8rem',
          color: 'var(--color-text-muted)',
          lineHeight: 1.6,
        }}>
          Select a layer to edit its properties, or use the AI panel to modify the project.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', height: '100%', overflow: 'auto' }}>
      <SectionTitle>{layer.name}</SectionTitle>

      {/* Transform */}
      <SectionLabel>Transform</SectionLabel>
      <PropRow label="X">
        <NumInput
          value={layer.position.x}
          onChange={v => onLayerUpdate(layer.id, { position: { ...layer.position, x: v } })}
        />
      </PropRow>
      <PropRow label="Y">
        <NumInput
          value={layer.position.y}
          onChange={v => onLayerUpdate(layer.id, { position: { ...layer.position, y: v } })}
        />
      </PropRow>
      {layer.size && (
        <>
          <PropRow label="W">
            <NumInput
              value={layer.size.width}
              min={1}
              onChange={v => onLayerUpdate(layer.id, { size: { ...layer.size!, width: v } })}
            />
          </PropRow>
          <PropRow label="H">
            <NumInput
              value={layer.size.height}
              min={1}
              onChange={v => onLayerUpdate(layer.id, { size: { ...layer.size!, height: v } })}
            />
          </PropRow>
        </>
      )}
      <PropRow label="Scale">
        <NumInput
          value={layer.scale ?? 1}
          min={0.01}
          max={20}
          step={0.01}
          onChange={v => onLayerUpdate(layer.id, { scale: v })}
        />
      </PropRow>
      <PropRow label="Rotation">
        <NumInput
          value={layer.rotation ?? 0}
          min={-360}
          max={360}
          onChange={v => onLayerUpdate(layer.id, { rotation: v })}
        />
      </PropRow>
      <PropRow label="Opacity">
        <NumInput
          value={Math.round((layer.opacity ?? 1) * 100)}
          min={0}
          max={100}
          suffix="%"
          onChange={v => onLayerUpdate(layer.id, { opacity: v / 100 })}
        />
      </PropRow>

      <div style={{ height: '1px', background: 'var(--color-border)', margin: '0.75rem 0' }} />

      {/* Timeline */}
      <SectionLabel>Timeline</SectionLabel>
      <PropRow label="Start (ms)">
        <NumInput
          value={layer.timeline.start}
          min={0}
          max={project.duration}
          step={100}
          onChange={v => onLayerUpdate(layer.id, { timeline: { ...layer.timeline, start: v } })}
        />
      </PropRow>
      <PropRow label="Duration (ms)">
        <NumInput
          value={layer.timeline.duration}
          min={100}
          step={100}
          onChange={v => onLayerUpdate(layer.id, { timeline: { ...layer.timeline, duration: v } })}
        />
      </PropRow>

      <div style={{ height: '1px', background: 'var(--color-border)', margin: '0.75rem 0' }} />

      {/* Animation */}
      <SectionLabel>Animation</SectionLabel>
      <PropRow label="Enter">
        <SelectInput
          value={layer.animation?.enter || 'none'}
          options={['none', 'fade', 'scaleFade', 'slideUp', 'slideDown', 'zoomIn', 'glow', 'glitch']}
          onChange={v => onLayerUpdate(layer.id, { animation: { ...layer.animation, enter: v as any } })}
        />
      </PropRow>
      <PropRow label="Exit">
        <SelectInput
          value={layer.animation?.exit || 'none'}
          options={['none', 'fade', 'slideUp', 'slideDown', 'zoomOut']}
          onChange={v => onLayerUpdate(layer.id, { animation: { ...layer.animation, exit: v as any } })}
        />
      </PropRow>

      {/* Type-specific */}
      {layer.type === 'text' && <TextProperties layer={layer as TextLayer} onUpdate={changes => onLayerUpdate(layer.id, changes as any)} />}
      {layer.type === 'image' && <ImageProperties layer={layer as ImageLayer} onUpdate={changes => onLayerUpdate(layer.id, changes as any)} />}
      {layer.type === 'shape' && <ShapeProperties layer={layer as ShapeLayer} onUpdate={changes => onLayerUpdate(layer.id, changes as any)} />}
    </div>
  );
}

function TextProperties({ layer, onUpdate }: { layer: TextLayer; onUpdate: (c: Partial<TextLayer>) => void }) {
  return (
    <>
      <div style={{ height: '1px', background: 'var(--color-border)', margin: '0.75rem 0' }} />
      <SectionLabel>Text</SectionLabel>
      <PropRow label="Content">
        <input
          type="text"
          value={layer.props.content}
          onChange={e => onUpdate({ props: { ...layer.props, content: e.target.value } })}
          className="input"
          style={{ fontSize: '0.8rem', padding: '0.375rem 0.625rem' }}
        />
      </PropRow>
      <PropRow label="Size">
        <NumInput
          value={layer.props.fontSize}
          min={6}
          max={500}
          onChange={v => onUpdate({ props: { ...layer.props, fontSize: v } })}
        />
      </PropRow>
      <PropRow label="Color">
        <ColorInput
          value={layer.props.color}
          onChange={v => onUpdate({ props: { ...layer.props, color: v } })}
        />
      </PropRow>
      <PropRow label="Align">
        <SelectInput
          value={layer.props.align}
          options={['left', 'center', 'right']}
          onChange={v => onUpdate({ props: { ...layer.props, align: v as any } })}
        />
      </PropRow>
    </>
  );
}

function ImageProperties({ layer, onUpdate }: { layer: ImageLayer; onUpdate: (c: Partial<ImageLayer>) => void }) {
  return (
    <>
      <div style={{ height: '1px', background: 'var(--color-border)', margin: '0.75rem 0' }} />
      <SectionLabel>Image</SectionLabel>
      <PropRow label="Src">
        <input
          type="text"
          value={layer.props.src}
          onChange={e => onUpdate({ props: { ...layer.props, src: e.target.value } })}
          className="input"
          style={{ fontSize: '0.75rem', padding: '0.375rem 0.625rem' }}
        />
      </PropRow>
      <PropRow label="Brightness">
        <NumInput
          value={layer.props.brightness ?? 1}
          min={0}
          max={2}
          step={0.1}
          onChange={v => onUpdate({ props: { ...layer.props, brightness: v } })}
        />
      </PropRow>
    </>
  );
}

function ShapeProperties({ layer, onUpdate }: { layer: ShapeLayer; onUpdate: (c: Partial<ShapeLayer>) => void }) {
  return (
    <>
      <div style={{ height: '1px', background: 'var(--color-border)', margin: '0.75rem 0' }} />
      <SectionLabel>Shape</SectionLabel>
      <PropRow label="Fill">
        <ColorInput
          value={layer.props.fill.startsWith('rgba') || layer.props.fill === 'transparent' ? '#14B45A' : layer.props.fill}
          onChange={v => onUpdate({ props: { ...layer.props, fill: v } })}
        />
      </PropRow>
      <PropRow label="Variant">
        <SelectInput
          value={layer.props.variant}
          options={['circle', 'rect', 'triangle', 'line']}
          onChange={v => onUpdate({ props: { ...layer.props, variant: v as any } })}
        />
      </PropRow>
    </>
  );
}

// ── Subcomponents ─────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.875rem', color: 'var(--color-text-primary)' }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '0.7rem',
      color: 'var(--color-text-muted)',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      fontWeight: 600,
      marginBottom: '0.5rem',
      marginTop: '0.75rem',
    }}>
      {children}
    </div>
  );
}

function PropRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '0.5rem',
    }}>
      <label style={{
        fontSize: '0.78rem',
        color: 'var(--color-text-muted)',
        minWidth: 70,
        flexShrink: 0,
      }}>
        {label}
      </label>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function NumInput({ value, min, max, step = 1, suffix, onChange }: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        style={{
          flex: 1,
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 6,
          color: 'var(--color-text-primary)',
          padding: '0.3rem 0.5rem',
          fontSize: '0.8rem',
          fontFamily: 'var(--font-mono)',
          outline: 'none',
          width: '100%',
        }}
      />
      {suffix && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{suffix}</span>}
    </div>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const safeValue = value.startsWith('#') ? value : '#14B45A';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <input
        type="color"
        value={safeValue}
        onChange={e => onChange(e.target.value)}
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          border: '1px solid var(--color-border)',
          cursor: 'pointer',
          background: 'none',
          padding: 2,
        }}
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          flex: 1,
          background: 'var(--color-bg-elevated)',
          border: '1px solid var(--color-border)',
          borderRadius: 6,
          color: 'var(--color-text-primary)',
          padding: '0.3rem 0.5rem',
          fontSize: '0.75rem',
          fontFamily: 'var(--font-mono)',
          outline: 'none',
        }}
      />
    </div>
  );
}

function SelectInput({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        width: '100%',
        background: 'var(--color-bg-elevated)',
        border: '1px solid var(--color-border)',
        borderRadius: 6,
        color: 'var(--color-text-primary)',
        padding: '0.3rem 0.5rem',
        fontSize: '0.8rem',
        fontFamily: 'var(--font-sans)',
        outline: 'none',
        cursor: 'pointer',
      }}
    >
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}
