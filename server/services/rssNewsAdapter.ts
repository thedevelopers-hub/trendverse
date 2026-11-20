import { XMLParser } from 'fast-xml-parser';
import { FeedSourceHealth, LiveNewsItem, LiveNewsResponse, NewsCategory } from '../types.js';

interface FeedSourceConfig {
  id: string;
  name: string;
  url: string;
  category: NewsCategory;
  countryTag: string;
}

export const PUBLIC_NEWS_SOURCES: FeedSourceConfig[] = [
  {
    id: 'bbc-world',
    name: 'BBC News',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'World',
    countryTag: 'United Kingdom',
  },
  {
    id: 'npr-world',
    name: 'NPR News',
    url: 'https://feeds.npr.org/1001/rss.xml',
    category: 'World',
    countryTag: 'United States',
  },
  {
    id: 'bbc-india',
    name: 'BBC News India',
    url: 'https://feeds.bbci.co.uk/news/world/asia/india/rss.xml',
    category: 'India',
    countryTag: 'India',
  },
  {
    id: 'the-hindu',
    name: 'The Hindu',
    url: 'https://www.thehindu.com/news/national/feeder/default.rss',
    category: 'India',
    countryTag: 'India',
  },
  {
    id: 'bbc-tech',
    name: 'BBC Technology',
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    category: 'Technology',
    countryTag: 'United Kingdom',
  },
  {
    id: 'google-ai-blog',
    name: 'Google AI Blog',
    url: 'https://blog.google/technology/ai/rss/',
    category: 'Artificial Intelligence',
    countryTag: 'United States',
  },
  {
    id: 'mit-ai',
    name: 'MIT News AI',
    url: 'https://news.mit.edu/rss/topic/artificial-intelligence2',
    category: 'Artificial Intelligence',
    countryTag: 'United States',
  },
  {
    id: 'bbc-business',
    name: 'BBC Business',
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    category: 'Business',
    countryTag: 'United Kingdom',
  },
  {
    id: 'bbc-science',
    name: 'BBC Science',
    url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
    category: 'Science',
    countryTag: 'United Kingdom',
  },
  {
    id: 'nasa-news',
    name: 'NASA',
    url: 'https://www.nasa.gov/rss/dyn/breaking_news.rss',
    category: 'Space',
    countryTag: 'United States',
  },
  {
    id: 'bbc-entertainment',
    name: 'BBC Entertainment',
    url: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',
    category: 'Entertainment',
    countryTag: 'United Kingdom',
  },
  {
    id: 'un-climate',
    name: 'UN News Climate',
    url: 'https://news.un.org/feed/subscribe/en/news/topic/climate-change/feed/rss.xml',
    category: 'Climate',
    countryTag: 'Global',
  },
];

const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  trimValues: true,
});

const CACHE_TTL_MS = 3 * 60 * 1000;
let cachedResponse: LiveNewsResponse | null = null;
let lastFetchMs = 0;
const sourceHealthMap = new Map<string, FeedSourceHealth>();
const perSourceCachedItems = new Map<string, LiveNewsItem[]>();

function stripHtml(raw: unknown): string {
  if (!raw) return '';
  const text = typeof raw === 'string' ? raw : String((raw as Record<string, unknown>)['#text'] ?? '');
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function extractThumbnail(item: Record<string, unknown>): string | undefined {
  const mediaThumb = item['media:thumbnail'] as Record<string, unknown> | Array<Record<string, unknown>> | undefined;
  if (Array.isArray(mediaThumb) && mediaThumb[0]?.['@_url']) {
    return String(mediaThumb[0]['@_url']);
  }
  if (mediaThumb && !Array.isArray(mediaThumb) && mediaThumb['@_url']) {
    return String(mediaThumb['@_url']);
  }

  const mediaContent = item['media:content'] as Record<string, unknown> | Array<Record<string, unknown>> | undefined;
  if (Array.isArray(mediaContent) && mediaContent[0]?.['@_url']) {
    return String(mediaContent[0]['@_url']);
  }
  if (mediaContent && !Array.isArray(mediaContent) && mediaContent['@_url']) {
    return String(mediaContent['@_url']);
  }

  const enclosure = item.enclosure as Record<string, unknown> | undefined;
  if (enclosure?.['@_url'] && String(enclosure['@_type'] || '').startsWith('image')) {
    return String(enclosure['@_url']);
  }
  return undefined;
}

function inferCountryTag(title: string, summary: string, fallback: string): string {
  const text = `${title} ${summary}`.toLowerCase();
  if (/\bindia\b|\bnew delhi\b|\bmumbai\b|\bbengaluru\b/.test(text)) return 'India';
  if (/\bunited states\b|\bu\.s\.\b|\bwashington\b|\bnew york\b|\bcalifornia\b/.test(text)) return 'United States';
  if (/\buk\b|\bbritain\b|\blondon\b|\bengland\b|\bscotland\b/.test(text)) return 'United Kingdom';
  if (/\bcanada\b|\bottawa\b|\btoronto\b/.test(text)) return 'Canada';
  if (/\baustralia\b|\bsydney\b|\bcanberra\b/.test(text)) return 'Australia';
  if (/\bjapan\b|\btokyo\b/.test(text)) return 'Japan';
  if (/\bgermany\b|\bberlin\b/.test(text)) return 'Germany';
  if (/\bfrance\b|\bparis\b/.test(text)) return 'France';
  if (/\bbrazil\b|\bbrasilia\b|\bsao paulo\b/.test(text)) return 'Brazil';
  if (/\bdubai\b|\buae\b|\bsaudi\b/.test(text)) return 'Middle East / UAE';
  if (/\bsingapore\b/.test(text)) return 'Singapore';
  return fallback;
}

function normalizeTitleTokens(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((t) => t.length > 2)
  );
}

function areTitlesSimilar(a: Set<string>, b: Set<string>): boolean {
  if (a.size === 0 || b.size === 0) return false;
  let overlap = 0;
  for (const token of a) {
    if (b.has(token)) overlap++;
  }
  const similarity = overlap / Math.min(a.size, b.size);
  return similarity >= 0.72;
}

function deduplicateItems(items: LiveNewsItem[]): { unique: LiveNewsItem[]; duplicatesRemoved: number } {
  const seenUrls = new Set<string>();
  const seenTokenSets: Set<string>[] = [];
  const unique: LiveNewsItem[] = [];
  let duplicatesRemoved = 0;

  for (const item of items) {
    const cleanUrl = item.url.split('?')[0].toLowerCase();
    if (seenUrls.has(cleanUrl)) {
      duplicatesRemoved++;
      continue;
    }
    const tokens = normalizeTitleTokens(item.title);
    const isDuplicateHeadline = seenTokenSets.some((prev) => areTitlesSimilar(prev, tokens));
    if (isDuplicateHeadline) {
      duplicatesRemoved++;
      continue;
    }
    seenUrls.add(cleanUrl);
    seenTokenSets.push(tokens);
    unique.push(item);
  }

  return { unique, duplicatesRemoved };
}

async function fetchSingleSource(source: FeedSourceConfig): Promise<LiveNewsItem[]> {
  const nowIso = new Date().toISOString();
  const prevHealth = sourceHealthMap.get(source.id);

  try {
    const response = await fetch(source.url, {
      signal: AbortSignal.timeout(7000),
      headers: {
        'User-Agent': 'TRENDVERSE-Newsroom/2.0 (RSS Reader)',
        Accept: 'application/rss+xml, application/xml, text/xml, */*',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const xml = await response.text();
    const parsed = xmlParser.parse(xml) as Record<string, unknown>;
    const rssChannel = (parsed.rss as Record<string, unknown> | undefined)?.channel as
      | Record<string, unknown>
      | undefined;
    const atomFeed = parsed.feed as Record<string, unknown> | undefined;

    const rawEntries: Array<Record<string, unknown>> = rssChannel?.item
      ? Array.isArray(rssChannel.item)
        ? (rssChannel.item as Array<Record<string, unknown>>)
        : [rssChannel.item as Record<string, unknown>]
      : atomFeed?.entry
      ? Array.isArray(atomFeed.entry)
        ? (atomFeed.entry as Array<Record<string, unknown>>)
        : [atomFeed.entry as Record<string, unknown>]
      : [];

    const sixHoursAgoMs = Date.now() - 6 * 60 * 60 * 1000;

    const mapped: LiveNewsItem[] = rawEntries
      .slice(0, 12)
      .map((entry, idx): LiveNewsItem | null => {
        const title = stripHtml(entry.title);
        const rawLink = entry.link as string | { '@_href'?: string } | Array<{ '@_href'?: string }> | undefined;
        const url =
          typeof rawLink === 'string'
            ? rawLink.trim()
            : Array.isArray(rawLink)
            ? String(rawLink[0]?.['@_href'] || '').trim()
            : String(rawLink?.['@_href'] || '').trim();

        if (!title || !url) return null;

        const rawDesc = stripHtml(entry.description || entry.summary || entry['content:encoded'] || '');
        const summary =
          rawDesc.length > 210 ? `${rawDesc.slice(0, 207).trim()}...` : rawDesc || `Published by ${source.name}.`;

        const rawDate = String(
          entry.pubDate || entry.published || entry.updated || entry['dc:date'] || nowIso
        );
        const parsedTime = Date.parse(rawDate);
        const publishedIso = Number.isNaN(parsedTime) ? nowIso : new Date(parsedTime).toISOString();
        const isBreakingEligible = !Number.isNaN(parsedTime) && parsedTime >= sixHoursAgoMs;

        return {
          id: `${source.id}-${idx}-${Buffer.from(url).toString('base64').slice(0, 12)}`,
          title,
          summary,
          url,
          publisher: source.name,
          sourceId: source.id,
          category: source.category,
          countryTag: inferCountryTag(title, summary, source.countryTag),
          publishedAt: publishedIso,
          thumbnailUrl: extractThumbnail(entry),
          isBreakingEligible,
        };
      })
      .filter((x): x is LiveNewsItem => x !== null);

    perSourceCachedItems.set(source.id, mapped);
    sourceHealthMap.set(source.id, {
      id: source.id,
      name: source.name,
      category: source.category,
      url: source.url,
      status: 'ok',
      lastCheckedAt: nowIso,
      lastSuccessAt: nowIso,
      itemCount: mapped.length,
    });

    return mapped;
  } catch (err) {
    const cached = perSourceCachedItems.get(source.id) || [];
    sourceHealthMap.set(source.id, {
      id: source.id,
      name: source.name,
      category: source.category,
      url: source.url,
      status: cached.length > 0 ? 'cached' : 'error',
      lastCheckedAt: nowIso,
      lastSuccessAt: prevHealth?.lastSuccessAt ?? null,
      itemCount: cached.length,
      errorMessage: err instanceof Error ? err.message : 'Feed unavailable',
    });
    return cached;
  }
}

export async function getLiveNews(forceRefresh = false): Promise<LiveNewsResponse> {
  const now = Date.now();
  if (!forceRefresh && cachedResponse && now - lastFetchMs < CACHE_TTL_MS) {
    return cachedResponse;
  }

  const results = await Promise.all(PUBLIC_NEWS_SOURCES.map(fetchSingleSource));
  const combined = results.flat().sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  const { unique, duplicatesRemoved } = deduplicateItems(combined);

  const sources = PUBLIC_NEWS_SOURCES.map(
    (s) =>
      sourceHealthMap.get(s.id) || {
        id: s.id,
        name: s.name,
        category: s.category,
        url: s.url,
        status: 'error' as const,
        lastCheckedAt: new Date().toISOString(),
        lastSuccessAt: null,
        itemCount: 0,
      }
  );

  const okCount = sources.filter((s) => s.status === 'ok').length;
  const status: LiveNewsResponse['status'] =
    okCount === sources.length
      ? 'live'
      : okCount > 0
      ? 'partial'
      : unique.length > 0
      ? 'cached'
      : 'unavailable';

  const lastSuccessfulRefresh =
    okCount > 0 ? new Date().toISOString() : cachedResponse?.lastSuccessfulRefresh ?? null;

  const payload: LiveNewsResponse = {
    items: unique,
    sources,
    lastSuccessfulRefresh,
    duplicatesRemoved,
    status,
  };

  if (unique.length > 0 || !cachedResponse) {
    cachedResponse = payload;
    lastFetchMs = now;
  }

  return payload;
}
