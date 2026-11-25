import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  BriefingStoryDigest,
  DailyBriefingResponse,
  LiveNewsItem,
} from '../types.js';

export const BRIEFING_PRIMARY_MODEL = 'gemini-4-hydrogen';
export const BRIEFING_FALLBACK_MODEL = 'gemini-3.1-flash-lite';
const GEMINI_TIMEOUT_MS = 14_000;

const inFlightBriefings = new Map<string, Promise<DailyBriefingResponse>>();

export function getGeminiApiKey(): string | null {
  const candidates = [process.env.GEMINI_API_KEY, process.env.GOOGLE_API_KEY];
  for (const raw of candidates) {
    if (!raw) continue;
    let cleaned = raw.trim();
    if (
      (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
      (cleaned.startsWith("'") && cleaned.endsWith("'"))
    ) {
      cleaned = cleaned.slice(1, -1).trim();
    }
    if (
      cleaned.length > 0 &&
      !/^(your_|placeholder|changeme|undefined|null)/i.test(cleaned)
    ) {
      return cleaned;
    }
  }
  return null;
}

export function isGeminiConfigured(): boolean {
  return getGeminiApiKey() !== null;
}

export function formatGeminiErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err || '');
  const lower = raw.toLowerCase();

  if (
    lower.includes('api_key_invalid') ||
    lower.includes('api key not valid') ||
    lower.includes('permission_denied') ||
    lower.includes('403')
  ) {
    return 'The configured server GEMINI_API_KEY was rejected by the Gemini API. Verify the key in Vercel Environment Variables and redeploy.';
  }
  if (lower.includes('429') || lower.includes('resource_exhausted') || lower.includes('quota')) {
    return 'Gemini API rate limit or quota reached temporarily. Please wait a moment and try generating the briefing again.';
  }
  if (
    lower.includes('503') ||
    lower.includes('unavailable') ||
    lower.includes('high demand') ||
    lower.includes('overloaded')
  ) {
    return 'The Gemini API is temporarily experiencing high demand (503). Please try again in a few seconds.';
  }
  if (
    lower.includes('abort') ||
    lower.includes('timeout') ||
    lower.includes('timed out')
  ) {
    return 'The Gemini briefing request timed out. Please try again.';
  }
  if (lower.includes('404') || lower.includes('not_found')) {
    return 'The requested Gemini model endpoint returned 404. Please verify model availability.';
  }
  return 'Unable to generate the Gemini briefing right now. Verified live headlines remain available in the News Center.';
}

function isTimeoutError(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : String(err || '');
  const lower = raw.toLowerCase();
  return lower.includes('timeout') || lower.includes('timed out') || lower.includes('abort');
}

function isTransientGeminiError(err: unknown): boolean {
  const raw = err instanceof Error ? err.message : String(err || '');
  const lower = raw.toLowerCase();
  return (
    lower.includes('503') ||
    lower.includes('429') ||
    lower.includes('unavailable') ||
    lower.includes('resource_exhausted') ||
    lower.includes('high demand') ||
    lower.includes('overloaded') ||
    lower.includes('timeout') ||
    lower.includes('timed out') ||
    lower.includes('abort') ||
    lower.includes('econnreset') ||
    lower.includes('fetch failed')
  );
}

const COUNTRY_KEYWORD_MAP: Record<string, RegExp> = {
  India: /\bindia\b|\bindian\b|\bnew delhi\b|\bmumbai\b|\bbengaluru\b|\bchennai\b/,
  'United States': /\bunited states\b|\bu\.s\.?\b|\busa\b|\bwashington\b|\bnew york\b|\bcalifornia\b/,
  'United Kingdom': /\bunited kingdom\b|\buk\b|\bbritain\b|\bbritish\b|\blondon\b|\bengland\b/,
  Australia: /\baustralia\b|\baustralian\b|\bsydney\b|\bmelbourne\b|\bcanberra\b/,
  Japan: /\bjapan\b|\bjapanese\b|\btokyo\b|\bosaka\b/,
  Germany: /\bgermany\b|\bgerman\b|\bberlin\b|\bmunich\b|\bfrankfurt\b/,
  France: /\bfrance\b|\bfrench\b|\bparis\b|\blyon\b/,
  Canada: /\bcanada\b|\bcanadian\b|\bottawa\b|\btoronto\b|\bvancouver\b/,
  Global: /\bglobal\b|\bun\b|\bunited nations\b|\bworld\b|\binternational\b/,
};

const CATEGORY_KEYWORD_MAP: Record<string, RegExp> = {
  World: /\bworld\b|\bdiplom|\bsummit\b|\bforeign\b|\bborder\b|\bunited nations\b|\btreaty\b/,
  India: /\bindia\b|\bnew delhi\b|\bmumbai\b|\blok sabha\b|\brbi\b|\bisro\b/,
  Technology: /\btech\b|\bsoftware\b|\bchip\b|\bsemiconductor\b|\bcyber\b|\bcloud\b|\bdigital\b/,
  'Artificial Intelligence': /\bai\b|\bartificial intelligence\b|\bllm\b|\bgemini\b|\bopenai\b|\bmachine learning\b|\bmodel\b/,
  Business: /\bbusiness\b|\beconom|\bmarket\b|\binflation\b|\bbank\b|\btrade\b|\bfinanc|\bstock\b/,
  Science: /\bscience\b|\bresearch\b|\bphysics\b|\bbiology\b|\bmedical\b|\bstudy\b/,
  Space: /\bspace\b|\bnasa\b|\borbit\b|\brocket\b|\bmoon\b|\bmars\b|\btelescope\b|\bsatellite\b/,
  Entertainment: /\bfilm\b|\bcinema\b|\bmusic\b|\bstream\b|\bseries\b|\btelevision\b|\baward\b/,
  Climate: /\bclimate\b|\bcarbon\b|\bemissions\b|\brenewable\b|\bwarming\b|\benergy\b|\bweather\b/,
};

function matchesCountry(item: LiveNewsItem, countryPref: string): boolean {
  if (countryPref === 'All Countries') return true;
  if (item.countryTag.toLowerCase() === countryPref.toLowerCase()) return true;
  const rx = COUNTRY_KEYWORD_MAP[countryPref];
  if (!rx) return false;
  return rx.test(`${item.title} ${item.summary}`);
}

function matchesCategory(item: LiveNewsItem, categoryPref: string): boolean {
  if (categoryPref === 'All Categories') return true;
  if (item.category.toLowerCase() === categoryPref.toLowerCase()) return true;
  const rx = CATEGORY_KEYWORD_MAP[categoryPref];
  if (!rx) return false;
  return rx.test(`${item.title} ${item.summary}`);
}

function selectFilteredCandidates(
  items: LiveNewsItem[],
  countryPref: string,
  categoryPref: string,
  targetCount: number
): { candidates: LiveNewsItem[]; note: string } {
  const hasCountryFilter = countryPref !== 'All Countries';
  const hasCategoryFilter = categoryPref !== 'All Categories';

  if (!hasCountryFilter && !hasCategoryFilter) {
    return { candidates: items, note: '' };
  }

  const exactMatches: LiveNewsItem[] = [];
  const primaryOnlyMatches: LiveNewsItem[] = [];
  const secondaryMatches: LiveNewsItem[] = [];
  const restItems: LiveNewsItem[] = [];

  for (const item of items) {
    const cMatch = matchesCountry(item, countryPref);
    const catMatch = matchesCategory(item, categoryPref);
    if (cMatch && catMatch) {
      exactMatches.push(item);
    } else if ((hasCountryFilter && cMatch) || (hasCategoryFilter && catMatch)) {
      if (hasCategoryFilter && catMatch) {
        primaryOnlyMatches.push(item);
      } else {
        secondaryMatches.push(item);
      }
    } else {
      restItems.push(item);
    }
  }

  const pool = [...exactMatches, ...primaryOnlyMatches, ...secondaryMatches, ...restItems];
  const notes: string[] = [];

  if (exactMatches.length >= targetCount) {
    return { candidates: exactMatches, note: '' };
  }

  if (hasCountryFilter && hasCategoryFilter) {
    if (exactMatches.length === 0) {
      notes.push(
        `No current RSS dispatches matched both ${countryPref} and ${categoryPref}; included closest ${categoryPref} and ${countryPref} verified stories.`
      );
    } else {
      notes.push(
        `Matched ${exactMatches.length} stories for ${countryPref} + ${categoryPref}; supplemented with related verified dispatches to reach ${targetCount} stories.`
      );
    }
  } else if (hasCountryFilter && exactMatches.length < targetCount) {
    notes.push(
      exactMatches.length > 0
        ? `Included ${exactMatches.length} dispatches focused on ${countryPref} alongside global developments to complete your ${targetCount}-story briefing.`
        : `No live RSS dispatches were explicitly tagged for ${countryPref} in this refresh; showing worldwide verified developments.`
    );
  } else if (hasCategoryFilter && exactMatches.length < targetCount) {
    notes.push(
      exactMatches.length > 0
        ? `Included ${exactMatches.length} ${categoryPref} stories alongside cross-desk global developments to reach ${targetCount} stories.`
        : `No live RSS dispatches were explicitly tagged under ${categoryPref} in this refresh; showing top cross-desk developments.`
    );
  }

  return { candidates: pool, note: notes.join(' ') };
}

function groundStoriesToFeed(
  rawStories: BriefingStoryDigest[] | undefined,
  digestInput: Array<{
    title: string;
    publisher: string;
    category: string;
    countryTag: string;
    publishedAt: string;
    url: string;
    summary: string;
  }>,
  targetCount: number
): BriefingStoryDigest[] {
  if (!Array.isArray(rawStories) || rawStories.length === 0) return [];

  const byUrl = new Map(digestInput.map((d) => [d.url.trim().toLowerCase(), d]));
  const grounded: BriefingStoryDigest[] = [];
  const usedUrls = new Set<string>();

  for (const s of rawStories) {
    if (grounded.length >= targetCount) break;
    const rawUrl = (s.sourceUrl || '').trim().toLowerCase();
    let matched = byUrl.get(rawUrl);

    if (!matched && s.headline) {
      const headlineWords = s.headline.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
      matched = digestInput.find((d) => {
        if (usedUrls.has(d.url)) return false;
        const titleLower = d.title.toLowerCase();
        const hits = headlineWords.filter((w) => titleLower.includes(w)).length;
        return hits >= Math.min(3, Math.max(1, Math.floor(headlineWords.length / 2)));
      });
    }

    if (!matched || usedUrls.has(matched.url)) continue;
    usedUrls.add(matched.url);

    grounded.push({
      headline: (s.headline || matched.title).trim(),
      category: (s.category || matched.category).trim(),
      countryTag: (s.countryTag || matched.countryTag).trim(),
      summary: (s.summary || matched.summary).trim(),
      whyItMatters:
        (s.whyItMatters || 'Selected as a notable development from verified international reporting.').trim(),
      whatHappensNext:
        (s.whatHappensNext || 'Awaiting further official updates.').trim(),
      sourceName: matched.publisher,
      sourceUrl: matched.url,
      publishedAt: matched.publishedAt,
    });
  }

  return grounded;
}

export interface BriefingPreferences {
  country?: string;
  category?: string;
  count?: number;
}

async function generateWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Gemini API request timed out.')), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
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
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    return {
      id: baseId,
      aiAvailable: false,
      label: 'AI-Generated Summary (Requires Server Gemini Configuration)',
      briefingDate: todayDate,
      generatedAt: nowIso,
      modelName: BRIEFING_PRIMARY_MODEL,
      countryPreference: countryPref,
      categoryPreference: categoryPref,
      overview: '',
      stories: [],
      errorMessage:
        'GEMINI_API_KEY is not configured in the active server environment. Set GEMINI_API_KEY in Vercel Environment Variables and redeploy to activate 60-Second Briefing.',
    };
  }

  if (items.length === 0) {
    return {
      id: baseId,
      aiAvailable: true,
      label: 'AI-Generated Summary',
      briefingDate: todayDate,
      generatedAt: nowIso,
      modelName: BRIEFING_PRIMARY_MODEL,
      countryPreference: countryPref,
      categoryPreference: categoryPref,
      overview: '',
      stories: [],
      errorMessage:
        'Live RSS news feeds are temporarily unavailable, so no verified stories could be retrieved to summarize.',
    };
  }

  const dedupeKey = `${countryPref}::${categoryPref}::${targetCount}`;
  const existing = inFlightBriefings.get(dedupeKey);
  if (existing) {
    return existing;
  }

  const runPromise = (async (): Promise<DailyBriefingResponse> => {
    const { candidates, note } = selectFilteredCandidates(
      items,
      countryPref,
      categoryPref,
      targetCount
    );

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const inputSliceSize = Math.min(18, Math.max(targetCount + 6, 14));
    const digestInput = candidates.slice(0, inputSliceSize).map((item) => ({
      title: item.title,
      publisher: item.publisher,
      category: item.category,
      countryTag: item.countryTag,
      publishedAt: item.publishedAt,
      url: item.url,
      summary: item.summary.slice(0, 220),
    }));

    const prompt = [
      `You are an international newsroom editor preparing "Your World in 60 Seconds" for ${todayDate}.`,
      `Reader preferences: Country="${countryPref}", Category="${categoryPref}".`,
      `Select exactly ${Math.min(targetCount, digestInput.length)} distinct, non-duplicate developments from the verified RSS items below (prioritizing items matching the requested Country and Category first).`,
      'STRICT GROUNDING RULES:',
      '1. Group related developments and never include duplicate stories.',
      '2. Summarize strictly from the provided headlines and summaries. Never invent facts, numbers, quotes, URLs, or unsupported predictions.',
      '3. Copy exact sourceName (publisher), sourceUrl (url), countryTag, and publishedAt values verbatim from the matched input item.',
      '4. Keep each summary crisp (25-40 words) so the full briefing can be read or listened to in about 60 seconds.',
      '5. For "whatHappensNext", only include next steps explicitly stated in the provided text; otherwise write "Awaiting further official updates."',
      '',
      JSON.stringify(digestInput),
    ].join('\n');

    const candidateModels: Array<{ model: string; thinkingLevel: ThinkingLevel; maxAttempts: number }> = [
      { model: BRIEFING_PRIMARY_MODEL, thinkingLevel: ThinkingLevel.LOW, maxAttempts: 2 },
      { model: BRIEFING_FALLBACK_MODEL, thinkingLevel: ThinkingLevel.MINIMAL, maxAttempts: 1 },
    ];

    let responseText = '';
    let usedModel = BRIEFING_PRIMARY_MODEL;
    let lastError: unknown = null;

    try {
      for (const candidate of candidateModels) {
        for (let attempt = 0; attempt < candidate.maxAttempts; attempt++) {
          try {
            const response = await generateWithTimeout(
              ai.models.generateContent({
                model: candidate.model,
                contents: prompt,
                config: {
                  thinkingConfig: { thinkingLevel: candidate.thinkingLevel },
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
              }),
              GEMINI_TIMEOUT_MS
            );

            const text = (response.text ?? '').trim();
            if (!text) {
              throw new Error('Empty response received from Gemini API.');
            }
            responseText = text;
            usedModel = candidate.model;
            lastError = null;
            break;
          } catch (err) {
            lastError = err;
            if (!isTransientGeminiError(err)) {
              throw err;
            }
            // If this model attempt timed out, fail over immediately to fallback model
            if (isTimeoutError(err)) {
              break;
            }
            if (attempt + 1 < candidate.maxAttempts) {
              await new Promise((r) => setTimeout(r, 350));
            }
          }
        }
        if (!lastError && responseText) break;
      }

      if (lastError) {
        return {
          id: baseId,
          aiAvailable: true,
          label: 'AI-Generated Summary',
          briefingDate: todayDate,
          generatedAt: nowIso,
          modelName: usedModel,
          countryPreference: countryPref,
          categoryPreference: categoryPref,
          overview: '',
          stories: [],
          errorMessage: formatGeminiErrorMessage(lastError),
        };
      }

      const parsed = JSON.parse(responseText || '{}') as {
        overview?: string;
        stories?: BriefingStoryDigest[];
      };

      const groundedStories = groundStoriesToFeed(parsed.stories, digestInput, targetCount);

      if (groundedStories.length === 0) {
        return {
          id: baseId,
          aiAvailable: true,
          label: 'AI-Generated Summary',
          briefingDate: todayDate,
          generatedAt: nowIso,
          modelName: usedModel,
          countryPreference: countryPref,
          categoryPreference: categoryPref,
          overview: '',
          stories: [],
          errorMessage:
            'Unable to match the generated summary cleanly against verified RSS sources. Please try again.',
        };
      }

      return {
        id: baseId,
        aiAvailable: true,
        label: 'AI-Generated Summary · Grounded in Live RSS Feeds',
        briefingDate: todayDate,
        generatedAt: nowIso,
        modelName: usedModel,
        countryPreference: countryPref,
        categoryPreference: categoryPref,
        overview: parsed.overview || 'Concise digest of verified international developments.',
        stories: groundedStories,
        note: note || undefined,
      };
    } catch (err) {
      return {
        id: baseId,
        aiAvailable: true,
        label: 'AI-Generated Summary',
        briefingDate: todayDate,
        generatedAt: nowIso,
        modelName: usedModel,
        countryPreference: countryPref,
        categoryPreference: categoryPref,
        overview: '',
        stories: [],
        errorMessage: formatGeminiErrorMessage(err),
      };
    }
  })().finally(() => {
    inFlightBriefings.delete(dedupeKey);
  });

  inFlightBriefings.set(dedupeKey, runPromise);
  return runPromise;
}
