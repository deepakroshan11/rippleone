import { NextRequest, NextResponse } from 'next/server';
import { OllamaProvider } from '@/lib/ai/ollama-provider';
import { generateLocalAIOperations } from '@/lib/ai/local-ai-engine';
import { ProjectSchema, ProjectOperationSchema } from '@/lib/validation/project-schema';
import { z } from 'zod';

const RequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  project: ProjectSchema,
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
  }

  const { prompt, project } = parsed.data;

  // Check project size
  const maxSize = parseInt(process.env.NEXT_PUBLIC_MAX_PROJECT_SIZE || '5242880', 10);
  const projectSize = JSON.stringify(project).length;
  if (projectSize > maxSize) {
    return NextResponse.json({ error: `Project exceeds maximum size of ${maxSize} bytes` }, { status: 413 });
  }

  try {
    const provider = new OllamaProvider();
    const ollamaAvailable = await provider.isAvailable();

    let rawOps;
    let explanationText = '';

    if (ollamaAvailable) {
      try {
        rawOps = await provider.modifyProject(prompt, project as any);
        explanationText = `Applied ${rawOps.length} AI changes via Ollama.`;
      } catch (ollamaErr) {
        console.warn('Ollama modify failed, falling back to local engine:', ollamaErr);
        const local = generateLocalAIOperations(prompt, project as any);
        rawOps = local.operations;
        explanationText = local.explanation;
      }
    } else {
      const local = generateLocalAIOperations(prompt, project as any);
      rawOps = local.operations;
      explanationText = local.explanation;
    }

    // Validate returned operations
    const validatedOps = [];
    for (const op of rawOps) {
      const result = ProjectOperationSchema.safeParse(op);
      if (result.success) {
        validatedOps.push(result.data);
      } else {
        console.warn('Skipping invalid AI operation:', op, result.error.flatten());
      }
    }

    return NextResponse.json({
      operations: validatedOps,
      explanation: explanationText,
      engine: ollamaAvailable ? 'ollama' : 'built-in',
    });
  } catch (err: any) {
    console.error('AI modify error:', err);
    return NextResponse.json({ error: err.message || 'AI processing failed' }, { status: 500 });
  }
}
