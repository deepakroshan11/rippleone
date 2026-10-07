import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RippleOne — Mobile Splash Screen & Launch Motion Studio',
  description: 'Design authentic, production-grade mobile app splash screens and animated launch experiences with intelligent AI assistance.',
};

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 2.5rem',
        borderBottom: '1px solid var(--color-border)',
        background: 'rgba(13, 22, 43, 0.85)',
        backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(255,255,255,0.2)',
          }}>
            <span style={{ color: '#060B17', fontWeight: 800, fontSize: '0.9rem' }}>R</span>
          </div>
          <span style={{ fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1rem', color: 'var(--color-text-primary)' }}>
            RippleOne
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link href="/templates" className="btn btn-ghost btn-sm" style={{ fontSize: '0.85rem' }}>
            Templates
          </Link>
          <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ fontSize: '0.85rem' }}>
            Dashboard
          </Link>
          <Link href="/templates" className="btn btn-primary btn-sm">
            Launch Studio
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        padding: '7rem 2rem 5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle Navy Gradient Mesh */}
        <div style={{
          position: 'absolute', top: '25%', left: '35%',
          width: 550, height: 550,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          transform: 'translate(-50%, -50%)',
        }} />
        <div style={{
          position: 'absolute', top: '35%', right: '25%',
          width: 450, height: 450,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="animate-slide-up" style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 14px',
            borderRadius: 999,
            background: 'rgba(56, 189, 248, 0.1)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            color: '#38BDF8',
            fontSize: '0.75rem',
            fontWeight: 600,
            marginBottom: '1.75rem',
            letterSpacing: '0.04em',
          }}>
            Mobile App Splash Screens & Launch Motion
          </div>
          <h1 style={{ marginBottom: '1.5rem', letterSpacing: '-0.035em', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.15 }}>
            Create Authentic{' '}
            <span className="gradient-text">Mobile Splash Screens</span>
            <br />
            with Natural AI
          </h1>
          <p style={{ maxWidth: 640, margin: '0 auto 3rem', fontSize: '1.1rem', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>
            Design production-ready app launch reveals, brand splash sequences, and kinetic wordmarks.
            Select an authentic archetype, prompt changes in plain English, and export clean code.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/templates" className="btn btn-primary btn-lg">
              Explore Templates
            </Link>
            <Link href="/editor/new" className="btn btn-secondary btn-lg">
              Create Composition
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Flow */}
      <section style={{ padding: '5rem 2rem', background: 'var(--color-bg-surface)', borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="container-app" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-accent)', fontWeight: 700 }}>
              Architecture & Workflow
            </span>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', marginTop: '0.35rem' }}>
              From concept to launch in minutes
            </h2>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: '1.5rem',
          }}>
            {[
              { step: '01', title: 'Pick Archetype', desc: 'Choose from 15 authentic consumer mobile splash screens like Myntra, BookMyShow, and Vodafone Vi.' },
              { step: '02', title: 'Prompt Changes', desc: 'Specify brand name, palette, typography, and motion effects in natural language.' },
              { step: '03', title: 'Visual Timeline', desc: 'Fine-tune layer timings, easing curves, and duration in the responsive editor.' },
              { step: '04', title: 'Interactive Playback', desc: 'Preview high-fps mobile motion in portrait canvas with instant scrubbing.' },
              { step: '05', title: 'Export Package', desc: 'Download standalone HTML/CSS/JS, pure React components, or project schema.' },
            ].map((item) => (
              <div key={item.step} className="glass-card" style={{ padding: '1.75rem', borderRadius: 12 }}>
                <div style={{ color: 'var(--color-accent)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.1em' }}>
                  STEP {item.step}
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>{item.title}</h3>
                <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: 'var(--color-text-muted)', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Showcase */}
      <section style={{ padding: '6rem 2rem' }}>
        <div className="container-app" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '5rem', alignItems: 'center', maxWidth: 1100, margin: '0 auto' }}>
          {/* Preview Card */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '100%',
              maxWidth: 300,
              aspectRatio: '9/16',
              margin: '0 auto',
              borderRadius: 32,
              background: '#FFFFFF',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                width: 90, height: 90,
                borderRadius: '50%',
                background: '#FFF1F2',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div style={{
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 900,
                  color: '#FF3F6C',
                  fontSize: '2rem',
                }}>
                  M
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  color: '#282C3F',
                  letterSpacing: '0.15em',
                }}>
                  MYNTRA
                </div>
                <div style={{ color: '#535766', fontSize: '0.72rem', fontWeight: 500, letterSpacing: '0.04em', marginTop: '4px' }}>
                  Fashion at your fingertips
                </div>
              </div>
              <div className="badge badge-gray" style={{ position: 'absolute', bottom: 16, right: 16, fontSize: '0.68rem', color: '#64748B' }}>
                3.0s
              </div>
            </div>
          </div>

          {/* Copy */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '2px 10px',
              borderRadius: 999,
              background: 'rgba(56, 189, 248, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              fontSize: '0.72rem',
              color: '#38BDF8',
              fontWeight: 600,
              marginBottom: '1rem',
            }}>
              Real Product Archetype
            </div>
            <h2 style={{ marginBottom: '1rem', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
              Myntra — High-Fashion Launch Screen
            </h2>
            <p style={{ marginBottom: '1.5rem', lineHeight: 1.7, color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
              Built upon the design standards of top tier consumer applications. Crisp pure white canvas,
              vibrant brand ribbons, calibrated typography hierarchy, and smooth ease-out entrance transitions.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '2rem' }}>
              {[
                'Authentic 3.0-second mobile launch progression',
                'Calibrated high-contrast typography hierarchy',
                'Natural spring and ease-out entrance transitions',
                'Clean vector emblem and loading indicators',
              ].map(item => (
                <div key={item} style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-accent)' }} />
                  {item}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link href="/editor/template/myntra-fashion" className="btn btn-primary">
                Open in Studio
              </Link>
              <Link href="/templates" className="btn btn-secondary">
                View All Archetypes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{
        padding: '6rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid var(--color-border)',
      }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
          Start crafting your launch experience
        </h2>
        <p style={{ marginBottom: '2.5rem', maxWidth: 500, margin: '0 auto 2.5rem', color: 'var(--color-text-secondary)', fontSize: '1rem' }}>
          Browse authentic app archetypes or launch the motion editor.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/templates" className="btn btn-primary btn-lg">
            Browse All Templates
          </Link>
          <Link href="/dashboard" className="btn btn-secondary btn-lg">
            Open Dashboard
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2.5rem 2rem',
        borderTop: '1px solid var(--color-border)',
        textAlign: 'center',
        background: 'var(--color-bg-surface)',
      }}>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0 }}>
          RippleOne — Mobile App Launch & Splash Screen Motion Engine
        </p>
      </footer>
    </main>
  );
}
