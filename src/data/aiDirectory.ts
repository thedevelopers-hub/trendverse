export type AIToolCategory =
  | 'Writing'
  | 'Image Generation'
  | 'Video Generation'
  | 'Audio'
  | 'Coding'
  | 'Research'
  | 'Productivity';

export interface AIToolEntry {
  id: string;
  name: string;
  provider: string;
  category: AIToolCategory;
  summary: string;
  officialUrl: string;
  lastVerified: string;
}

export interface AIModelComparisonRow {
  modelName: string;
  provider: string;
  capabilities: string;
  officialUrl: string;
  pricingUrl: string;
  lastVerified: string;
}

export const AI_TOOL_CATEGORIES: AIToolCategory[] = [
  'Writing',
  'Image Generation',
  'Video Generation',
  'Audio',
  'Coding',
  'Research',
  'Productivity',
];

export const AI_TOOLS_DIRECTORY: AIToolEntry[] = [
  {
    id: 'gemini-app',
    name: 'Google Gemini',
    provider: 'Google',
    category: 'Writing',
    summary: 'Multimodal assistant for drafting, document synthesis, and multilingual explanation.',
    officialUrl: 'https://gemini.google.com/',
    lastVerified: 'November 2026',
  },
  {
    id: 'claude-ai',
    name: 'Claude',
    provider: 'Anthropic',
    category: 'Writing',
    summary: 'Long-context writing, editorial analysis, and structured document review.',
    officialUrl: 'https://claude.ai/',
    lastVerified: 'November 2026',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    provider: 'OpenAI',
    category: 'Productivity',
    summary: 'General-purpose conversational workspace supporting text, files, and web search.',
    officialUrl: 'https://chatgpt.com/',
    lastVerified: 'November 2026',
  },
  {
    id: 'notebooklm',
    name: 'NotebookLM',
    provider: 'Google',
    category: 'Research',
    summary: 'Source-grounded research notebook that synthesizes uploaded documents and citations.',
    officialUrl: 'https://notebooklm.google.com/',
    lastVerified: 'November 2026',
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    provider: 'Perplexity AI',
    category: 'Research',
    summary: 'Citation-linked answer engine combining web retrieval with concise synthesis.',
    officialUrl: 'https://www.perplexity.ai/',
    lastVerified: 'November 2026',
  },
  {
    id: 'github-copilot',
    name: 'GitHub Copilot',
    provider: 'GitHub',
    category: 'Coding',
    summary: 'IDE code completion, pull request assistance, and repository-aware chat.',
    officialUrl: 'https://github.com/features/copilot',
    lastVerified: 'November 2026',
  },
  {
    id: 'google-ai-studio',
    name: 'Google AI Studio',
    provider: 'Google',
    category: 'Coding',
    summary: 'Developer prototyping environment and API gateway for Gemini models.',
    officialUrl: 'https://aistudio.google.com/',
    lastVerified: 'November 2026',
  },
  {
    id: 'imagen-gemini',
    name: 'Google Imagen / Whisk',
    provider: 'Google DeepMind',
    category: 'Image Generation',
    summary: 'Photorealistic and editorial visual generation models accessible via Vertex & AI Studio.',
    officialUrl: 'https://deepmind.google/technologies/imagen-3/',
    lastVerified: 'November 2026',
  },
  {
    id: 'adobe-firefly',
    name: 'Adobe Firefly',
    provider: 'Adobe',
    category: 'Image Generation',
    summary: 'Commercial-safe generative imaging integrated with Creative Cloud workflows.',
    officialUrl: 'https://www.adobe.com/products/firefly.html',
    lastVerified: 'November 2026',
  },
  {
    id: 'veo-deepmind',
    name: 'Veo',
    provider: 'Google DeepMind',
    category: 'Video Generation',
    summary: 'High-definition text-to-video and image-to-video synthesis platform.',
    officialUrl: 'https://deepmind.google/technologies/veo/',
    lastVerified: 'November 2026',
  },
  {
    id: 'runway',
    name: 'Runway',
    provider: 'Runway ML',
    category: 'Video Generation',
    summary: 'Browser-based generative video editing and motion control tools for creators.',
    officialUrl: 'https://runwayml.com/',
    lastVerified: 'November 2026',
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    provider: 'ElevenLabs',
    category: 'Audio',
    summary: 'Multilingual speech synthesis, dubbing, and audio accessibility narration.',
    officialUrl: 'https://elevenlabs.io/',
    lastVerified: 'November 2026',
  },
];

export const AI_MODEL_COMPARISON: AIModelComparisonRow[] = [
  {
    modelName: 'Gemini (Google DeepMind)',
    provider: 'Google',
    capabilities: 'Multimodal text, code, audio, video understanding, and structured JSON output via Gemini API.',
    officialUrl: 'https://ai.google.dev/gemini-api/docs',
    pricingUrl: 'https://ai.google.dev/gemini-api/docs/pricing',
    lastVerified: 'November 2026',
  },
  {
    modelName: 'Claude Model Family',
    provider: 'Anthropic',
    capabilities: 'Long-context reasoning, document analysis, code generation, and tool use.',
    officialUrl: 'https://docs.anthropic.com/',
    pricingUrl: 'https://www.anthropic.com/pricing',
    lastVerified: 'November 2026',
  },
  {
    modelName: 'GPT Model Family',
    provider: 'OpenAI',
    capabilities: 'General reasoning, multimodal vision/audio, function calling, and structured outputs.',
    officialUrl: 'https://platform.openai.com/docs',
    pricingUrl: 'https://openai.com/api/pricing/',
    lastVerified: 'November 2026',
  },
  {
    modelName: 'Llama Open-Weights Series',
    provider: 'Meta',
    capabilities: 'Open-weights multilingual text and vision models for self-hosted or cloud inference.',
    officialUrl: 'https://www.llama.com/',
    pricingUrl: 'https://www.llama.com/get-started/',
    lastVerified: 'November 2026',
  },
  {
    modelName: 'Mistral Model Family',
    provider: 'Mistral AI',
    capabilities: 'Open and commercial European models optimized for multilingual prose and code.',
    officialUrl: 'https://docs.mistral.ai/',
    pricingUrl: 'https://mistral.ai/technology/#pricing',
    lastVerified: 'November 2026',
  },
];
