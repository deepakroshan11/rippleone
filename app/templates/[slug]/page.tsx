import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTemplateDefinition, ALL_TEMPLATES_LIST } from '@/templates/registry';
import { TemplateDetailView } from '@/components/templates/TemplateDetailView';

interface TemplateDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ALL_TEMPLATES_LIST.map((t) => ({
    slug: t.slug,
  }));
}

export async function generateMetadata({ params }: TemplateDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const template = getTemplateDefinition(slug);
  if (!template) {
    return { title: 'Template Not Found — RippleOne' };
  }
  return {
    title: `${template.name} — Animated Splash Screen · RippleOne`,
    description: template.description,
  };
}

export default async function TemplateDetailPage({ params }: TemplateDetailPageProps) {
  const { slug } = await params;
  const template = getTemplateDefinition(slug);

  if (!template) {
    notFound();
  }

  return <TemplateDetailView template={template} />;
}
