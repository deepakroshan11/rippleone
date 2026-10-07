'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import type { Project, Layer, ProjectOperation } from '@/types/project';
import { applyOperations } from '@/lib/engine/apply-operations';
import { LayerList } from '@/components/editor/LayerList';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { Timeline } from '@/components/editor/Timeline';
import { PreviewCanvas } from '@/components/editor/PreviewCanvas';
import { AIPanel } from '@/components/ai/AIPanel';
import { ExportPanel } from '@/components/editor/ExportPanel';

interface EditorProps {
  initialProject: Project;
}

type ActivePanel = 'layers' | 'ai' | 'export';

export default function Editor({ initialProject }: EditorProps) {
  const [project, setProject] = useState<Project>(initialProject);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  // Default playhead to poster frame where branding, logo, and icons are fully visible!
  const defaultPosterTime = Math.min(1250, Math.round((initialProject.duration || 3000) * 0.45));
  const [currentTime, setCurrentTime] = useState(defaultPosterTime);
  const [activePanel, setActivePanel] = useState<ActivePanel>('layers');
  const [history, setHistory] = useState<Project[]>([]);
  const [future, setFuture] = useState<Project[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [aiVariant, setAiVariant] = useState<Project | null>(null);

  // Restore custom project if variant=custom is present in URL
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('variant') === 'custom') {
        const pathParts = window.location.pathname.split('/');
        const slug = pathParts[pathParts.length - 1];
        if (slug) {
          const cached = localStorage.getItem(`custom_project_${slug}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.layers && parsed.canvas) {
              setProject(parsed);
            }
          }
        }
      }
    } catch (e) {
      console.warn('Could not restore cached custom project', e);
    }
  }, []);

  const selectedLayer = project.layers.find(l => l.id === selectedLayerId) || null;

  // --- History management ---
  const pushHistory = useCallback((prev: Project) => {
    setHistory(h => [...h.slice(-49), prev]);
    setFuture([]);
  }, []);

  const updateProject = useCallback((updater: (p: Project) => Project) => {
    setProject(prev => {
      pushHistory(prev);
      return updater(prev);
    });
  }, [pushHistory]);

  const undo = useCallback(() => {
    setHistory(h => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setFuture(f => [project, ...f]);
      setProject(prev);
      return h.slice(0, -1);
    });
  }, [project]);

  const redo = useCallback(() => {
    setFuture(f => {
      if (f.length === 0) return f;
      const next = f[0];
      setHistory(h => [...h, project]);
      setProject(next);
      return f.slice(1);
    });
  }, [project]);

  // --- AI operations ---
  const applyAIOperations = useCallback((ops: ProjectOperation[]) => {
    const variant = applyOperations(project, ops);
    setAiVariant(variant);
    setCurrentTime(t => (t < 400 ? Math.min(1200, variant.duration * 0.45) : t));
  }, [project]);

  const acceptAIVariant = useCallback(() => {
    if (!aiVariant) return;
    pushHistory(project);
    setProject(aiVariant);
    setAiVariant(null);
  }, [aiVariant, project, pushHistory]);

  const rejectAIVariant = useCallback(() => {
    setAiVariant(null);
  }, []);

  // --- Layer selection ---
  const handleLayerSelect = useCallback((id: string | null) => {
    setSelectedLayerId(id);
  }, []);

  // --- Layer update ---
  const handleLayerUpdate = useCallback((layerId: string, changes: Partial<Layer>) => {
    updateProject(p => applyOperations(p, [{
      type: 'update_layer',
      layerId,
      changes,
    }]));
  }, [updateProject]);

  // --- Save ---
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      // In production, this would save to Supabase
      localStorage.setItem(`project-${project.id}`, JSON.stringify(project));
      console.log('Project saved locally');
    } finally {
      setTimeout(() => setIsSaving(false), 800);
    }
  }, [project]);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying(playing => {
      if (!playing) {
        if (currentTime >= project.duration - 40) {
          setCurrentTime(0);
        }
        return true;
      }
      return false;
    });
  }, [currentTime, project.duration]);

  const displayProject = aiVariant || project;

  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: 'auto 1fr auto',
      height: '100vh',
      overflow: 'hidden',
      background: 'var(--color-bg-base)',
      fontFamily: 'var(--font-sans)',
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.625rem 1rem',
        background: 'var(--color-bg-surface)',
        borderBottom: '1px solid var(--color-border)',
        zIndex: 50,
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/dashboard" style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            textDecoration: 'none', color: 'var(--color-text-secondary)',
            fontSize: '0.85rem',
          }}>
            <span>←</span> Dashboard
          </Link>
          <div style={{ width: 1, height: 20, background: 'var(--color-border)' }} />
          <input
            type="text"
            value={project.name}
            onChange={e => updateProject(p => ({ ...p, name: e.target.value }))}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--color-text-primary)',
              fontWeight: 600,
              fontSize: '0.95rem',
              fontFamily: 'var(--font-sans)',
              minWidth: 200,
            }}
            aria-label="Project name"
          />
        </div>

        {/* Center — playback */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="btn btn-ghost btn-icon btn-sm"
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
          >
            Undo
          </button>
          <button
            onClick={redo}
            disabled={future.length === 0}
            className="btn btn-ghost btn-sm"
            title="Redo (Ctrl+Shift+Z)"
            aria-label="Redo"
            style={{ fontSize: '0.75rem', padding: '0.35rem 0.6rem' }}
          >
            Redo
          </button>
          <div style={{ width: 1, height: 18, background: 'var(--color-border)' }} />
          <button
            onClick={handleTogglePlay}
            className="btn btn-primary btn-sm"
            aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
            style={{ minWidth: 76 }}
          >
            {isPlaying ? 'Pause' : currentTime >= project.duration - 40 ? 'Replay' : 'Play'}
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', minWidth: 60, textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
            {(currentTime / 1000).toFixed(2)}s / {(project.duration / 1000).toFixed(1)}s
          </span>
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {aiVariant && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-ai)', alignSelf: 'center' }}>AI Preview</span>
              <button onClick={acceptAIVariant} className="btn btn-primary btn-sm">Apply</button>
              <button onClick={rejectAIVariant} className="btn btn-secondary btn-sm">Reject</button>
            </div>
          )}
          <button
            onClick={() => setActivePanel(p => p === 'export' ? 'layers' : 'export')}
            className="btn btn-secondary btn-sm"
          >
            Export
          </button>
          <button
            onClick={handleSave}
            className="btn btn-primary btn-sm"
            disabled={isSaving}
          >
            {isSaving ? 'Saved' : 'Save'}
          </button>
        </div>
      </header>

      {/* Main area */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 300px', overflow: 'hidden' }}>
        {/* Left sidebar */}
        <div style={{
          background: 'var(--color-bg-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Panel tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
            {(['layers', 'ai'] as const).map(panel => (
              <button
                key={panel}
                onClick={() => setActivePanel(panel)}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  background: activePanel === panel ? 'var(--color-bg-elevated)' : 'transparent',
                  border: 'none',
                  borderBottom: activePanel === panel ? `2px solid var(--color-accent)` : '2px solid transparent',
                  color: activePanel === panel ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  fontFamily: 'var(--font-sans)',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s ease',
                }}
                aria-pressed={activePanel === panel}
              >
                {panel === 'layers' ? 'Layers' : 'AI Assistant'}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: 'hidden' }}>
            {activePanel === 'layers' && (
              <LayerList
                layers={project.layers}
                selectedLayerId={selectedLayerId}
                onSelect={handleLayerSelect}
                onReorder={layers => updateProject(p => ({ ...p, layers }))}
                onDelete={id => updateProject(p => applyOperations(p, [{ type: 'remove_layer', layerId: id }]))}
                onDuplicate={id => {
                  const layer = project.layers.find(l => l.id === id);
                  if (layer) {
                    updateProject(p => applyOperations(p, [{
                      type: 'add_layer',
                      layer: { ...layer, id: `${layer.id}_copy_${Date.now()}`, name: `${layer.name} (copy)` },
                    }]));
                  }
                }}
              />
            )}
            {activePanel === 'ai' && (
              <AIPanel
                project={project}
                onOperations={applyAIOperations}
              />
            )}
          </div>
        </div>

        {/* Canvas */}
        <div style={{
          background: '#040812',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <PreviewCanvas
            project={displayProject}
            isPlaying={isPlaying}
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
            onPlayEnd={() => setIsPlaying(false)}
            selectedLayerId={selectedLayerId}
            onLayerSelect={handleLayerSelect}
          />
          {aiVariant && (
            <div style={{
              position: 'absolute',
              top: 12, left: '50%',
              transform: 'translateX(-50%)',
              padding: '0.375rem 0.75rem',
              background: 'rgba(157,78,221,0.15)',
              border: '1px solid rgba(157,78,221,0.4)',
              borderRadius: 20,
              fontSize: '0.75rem',
              color: '#bf7fff',
              backdropFilter: 'blur(10px)',
            }}>
              Previewing AI Changes
            </div>
          )}
        </div>

        {/* Right panel */}
        <div style={{
          background: 'var(--color-bg-surface)',
          borderLeft: '1px solid var(--color-border)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {activePanel === 'export' ? (
            <ExportPanel project={project} />
          ) : (
            <PropertiesPanel
              layer={displayProject.layers.find(l => l.id === selectedLayerId) || null}
              project={displayProject}
              onLayerUpdate={handleLayerUpdate}
              onProjectUpdate={(changes) => updateProject(p => ({ ...p, ...changes }))}
            />
          )}
        </div>
      </div>

      {/* Timeline */}
      <div style={{
        background: 'var(--color-bg-surface)',
        borderTop: '1px solid var(--color-border)',
        height: 180,
        overflow: 'hidden',
      }}>
        <Timeline
          project={project}
          currentTime={currentTime}
          selectedLayerId={selectedLayerId}
          onTimeChange={setCurrentTime}
          onLayerSelect={handleLayerSelect}
          onLayerUpdate={handleLayerUpdate}
        />
      </div>
    </div>
  );
}
