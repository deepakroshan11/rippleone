'use client';

import { useState, useCallback } from 'react';
import type { Project, ProjectOperation } from '@/types/project';

const QUICK_ACTIONS = [
  'Clean white background',
  'Deep navy theme',
  'Accelerate to 2.0s',
  'Enlarge brand title',
  'Minimalist typography',
];

interface AIPanelProps {
  project: Project;
  onOperations: (ops: ProjectOperation[]) => void;
}

export function AIPanel({ project, onOperations }: AIPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const handleSubmit = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setIsLoading(true);
    setError(null);
    setLastResult(null);

    try {
      const res = await fetch('/api/ai/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, project }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'AI request failed');
      }

      const data = await res.json();
      if (data.operations && data.operations.length > 0) {
        onOperations(data.operations);
        setLastResult(data.explanation || `Applied ${data.operations.length} modifications.`);
      } else {
        setLastResult('No modifications detected. Try specifying colors, title, or timing.');
      }
      setPrompt('');
    } catch (err: any) {
      setError(err.message || 'Unable to process prompt. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [project, onOperations]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '0.875rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
        <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-primary)' }}>
          AI Assistant
        </span>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '2px 8px',
          borderRadius: 999,
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          fontSize: '0.68rem',
          color: '#38BDF8',
          fontWeight: 500,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#38BDF8' }} />
          Ready
        </div>
      </div>

      {/* Input Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.875rem' }}>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(prompt);
            }
          }}
          placeholder="e.g. Set brand to Ripple, use navy background, speed up motion"
          disabled={isLoading}
          rows={3}
          style={{
            width: '100%',
            padding: '0.625rem 0.75rem',
            background: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            borderRadius: 8,
            color: 'var(--color-text-primary)',
            fontFamily: 'var(--font-sans)',
            fontSize: '0.8rem',
            resize: 'none',
            outline: 'none',
            lineHeight: 1.5,
          }}
          aria-label="AI prompt"
        />

        <button
          onClick={() => handleSubmit(prompt)}
          disabled={isLoading || !prompt.trim()}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem' }}
        >
          {isLoading ? 'Processing...' : 'Apply AI Changes'}
        </button>
      </div>

      {/* Status Notifications */}
      {error && (
        <div style={{
          padding: '0.5rem 0.75rem',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 6,
          fontSize: '0.75rem',
          color: '#F87171',
          marginBottom: '0.75rem',
          lineHeight: 1.4,
        }}>
          {error}
        </div>
      )}

      {lastResult && (
        <div style={{
          padding: '0.5rem 0.75rem',
          background: 'rgba(56, 189, 248, 0.08)',
          border: '1px solid rgba(56, 189, 248, 0.2)',
          borderRadius: 6,
          fontSize: '0.75rem',
          color: '#38BDF8',
          marginBottom: '0.75rem',
          lineHeight: 1.4,
        }}>
          {lastResult}
        </div>
      )}

      {/* Quick Prompts */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{
          fontSize: '0.68rem',
          color: 'var(--color-text-muted)',
          marginBottom: '0.5rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          fontWeight: 600,
        }}>
          Quick Actions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {QUICK_ACTIONS.map(action => (
            <button
              key={action}
              onClick={() => handleSubmit(action)}
              disabled={isLoading}
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border)',
                borderRadius: 6,
                color: 'var(--color-text-secondary)',
                fontSize: '0.75rem',
                padding: '0.375rem 0.625rem',
                textAlign: 'left',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.style.borderColor = 'var(--color-border-active)';
                el.style.color = 'var(--color-text-primary)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.style.borderColor = 'var(--color-border)';
                el.style.color = 'var(--color-text-secondary)';
              }}
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
