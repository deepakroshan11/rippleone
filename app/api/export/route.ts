import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ProjectSchema } from '@/lib/validation/project-schema';
import { generateHTML } from '@/generators/web/html-generator';
import { generateReact } from '@/generators/react/react-generator';

const RequestSchema = z.object({
  project: ProjectSchema,
  target: z.enum(['json', 'html', 'react', 'webm', 'mp4', 'gif']),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const { project, target } = parsed.data;

  // Size check
  const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_PROJECT_SIZE || '5242880', 10);
  if (JSON.stringify(project).length > maxSize) {
    return NextResponse.json({ error: 'Project too large' }, { status: 413 });
  }

  try {
    if (target === 'json') {
      const json = JSON.stringify(project, null, 2);
      return new NextResponse(json, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="${slugify(project.name)}-project.json"`,
        },
      });
    }

    if (target === 'html') {
      const html = generateHTML(project as any);
      const slug = slugify(project.name);

      // Create a simple "zip" response with just the HTML file
      // In production, we'd use a proper zip library
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="${slug}-intro.html"`,
        },
      });
    }

    if (target === 'react') {
      const code = generateReact(project as any);
      const slug = slugify(project.name);

      return new NextResponse(code, {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="${slug}-intro.tsx"`,
        },
      });
    }

    if (target === 'webm') {
      return NextResponse.json({
        error: 'Video export requires a rendering service. Currently only available in the cloud version.',
      }, { status: 501 });
    }

    return NextResponse.json({ error: `Export target '${target}' not supported` }, { status: 400 });
  } catch (err: any) {
    console.error('Export error:', err);
    return NextResponse.json({ error: `Export failed: ${err.message}` }, { status: 500 });
  }
}

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
