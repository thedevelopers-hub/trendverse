import { XMLParser } from 'fast-xml-parser';
import { TrendGeoCode, TrendItem, TrendRelatedArticle, TrendsResponse } from '../types.js';

export const TREND_GEO_OPTIONS: Array<{ code: TrendGeoCode; name: string }> = [
  { code: 'WORLD', name: 'Worldwide (Aggregated Regions)' },
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'BR', name: 'Brazil' },
];

const REGIONAL_CODES: Exclude<TrendGeoCode, 'WORLD'>[] = [
  'IN',
  'US',
  'GB',
  'CA',
  'AU',
  'JP',
  'DE',
  'FR',
  'BR',
];

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true,
});

const CACHE_TTL_MS = 5 * 60 * 1000;
const regionCache = new Map<TrendGeoCode, { data: TrendsResponse; fetchedAt: number }>();
const inFlightTrends = new Map<TrendGeoCode, Promise<TrendsResponse>>();

function parseTrafficNumber(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, '');
  return digits ? Number(digits) : 0;
}

function inferTrendCategory(query: string, newsTitles: string[]): string {
  const text = `${query} ${newsTitles.join(' ')}`.toLowerCase();
  if (/\bai\b|openai|gemini|anthropic|gpu|chip|apple|google|microsoft|tech|software/.test(text)) {
    return 'Technology & AI';
  }
  if (/stock|market|bank|rate|inflation|gdp|economy|earnings|tariff|trade/.test(text)) {
    return 'Business & Economy';
  }
  if (/nasa|space|orbit|climate|science|earthquake|weather|solar/.test(text)) {
    return 'Science & Climate';
  }
  if (/film|movie|series|award|music|festival|box office|match|cup|championship|finals/.test(text)) {
    return 'Entertainment & Sports';
  }
  return 'World & Public Interest';
}

function extractRelatedQueries(query: string, newsTitles: string[]): string[] {
  const baseWords = new Set(query.toLowerCase().split(/\s+/));
  const suggestions = new Set<string>();
  for (const t of newsTitles) {
    const cleaned = t.replace(/[-|:].*$/, '').trim();
    if (cleaned && cleaned.length <= 52 && !baseWords.has(cleaned.toLowerCase())) {
      suggestions.add(cleaned);
    }
    if (suggestions.size >= 3) break;
  }
  return Array.from(suggestions);
}

async function fetchRegionalRss(geo: Exclude<TrendGeoCode, 'WORLD'>): Promise<TrendItem[]> {
  const geoName = TREND_GEO_OPTIONS.find((g) => g.code === geo)?.name || geo;
  const rssUrl = `https://trends.google.com/trending/rss?geo=${geo}`;

  const response = await fetch(rssUrl, {
    signal: AbortSignal.timeout(4800),
    headers: {
      'User-Agent': 'TRENDVERSE-TrendRadar/2.0',
      Accept: 'application/rss+xml, application/xml, text/xml',
    },
  });

  if (!response.ok) {
    throw new Error(`Google Trends RSS returned HTTP ${response.status}`);
  }

  const xml = await response.text();
  const parsed = xmlParser.parse(xml) as Record<string, unknown>;
  const channel = (parsed.rss as Record<string, unknown> | undefined)?.channel as
    | Record<string, unknown>
    | undefined;
  const rawItems = channel?.item
    ? Array.isArray(channel.item)
      ? (channel.item as Array<Record<string, unknown>>)
      : [channel.item as Record<string, unknown>]
    : [];

  return rawItems.slice(0, 12).map((entry, idx): TrendItem => {
    const query = String(entry.title || '').trim();
    const approxTraffic = String(entry['ht:approx_traffic'] || 'Rising').trim();
    const trafficNumeric = parseTrafficNumber(approxTraffic);
    const pubRaw = String(entry.pubDate || new Date().toISOString());
    const pubMs = Date.parse(pubRaw);
    const publishedAt = Number.isNaN(pubMs) ? new Date().toISOString() : new Date(pubMs).toISOString();

    const rawNews = entry['ht:news_item'];
    const newsArr = rawNews
      ? Array.isArray(rawNews)
        ? (rawNews as Array<Record<string, unknown>>)
        : [rawNews as Record<string, unknown>]
      : [];

    const relatedArticles: TrendRelatedArticle[] = newsArr
      .slice(0, 3)
      .map((n) => ({
        title: String(n['ht:news_item_title'] || '').trim(),
        source: String(n['ht:news_item_source'] || 'News Publisher').trim(),
        url: String(n['ht:news_item_url'] || '').trim(),
      }))
      .filter((n) => n.title && n.url);

    const newsTitles = relatedArticles.map((n) => n.title);

    return {
      id: `${geo}-${idx}-${query.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16)}`,
      query,
      approxTraffic,
      trafficNumeric,
      interestLabel: `Google Trends Bucket: ${approxTraffic}`,
      direction: trafficNumeric >= 10000 ? 'Rising' : 'Steady',
      category: inferTrendCategory(query, newsTitles),
      geo,
      geoName,
      publishedAt,
      trendsExploreUrl: `https://trends.google.com/trends/explore?q=${encodeURIComponent(query)}&geo=${geo}`,
      relatedQueries: extractRelatedQueries(query, newsTitles),
      relatedArticles,
    };
  });
}

export async function getGoogleTrends(
  geo: TrendGeoCode = 'WORLD',
  forceRefresh = false
): Promise<TrendsResponse> {
  const validGeo = TREND_GEO_OPTIONS.some((g) => g.code === geo) ? geo : 'WORLD';
  const geoName = TREND_GEO_OPTIONS.find((g) => g.code === validGeo)?.name || 'Worldwide';
  const now = Date.now();
  const cached = regionCache.get(validGeo);

  if (!forceRefresh && cached && cached.data.trends.length > 0 && now - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  const existingInFlight = inFlightTrends.get(validGeo);
  if (existingInFlight && !forceRefresh) {
    return existingInFlight;
  }

  const runFetch = async (): Promise<TrendsResponse> => {
    try {
      let trends: TrendItem[] = [];
      if (validGeo === 'WORLD') {
        const sampleRegions: Exclude<TrendGeoCode, 'WORLD'>[] = ['US', 'IN', 'GB', 'DE', 'JP', 'AU'];
        const settled = await Promise.allSettled(sampleRegions.map((r) => fetchRegionalRss(r)));
        const all = settled
          .filter((r): r is PromiseFulfilledResult<TrendItem[]> => r.status === 'fulfilled')
          .flatMap((r) => r.value);

        if (all.length === 0) {
          throw new Error('Unable to reach regional Google Trends RSS feeds.');
        }

        const seenQueries = new Set<string>();
        trends = all
          .sort((a, b) => b.trafficNumeric - a.trafficNumeric)
          .filter((item) => {
            const key = item.query.toLowerCase();
            if (seenQueries.has(key)) return false;
            seenQueries.add(key);
            return true;
          })
          .slice(0, 12);
      } else {
        trends = await fetchRegionalRss(validGeo);
      }

      const payload: TrendsResponse = {
        geo: validGeo,
        geoName,
        sourceName: 'Google Trends Official RSS',
        sourceUrl:
          validGeo === 'WORLD'
            ? 'https://trends.google.com/trending'
            : `https://trends.google.com/trending/rss?geo=${validGeo}`,
        lastUpdated: new Date().toISOString(),
        status: 'live',
        note:
          validGeo === 'WORLD'
            ? 'Aggregated from live regional Google Trends RSS feeds (US, IN, GB, DE, JP, AU). Traffic tiers represent Google Trends approximate search interest buckets, not exact total query counts.'
            : 'Traffic tiers reflect Google Trends approximate search interest buckets (ht:approx_traffic), not absolute search volume.',
        trends,
      };

      if (trends.length > 0) {
        regionCache.set(validGeo, { data: payload, fetchedAt: Date.now() });
      }
      return payload;
    } catch (err) {
      if (cached && cached.data.trends.length > 0) {
        return {
          ...cached.data,
          status: 'cached',
          errorMessage: err instanceof Error ? err.message : 'Live Google Trends fetch failed; showing cached data.',
        };
      }

      return {
        geo: validGeo,
        geoName,
        sourceName: 'Google Trends Official RSS',
        sourceUrl: 'https://trends.google.com/trending',
        lastUpdated: null,
        status: 'unavailable',
        note: 'Official Google Trends feed could not be reached right now.',
        errorMessage: err instanceof Error ? err.message : 'Google Trends feed temporarily unavailable.',
        trends: [],
      };
    }
  };

  const promise = runFetch().finally(() => {
    if (inFlightTrends.get(validGeo) === promise) {
      inFlightTrends.delete(validGeo);
    }
  });
  inFlightTrends.set(validGeo, promise);
  return promise;
}

export { REGIONAL_CODES };
