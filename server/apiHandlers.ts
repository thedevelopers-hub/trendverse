import type { IncomingMessage, ServerResponse } from 'http';
import { getLiveNews, PUBLIC_NEWS_SOURCES } from './services/rssNewsAdapter.js';
import { getGoogleTrends, TREND_GEO_OPTIONS } from './services/googleTrendsAdapter.js';
import {
  generateDailyGlobalBriefing,
  isGeminiConfigured,
} from './services/geminiBriefingAdapter.js';
import { runTrendBattleComparison } from './services/trendBattleAdapter.js';
import { getAllCareerJobs } from './services/careers/jobProvidersAdapter.js';
import {
  getGovernmentRecruitmentData,
  getLiveScholarshipFeeds,
  STUDENT_CERTIFICATIONS_AND_COMPETITIONS,
} from './services/careers/scholarshipsAndGovAdapter.js';
import { runCareerAiAssist } from './services/careers/careerAiAssistAdapter.js';
import { CareerAiAssistRequest, TrendBattleRange, TrendGeoCode } from './types.js';

export interface ApiRequest {
  method?: string;
  url?: string;
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, unknown>;
  body?: unknown;
  on?: IncomingMessage['on'];
}

export interface ApiResponse {
  status?: (code: number) => ApiResponse;
  statusCode: number;
  setHeader: (name: string, value: string | number | readonly string[]) => unknown;
  json?: (payload: unknown) => unknown;
  end: (chunk?: string | Uint8Array) => unknown;
}

function getQueryRecord(req: ApiRequest): Record<string, string> {
  const out: Record<string, string> = {};
  if (req.query) {
    for (const [key, val] of Object.entries(req.query)) {
      if (typeof val === 'string') out[key] = val;
      else if (Array.isArray(val) && typeof val[0] === 'string') out[key] = val[0];
    }
    return out;
  }
  if (req.url) {
    const parsed = new URL(req.url, 'http://localhost');
    parsed.searchParams.forEach((value, key) => {
      out[key] = value;
    });
  }
  return out;
}

async function getJsonBody(req: ApiRequest): Promise<Record<string, unknown>> {
  if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  if (typeof req.on !== 'function') return {};

  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    let totalBytes = 0;
    const MAX_BYTES = 1024 * 1024;
    req.on!('data', (chunk: Buffer | string) => {
      const buf = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
      totalBytes += buf.length;
      if (totalBytes <= MAX_BYTES) chunks.push(buf);
    });
    req.on!('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8').trim();
        resolve(raw ? (JSON.parse(raw) as Record<string, unknown>) : {});
      } catch {
        resolve({});
      }
    });
    req.on!('error', () => resolve({}));
  });
}

function applyCorsHeaders(req: ApiRequest, res: ApiResponse, allowMethods: string): void {
  const rawOrigin = req.headers?.origin;
  const requestOrigin = Array.isArray(rawOrigin) ? rawOrigin[0] : rawOrigin;
  const configuredOrigins = (process.env.ALLOWED_ORIGINS || process.env.APP_URL || '')
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);

  if (configuredOrigins.length > 0 && requestOrigin) {
    if (configuredOrigins.includes(requestOrigin.replace(/\/+$/, ''))) {
      res.setHeader('Access-Control-Allow-Origin', requestOrigin);
      res.setHeader('Vary', 'Origin');
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', allowMethods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('X-Content-Type-Options', 'nosniff');
}

function applyCacheControl(res: ApiResponse, directive: string, cdnDirective?: string): void {
  res.setHeader('Cache-Control', directive);
  if (cdnDirective) {
    res.setHeader('CDN-Cache-Control', cdnDirective);
    res.setHeader('Vercel-CDN-Cache-Control', cdnDirective);
  }
}

function sendJson(res: ApiResponse, statusCode: number, payload: unknown): void {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.statusCode = statusCode;
  res.end(JSON.stringify(payload));
}

function handlePreflight(
  req: ApiRequest,
  res: ApiResponse,
  allowedMethod: 'GET' | 'POST'
): boolean {
  applyCorsHeaders(req, res, `${allowedMethod}, OPTIONS`);
  const method = (req.method || 'GET').toUpperCase();
  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }
  if (method !== allowedMethod) {
    applyCacheControl(res, 'no-store, max-age=0', 'no-store');
    sendJson(res, 405, {
      errorMessage: `Method ${method} not allowed. Expected ${allowedMethod}.`,
    });
    return true;
  }
  return false;
}

export async function handleNewsRequest(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (handlePreflight(req, res, 'GET')) return;
  try {
    const q = getQueryRecord(req);
    const forceRefresh = q.refresh === '1' || q.refresh === 'true';
    const categoryFilter = q.category || '';
    const countryFilter = q.country || '';
    const queryFilter = (q.q || '').trim().toLowerCase();

    const data = await getLiveNews(forceRefresh);
    let items = data.items;

    if (categoryFilter && categoryFilter !== 'All') {
      if (categoryFilter === 'Breaking Developments') {
        items = items.filter((item) => item.isBreakingEligible);
      } else {
        items = items.filter((item) => item.category === categoryFilter);
      }
    }

    if (countryFilter && countryFilter !== 'All') {
      items = items.filter(
        (item) => item.countryTag.toLowerCase() === countryFilter.toLowerCase()
      );
    }

    if (queryFilter) {
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(queryFilter) ||
          item.summary.toLowerCase().includes(queryFilter) ||
          item.publisher.toLowerCase().includes(queryFilter)
      );
    }

    if (forceRefresh || data.status === 'unavailable' || items.length === 0) {
      applyCacheControl(res, 'no-store, max-age=0', 'no-store');
    } else {
      applyCacheControl(
        res,
        'public, max-age=45, s-maxage=90, stale-while-revalidate=180',
        'public, s-maxage=90, stale-while-revalidate=180'
      );
    }

    sendJson(res, 200, { ...data, items });
  } catch (err) {
    applyCacheControl(res, 'no-store, max-age=0', 'no-store');
    sendJson(res, 500, {
      items: [],
      sources: [],
      lastSuccessfulRefresh: null,
      duplicatesRemoved: 0,
      status: 'unavailable',
      errorMessage: err instanceof Error ? err.message : 'Unable to fetch news feeds.',
    });
  }
}

export async function handleTrendsRequest(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (handlePreflight(req, res, 'GET')) return;
  try {
    const q = getQueryRecord(req);
    const geo = ((q.geo || 'WORLD').toUpperCase() || 'WORLD') as TrendGeoCode;
    const forceRefresh = q.refresh === '1' || q.refresh === 'true';
    const result = await getGoogleTrends(geo, forceRefresh);

    if (forceRefresh || result.status === 'unavailable' || result.trends.length === 0) {
      applyCacheControl(res, 'no-store, max-age=0', 'no-store');
    } else {
      applyCacheControl(
        res,
        'public, max-age=60, s-maxage=180, stale-while-revalidate=300',
        'public, s-maxage=180, stale-while-revalidate=300'
      );
    }

    sendJson(res, 200, result);
  } catch (err) {
    applyCacheControl(res, 'no-store, max-age=0', 'no-store');
    sendJson(res, 500, {
      geo: 'WORLD',
      geoName: 'Worldwide',
      sourceName: 'Google Trends Official RSS',
      sourceUrl: 'https://trends.google.com/trending',
      lastUpdated: null,
      status: 'unavailable',
      note: 'Trend service error.',
      errorMessage: err instanceof Error ? err.message : 'Trends error',
      trends: [],
    });
  }
}

export async function handleTrendBattleRequest(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (handlePreflight(req, res, 'GET')) return;
  const q = getQueryRecord(req);
  const topicA = (q.topicA || '').trim().slice(0, 120);
  const topicB = (q.topicB || '').trim().slice(0, 120);
  const geo = ((q.geo || 'WORLD').toUpperCase() || 'WORLD') as TrendGeoCode;
  const range = (q.range || '30d') as TrendBattleRange;
  const forceRefresh = q.refresh === '1' || q.refresh === 'true';

  if (!topicA || !topicB) {
    applyCacheControl(res, 'no-store, max-age=0', 'no-store');
    sendJson(res, 400, {
      status: 'unavailable',
      errorMessage: 'Both Topic A and Topic B are required for comparison.',
    });
    return;
  }

  try {
    const result = await runTrendBattleComparison(topicA, topicB, geo, range, forceRefresh);
    if (forceRefresh || result.status === 'unavailable') {
      applyCacheControl(res, 'no-store, max-age=0', 'no-store');
    } else {
      applyCacheControl(
        res,
        'public, max-age=120, s-maxage=300, stale-while-revalidate=600',
        'public, s-maxage=300, stale-while-revalidate=600'
      );
    }
    sendJson(res, 200, result);
  } catch (err) {
    applyCacheControl(res, 'no-store, max-age=0', 'no-store');
    sendJson(res, 500, {
      status: 'unavailable',
      errorMessage: err instanceof Error ? err.message : 'Trend comparison failed.',
    });
  }
}

export async function handleBriefingRequest(req: ApiRequest, res: ApiResponse): Promise<void> {
  if (handlePreflight(req, res, 'POST')) return;
  applyCacheControl(res, 'no-store, max-age=0', 'no-store');

  try {
    const body = await getJsonBody(req);
    const forceRefresh = Boolean(body.refreshNews);
    const country = typeof body.country === 'string' ? body.country : 'All Countries';
    const category = typeof body.category === 'string' ? body.category : 'All Categories';
    const count = typeof body.count === 'number' ? body.count : 7;

    const newsData = await getLiveNews(forceRefresh);
    const briefing = await generateDailyGlobalBriefing(newsData.items, {
      country,
      category,
      count,
    });
    if (!briefing.aiAvailable) {
      sendJson(res, 503, briefing);
      return;
    }
    sendJson(res, 200, briefing);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gemini briefing generation failed.';
    sendJson(res, 500, {
      id: `briefing-err-${Date.now()}`,
      aiAvailable: isGeminiConfigured(),
      label: 'AI-Generated Summary',
      briefingDate: new Date().toISOString().slice(0, 10),
      generatedAt: new Date().toISOString(),
      modelName: 'gemini-4-hydrogen',
      countryPreference: 'All Countries',
      categoryPreference: 'All Categories',
      overview: '',
      stories: [],
      errorMessage: message,
    });
  }
}

export async function handleIntegrationsStatusRequest(
  req: ApiRequest,
  res: ApiResponse
): Promise<void> {
  if (handlePreflight(req, res, 'GET')) return;
  applyCacheControl(res, 'no-store, max-age=0', 'no-store');
  sendJson(res, 200, {
    geminiServerConfigured: isGeminiConfigured(),
    rssFeedCount: PUBLIC_NEWS_SOURCES.length,
    trendRegionsCount: TREND_GEO_OPTIONS.length,
    nasaFeedActive: PUBLIC_NEWS_SOURCES.some((s) => s.id === 'nasa-news'),
    bloggerFeedMode: 'Public JSON-in-Script (No API Key Required)',
    careersProvidersCount: 11,
    careersPaidApisRequired: false,
    runtime: process.env.VERCEL ? 'vercel-serverless' : 'node-express',
  });
}

export async function handleCareersOpportunitiesRequest(
  req: ApiRequest,
  res: ApiResponse
): Promise<void> {
  if (handlePreflight(req, res, 'GET')) return;
  try {
    const qMap = getQueryRecord(req);
    const forceRefresh = qMap.refresh === '1' || qMap.refresh === 'true';
    const q = (qMap.q || '').trim().toLowerCase();
    const country = (qMap.country || '').trim();
    const city = (qMap.city || '').trim().toLowerCase();
    const employmentType = (qMap.employmentType || '').trim();
    const workMode = (qMap.workMode || '').trim();
    const experience = (qMap.experience || '').trim();
    const postedWithin = (qMap.postedWithin || '').trim();
    const salaryMin = Number(qMap.salaryMin || 0);
    const salaryOnly = qMap.salaryOnly === '1' || qMap.salaryOnly === 'true';
    const sort = (qMap.sort || 'newest').trim();

    const [jobsData, schData, govData] = await Promise.all([
      getAllCareerJobs(forceRefresh),
      getLiveScholarshipFeeds(false),
      getGovernmentRecruitmentData(false),
    ]);

    const allProviders = [...jobsData.providers, ...schData.providers, ...govData.providers];
    let filtered = [...jobsData.items];

    if (q) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.company.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.skills.some((s) => s.toLowerCase().includes(q)) ||
          item.location.toLowerCase().includes(q)
      );
    }

    if (country && country !== 'All' && country !== 'Worldwide') {
      filtered = filtered.filter(
        (item) =>
          item.country.toLowerCase() === country.toLowerCase() ||
          item.location.toLowerCase().includes(country.toLowerCase()) ||
          item.remoteScope.toLowerCase().includes(country.toLowerCase()) ||
          item.remoteScope.toLowerCase().includes('worldwide')
      );
    } else if (country === 'Worldwide') {
      filtered = filtered.filter(
        (item) =>
          item.country === 'Worldwide' ||
          item.remoteScope.toLowerCase().includes('worldwide')
      );
    }

    if (city) {
      filtered = filtered.filter(
        (item) =>
          item.city.toLowerCase().includes(city) ||
          item.location.toLowerCase().includes(city)
      );
    }

    if (employmentType && employmentType !== 'All') {
      filtered = filtered.filter((item) => item.employmentType === employmentType);
    }

    if (workMode && workMode !== 'All') {
      filtered = filtered.filter((item) => item.workMode === workMode);
    }

    if (experience && experience !== 'All') {
      filtered = filtered.filter((item) => item.experienceLevel === experience);
    }

    if (postedWithin && postedWithin !== 'all') {
      const hoursMap: Record<string, number> = {
        '24h': 24,
        '3d': 72,
        '7d': 168,
        '30d': 720,
      };
      const hours = hoursMap[postedWithin];
      if (hours) {
        const cutoff = Date.now() - hours * 60 * 60 * 1000;
        filtered = filtered.filter((item) => Date.parse(item.postedAt) >= cutoff);
      }
    }

    if (salaryOnly) {
      filtered = filtered.filter((item) => Boolean(item.salaryText));
    }

    if (!Number.isNaN(salaryMin) && salaryMin > 0) {
      filtered = filtered.filter(
        (item) => item.salaryMinAnnualUsd !== undefined && item.salaryMinAnnualUsd >= salaryMin
      );
    }

    if (sort === 'salary-desc') {
      filtered.sort(
        (a, b) => (b.salaryMinAnnualUsd ?? -1) - (a.salaryMinAnnualUsd ?? -1)
      );
    } else if (sort === 'salary-asc') {
      filtered.sort((a, b) => {
        const aVal = a.salaryMinAnnualUsd ?? Number.MAX_SAFE_INTEGER;
        const bVal = b.salaryMinAnnualUsd ?? Number.MAX_SAFE_INTEGER;
        return aVal - bVal;
      });
    } else if (sort === 'relevant' && q) {
      filtered.sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(q) ? 2 : 0;
        const bTitle = b.title.toLowerCase().includes(q) ? 2 : 0;
        const aSkill = a.skills.some((s) => s.toLowerCase().includes(q)) ? 1 : 0;
        const bSkill = b.skills.some((s) => s.toLowerCase().includes(q)) ? 1 : 0;
        if (bTitle + bSkill !== aTitle + aSkill) return bTitle + bSkill - (aTitle + aSkill);
        return Date.parse(b.postedAt) - Date.parse(a.postedAt);
      });
    } else {
      filtered.sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt));
    }

    if (forceRefresh || jobsData.status === 'unavailable') {
      applyCacheControl(res, 'no-store, max-age=0', 'no-store');
    } else {
      applyCacheControl(
        res,
        'public, max-age=120, s-maxage=300, stale-while-revalidate=600',
        'public, s-maxage=300, stale-while-revalidate=600'
      );
    }

    sendJson(res, 200, {
      ...jobsData,
      items: filtered,
      totalMatched: filtered.length,
      providers: allProviders,
    });
  } catch (err) {
    applyCacheControl(res, 'no-store, max-age=0', 'no-store');
    sendJson(res, 500, {
      items: [],
      totalMatched: 0,
      providers: [],
      trendingSkills: [],
      metrics: {
        totalRawFetched: 0,
        duplicatesRemoved: 0,
        expiredFiltered: 0,
        brokenLinksFiltered: 0,
        suspiciousFlagged: 0,
        missingSalaryCount: 0,
      },
      lastUpdated: new Date().toISOString(),
      status: 'unavailable',
      errorMessage: err instanceof Error ? err.message : 'Unable to load career opportunities.',
    });
  }
}

export async function handleCareersScholarshipsRequest(
  req: ApiRequest,
  res: ApiResponse
): Promise<void> {
  if (handlePreflight(req, res, 'GET')) return;
  try {
    const qMap = getQueryRecord(req);
    const forceRefresh = qMap.refresh === '1' || qMap.refresh === 'true';
    const country = (qMap.country || '').trim();
    const data = await getLiveScholarshipFeeds(forceRefresh);

    const directory =
      country && country !== 'All' && country !== 'Worldwide'
        ? data.directory.filter(
            (d) =>
              d.country.toLowerCase() === country.toLowerCase() ||
              d.country === 'Worldwide'
          )
        : data.directory;

    if (forceRefresh) {
      applyCacheControl(res, 'no-store, max-age=0', 'no-store');
    } else {
      applyCacheControl(
        res,
        'public, max-age=180, s-maxage=360, stale-while-revalidate=600',
        'public, s-maxage=360, stale-while-revalidate=600'
      );
    }

    sendJson(res, 200, {
      ...data,
      directory,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    applyCacheControl(res, 'no-store, max-age=0', 'no-store');
    sendJson(res, 500, {
      items: [],
      providers: [],
      directory: [],
      errorMessage: err instanceof Error ? err.message : 'Unable to fetch scholarship feeds.',
    });
  }
}

export async function handleCareersGovernmentRequest(
  req: ApiRequest,
  res: ApiResponse
): Promise<void> {
  if (handlePreflight(req, res, 'GET')) return;
  try {
    const qMap = getQueryRecord(req);
    const forceRefresh = qMap.refresh === '1' || qMap.refresh === 'true';
    const country = (qMap.country || '').trim();
    const data = await getGovernmentRecruitmentData(forceRefresh);

    const portals =
      country && country !== 'All' && country !== 'Worldwide'
        ? data.portals.filter((p) => p.country.toLowerCase() === country.toLowerCase())
        : data.portals;

    if (forceRefresh) {
      applyCacheControl(res, 'no-store, max-age=0', 'no-store');
    } else {
      applyCacheControl(
        res,
        'public, max-age=180, s-maxage=360, stale-while-revalidate=600',
        'public, s-maxage=360, stale-while-revalidate=600'
      );
    }

    sendJson(res, 200, {
      ...data,
      portals,
      lastUpdated: new Date().toISOString(),
    });
  } catch (err) {
    applyCacheControl(res, 'no-store, max-age=0', 'no-store');
    sendJson(res, 500, {
      items: [],
      providers: [],
      portals: [],
      errorMessage: err instanceof Error ? err.message : 'Unable to load government recruitment data.',
    });
  }
}

export async function handleCareersStudentResourcesRequest(
  req: ApiRequest,
  res: ApiResponse
): Promise<void> {
  if (handlePreflight(req, res, 'GET')) return;
  applyCacheControl(
    res,
    'public, max-age=300, s-maxage=900, stale-while-revalidate=1800',
    'public, s-maxage=900, stale-while-revalidate=1800'
  );
  sendJson(res, 200, {
    programs: STUDENT_CERTIFICATIONS_AND_COMPETITIONS,
    lastUpdated: new Date().toISOString(),
  });
}

export async function handleCareersAiAssistRequest(
  req: ApiRequest,
  res: ApiResponse
): Promise<void> {
  if (handlePreflight(req, res, 'POST')) return;
  applyCacheControl(res, 'no-store, max-age=0', 'no-store');

  try {
    const body = (await getJsonBody(req)) as Partial<CareerAiAssistRequest>;
    if (!body.mode || !body.text || typeof body.text !== 'string' || !body.text.trim()) {
      sendJson(res, 400, {
        aiAvailable: isGeminiConfigured(),
        mode: body.mode || 'resume-review',
        modelName: 'gemini-4-hydrogen',
        generatedAt: new Date().toISOString(),
        suggestions: [],
        disclaimer:
          'Provide your draft text and target role to request optional AI suggestions.',
        errorMessage: 'Input text is required.',
      });
      return;
    }

    const result = await runCareerAiAssist({
      mode: body.mode,
      targetRole: body.targetRole || 'Early Career / Student Candidate',
      company: body.company,
      experienceLevel: body.experienceLevel,
      text: body.text,
    });

    if (!result.aiAvailable) {
      sendJson(res, 503, result);
      return;
    }
    sendJson(res, 200, result);
  } catch (err) {
    sendJson(res, 500, {
      aiAvailable: isGeminiConfigured(),
      mode: 'resume-review',
      modelName: 'gemini-4-hydrogen',
      generatedAt: new Date().toISOString(),
      suggestions: [],
      disclaimer:
        'Browser-local tools remain available without AI assistance.',
      errorMessage: err instanceof Error ? err.message : 'Optional AI assistance temporarily unavailable.',
    });
  }
}
