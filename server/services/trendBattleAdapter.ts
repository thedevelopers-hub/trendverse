import {
  TrendBattleEntitySummary,
  TrendBattlePoint,
  TrendBattleRange,
  TrendBattleResponse,
  TrendGeoCode,
} from '../types.js';
import { getGoogleTrends, TREND_GEO_OPTIONS } from './googleTrendsAdapter.js';

const WIKI_PROJECT_BY_GEO: Record<TrendGeoCode, string> = {
  WORLD: 'en.wikipedia',
  IN: 'en.wikipedia',
  US: 'en.wikipedia',
  GB: 'en.wikipedia',
  CA: 'en.wikipedia',
  AU: 'en.wikipedia',
  JP: 'ja.wikipedia',
  DE: 'de.wikipedia',
  FR: 'fr.wikipedia',
  BR: 'pt.wikipedia',
};

const WIKI_LANG_BY_GEO: Record<TrendGeoCode, string> = {
  WORLD: 'en',
  IN: 'en',
  US: 'en',
  GB: 'en',
  CA: 'en',
  AU: 'en',
  JP: 'ja',
  DE: 'de',
  FR: 'fr',
  BR: 'pt',
};

const WIKIMEDIA_UA = 'TRENDVERSE/2.0 (https://trendverse.app; newsroom@trendverse.app)';

const SUGGEST_GL_BY_GEO: Record<TrendGeoCode, { hl: string; gl: string }> = {
  WORLD: { hl: 'en', gl: 'us' },
  IN: { hl: 'en', gl: 'in' },
  US: { hl: 'en', gl: 'us' },
  GB: { hl: 'en', gl: 'gb' },
  CA: { hl: 'en', gl: 'ca' },
  AU: { hl: 'en', gl: 'au' },
  JP: { hl: 'ja', gl: 'jp' },
  DE: { hl: 'de', gl: 'de' },
  FR: { hl: 'fr', gl: 'fr' },
  BR: { hl: 'pt', gl: 'br' },
};

const battleCache = new Map<string, { data: TrendBattleResponse; expiresAt: number }>();
const BATTLE_CACHE_TTL_MS = 15 * 60 * 1000;

interface ResolvedWikiEntity {
  title: string;
  url: string;
}

async function resolveWikipediaEntity(
  topic: string,
  lang: string
): Promise<ResolvedWikiEntity | null> {
  const searchUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srlimit=5&format=json&srsearch=${encodeURIComponent(
    topic
  )}`;
  const res = await fetch(searchUrl, {
    signal: AbortSignal.timeout(3800),
    headers: { 'User-Agent': WIKIMEDIA_UA },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    query?: { search?: Array<{ title?: string }> };
  };
  const candidates = (data.query?.search || [])
    .map((c) => c.title || '')
    .filter(Boolean);
  if (candidates.length === 0) return null;

  // Check pageprops to avoid disambiguation pages when a specific entity exists
  const titlesParam = candidates.slice(0, 4).join('|');
  const propsUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=pageprops&ppprop=disambiguation&titles=${encodeURIComponent(
    titlesParam
  )}&format=json`;
  const propsRes = await fetch(propsUrl, {
    signal: AbortSignal.timeout(2800),
    headers: { 'User-Agent': WIKIMEDIA_UA },
  });

  let chosen = candidates[0];
  if (propsRes.ok) {
    const propsJson = (await propsRes.json()) as {
      query?: { pages?: Record<string, { title?: string; pageprops?: { disambiguation?: string } }> };
    };
    const pages = Object.values(propsJson.query?.pages || {});
    const nonDisambig = candidates.find((cand) => {
      const match = pages.find((p) => p.title === cand);
      return match && match.pageprops?.disambiguation === undefined;
    });
    if (nonDisambig) {
      chosen = nonDisambig;
    }
  }

  return {
    title: chosen,
    url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(chosen.replace(/ /g, '_'))}`,
  };
}

function formatYmdCompact(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

async function fetchWikimediaDailyViews(
  articleTitle: string,
  project: string,
  days: number
): Promise<Array<{ date: string; views: number }>> {
  // End date yesterday UTC (Wikimedia daily data finalizes after UTC midnight)
  const end = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const start = new Date(end.getTime() - (days - 1) * 24 * 60 * 60 * 1000);

  const encodedArticle = encodeURIComponent(articleTitle.replace(/ /g, '_'));
  const url = `https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/${project}/all-access/user/${encodedArticle}/daily/${formatYmdCompact(
    start
  )}/${formatYmdCompact(end)}`;

  const res = await fetch(url, {
    signal: AbortSignal.timeout(4200),
    headers: { 'User-Agent': WIKIMEDIA_UA },
  });
  if (!res.ok) {
    throw new Error(`Wikimedia Pageviews returned HTTP ${res.status}`);
  }
  const json = (await res.json()) as {
    items?: Array<{ timestamp?: string; views?: number }>;
  };

  return (json.items || [])
    .map((item) => {
      const ts = String(item.timestamp || '');
      const date =
        ts.length >= 8 ? `${ts.slice(0, 4)}-${ts.slice(4, 6)}-${ts.slice(6, 8)}` : '';
      return { date, views: Number(item.views || 0) };
    })
    .filter((d) => d.date);
}

async function fetchRelatedSuggestQueries(
  topic: string,
  geo: TrendGeoCode,
  suffix = ''
): Promise<string[]> {
  try {
    const q = suffix ? `${topic} ${suffix}` : topic;
    const { hl, gl } = SUGGEST_GL_BY_GEO[geo] || { hl: 'en', gl: 'us' };
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=${hl}&gl=${gl}&q=${encodeURIComponent(
      q
    )}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(3000),
      headers: { 'User-Agent': WIKIMEDIA_UA },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as [string, string[]];
    return Array.isArray(data?.[1])
      ? data[1].filter((s) => s.toLowerCase() !== topic.toLowerCase()).slice(0, 5)
      : [];
  } catch {
    return [];
  }
}

export async function runTrendBattleComparison(
  rawTopicA: string,
  rawTopicB: string,
  geo: TrendGeoCode = 'WORLD',
  range: TrendBattleRange = '30d',
  forceRefresh = false
): Promise<TrendBattleResponse> {
  const topicAInput = rawTopicA.trim();
  const topicBInput = rawTopicB.trim();
  const validGeo = TREND_GEO_OPTIONS.some((g) => g.code === geo) ? geo : 'WORLD';
  const geoName = TREND_GEO_OPTIONS.find((g) => g.code === validGeo)?.name || 'Worldwide';
  const validRange: TrendBattleRange = range === '7d' || range === '90d' ? range : '30d';
  const days = validRange === '7d' ? 7 : validRange === '90d' ? 90 : 30;
  const project = WIKI_PROJECT_BY_GEO[validGeo];
  const lang = WIKI_LANG_BY_GEO[validGeo];
  const nowIso = new Date().toISOString();

  const cacheKey = `${topicAInput.toLowerCase()}__${topicBInput.toLowerCase()}__${validGeo}__${validRange}`;
  const cached = battleCache.get(cacheKey);
  if (!forceRefresh && cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const googleCompareUrl = `https://trends.google.com/trends/explore?q=${encodeURIComponent(
    `${topicAInput},${topicBInput}`
  )}${validGeo === 'WORLD' ? '' : `&geo=${validGeo}`}`;

  const [
    entityA,
    entityB,
    relatedA,
    risingA,
    relatedB,
    risingB,
    liveTrends,
  ] = await Promise.all([
    resolveWikipediaEntity(topicAInput, lang).catch(() => null),
    resolveWikipediaEntity(topicBInput, lang).catch(() => null),
    fetchRelatedSuggestQueries(topicAInput, validGeo),
    fetchRelatedSuggestQueries(topicAInput, validGeo, 'vs'),
    fetchRelatedSuggestQueries(topicBInput, validGeo),
    fetchRelatedSuggestQueries(topicBInput, validGeo, 'vs'),
    getGoogleTrends(validGeo, false).catch(() => null),
  ]);

  let viewsA: Array<{ date: string; views: number }> = [];
  let viewsB: Array<{ date: string; views: number }> = [];
  let errA: string | undefined;
  let errB: string | undefined;

  if (entityA) {
    try {
      viewsA = await fetchWikimediaDailyViews(entityA.title, project, days);
    } catch (e) {
      errA = e instanceof Error ? e.message : 'Attention timeline unavailable';
    }
  } else {
    errA = `No public reference entity found for "${topicAInput}".`;
  }

  if (entityB) {
    try {
      viewsB = await fetchWikimediaDailyViews(entityB.title, project, days);
    } catch (e) {
      errB = e instanceof Error ? e.message : 'Attention timeline unavailable';
    }
  } else {
    errB = `No public reference entity found for "${topicBInput}".`;
  }

  // Merge date keys and normalize onto a shared 0-100 relative interest scale
  const dateSet = new Set<string>([...viewsA.map((d) => d.date), ...viewsB.map((d) => d.date)]);
  const sortedDates = Array.from(dateSet).sort();

  const mapA = new Map(viewsA.map((d) => [d.date, d.views]));
  const mapB = new Map(viewsB.map((d) => [d.date, d.views]));

  const maxRaw = Math.max(
    1,
    ...viewsA.map((d) => d.views),
    ...viewsB.map((d) => d.views)
  );

  const series: TrendBattlePoint[] = sortedDates.map((date) => {
    const rawA = mapA.get(date);
    const rawB = mapB.get(date);
    return {
      date,
      topicAScore: rawA !== undefined ? Math.round((rawA / maxRaw) * 100) : null,
      topicBScore: rawB !== undefined ? Math.round((rawB / maxRaw) * 100) : null,
    };
  });

  const summarize = (
    inputTopic: string,
    entity: ResolvedWikiEntity | null,
    scores: Array<{ date: string; score: number | null }>,
    relatedQueries: string[],
    risingQueries: string[],
    errorReason?: string
  ): TrendBattleEntitySummary => {
    const valid = scores.filter((s): s is { date: string; score: number } => s.score !== null);
    const avg =
      valid.length > 0
        ? Math.round(valid.reduce((acc, s) => acc + s.score, 0) / valid.length)
        : 0;
    let peak = 0;
    let peakDate: string | null = null;
    for (const s of valid) {
      if (s.score >= peak) {
        peak = s.score;
        peakDate = s.date;
      }
    }

    const trendMatch = liveTrends?.trends.find(
      (t) =>
        t.query.toLowerCase().includes(inputTopic.toLowerCase()) ||
        inputTopic.toLowerCase().includes(t.query.toLowerCase())
    );

    return {
      inputTopic,
      resolvedEntity: entity?.title || null,
      wikipediaUrl: entity?.url || null,
      averageScore: avg,
      peakScore: peak,
      peakDate,
      trendingTodayTraffic: trendMatch ? trendMatch.approxTraffic : null,
      relatedQueries,
      risingQueries,
      available: valid.length > 0,
      errorReason,
    };
  };

  const summaryA = summarize(
    topicAInput,
    entityA,
    series.map((p) => ({ date: p.date, score: p.topicAScore })),
    relatedA,
    risingA,
    errA
  );
  const summaryB = summarize(
    topicBInput,
    entityB,
    series.map((p) => ({ date: p.date, score: p.topicBScore })),
    relatedB,
    risingB,
    errB
  );

  const status: TrendBattleResponse['status'] =
    summaryA.available && summaryB.available
      ? 'live'
      : summaryA.available || summaryB.available
      ? 'partial'
      : 'unavailable';

  const payload: TrendBattleResponse = {
    topicA: summaryA,
    topicB: summaryB,
    geo: validGeo,
    geoName,
    range: validRange,
    series,
    sourceName: `Wikimedia Public Attention API (${project}) + Google Suggest + Google Trends RSS`,
    sourceUrl: 'https://wikimedia.org/api/rest_v1/',
    googleTrendsCompareUrl: googleCompareUrl,
    googleTrendsApiNote:
      'Google Trends direct multiline comparison API restricts automated unauthenticated calls (HTTP 429). TRENDVERSE uses verified Wikimedia public reader attention normalized to a 0–100 relative index alongside official Google Trends RSS signals and Google Suggest queries.',
    isRelativeScoreNotice:
      'Scores (0–100) represent relative reader interest normalized to the peak value in this comparison window, NOT absolute search query volume.',
    lastUpdated: nowIso,
    status,
    errorMessage:
      status === 'unavailable'
        ? 'Could not retrieve public attention time series for either topic. Use the Google Trends direct link to inspect manually.'
        : undefined,
  };

  if (status !== 'unavailable') {
    if (battleCache.size >= 100) {
      const oldestKey = battleCache.keys().next().value;
      if (oldestKey) battleCache.delete(oldestKey);
    }
    battleCache.set(cacheKey, { data: payload, expiresAt: Date.now() + BATTLE_CACHE_TTL_MS });
  }

  return payload;
}
