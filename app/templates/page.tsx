import Link from 'next/link';
import type { Metadata } from 'next';
import { ALL_TEMPLATES_LIST } from '@/templates/registry';
import { TemplateGallery } from '@/components/templates/TemplateGallery';

export const metadata: Metadata = {
  title: 'Real Mobile App Splash Screens — RippleOne',
  description: 'A curated library of authentic mobile app splash screens for consumer apps: fashion, cinema, telecom, music, food delivery, finance, and modern software.',
};

export default function TemplatesPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        borderBottom: '1px solid var(--color-border)',
        background: 'rgba(13, 22, 43, 0.85)',
        backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(255,255,255,0.2)',
          }}>
            <span style={{ color: '#060B17', fontWeight: 800, fontSize: '0.9rem' }}>R</span>
          </div>
          <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>RippleOne</span>
        </Link>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link href="/dashboard" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/editor/new" className="btn btn-primary btn-sm" style={{ textDecoration: 'none' }}>New Project</Link>
        </div>
      </nav>

      <main style={{ padding: '3rem 2rem' }} className="container-app">
        {/* Gallery Hero Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', color: '#38BDF8', fontSize: '0.75rem', fontWeight: 600, marginBottom: '1rem', letterSpacing: '0.04em' }}>
            Real Mobile App Splash Screens
          </div>
          <h1 style={{ marginBottom: '0.75rem', fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            App Splash Screen <span className="gradient-text">Library</span>
          </h1>
          <p style={{ maxWidth: 720, fontSize: '1.05rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Every template is a realistic 9:16 mobile app launch screen with clean typography, strong negative space, authentic brand identities, and subtle product UI motion. Hover any screen to preview live launch motion.
          </p>
        </div>

        {/* Client Interactive Gallery */}
        <TemplateGallery initialTemplates={ALL_TEMPLATES_LIST} />
      </main>
    </div>
  );
}
