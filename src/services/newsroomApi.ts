import {
  DailyBriefingResponse,
  LiveNewsResponse,
  TrendBattleRange,
  TrendBattleResponse,
  TrendGeoCode,
  TrendsResponse,
} from '../../server/types';
import { fetchJsonApi } from './apiClient';

export interface IntegrationsHealth {
  geminiServerConfigured: boolean;
  rssFeedCount: number;
  trendRegionsCount: number;
  nasaFeedActive: boolean;
  bloggerFeedMode: string;
  runtime?: string;
}

export async function fetchLiveNewsFeed(options?: {
  refresh?: boolean;
  category?: string;
  country?: string;
  query?: string;
  signal?: AbortSignal;
}): Promise<LiveNewsResponse> {
  const params = new URLSearchParams();
  if (options?.refresh) {
    params.set('refresh', '1');
    params.set('_t', String(Date.now()));
  }
  if (options?.category) params.set('category', options.category);
  if (options?.country) params.set('country', options.country);
  if (options?.query) params.set('q', options.query);

  const qs = params.toString();
  const { data } = await fetchJsonApi<LiveNewsResponse>(
    qs ? `/api/news?${qs}` : '/api/news',
    {
      signal: options?.signal,
      cache: options?.refresh ? 'no-store' : 'default',
    }
  );
  return data;
}

export async function fetchGoogleTrendsFeed(
  geo: TrendGeoCode = 'WORLD',
  refresh = false,
  signal?: AbortSignal
): Promise<TrendsResponse> {
  const params = new URLSearchParams({ geo });
  if (refresh) {
    params.set('refresh', '1');
    params.set('_t', String(Date.now()));
  }
  const { data } = await fetchJsonApi<TrendsResponse>(
    `/api/trends?${params.toString()}`,
    {
      signal,
      cache: refresh ? 'no-store' : 'default',
    }
  );
  return data;
}

export async function fetchTrendBattle(
  topicA: string,
  topicB: string,
  geo: TrendGeoCode = 'WORLD',
  range: TrendBattleRange = '30d',
  options?: { refresh?: boolean; signal?: AbortSignal }
): Promise<TrendBattleResponse> {
  const params = new URLSearchParams({
    topicA: topicA.trim(),
    topicB: topicB.trim(),
    geo,
    range,
  });
  if (options?.refresh) {
    params.set('refresh', '1');
    params.set('_t', String(Date.now()));
  }
  const { data } = await fetchJsonApi<TrendBattleResponse>(
    `/api/trend-battle?${params.toString()}`,
    {
      allowErrorPayload: true,
      signal: options?.signal,
      cache: options?.refresh ? 'no-store' : 'default',
    }
  );
  return data;
}

export async function requestDailyBriefing(options?: {
  refreshNews?: boolean;
  country?: string;
  category?: string;
  count?: number;
  signal?: AbortSignal;
}): Promise<DailyBriefingResponse> {
  const { data } = await fetchJsonApi<DailyBriefingResponse>('/api/briefing', {
    method: 'POST',
    allowErrorPayload: true,
    signal: options?.signal,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refreshNews: Boolean(options?.refreshNews),
      country: options?.country || 'All Countries',
      category: options?.category || 'All Categories',
      count: options?.count ?? 7,
    }),
  });
  return data;
}

export async function fetchIntegrationsHealth(
  signal?: AbortSignal
): Promise<IntegrationsHealth> {
  const { data } = await fetchJsonApi<IntegrationsHealth>('/api/integrations/status', {
    signal,
    cache: 'no-store',
  });
  return data;
}
