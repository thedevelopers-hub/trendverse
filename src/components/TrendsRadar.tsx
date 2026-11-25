import React from 'react';
import { ArrowUpRight, RefreshCw, TrendingUp } from 'lucide-react';
import { TrendGeoCode, TrendsResponse } from '../../server/types';
import { formatPublicationTimestamp, formatRelativeTime } from '../utils/timeFormat';

interface TrendsRadarProps {
  data: TrendsResponse | null;
  selectedGeo: TrendGeoCode;
  loading: boolean;
  useUtc: boolean;
  onSelectGeo: (geo: TrendGeoCode) => void;
  onRefresh: () => void;
}

const REGION_CHOICES: Array<{ code: TrendGeoCode; label: string }> = [
  { code: 'WORLD', label: 'Worldwide' },
  { code: 'IN', label: 'India' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'CA', label: 'Canada' },
  { code: 'AU', label: 'Australia' },
  { code: 'JP', label: 'Japan' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'BR', label: 'Brazil' },
];

export const TrendsRadar: React.FC<TrendsRadarProps> = ({
  data,
  selectedGeo,
  loading,
  useUtc,
  onSelectGeo,
  onRefresh,
}) => {
  return (
    <section
      id="trends-radar"
      aria-label="Google Trends Radar"
      className="bg-[#0b1324] text-white py-12 border-b border-white/10"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between border-b border-white/10 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
              <TrendingUp className="h-4 w-4" aria-hidden="true" />
              <span>Global Trend Radar</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white">
              Real-Time Search Momentum
            </h2>
            <p className="mt-1.5 text-sm text-slate-300 max-w-2xl">
              Live regional search signals sourced directly from Google Trends official public RSS
              feeds. Displays Google&apos;s approximate interest tiers rather than invented volume
              estimates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="text-xs text-slate-400">
              {data?.lastUpdated
                ? `Updated ${formatPublicationTimestamp(data.lastUpdated, useUtc)}`
                : 'Awaiting feed'}
              {data?.status && (
                <>
                  {' '}
                  · <span className="text-blue-400 uppercase">{data.status}</span>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>{loading ? 'Refreshing...' : 'Refresh Trends'}</span>
            </button>
          </div>
        </div>

        {/* 10 Country / Region Selector */}
        <div
          role="tablist"
          aria-label="Select country or region for Google Trends"
          className="flex flex-wrap gap-1.5 mb-6"
        >
          {REGION_CHOICES.map((region) => (
            <button
              key={region.code}
              type="button"
              role="tab"
              aria-selected={selectedGeo === region.code}
              onClick={() => onSelectGeo(region.code)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedGeo === region.code
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {region.label}
            </button>
          ))}
        </div>

        {/* Source & Transparency Notice */}
        {data && (
          <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400">
            <span>{data.note}</span>
            <a
              href={data.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-blue-400 hover:underline shrink-0"
            >
              <span>Source: {data.sourceName}</span>
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        )}

        {/* Loading / Unavailable / Live Grid */}
        {loading && !data ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="h-44 rounded-xl border border-white/10 bg-white/5 p-5 animate-pulse"
              />
            ))}
          </div>
        ) : !data || data.trends.length === 0 ? (
          <div className="rounded-xl border border-white/15 bg-white/5 p-6 text-sm text-slate-300">
            <p className="font-semibold text-white">Google Trends feed temporarily unavailable</p>
            <p className="mt-1 text-xs text-slate-400">
              {data?.errorMessage ||
                'Unable to reach the official Google Trends RSS endpoint. Click Refresh Trends to try again.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.trends.slice(0, 9).map((trend, idx) => (
              <div
                key={trend.id}
                className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#13203b]/70 p-5 hover:border-blue-500/60 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-mono-tabular text-blue-400 font-semibold">
                      #{idx + 1} · {trend.category}
                    </span>
                    <span className="font-mono-tabular text-slate-300">
                      {trend.approxTraffic}
                    </span>
                  </div>

                  <h3 className="font-display text-lg font-semibold text-white leading-snug">
                    <a
                      href={trend.trendsExploreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-400 transition-colors"
                    >
                      {trend.query}
                    </a>
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span>{trend.geoName}</span>
                    <span aria-hidden="true">·</span>
                    <span>{trend.direction} interest</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatRelativeTime(trend.publishedAt)}</span>
                  </div>

                  {trend.relatedArticles[0] && (
                    <a
                      href={trend.relatedArticles[0].url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 block text-xs leading-relaxed text-slate-300 hover:text-white line-clamp-2 border-t border-white/10 pt-3"
                    >
                      <span className="text-slate-400">
                        {trend.relatedArticles[0].source}:{' '}
                      </span>
                      {trend.relatedArticles[0].title}
                    </a>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 truncate max-w-[180px]">
                    {trend.relatedQueries.length > 0
                      ? `Related: ${trend.relatedQueries[0]}`
                      : 'Google Trends RSS'}
                  </span>
                  <a
                    href={trend.trendsExploreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Explore ${trend.query} on Google Trends`}
                    className="inline-flex items-center gap-1 font-medium text-blue-400 hover:text-blue-300 shrink-0"
                  >
                    <span>Explore</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
