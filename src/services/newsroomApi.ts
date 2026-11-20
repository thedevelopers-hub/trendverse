import {
  DailyBriefingResponse,
  LiveNewsResponse,
  TrendBattleRange,
  TrendBattleResponse,
  TrendGeoCode,
  TrendsResponse,
} from '../../server/types';

export interface IntegrationsHealth {
  geminiServerConfigured: boolean;
  rssFeedCount: number;
  trendRegionsCount: number;
  nasaFeedActive: boolean;
  bloggerFeedMode: string;
}

export async function fetchLiveNewsFeed(options?: {
  refresh?: boolean;
  category?: string;
  country?: string;
  query?: string;
}): Promise<LiveNewsResponse> {
  const params = new URLSearchParams();
  if (options?.refresh) params.set('refresh', '1');
  if (options?.category) params.set('category', options.category);
  if (options?.country) params.set('country', options.country);
  if (options?.query) params.set('q', options.query);

  const res = await fetch(`/api/news?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`News service error (${res.status})`);
  }
  return (await res.json()) as LiveNewsResponse;
}

export async function fetchGoogleTrendsFeed(
  geo: TrendGeoCode = 'WORLD',
  refresh = false
): Promise<TrendsResponse> {
  const params = new URLSearchParams({ geo });
  if (refresh) params.set('refresh', '1');
  const res = await fetch(`/api/trends?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Trends service error (${res.status})`);
  }
  return (await res.json()) as TrendsResponse;
}

export async function fetchTrendBattle(
  topicA: string,
  topicB: string,
  geo: TrendGeoCode = 'WORLD',
  range: TrendBattleRange = '30d'
): Promise<TrendBattleResponse> {
  const params = new URLSearchParams({
    topicA: topicA.trim(),
    topicB: topicB.trim(),
    geo,
    range,
  });
  const res = await fetch(`/api/trend-battle?${params.toString()}`);
  const data = (await res.json()) as TrendBattleResponse;
  return data;
}

export async function requestDailyBriefing(options?: {
  refreshNews?: boolean;
  country?: string;
  category?: string;
  count?: number;
}): Promise<DailyBriefingResponse> {
  const res = await fetch('/api/briefing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refreshNews: Boolean(options?.refreshNews),
      country: options?.country || 'All Countries',
      category: options?.category || 'All Categories',
      count: options?.count ?? 7,
    }),
  });
  const data = (await res.json()) as DailyBriefingResponse;
  return data;
}

export async function fetchIntegrationsHealth(): Promise<IntegrationsHealth> {
  const res = await fetch('/api/integrations/status');
  if (!res.ok) {
    throw new Error('Could not read integration status');
  }
  return (await res.json()) as IntegrationsHealth;
}
