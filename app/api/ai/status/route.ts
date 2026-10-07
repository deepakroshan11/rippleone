import { NextResponse } from 'next/server';
import { OllamaProvider } from '@/lib/ai/ollama-provider';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

export async function GET() {
  try {
    const provider = new OllamaProvider(OLLAMA_BASE_URL);
    const ollamaConnected = await provider.isAvailable();
    return NextResponse.json({
      available: true,
      ollamaConnected,
      engine: ollamaConnected ? 'ollama' : 'built-in',
      model: ollamaConnected ? (process.env.AI_MODEL_NAME || 'qwen3:4b') : 'Built-in Smart Assistant',
      baseUrl: OLLAMA_BASE_URL,
    });
  } catch {
    return NextResponse.json({
      available: true,
      ollamaConnected: false,
      engine: 'built-in',
      model: 'Built-in Smart Assistant',
    });
  }
}
