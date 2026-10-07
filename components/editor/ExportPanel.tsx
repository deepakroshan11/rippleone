'use client';

import { useState } from 'react';
import type { Project } from '@/types/project';

interface ExportPanelProps {
  project: Project;
}

type ExportType = 'json' | 'html' | 'react' | 'webm';

export function ExportPanel({ project }: ExportPanelProps) {
  const [activeExport, setActiveExport] = useState<ExportType>('json');
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (type: ExportType) => {
    setIsExporting(true);
    try {
      if (type === 'json') {
        const json = JSON.stringify(project, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        downloadBlob(blob, `${slugify(project.name)}-project.json`);
        return;
      }

      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project, target: type }),
      });

      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const ext = type === 'html' ? 'zip' : type === 'react' ? 'zip' : 'webm';
      downloadBlob(blob, `${slugify(project.name)}-${type}.${ext}`);
    } catch (err: any) {
      console.error('Export error:', err);
      alert(`Export failed: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = [
    { type: 'json' as ExportType, label: 'Project JSON', badge: 'JSON', desc: 'Save the project schema', available: true },
    { type: 'html' as ExportType, label: 'HTML / CSS / JS', badge: 'HTML', desc: 'Standalone web animation', available: true },
    { type: 'react' as ExportType, label: 'React Component', badge: 'JSX', desc: 'React component package', available: true },
    { type: 'webm' as ExportType, label: 'Video (WebM)', badge: 'WEBM', desc: 'Browser-rendered video', available: false },
  ];

  return (
    <div style={{ padding: '1rem', height: '100%', overflow: 'auto' }}>
      <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
        Export Project
      </div>

      {/* Export options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {exportOptions.map(opt => (
          <div
            key={opt.type}
            onClick={() => opt.available && setActiveExport(opt.type)}
            style={{
              padding: '0.75rem',
              borderRadius: 8,
              border: `1px solid ${activeExport === opt.type ? 'var(--color-accent)' : 'var(--color-border)'}`,
              background: activeExport === opt.type ? 'var(--color-accent-subtle)' : 'var(--color-bg-elevated)',
              cursor: opt.available ? 'pointer' : 'not-allowed',
              opacity: opt.available ? 1 : 0.5,
              transition: 'all 0.1s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <span style={{
                fontSize: '0.65rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                padding: '3px 6px',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: 4,
                color: 'var(--color-text-secondary)',
                letterSpacing: '0.04em',
              }}>
                {opt.badge}
              </span>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  color: activeExport === opt.type ? 'var(--color-accent)' : 'var(--color-text-primary)',
                }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{opt.desc}</div>
              </div>
              {!opt.available && (
                <span className="badge badge-gray" style={{ fontSize: '0.65rem' }}>Soon</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => handleExport(activeExport)}
        disabled={isExporting}
        className="btn btn-primary"
        style={{ width: '100%', marginBottom: '1rem' }}
      >
        {isExporting ? '⟳ Exporting...' : `⬇ Download ${exportOptions.find(o => o.type === activeExport)?.label}`}
      </button>

      {/* Project info */}
      <div style={{
        padding: '0.875rem',
        background: 'var(--color-bg-elevated)',
        borderRadius: 8,
        border: '1px solid var(--color-border)',
      }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
          Project Info
        </div>
        {[
          { label: 'Name', value: project.name },
          { label: 'Canvas', value: `${project.canvas.width} × ${project.canvas.height}` },
          { label: 'Duration', value: `${(project.duration / 1000).toFixed(1)}s` },
          { label: 'FPS', value: `${project.canvas.fps}fps` },
          { label: 'Layers', value: project.layers.length },
          { label: 'Version', value: project.version },
        ].map(row => (
          <div key={row.label} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0.25rem 0',
            borderBottom: '1px solid var(--color-border)',
            fontSize: '0.78rem',
          }}>
            <span style={{ color: 'var(--color-text-muted)' }}>{row.label}</span>
            <span style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
