'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Project, ProjectOperation } from '@/types/project';
import type { TemplateDefinition } from '@/templates/registry';
import { TemplateMotionPlayer } from '@/components/templates/TemplateMotionPlayer';
import { applyOperations } from '@/lib/engine/apply-operations';

interface TemplateDetailViewProps {
  template: TemplateDefinition;
}

export function TemplateDetailView({ template }: TemplateDetailViewProps) {
  const router = useRouter();
  const [activeProject, setActiveProject] = useState<Project>(template.project);
  const [isModified, setIsModified] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResultNote, setAiResultNote] = useState<string | null>(null);
  const [playerKey, setPlayerKey] = useState(0);

  const handleAiCustomize = async (customPrompt?: string) => {
    const text = customPrompt || aiPrompt;
    if (!text.trim()) return;

    setIsGenerating(true);
    setAiResultNote(null);

    try {
      const res = await fetch('/api/ai/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, project: activeProject }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate customization');
      }

      const data = await res.json();
      if (data.operations && data.operations.length > 0) {
        const updated = applyOperations(activeProject, data.operations as ProjectOperation[]);
        setActiveProject(updated);
        setIsModified(true);
        setAiResultNote(data.explanation || `Applied ${data.operations.length} dynamic AI changes.`);
        setPlayerKey(prev => prev + 1); // trigger reload of motion player with updated project
      } else {
        setAiResultNote('AI evaluated project. No modifications required.');
      }
    } catch (err: any) {
      setAiResultNote(err.message || 'Customization failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetOriginal = () => {
    setActiveProject(template.project);
    setIsModified(false);
    setAiResultNote(null);
    setPlayerKey(prev => prev + 1);
  };

  const handleOpenEditor = () => {
    if (isModified && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`custom_project_${template.slug}`, JSON.stringify(activeProject));
      } catch (e) {
        console.warn('Could not cache custom project', e);
      }
      router.push(`/editor/template/${template.slug}?variant=custom`);
    } else {
      router.push(`/editor/template/${template.slug}`);
    }
  };

  const durationSec = (activeProject.duration / 1000).toFixed(1);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', color: 'var(--color-text-primary)' }}>
      {/* Top Bar */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--color-border)',
        background: 'rgba(8,12,16,0.85)',
        backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/templates" className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
            ← Back to Gallery
          </Link>
          <div style={{ height: 20, width: 1, background: 'var(--color-border)' }} />
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              {activeProject.name || template.name}
            </h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {template.category} · {template.aspectRatio} · {durationSec}s Intro
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isModified && (
            <button onClick={handleResetOriginal} className="btn btn-secondary btn-sm">
              ↺ Reset to Default
            </button>
          )}
          <button onClick={handleOpenEditor} className="btn btn-primary btn-sm" style={{ fontWeight: 600 }}>
            Use Template in Editor →
          </button>
        </div>
      </nav>

      {/* Main Studio Workspace */}
      <div className="container-app" style={{ padding: '2.5rem 2rem', display: 'grid', gridTemplateColumns: 'minmax(320px, 480px) 1fr', gap: '3rem', alignItems: 'start' }}>
        {/* Left: Motion Player Showcase */}
        <div>
          <div style={{
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 16,
            padding: '1.25rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}>
            <TemplateMotionPlayer
              key={playerKey}
              project={activeProject}
              autoplayOnHover={false}
              loop={true}
            />

            {/* Spec Metrics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginTop: '1.25rem', textAlign: 'center' }}>
              <div style={{ background: 'var(--color-bg-elevated)', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Duration</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-accent)' }}>{durationSec}s</div>
              </div>
              <div style={{ background: 'var(--color-bg-elevated)', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Canvas</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{activeProject.canvas.width}×{activeProject.canvas.height}</div>
              </div>
              <div style={{ background: 'var(--color-bg-elevated)', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Ratio</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{template.aspectRatio}</div>
              </div>
              <div style={{ background: 'var(--color-bg-elevated)', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Layers</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{activeProject.layers.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Timeline Anatomy & AI Customization */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* AI Customization Studio */}
          <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(157,78,221,0.25)', background: 'linear-gradient(135deg, rgba(157,78,221,0.06), rgba(8,12,16,0.9))' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                background: 'linear-gradient(135deg, #9D4EDD, #6A2B9C)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 10px rgba(157,78,221,0.3)',
                fontSize: '0.65rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: '#fff',
              }}>
                AI
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Customize with AI</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Describe what to change — brand color, typography, duration, or tagline</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <input
                type="text"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAiCustomize()}
                placeholder='e.g., "Change brand accent to emerald green and shorten reveal to 2.5s"'
                className="input"
                style={{ flex: 1 }}
                disabled={isGenerating}
              />
              <button
                onClick={() => handleAiCustomize()}
                disabled={isGenerating || !aiPrompt.trim()}
                className="btn btn-ai"
                style={{ whiteSpace: 'nowrap' }}
              >
                {isGenerating ? 'Thinking...' : 'Generate'}
              </button>
            </div>

            {/* Quick Suggestion Chips */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {[
                'Change brand accent to emerald',
                'Set background to warm cream',
                'Speed up reveal to 2.5s',
                'Make logo icon 20% larger',
                'Set typography to editorial serif',
              ].map(s => (
                <button
                  key={s}
                  onClick={() => { setAiPrompt(s); handleAiCustomize(s); }}
                  disabled={isGenerating}
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 999,
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>

            {aiResultNote && (
              <div style={{
                padding: '0.625rem 0.875rem',
                borderRadius: 8,
                background: 'rgba(20,180,90,0.1)',
                border: '1px solid rgba(20,180,90,0.3)',
                color: 'var(--color-accent)',
                fontSize: '0.8rem',
                lineHeight: 1.4,
              }}>
                {aiResultNote}
              </div>
            )}
          </div>

          {/* Animation Timeline Anatomy Breakdown */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Motion Timeline Anatomy
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
              Every element enters with precise choreography, easing, and duration.
            </p>

            {/* Timeline Ruler */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
              <span>0.0s</span>
              <span>{(activeProject.duration * 0.25 / 1000).toFixed(1)}s</span>
              <span>{(activeProject.duration * 0.5 / 1000).toFixed(1)}s</span>
              <span>{(activeProject.duration * 0.75 / 1000).toFixed(1)}s</span>
              <span>{durationSec}s</span>
            </div>

            {/* Visual Layer Tracks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activeProject.layers.map((layer) => {
                const totalDur = activeProject.duration;
                const leftPercent = Math.max(0, Math.min(100, (layer.timeline.start / totalDur) * 100));
                const widthPercent = Math.max(8, Math.min(100 - leftPercent, (layer.timeline.duration / totalDur) * 100));

                const typeColor = layer.type === 'text' ? '#14B45A' :
                  layer.type === 'image' ? '#38BDF8' :
                  layer.type === 'particle' ? '#F59E0B' : '#9D4EDD';

                return (
                  <div key={layer.id} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {layer.name}
                    </div>
                    <div style={{ height: 22, background: 'rgba(255,255,255,0.04)', borderRadius: 4, position: 'relative', overflow: 'hidden' }}>
                      <div
                        style={{
                          position: 'absolute',
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                          height: '100%',
                          borderRadius: 4,
                          background: `linear-gradient(90deg, ${typeColor}88, ${typeColor}cc)`,
                          border: `1px solid ${typeColor}`,
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 6px',
                          fontSize: '0.65rem',
                          color: '#FFFFFF',
                          fontWeight: 600,
                        }}
                      >
                        {layer.animation?.enter || 'hold'} · {(layer.timeline.duration / 1000).toFixed(1)}s
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Call to Action */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', background: 'var(--color-bg-surface)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Ready to build your intro?</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Launch full studio editor with timeline, canvas keyframing, and code export.</div>
            </div>
            <button onClick={handleOpenEditor} className="btn btn-primary" style={{ padding: '0.625rem 1.5rem', fontWeight: 700 }}>
              Open in Studio Editor →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
