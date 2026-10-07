import type { Project } from '@/types/project';

// ============================================================
// FINDORA TEMPLATE — Cinematic Dark Green, 3 seconds
// First showcase template for AI Intro Studio
// ============================================================

export const findoraTemplate: Project = {
  id: 'template-findora-cinematic',
  version: '1.0',
  name: 'Findora — Cinematic Intro',
  description: 'A cinematic 3-second intro for Findora, the lost-and-found app. Dark green theme with glowing logo reveal.',
  canvas: {
    width: 1080,
    height: 1920,
    fps: 30,
  },
  duration: 3000,
  background: {
    type: 'gradient',
    direction: 'to-bottom',
    stops: [
      { color: '#020D07', position: 0 },
      { color: '#071F16', position: 60 },
      { color: '#0A2A1A', position: 100 },
    ],
  },
  layers: [
    // 0.0s - Background ambient glow
    {
      id: 'bg-glow',
      name: 'Background Glow',
      type: 'shape',
      position: { x: 540, y: 960 },
      size: { width: 800, height: 800 },
      opacity: 0.8,
      timeline: { start: 200, duration: 2800, easing: 'ease-out' },
      animation: { enter: 'glow', enterDuration: 1200 },
      props: {
        variant: 'circle',
        fill: 'rgba(20, 180, 90, 0.07)',
        stroke: 'rgba(20, 180, 90, 0.12)',
        strokeWidth: 1,
      },
    },
    // 0.3s - Ambient particles
    {
      id: 'particles-bg',
      name: 'Ambient Particles',
      type: 'particle',
      position: { x: 540, y: 960 },
      size: { width: 1080, height: 1920 },
      opacity: 0.6,
      timeline: { start: 300, duration: 2700, easing: 'ease' },
      animation: { enter: 'fade', enterDuration: 800 },
      props: {
        count: 40,
        color: '#14B45A',
        size: 2,
        spread: 0.9,
        speed: 0.3,
        type: 'star',
      },
    },
    // 0.6s - Lost wallet icon
    {
      id: 'wallet-icon',
      name: 'Lost Wallet',
      type: 'image',
      position: { x: 540, y: 850 },
      size: { width: 200, height: 200 },
      opacity: 1,
      timeline: { start: 600, duration: 2400, easing: 'ease-out' },
      animation: { enter: 'slideUp', enterDuration: 700, exit: 'fade', exitDuration: 400 },
      props: {
        src: '/templates/findora/wallet.svg',
        alt: 'Lost wallet icon',
        objectFit: 'contain',
        brightness: 0.9,
      },
    },
    // 0.6s - Glow ring around wallet
    {
      id: 'wallet-glow',
      name: 'Wallet Glow Ring',
      type: 'shape',
      position: { x: 540, y: 850 },
      size: { width: 260, height: 260 },
      opacity: 0.8,
      timeline: { start: 700, duration: 1600, easing: 'ease-out' },
      animation: { enter: 'glow', enterDuration: 800, exit: 'fade', exitDuration: 300 },
      props: {
        variant: 'circle',
        fill: 'transparent',
        stroke: 'rgba(20, 180, 90, 0.5)',
        strokeWidth: 2,
        borderRadius: 130,
      },
    },
    // 1.2s - Findora logo text
    {
      id: 'logo-text',
      name: 'Findora Logo',
      type: 'text',
      position: { x: 540, y: 1050 },
      opacity: 1,
      timeline: { start: 1200, duration: 1800, easing: 'ease-out' },
      animation: { enter: 'scaleFade', enterDuration: 700 },
      props: {
        content: 'FINDORA',
        fontFamily: 'Outfit, sans-serif',
        fontSize: 72,
        fontWeight: 700,
        color: '#FFFFFF',
        align: 'center',
        letterSpacing: 0.15,
        textShadow: '0 0 40px rgba(20, 180, 90, 0.6)',
      },
    },
    // 1.2s - Glowing underline
    {
      id: 'logo-underline',
      name: 'Logo Underline',
      type: 'shape',
      position: { x: 540, y: 1090 },
      size: { width: 200, height: 2 },
      opacity: 1,
      timeline: { start: 1400, duration: 1600, easing: 'ease-out' },
      animation: { enter: 'fade', enterDuration: 500 },
      props: {
        variant: 'line',
        fill: '#14B45A',
        stroke: '#14B45A',
        strokeWidth: 2,
      },
    },
    // 2.0s - Tagline
    {
      id: 'tagline',
      name: 'Tagline',
      type: 'text',
      position: { x: 540, y: 1130 },
      opacity: 0.85,
      timeline: { start: 2000, duration: 1000, easing: 'ease-out' },
      animation: { enter: 'slideUp', enterDuration: 500, exit: 'fade', exitDuration: 300 },
      props: {
        content: 'Find what matters.',
        fontFamily: 'Outfit, sans-serif',
        fontSize: 32,
        fontWeight: 300,
        color: 'rgba(255, 255, 255, 0.7)',
        align: 'center',
        letterSpacing: 0.05,
      },
    },
    // 2.7s - Fade out overlay
    {
      id: 'fade-overlay',
      name: 'Fade Out',
      type: 'shape',
      position: { x: 540, y: 960 },
      size: { width: 1080, height: 1920 },
      opacity: 1,
      timeline: { start: 2700, duration: 300, easing: 'ease-in' },
      animation: { enter: 'fade', enterDuration: 300 },
      props: {
        variant: 'rect',
        fill: '#000000',
      },
    },
  ],
};

export const findoraTemplateMetadata = {
  id: 'findora-cinematic',
  name: 'Findora Cinematic',
  slug: 'findora-cinematic',
  description: 'A cinematic 3-second app intro for Findora — the lost-and-found application. Features dark green theme, glow effects, and wallet animation.',
  category: 'Cinematic',
  tags: ['cinematic', 'dark', 'green', 'glow', 'logo-reveal', 'showcase'],
  thumbnailUrl: '/templates/findora/thumbnail.webp',
  previewUrl: '/templates/findora/preview.webm',
  projectJsonUrl: '/templates/findora/project.json',
  durationMs: 3000,
  orientation: 'portrait' as const,
  isFeatured: true,
  isPremium: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};
