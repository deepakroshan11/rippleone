import Link from 'next/link';
import type { Metadata } from 'next';
import { getFeaturedTemplates } from '@/lib/templates/static-templates';

export const metadata: Metadata = {
  title: 'Dashboard — RippleOne',
  description: 'Manage your animated mobile splash screens and launch experiences.',
};

const MOCK_PROJECTS = [
  { id: '1', name: 'Myntra Fashion Launch', duration: 3, lastEdited: 'Just now', templateId: 'myntra-fashion', tag: 'MYN', color: '#FF3F6C' },
  { id: '2', name: 'BookMyShow Cinema Intro', duration: 3, lastEdited: '1 hour ago', templateId: 'bookmyshow-entertainment', tag: 'BMS', color: '#DC2626' },
  { id: '3', name: 'Vodafone Vi Telecom', duration: 3, lastEdited: 'Yesterday', templateId: 'vi-telecom', tag: 'VI', color: '#38BDF8' },
];

export default function DashboardPage() {
  const featuredTemplates = getFeaturedTemplates().slice(0, 4);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2.5rem',
        borderBottom: '1px solid var(--color-border)',
        background: 'rgba(13, 22, 43, 0.85)',
        backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: '#FFFFFF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(255,255,255,0.2)',
            }}>
              <span style={{ color: '#060B17', fontWeight: 800, fontSize: '0.9rem' }}>R</span>
            </div>
            <span style={{ fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', fontSize: '1rem' }}>RippleOne</span>
          </Link>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ fontSize: '0.82rem', fontWeight: 600 }}>Projects</Link>
            <Link href="/templates" className="btn btn-ghost btn-sm" style={{ fontSize: '0.82rem' }}>Templates</Link>
            <Link href="/editor/new" className="btn btn-ghost btn-sm" style={{ fontSize: '0.82rem' }}>Studio</Link>
          </div>
        </div>
        <Link href="/editor/new" className="btn btn-primary btn-sm">
          New Project
        </Link>
      </nav>

      <main className="container-app" style={{ padding: '3.5rem 2.5rem', maxWidth: 1280, margin: '0 auto' }}>
        {/* Welcome */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-accent)', fontWeight: 700, marginBottom: '0.5rem' }}>
            Workspace Overview
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)' }}>Continue customizing your mobile intro projects or launch a new composition.</p>
        </div>

        {/* Quick actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '3.5rem',
        }}>
          <Link href="/templates" style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{
              padding: '1.5rem',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(56,189,248,0.06), transparent)',
              borderColor: 'rgba(56,189,248,0.2)',
            }}>
              <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '0.75rem', letterSpacing: '0.08em' }}>01 / EXPLORE</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Browse Templates</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>15 verified splash screen archetypes</div>
            </div>
          </Link>
          <Link href="/editor/new" style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{
              padding: '1.5rem',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, rgba(96,165,250,0.06), transparent)',
              borderColor: 'rgba(96,165,250,0.2)',
            }}>
              <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#93C5FD', marginBottom: '0.75rem', letterSpacing: '0.08em' }}>02 / ASSISTANT</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Create with AI</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Prompt your motion layout</div>
            </div>
          </Link>
          <Link href="/editor/template/clean-search" style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{
              padding: '1.5rem',
              cursor: 'pointer',
            }}>
              <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.75rem', letterSpacing: '0.08em' }}>03 / SHOWCASE</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Findora Archetype</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>Inspect clean search screen</div>
            </div>
          </Link>
          <Link href="/templates" style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{ padding: '1.5rem', cursor: 'pointer' }}>
              <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: '0.75rem', letterSpacing: '0.08em' }}>04 / PRESETS</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>Motion Presets</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>ScaleFade, SlideUp, and Ripple</div>
            </div>
          </Link>
        </div>

        {/* My Projects */}
        <section style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Recent Projects</h2>
            <Link href="/templates" className="btn btn-ghost btn-sm">View all templates</Link>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {MOCK_PROJECTS.map((project, i) => (
              <div
                key={project.id}
                className="glass-card"
                style={{
                  overflow: 'hidden',
                  animation: `slideUp 0.4s ease forwards ${i * 80}ms`,
                  opacity: 0,
                  borderRadius: 14,
                }}
              >
                {/* Preview Banner */}
                <div style={{
                  height: 120,
                  background: `linear-gradient(135deg, ${project.color}15, #080E1E)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  borderBottom: '1px solid var(--color-border)',
                }}>
                  <div style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: 6,
                    background: `rgba(255,255,255,0.06)`,
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: project.color,
                    letterSpacing: '0.08em',
                  }}>
                    {project.tag}
                  </div>
                  <div className="badge badge-gray" style={{ position: 'absolute', bottom: 10, right: 10, fontSize: '0.7rem' }}>
                    {project.duration}s
                  </div>
                </div>
                {/* Info */}
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: 'var(--color-text-primary)', fontSize: '0.95rem' }}>
                    {project.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '1.25rem' }}>
                    Last edited {project.lastEdited}
                  </div>
                  <Link
                    href={`/editor/template/${project.templateId}?variant=custom`}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', textDecoration: 'none', textAlign: 'center' }}
                  >
                    Open in Editor
                  </Link>
                </div>
              </div>
            ))}

            {/* New project CTA */}
            <Link href="/templates" style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{
                minHeight: 230,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                borderStyle: 'dashed',
                color: 'var(--color-text-muted)',
                transition: 'all 0.2s ease',
                borderRadius: 14,
              }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 300 }}>+</div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>New Composition</div>
              </div>
            </Link>
          </div>
        </section>

        {/* Featured Templates */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Featured Splash Screens</h2>
            <Link href="/templates" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>Explore gallery</Link>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '1.5rem',
          }}>
            {featuredTemplates.map(t => (
              <Link key={t.id} href={`/editor/template/${t.slug}`} style={{ textDecoration: 'none' }}>
                <div className="glass-card" style={{ padding: '1.25rem', cursor: 'pointer', borderRadius: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span style={{
                      fontSize: '0.65rem',
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      color: 'var(--color-accent)',
                      background: 'var(--color-accent-subtle)',
                      padding: '2px 6px',
                      borderRadius: 4,
                      border: '1px solid rgba(56,189,248,0.25)',
                    }}>
                      FEATURED
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {(t.durationMs / 1000).toFixed(1)}s
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem', color: 'var(--color-text-primary)' }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    {t.category}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
