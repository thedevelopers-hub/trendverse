import React, { useMemo, useState } from 'react';
import { ArrowUpRight, RefreshCw, ShieldCheck } from 'lucide-react';
import { LiveNewsResponse, NewsCategory } from '../../server/types';
import { formatPublicationTimestamp, formatRelativeTime } from '../utils/timeFormat';

interface NewsCenterSectionProps {
  data: LiveNewsResponse | null;
  loading: boolean;
  error: string | null;
  useUtc: boolean;
  autoRefreshMinutes: number;
  onChangeAutoRefresh: (minutes: number) => void;
  onManualRefresh: () => void;
  compactMode?: boolean;
  mode?: 'section' | 'page';
}

const NEWS_CATEGORIES: Array<'All' | NewsCategory> = [
  'All',
  'Breaking Developments',
  'World',
  'India',
  'Technology',
  'Artificial Intelligence',
  'Business',
  'Science',
  'Space',
  'Entertainment',
  'Climate',
];

export const NewsCenterSection: React.FC<NewsCenterSectionProps> = ({
  data,
  loading,
  error,
  useUtc,
  autoRefreshMinutes,
  onChangeAutoRefresh,
  onManualRefresh,
  compactMode = false,
  mode = 'section',
}) => {
  const [selectedCat, setSelectedCat] = useState<'All' | NewsCategory>('All');
  const [showSources, setShowSources] = useState(false);
  const [failedThumbIds, setFailedThumbIds] = useState<Record<string, boolean>>({});

  const filteredItems = useMemo(() => {
    const all = data?.items ?? [];
    if (selectedCat === 'All') return all;
    if (selectedCat === 'Breaking Developments') {
      return all.filter((item) => item.isBreakingEligible);
    }
    return all.filter((item) => item.category === selectedCat);
  }, [data, selectedCat]);

  const visibleItems = compactMode ? filteredItems.slice(0, 6) : filteredItems.slice(0, 18);

  return (
    <section id="live-news-center" className="mx-auto max-w-[1200px] px-4 sm:px-6 py-12">
      {/* Header & Refresh Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between border-b border-slate-200 pb-5 mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1.5">
            Live Global News Center
          </p>
          {mode === 'page' ? (
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900">
              Verified International Feeds
            </h1>
          ) : (
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900">
              Verified International Feeds
            </h2>
          )}
          <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">
            Reported external dispatches with original publisher attribution and publication
            timestamps from BBC News, NPR, The Hindu, NASA, Google AI Blog, MIT News AI, and UN
            News Climate. Headlines link directly to each source publication rather than republishing
            full third-party articles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="text-slate-500">
            {data?.lastSuccessfulRefresh ? (
              <span>
                Last refresh: {formatPublicationTimestamp(data.lastSuccessfulRefresh, useUtc)}
              </span>
            ) : (
              <span>Not yet refreshed</span>
            )}
            {data && (
              <>
                {' '}
                <span aria-hidden="true">·</span>{' '}
                <span className="font-medium text-slate-700 uppercase">{data.status}</span>
                {data.duplicatesRemoved > 0 && (
                  <>
                    {' '}
                    <span aria-hidden="true">·</span>{' '}
                    <span className="tabular-nums">
                      {data.duplicatesRemoved} duplicates filtered
                    </span>
                  </>
                )}
              </>
            )}
          </div>

          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-slate-700">
            <span>Auto:</span>
            <select
              aria-label="Automatic news refresh interval"
              value={autoRefreshMinutes}
              onChange={(e) => onChangeAutoRefresh(Number(e.target.value))}
              className="bg-transparent font-medium text-slate-900 focus:outline-none cursor-pointer"
            >
              <option value={0}>Off</option>
              <option value={1}>1 min</option>
              <option value={5}>5 min</option>
              <option value={15}>15 min</option>
            </select>
          </label>

          <button
            type="button"
            onClick={() => setShowSources((s) => !s)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
            <span>Sources ({data?.sources.length ?? 0})</span>
          </button>

          <button
            type="button"
            onClick={onManualRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 font-semibold text-white hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Source Health Transparency Panel */}
      {showSources && data?.sources && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Upstream Publisher Feed Status
            </h3>
            <button
              type="button"
              onClick={() => setShowSources(false)}
              className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              Close
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {data.sources.map((src) => (
              <div
                key={src.id}
                className="rounded-lg border border-slate-200 bg-white p-3 text-xs"
              >
                <div className="flex items-center justify-between font-semibold text-slate-900">
                  <span>{src.name}</span>
                  <span
                    className={
                      src.status === 'ok'
                        ? 'text-blue-600'
                        : src.status === 'cached'
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }
                  >
                    {src.status.toUpperCase()}
                  </span>
                </div>
                <div className="mt-1 text-slate-500">
                  {src.category} · {src.itemCount} items
                </div>
                {src.errorMessage && (
                  <div className="mt-1 text-[11px] text-rose-600 truncate">
                    {src.errorMessage}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10 News Categories Filter Bar */}
      <div
        role="tablist"
        aria-label="Filter live news by category"
        className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1.5 mb-8"
      >
        {NEWS_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={selectedCat === cat}
            onClick={() => setSelectedCat(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedCat === cat
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Error / Empty / Grid */}
      {error && (
        <div role="alert" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {error}
        </div>
      )}

      {loading && visibleItems.length === 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-xl border border-slate-200 bg-slate-50 animate-pulse" />
          ))}
        </div>
      ) : visibleItems.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
          <p className="text-sm font-medium text-slate-800">
            {selectedCat === 'Breaking Developments'
              ? 'No verified stories published within the last 6 hours qualify as Breaking Developments.'
              : `No live headlines currently available under ${selectedCat}.`}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Switch to All feeds or click Refresh to query upstream RSS publishers again.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visibleItems.map((item) => {
            const hasThumb = Boolean(item.thumbnailUrl) && !failedThumbIds[item.id];
            return (
              <article
                key={item.id}
                className="group flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
              >
                <div>
                  {hasThumb && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block aspect-[16/9] w-full overflow-hidden bg-slate-100"
                    >
                      <img
                        src={item.thumbnailUrl}
                        alt={item.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedThumbIds((prev) => ({ ...prev, [item.id]: true }))
                        }
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </a>
                  )}

                  <div className="p-5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-2">
                      <span className="font-semibold text-blue-600">{item.publisher}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.category}</span>
                      {item.isBreakingEligible && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-slate-900">Recent (&lt;6h)</span>
                        </>
                      )}
                    </div>

                    <h3 className="font-display text-lg font-semibold leading-snug text-slate-900 group-hover:text-blue-600 transition-colors">
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        {item.title}
                      </a>
                    </h3>

                    <p className="mt-2.5 text-sm leading-relaxed text-slate-600 line-clamp-3">
                      {item.summary}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
                  <div>
                    <time dateTime={item.publishedAt}>
                      {formatPublicationTimestamp(item.publishedAt, useUtc)}
                    </time>
                    <span className="ml-1.5 text-slate-400">
                      ({formatRelativeTime(item.publishedAt)})
                    </span>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 shrink-0"
                  >
                    <span>Read</span>
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
