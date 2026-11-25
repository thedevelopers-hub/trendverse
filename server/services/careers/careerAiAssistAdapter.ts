import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { CareerAiAssistRequest, CareerAiAssistResponse } from '../../types.js';
import { formatGeminiErrorMessage, getGeminiApiKey } from '../geminiBriefingAdapter.js';

const PRIMARY_MODEL = 'gemini-4-hydrogen';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';

export async function runCareerAiAssist(
  req: CareerAiAssistRequest
): Promise<CareerAiAssistResponse> {
  const nowIso = new Date().toISOString();
  const disclaimer =
    'AI career feedback is optional assistance only. It does not guarantee ATS pass rates, interviews, or job selection. Review and personalize all output carefully.';

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return {
      aiAvailable: false,
      mode: req.mode,
      modelName: PRIMARY_MODEL,
      generatedAt: nowIso,
      suggestions: [],
      disclaimer,
      errorMessage:
        'GEMINI_API_KEY is not configured on the server. All browser-local Career Tools continue to work without AI.',
    };
  }

  const cleanText = req.text.trim().slice(0, 4500);
  const role = req.targetRole.trim().slice(0, 120) || 'Target Role';
  const company = req.company?.trim().slice(0, 100) || '';
  const level = req.experienceLevel?.trim().slice(0, 60) || '';

  const instructionMap: Record<CareerAiAssistRequest['mode'], string> = {
    'resume-review': `Analyze this resume draft for the target role "${role}" (${level}). Give 4–6 concrete, honest improvements on clarity, quantified impact, and relevant skills. Never invent fake credentials or promise guaranteed ATS scores.`,
    'cover-letter': `Polish and strengthen this cover letter draft for "${role}"${company ? ` at "${company}"` : ''} (${level}). Provide 3–4 concise improvement notes plus a clean polished version preserving only facts present in the user's draft.`,
    'interview-feedback': `Review this candidate interview practice answer for "${role}" (${level}). Give 4 specific coaching points using the STAR structure (Situation, Task, Action, Result) and a tighter refined sample phrasing.`,
  };

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const prompt = `${instructionMap[req.mode]}\n\nCandidate Input:\n${cleanText}`;

  let responseText = '';
  let usedModel = PRIMARY_MODEL;
  let lastError: unknown = null;

  for (const candidate of [
    { model: PRIMARY_MODEL, thinkingLevel: ThinkingLevel.LOW },
    { model: FALLBACK_MODEL, thinkingLevel: ThinkingLevel.MINIMAL },
  ]) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await ai.models.generateContent({
          model: candidate.model,
          contents: prompt,
          config: {
            thinkingConfig: { thinkingLevel: candidate.thinkingLevel },
            systemInstruction:
              'You are a factual, practical international career advisor for students and early-career professionals. Never invent facts, degrees, or metrics not provided by the user.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                suggestions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                polishedText: { type: Type.STRING },
              },
              required: ['suggestions'],
            },
          },
        });
        responseText = (res.text ?? '{}').trim();
        usedModel = candidate.model;
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes('503') && !msg.includes('429') && !msg.includes('UNAVAILABLE')) {
          throw new Error(formatGeminiErrorMessage(err));
        }
        await new Promise((r) => setTimeout(r, 450));
      }
    }
    if (!lastError && responseText) break;
  }

  if (lastError) {
    throw new Error(formatGeminiErrorMessage(lastError));
  }

  const parsed = JSON.parse(responseText || '{}') as {
    suggestions?: string[];
    polishedText?: string;
  };

  return {
    aiAvailable: true,
    mode: req.mode,
    modelName: usedModel,
    generatedAt: nowIso,
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 6) : [],
    polishedText: parsed.polishedText || undefined,
    disclaimer,
  };
}
