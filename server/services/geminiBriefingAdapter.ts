import { GoogleGenAI, Type } from '@google/genai';
import { DailyBriefingResponse, LiveNewsItem } from '../types.js';

const BRIEFING_MODEL = 'gemini-4-hydrogen';

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
}

export interface BriefingPreferences {
  country?: string;
  category?: string;
  count?: number;
}

export async function generateDailyGlobalBriefing(
  items: LiveNewsItem[],
  prefs: BriefingPreferences = {}
): Promise<DailyBriefingResponse> {
  const nowIso = new Date().toISOString();
  const todayDate = nowIso.slice(0, 10);
  const countryPref = prefs.country?.trim() || 'All Countries';
  const categoryPref = prefs.category?.trim() || 'All Categories';
  const targetCount = Math.min(10, Math.max(5, Number(prefs.count || 7)));

  const baseId = `briefing-${todayDate}-${Date.now()}`;

  if (!isGeminiConfigured()) {
    return {
      id: baseId,
      aiAvailable: false,
      label: 'AI-Generated Summary (Requires Server Gemini Configuration)',
      briefingDate: todayDate,
      generatedAt: nowIso,
      modelName: BRIEFING_MODEL,
      countryPreference: countryPref,
      categoryPreference: categoryPref,
      overview: '',
      stories: [],
      errorMessage:
        'GEMINI_API_KEY is not configured in server environment secrets. Add it in Settings > Secrets to enable Your World in 60 Seconds.',
    };
  }

  let candidateItems = [...items];
  let note = '';

  if (countryPref !== 'All Countries') {
    const byCountry = candidateItems.filter(
      (i) => i.countryTag.toLowerCase() === countryPref.toLowerCase()
    );
    if (byCountry.length >= 3) {
      candidateItems = byCountry;
    } else if (byCountry.length > 0) {
      const rest = candidateItems.filter(
        (i) => i.countryTag.toLowerCase() !== countryPref.toLowerCase()
      );
      candidateItems = [...byCountry, ...rest];
      note = `Included global dispatches alongside ${byCountry.length} stories tagged for ${countryPref} to meet the 5–10 story briefing threshold.`;
    } else {
      note = `No stories explicitly tagged for ${countryPref} in current RSS cache; showing worldwide verified dispatches.`;
    }
  }

  if (categoryPref !== 'All Categories') {
    const byCat = candidateItems.filter(
      (i) => i.category.toLowerCase() === categoryPref.toLowerCase()
    );
    if (byCat.length >= 3) {
      candidateItems = byCat;
    } else if (byCat.length > 0) {
      const rest = candidateItems.filter(
        (i) => i.category.toLowerCase() !== categoryPref.toLowerCase()
      );
      candidateItems = [...byCat, ...rest];
      note = `${note ? note + ' ' : ''}Supplemented ${categoryPref} with top cross-desk developments.`;
    }
  }

  if (candidateItems.length === 0) {
    return {
      id: baseId,
      aiAvailable: true,
      label: 'AI-Generated Summary',
      briefingDate: todayDate,
      generatedAt: nowIso,
      modelName: BRIEFING_MODEL,
      countryPreference: countryPref,
      categoryPreference: categoryPref,
      overview: '',
      stories: [],
      errorMessage: 'No verified live news items are currently loaded to summarize.',
    };
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const digestInput = candidateItems.slice(0, 28).map((item) => ({
    title: item.title,
    publisher: item.publisher,
    category: item.category,
    countryTag: item.countryTag,
    publishedAt: item.publishedAt,
    url: item.url,
    summary: item.summary,
  }));

  const prompt = [
    `You are an international newsroom editor preparing "Your World in 60 Seconds" for ${todayDate}.`,
    `Reader preferences: Country="${countryPref}", Category="${categoryPref}".`,
    `Select ${targetCount} distinct, non-duplicate, high-importance global developments from the verified RSS items below (minimum 5, maximum 10).`,
    'STRICT GROUNDING RULES:',
    '1. Group related developments and never include duplicate stories.',
    '2. Summarize strictly from the provided headlines and summaries. Never invent facts, numbers, quotes, URLs, or unsupported predictions.',
    '3. Preserve exact sourceName, sourceUrl, countryTag, and publishedAt values from the matched input item.',
    '4. Keep each summary crisp (25-40 words) so the full briefing can be read or listened to in about 60 seconds.',
    '5. For "whatHappensNext", only include next steps explicitly stated in the provided text; otherwise write "Awaiting further official updates."',
    '',
    JSON.stringify(digestInput),
  ].join('\n');

  const candidateModels = [BRIEFING_MODEL, 'gemini-3.1-flash-lite'];
  let responseText = '';
  let usedModel = BRIEFING_MODEL;
  let lastError: unknown = null;

  for (const model of candidateModels) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction:
              'Produce concise, factual, neutral international newsroom briefings in global English grounded strictly in the provided RSS dataset.',
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overview: {
                  type: Type.STRING,
                  description: 'Two-sentence opening summary for the 60-second briefing.',
                },
                stories: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      headline: { type: Type.STRING },
                      category: { type: Type.STRING },
                      countryTag: { type: Type.STRING },
                      summary: { type: Type.STRING },
                      whyItMatters: { type: Type.STRING },
                      whatHappensNext: { type: Type.STRING },
                      sourceName: { type: Type.STRING },
                      sourceUrl: { type: Type.STRING },
                      publishedAt: { type: Type.STRING },
                    },
                    required: [
                      'headline',
                      'category',
                      'countryTag',
                      'summary',
                      'whyItMatters',
                      'whatHappensNext',
                      'sourceName',
                      'sourceUrl',
                      'publishedAt',
                    ],
                  },
                },
              },
              required: ['overview', 'stories'],
            },
          },
        });
        responseText = (response.text ?? '{}').trim();
        usedModel = model;
        lastError = null;
        break;
      } catch (err) {
        lastError = err;
        const msg = err instanceof Error ? err.message : String(err);
        const isTransient = msg.includes('503') || msg.includes('429') || msg.includes('UNAVAILABLE');
        if (!isTransient) throw err;
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    if (!lastError && responseText) break;
  }

  if (lastError) {
    throw lastError;
  }

  const parsed = JSON.parse(responseText || '{}') as {
    overview?: string;
    stories?: DailyBriefingResponse['stories'];
  };

  return {
    id: baseId,
    aiAvailable: true,
    label: 'AI-Generated Summary · Grounded in Live RSS Feeds · Human Approval Required Before Publishing',
    briefingDate: todayDate,
    generatedAt: nowIso,
    modelName: usedModel,
    countryPreference: countryPref,
    categoryPreference: categoryPref,
    overview: parsed.overview || 'Concise digest of verified international developments.',
    stories: Array.isArray(parsed.stories) ? parsed.stories.slice(0, 10) : [],
    note: note || undefined,
  };
}
