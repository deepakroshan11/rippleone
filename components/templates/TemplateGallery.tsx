'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import type { TemplateDefinition } from '@/templates/registry';
import { TemplateMotionPlayer } from '@/components/templates/TemplateMotionPlayer';

interface TemplateGalleryProps {
  initialTemplates: TemplateDefinition[];
}

const CATEGORIES = [
  'All',
  'Productivity',
  'Food & Drink',
  'Fashion & Retail',
  'Finance',
  'Travel',
  'Health & Fitness',
  'Social',
  'Shopping',
  'Healthcare',
  'Technology & AI',
];

export function TemplateGallery({ initialTemplates }: TemplateGalleryProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTemplates = useMemo(() => {
    return initialTemplates.filter(t => {
      const matchCat = activeCategory === 'All' || t.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tagline.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [initialTemplates, activeCategory, searchQuery]);

  return (
    <div>
      {/* Category Pills & Search */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '2.5rem',
      }}>
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap', flex: 1 }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                borderRadius: 999,
                padding: '0.35rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: activeCategory === cat ? 600 : 500,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: 280 }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search app splash screens..."
            className="input"
            style={{ paddingLeft: '2.2rem', width: '100%', height: 38, fontSize: '0.8rem' }}
          />
        </div>
      </div>

      {/* Grid Subhead */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>
          Showing <strong style={{ color: 'var(--color-text-primary)' }}>{filteredTemplates.length}</strong> real mobile app splash screen{filteredTemplates.length !== 1 ? 's' : ''}
          {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
        </p>
        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          Hover card to preview launch motion
        </span>
      </div>

      {/* Mobile App Splash Screen Gallery Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '2.25rem',
          alignItems: 'start',
        }}
      >
        {filteredTemplates.map((template) => (
          <SplashScreenCard key={template.id} template={template} />
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--color-text-muted)' }}>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>No matching splash screens</h3>
          <p style={{ maxWidth: 400, margin: '0 auto 1.5rem' }}>Try clearing your search query or switching categories.</p>
          <button
            onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
            className="btn btn-secondary btn-sm"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

function SplashScreenCard({ template }: { template: TemplateDefinition }) {
  const durationSec = (template.durationMs / 1000).toFixed(1);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem',
      }}
    >
      {/* Smartphone Splash Screen Frame (Hero) */}
      <Link href={`/templates/${template.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          style={{
            padding: '1.25rem',
            background: 'var(--color-bg-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 28,
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)';
            e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.5)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'var(--color-border)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
          }}
        >
          <TemplateMotionPlayer
            project={template.project}
            autoplayOnHover={true}
            loop={true}
          />
        </div>
      </Link>

      {/* Card Info & Actions */}
      <div style={{ padding: '0 0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--color-text-primary)' }}>
            {template.name}
          </h3>
          <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
            {template.category} · {durationSec}s
          </span>
        </div>

        <p style={{
          fontSize: '0.78rem',
          lineHeight: 1.45,
          color: 'var(--color-text-muted)',
          margin: '0 0 0.85rem 0',
        }}>
          {template.description}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <Link
            href={`/templates/${template.slug}`}
            className="btn btn-secondary btn-sm"
            style={{ textAlign: 'center', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600, padding: '0.45rem' }}
          >
            Customize
          </Link>
          <Link
            href={`/editor/template/${template.slug}`}
            className="btn btn-primary btn-sm"
            style={{ textAlign: 'center', textDecoration: 'none', fontSize: '0.75rem', fontWeight: 600, padding: '0.45rem' }}
          >
            Use Template →
          </Link>
        </div>
      </div>
    </div>
  );
}
