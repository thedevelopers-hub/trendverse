import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import {
  BriefingStoryDigest,
  DailyBriefingResponse,
  LiveNewsItem,
} from '../types.js';

const ALLOWED_FREE_TEXT_MODELS = ['gemini-4-hydrogen', 'gemini-3.1-flash-lite'] as const;
type SupportedBriefingModel = (typeof ALLOWED_FREE_TEXT_MODELS)[number];

const DEPRECATED_MODEL_PATTERN = /^(gemini-1\.|gemini-2\.0|gemini-pro$|text-bison|chat-bison)/i;

function resolveConfiguredModel(envValue: string | undefined, defaultModel: SupportedBriefingModel): SupportedBriefingModel {
  const cleaned = (envValue || '').trim().replace(/^models\//i, '');
  if (!cleaned || DEPRECATED_MODEL_PATTERN.test(cleaned)) {
    return defaultModel;
  }
  if ((ALLOWED_FREE_TEXT_MODELS as readonly string[]).includes(cleaned)) {
    return cleaned as SupportedBriefingModel;
  }
  return defaultModel;
}

export function getConfiguredBriefingModels(): {
  primary: SupportedBriefingModel;
  fallback: SupportedBriefingModel;
} {
  const primary = resolveConfiguredModel(process.env.GEMINI_PRIMARY_MODEL, 'gemini-4-hydrogen');
  const rawFallback = resolveConfiguredModel(
    process.env.GEMINI_FALLBACK_MODEL,
    primary === 'gemini-3.1-flash-lite' ? 'gemini-4-hydrogen' : 'gemini-3.1-flash-lite'
  );
  return { primary, fallback: rawFallback };
}

export const BRIEFING_PRIMARY_MODEL = getConfiguredBriefingModels().primary;
export const BRIEFING_FALLBACK_MODEL = getConfiguredBriefingModels().fallback;

const GEMINI_TIMEOUT_MS = 12_000;
const MODELS_LIST_TIMEOUT_MS = 3_000;
const MAX_RETRY_ATTEMPTS = 3; // Maximum 3 retry attempts (up to 4 total attempts)
const OVERALL_DEADLINE_MS = 28_000;
const BRIEFING_CACHE_TTL_MS = 90_000;
const MODEL_LIST_CACHE_TTL_MS = 10 * 60 * 1000;

const inFlightBriefings = new Map<string, Promise<DailyBriefingResponse>>();
const recentBriefingsCache = new Map<string, { expiresAt: number; payload: DailyBriefingResponse }>();
const verifiedModelsCache = new Map<string, { expiresAt: number; models: Set<string> }>();

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
    return 'Gemini API rate limit or quota reached temporarily (429). Displaying verified live RSS headlines below — please retry in a moment.';
  }
  if (
    lower.includes('503') ||
    lower.includes('unavailable') ||
    lower.includes('high demand') ||
    lower.includes('overloaded')
  ) {
    return 'The Gemini API is temporarily experiencing high demand (503). Displaying verified live RSS headlines below — please try again in a few seconds.';
  }
  if (lower.includes('500') || lower.includes('502') || lower.includes('504') || lower.includes('internal')) {
    return 'The Gemini API encountered a temporary server error. Displaying verified live RSS headlines below — please retry shortly.';
  }
  if (
    lower.includes('abort') ||
    lower.includes('timeout') ||
    lower.includes('timed out')
  ) {
    return 'The Gemini briefing request timed out. Displaying verified live RSS headlines below — please try again.';
  }
  if (lower.includes('404') || lower.includes('not_found')) {
    return 'The configured Gemini model endpoint is unavailable for this key. Displaying verified live RSS headlines below.';
  }
  return 'The Gemini API is temporarily unavailable. Displaying verified live RSS headlines below — please try again.';
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
    lower.includes('500') ||
    lower.includes('502') ||
    lower.includes('504') ||
    lower.includes('unavailable') ||
    lower.includes('resource_exhausted') ||
    lower.includes('internal') ||
    lower.includes('high demand') ||
    lower.includes('overloaded') ||
    lower.includes('timeout') ||
    lower.includes('timed out') ||
    lower.includes('abort') ||
    lower.includes('econnreset') ||
    lower.includes('etimedout') ||
    lower.includes('enotfound') ||
    lower.includes('socket hang up') ||
    lower.includes('fetch failed')
  );
}

function computeJitteredBackoffMs(retryNumber: number): number {
  const exponentialBase = 400 * Math.pow(2, Math.max(0, retryNumber));
  const jitter = Math.floor(Math.random() * 250);
  return Math.min(3_000, exponentialBase + jitter);
}

async function getVerifiedAvailableModels(ai: GoogleGenAI, apiKey: string): Promise<Set<string>> {
  const keyFingerprint = `${apiKey.length}:${apiKey.slice(-4)}`;
  const cached = verifiedModelsCache.get(keyFingerprint);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.models;
  }

  const available = new Set<string>();
  try {
    const pager = await generateWithTimeout(ai.models.list(), MODELS_LIST_TIMEOUT_MS);
    for await (const model of pager) {
      const normalized = (model?.name || '').replace(/^models\//i, '').trim();
      if (normalized && !DEPRECATED_MODEL_PATTERN.test(normalized)) {
        available.add(normalized);
      }
      if (available.size >= 100) break;
    }
    if (available.size > 0) {
      verifiedModelsCache.set(keyFingerprint, {
        expiresAt: Date.now() + MODEL_LIST_CACHE_TTL_MS,
        models: available,
      });
    }
  } catch {
    // Keep empty set when list endpoint transiently fails so configured primary can still be attempted
  }
  return available;
}

const COUNTRY_KEYWORD_MAP: Record<string, RegExp> = {
  India: /\bindia\b|\bindian\b|\bnew delhi\b|\bmumbai\b|\bbengaluru\b|\bchennai\b|\bkolkata\b|\bhyderabad\b/,
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
  Entertainment: /\bfilm\b|\bcinema\b|\bmusic\b|\bstream\b|\bseries\b|\btelevision\b|\baward\b|\bactor\b|\bmovie\b|\bbollywood\b|\bhollywood\b/,
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

export function selectFilteredCandidates(
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
  const countryPriorityMatches: LiveNewsItem[] = [];
  const categoryOnlyMatches: LiveNewsItem[] = [];
  const restItems: LiveNewsItem[] = [];

  for (const item of items) {
    const cMatch = matchesCountry(item, countryPref);
    const catMatch = matchesCategory(item, categoryPref);
    if (cMatch && catMatch) {
      exactMatches.push(item);
    } else if (hasCountryFilter && cMatch) {
      countryPriorityMatches.push(item);
    } else if (hasCategoryFilter && catMatch) {
      categoryOnlyMatches.push(item);
    } else {
      restItems.push(item);
    }
  }

  // Prioritize India + selected category cleanly when both are chosen
  const interleavedSecondary: LiveNewsItem[] = [];
  const maxSecondaryLen = Math.max(countryPriorityMatches.length, categoryOnlyMatches.length);
  for (let i = 0; i < maxSecondaryLen; i++) {
    if (i < categoryOnlyMatches.length) interleavedSecondary.push(categoryOnlyMatches[i]);
    if (i < countryPriorityMatches.length) interleavedSecondary.push(countryPriorityMatches[i]);
  }

  const pool = [...exactMatches, ...interleavedSecondary, ...restItems];
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
        `Matched ${exactMatches.length} stories for ${countryPref} + ${categoryPref}; supplemented with related ${countryPref} and ${categoryPref} verified dispatches to reach ${targetCount} stories.`
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
  forceRefresh?: boolean;
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

function buildFallbackResponse(params: {
  id: string;
  nowIso: string;
  todayDate: string;
  modelName: string;
  countryPref: string;
  categoryPref: string;
  candidates: LiveNewsItem[];
  targetCount: number;
  note?: string;
  errorMessage: string;
  label?: string;
}): DailyBriefingResponse {
  const fallbackArticles = params.candidates.slice(0, params.targetCount);
  return {
    id: params.id,
    aiAvailable: false,
    fallbackMode: true,
    label: params.label || 'Fallback Mode · Verified Live RSS Headlines (AI Summary Unavailable)',
    briefingDate: params.todayDate,
    generatedAt: params.nowIso,
    modelName: params.modelName,
    countryPreference: params.countryPref,
    categoryPreference: params.categoryPref,
    overview: '',
    stories: [],
    fallbackArticles,
    note: params.note || undefined,
    errorMessage: params.errorMessage,
  };
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

  const { primary: primaryModel, fallback: fallbackModel } = getConfiguredBriefingModels();
  const baseId = `briefing-${todayDate}-${Date.now()}`;
  const { candidates, note } = selectFilteredCandidates(
    items,
    countryPref,
    categoryPref,
    targetCount
  );

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return buildFallbackResponse({
      id: baseId,
      nowIso,
      todayDate,
      modelName: primaryModel,
      countryPref,
      categoryPref,
      candidates,
      targetCount,
      note,
      label: 'Fallback Mode · Verified Live RSS Headlines (Server Gemini Key Not Configured)',
      errorMessage:
        'GEMINI_API_KEY is not configured in the active server environment. Displaying verified live RSS headlines below.',
    });
  }

  if (items.length === 0) {
    return {
      id: baseId,
      aiAvailable: false,
      fallbackMode: true,
      label: 'Live RSS Feeds Temporarily Unavailable',
      briefingDate: todayDate,
      generatedAt: nowIso,
      modelName: primaryModel,
      countryPreference: countryPref,
      categoryPreference: categoryPref,
      overview: '',
      stories: [],
      fallbackArticles: [],
      errorMessage:
        'Live RSS news feeds are temporarily unavailable, so no verified stories could be retrieved to summarize.',
    };
  }

  const dedupeKey = `${countryPref}::${categoryPref}::${targetCount}`;
  const topUrlsSignature = candidates.slice(0, 3).map((c) => c.url).join('|');
  const cacheKey = `${dedupeKey}::${topUrlsSignature}`;

  if (!prefs.forceRefresh) {
    const cached = recentBriefingsCache.get(cacheKey);
    if (
      cached &&
      cached.expiresAt > Date.now() &&
      cached.payload.aiAvailable &&
      !cached.payload.fallbackMode &&
      cached.payload.stories.length > 0
    ) {
      return cached.payload;
    }
  }

  const existing = inFlightBriefings.get(dedupeKey);
  if (existing) {
    return existing;
  }

  const startedAtMs = Date.now();

  const runPromise = (async (): Promise<DailyBriefingResponse> => {
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

    // Verify available models for the configured API key before switching to fallback
    const verifiedModels = await getVerifiedAvailableModels(ai, apiKey);

    const modelExecutionPlan: Array<{
      model: SupportedBriefingModel;
      thinkingLevel: ThinkingLevel;
      attempts: number;
    }> = [
      {
        model: primaryModel,
        thinkingLevel: primaryModel === 'gemini-3.1-flash-lite' ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW,
        attempts: 2, // Initial try + 1 retry on primary before checking fallback
      },
    ];

    const fallbackAllowedForKey =
      fallbackModel !== primaryModel &&
      (verifiedModels.size === 0 || verifiedModels.has(fallbackModel));

    if (fallbackAllowedForKey) {
      modelExecutionPlan.push({
        model: fallbackModel,
        thinkingLevel: fallbackModel === 'gemini-3.1-flash-lite' ? ThinkingLevel.MINIMAL : ThinkingLevel.LOW,
        attempts: 2, // Up to 2 attempts on verified fallback (capped at MAX_RETRY_ATTEMPTS total retries)
      });
    }

    let responseText = '';
    let usedModel: string = primaryModel;
    let lastError: unknown = null;
    let retriesUsed = 0;

    try {
      for (const stage of modelExecutionPlan) {
        if (verifiedModels.size > 0 && !verifiedModels.has(stage.model)) {
          continue;
        }

        for (let stageAttempt = 0; stageAttempt < stage.attempts; stageAttempt++) {
          const remainingBudgetMs = OVERALL_DEADLINE_MS - (Date.now() - startedAtMs);
          if (remainingBudgetMs < 3_500) break;

          try {
            const perAttemptTimeout = Math.min(GEMINI_TIMEOUT_MS, remainingBudgetMs);
            const response = await generateWithTimeout(
              ai.models.generateContent({
                model: stage.model,
                contents: prompt,
                config: {
                  thinkingConfig: { thinkingLevel: stage.thinkingLevel },
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
              perAttemptTimeout
            );

            const text = (response.text ?? '').trim();
            if (!text) {
              throw new Error('Empty response received from Gemini API.');
            }
            responseText = text;
            usedModel = stage.model;
            lastError = null;
            break;
          } catch (err) {
            lastError = err;
            if (!isTransientGeminiError(err)) {
              throw err;
            }
            if (retriesUsed >= MAX_RETRY_ATTEMPTS) {
              break;
            }
            retriesUsed++;
            const backoffMs = computeJitteredBackoffMs(retriesUsed - 1);
            if (Date.now() - startedAtMs + backoffMs + 3_500 > OVERALL_DEADLINE_MS) {
              break;
            }
            await new Promise((r) => setTimeout(r, backoffMs));
            // On timeout of primary, jump straight to fallback stage after jittered backoff
            if (isTimeoutError(err)) {
              break;
            }
          }
        }
        if (!lastError && responseText) break;
        if (retriesUsed > MAX_RETRY_ATTEMPTS) break;
      }

      if (lastError || !responseText) {
        return buildFallbackResponse({
          id: baseId,
          nowIso,
          todayDate,
          modelName: usedModel,
          countryPref,
          categoryPref,
          candidates,
          targetCount,
          note,
          errorMessage: formatGeminiErrorMessage(lastError),
        });
      }

      const parsed = JSON.parse(responseText || '{}') as {
        overview?: string;
        stories?: BriefingStoryDigest[];
      };

      const groundedStories = groundStoriesToFeed(parsed.stories, digestInput, targetCount);

      if (groundedStories.length === 0) {
        return buildFallbackResponse({
          id: baseId,
          nowIso,
          todayDate,
          modelName: usedModel,
          countryPref,
          categoryPref,
          candidates,
          targetCount,
          note,
          errorMessage:
            'Unable to match the AI summary cleanly against verified RSS sources. Displaying verified RSS headlines below — please try again.',
        });
      }

      const successPayload: DailyBriefingResponse = {
        id: baseId,
        aiAvailable: true,
        fallbackMode: false,
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

      recentBriefingsCache.set(cacheKey, {
        expiresAt: Date.now() + BRIEFING_CACHE_TTL_MS,
        payload: successPayload,
      });

      return successPayload;
    } catch (err) {
      return buildFallbackResponse({
        id: baseId,
        nowIso,
        todayDate,
        modelName: usedModel,
        countryPref,
        categoryPref,
        candidates,
        targetCount,
        note,
        errorMessage: formatGeminiErrorMessage(err),
      });
    }
  })().finally(() => {
    inFlightBriefings.delete(dedupeKey);
  });

  inFlightBriefings.set(dedupeKey, runPromise);
  return runPromise;
}
