import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Editor from '@/components/editor/Editor';
import { getTemplateDefinition, ALL_TEMPLATES_LIST } from '@/templates/registry';
import type { Project } from '@/types/project';

interface EditorTemplatePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export async function generateStaticParams() {
  return ALL_TEMPLATES_LIST.map((t) => ({
    slug: t.slug,
  }));
}

export async function generateMetadata({ params }: EditorTemplatePageProps): Promise<Metadata> {
  const { slug } = await params;
  const template = getTemplateDefinition(slug);
  return {
    title: template ? `${template.name} — Editor · RippleOne` : 'Editor · RippleOne',
  };
}

export default async function EditorTemplatePage({ params }: EditorTemplatePageProps) {
  const { slug } = await params;
  const template = getTemplateDefinition(slug);

  if (!template) {
    notFound();
  }

  // Clone project so user edits don't mutate template definition
  const initialProject: Project = JSON.parse(JSON.stringify(template.project));

  return <Editor initialProject={initialProject} />;
}
