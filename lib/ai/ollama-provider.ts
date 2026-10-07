import type { AIProvider, Project, ProjectContext, ProjectOperation } from '@/types/project';
import { AIResponseSchema } from '@/lib/validation/project-schema';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const MODEL_NAME = process.env.AI_MODEL_NAME || 'qwen3:4b';

const SYSTEM_PROMPT = `You are an AI design assistant for RippleOne, a platform for creating animated mobile app splash screens and launch experiences.

Your job is to return ONLY valid JSON containing an array of project operations to modify animated intro designs.

Available operation types:
- add_layer: Add a new layer (text, image, shape, particle)
- remove_layer: Remove a layer by ID
- update_layer: Update any layer properties
- move_layer: Move a layer to a new position
- resize_layer: Resize a layer
- change_color: Change background or layer color
- change_text: Change text content
- change_animation: Change enter/exit animation
- change_duration: Change total project duration (ms)
- update_background: Change the background

Canvas is 1080×1920 by default. Positions are in pixels. Duration is in milliseconds.

You MUST respond with ONLY this JSON structure — no prose, no markdown:
{
  "operations": [...],
  "explanation": "Brief explanation of what you did"
}`;

export class OllamaProvider implements AIProvider {
  private baseUrl: string;
  private model: string;

  constructor(baseUrl = OLLAMA_BASE_URL, model = MODEL_NAME) {
    this.baseUrl = baseUrl;
    this.model = model;
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async generateProject(prompt: string, context: ProjectContext): Promise<ProjectOperation[]> {
    const contextStr = JSON.stringify({
      existingProject: context.project || null,
      templateId: context.templateId,
      style: context.style,
      mood: context.mood,
    }, null, 2);

    const userMessage = `Create an animated intro project for this request:

"${prompt}"

Context:
${contextStr}

Return JSON operations to create or modify the project.`;

    return this.callOllama(userMessage);
  }

  async modifyProject(prompt: string, project: Project): Promise<ProjectOperation[]> {
    const projectStr = JSON.stringify(project, null, 2);

    const userMessage = `Modify this animated intro project based on the user's request:

User request: "${prompt}"

Current project:
${projectStr}

Return JSON operations to modify the project. Only include operations for the requested changes.`;

    return this.callOllama(userMessage);
  }

  private async callOllama(userMessage: string): Promise<ProjectOperation[]> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
        },
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data?.message?.content || data?.choices?.[0]?.message?.content || '';

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI response did not contain valid JSON');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      throw new Error('Failed to parse AI JSON response');
    }

    // Validate with Zod
    const validated = AIResponseSchema.parse(parsed);
    return validated.operations as ProjectOperation[];
  }
}

// --- Fallback provider (no AI) ---
export class FallbackProvider implements AIProvider {
  async isAvailable(): Promise<boolean> {
    return false;
  }

  async generateProject(_prompt: string, _context: ProjectContext): Promise<ProjectOperation[]> {
    throw new Error('AI is not available. Please install Ollama and run qwen3:4b locally.');
  }

  async modifyProject(_prompt: string, _project: Project): Promise<ProjectOperation[]> {
    throw new Error('AI is not available. Please install Ollama and run qwen3:4b locally.');
  }
}

// --- Factory ---
export async function getAIProvider(): Promise<AIProvider> {
  const providerType = process.env.AI_PROVIDER || 'ollama';

  if (providerType === 'ollama') {
    const provider = new OllamaProvider();
    const available = await provider.isAvailable();
    if (available) return provider;
  }

  return new FallbackProvider();
}
