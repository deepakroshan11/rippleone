import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Allow SVG images from the public folder
  images: {
    remotePatterns: [],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Disable powered-by header
  poweredByHeader: false,

  // Strict mode for better error detection
  reactStrictMode: true,

  // Environment variable validation
  env: {
    OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    AI_MODEL_NAME: process.env.AI_MODEL_NAME || 'qwen3:4b',
    AI_PROVIDER: process.env.AI_PROVIDER || 'ollama',
  },
};

export default nextConfig;
