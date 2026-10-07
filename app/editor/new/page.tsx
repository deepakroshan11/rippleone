import type { Metadata } from 'next';
import Editor from '@/components/editor/Editor';
import type { Project } from '@/types/project';

export const metadata: Metadata = {
  title: 'New Project — Editor · RippleOne',
};

const BLANK_PROJECT: Project = {
  id: `project-new-${Date.now()}`,
  version: '1.0',
  name: 'Untitled Project',
  canvas: { width: 1080, height: 1920, fps: 30 },
  duration: 3000,
  background: { type: 'solid', color: '#F8FAFC' },
  layers: [
    {
      id: 'text-1',
      name: 'App Title',
      type: 'text',
      position: { x: 540, y: 920 },
      timeline: { start: 200, duration: 2800, easing: 'ease-out' },
      animation: { enter: 'scaleFade', enterDuration: 650 },
      props: {
        content: 'YOUR APP',
        fontFamily: 'Outfit, sans-serif',
        fontSize: 74,
        fontWeight: 800,
        letterSpacing: 0.04,
        color: '#0F172A',
        align: 'center',
      },
    },
    {
      id: 'tagline-1',
      name: 'Tagline',
      type: 'text',
      position: { x: 540, y: 1000 },
      timeline: { start: 600, duration: 2400, easing: 'ease-out' },
      animation: { enter: 'slideUp', enterDuration: 500 },
      props: {
        content: 'Your tagline here.',
        fontFamily: 'Outfit, sans-serif',
        fontSize: 28,
        fontWeight: 400,
        color: 'rgba(15, 23, 42, 0.6)',
        align: 'center',
      },
    },
    {
      id: 'dot-1',
      name: 'Loading Dot 1',
      type: 'shape',
      position: { x: 500, y: 1680 },
      size: { width: 10, height: 10 },
      timeline: { start: 1000, duration: 2000, easing: 'ease-in-out' },
      animation: { enter: 'scaleFade', enterDuration: 400 },
      props: { variant: 'circle', fill: '#10B981' },
    },
    {
      id: 'dot-2',
      name: 'Loading Dot 2',
      type: 'shape',
      position: { x: 540, y: 1680 },
      size: { width: 10, height: 10 },
      timeline: { start: 1150, duration: 1850, easing: 'ease-in-out' },
      animation: { enter: 'scaleFade', enterDuration: 400 },
      props: { variant: 'circle', fill: '#10B981' },
    },
    {
      id: 'dot-3',
      name: 'Loading Dot 3',
      type: 'shape',
      position: { x: 580, y: 1680 },
      size: { width: 10, height: 10 },
      timeline: { start: 1300, duration: 1700, easing: 'ease-in-out' },
      animation: { enter: 'scaleFade', enterDuration: 400 },
      props: { variant: 'circle', fill: '#10B981' },
    },
  ],
};

export default function NewProjectPage() {
  return <Editor initialProject={BLANK_PROJECT} />;
}
