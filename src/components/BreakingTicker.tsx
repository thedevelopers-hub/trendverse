import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Radio, RefreshCw } from 'lucide-react';
import { LiveNewsItem } from '../../server/types';
import { formatRelativeTime } from '../utils/timeFormat';

interface BreakingTickerProps {
  items: LiveNewsItem[];
  loading: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export const BreakingTicker: React.FC<BreakingTickerProps> = ({
  items,
  loading,
  error,
  onRefresh,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const breakingOnly = items.filter((item) => item.isBreakingEligible);
  const tickerItems = (breakingOnly.length > 0 ? breakingOnly : items).slice(0, 8);
  const isRecentBreaking = breakingOnly.length > 0;

  useEffect(() => {
    if (tickerItems.length === 0) {
      setActiveIndex(0);
      return;
    }
    setActiveIndex((prev) => prev % tickerItems.length);
    if (tickerItems.length <= 1) return;
    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % tickerItems.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, [tickerItems.length]);

  const currentItem = tickerItems[activeIndex % Math.max(1, tickerItems.length)];

  return (
    <div className="bg-[#0b1324] border-b border-white/10 text-white">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-2.5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-400 whitespace-nowrap shrink-0">
            <Radio className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isRecentBreaking ? 'Breaking Developments' : 'Latest Dispatches'}</span>
          </span>

          {loading && tickerItems.length === 0 ? (
            <span className="text-xs text-slate-400">Synchronizing live newsroom feeds...</span>
          ) : currentItem ? (
            <a
              href={currentItem.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 min-w-0 text-xs sm:text-sm text-slate-100 hover:text-blue-300 transition-colors"
            >
              <span className="truncate font-medium">{currentItem.title}</span>
              <span className="text-xs text-slate-400 whitespace-nowrap shrink-0 hidden md:inline">
                {currentItem.publisher} · {formatRelativeTime(currentItem.publishedAt)}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-blue-400 shrink-0" aria-hidden="true" />
            </a>
          ) : (
            <div className="flex items-center gap-2 min-w-0 text-xs text-amber-200">
              <span className="truncate">
                {error || 'Live news wire standby — click Refresh to reload upstream RSS feeds.'}
              </span>
              {onRefresh && (
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={loading}
                  className="inline-flex items-center gap-1 rounded border border-white/20 px-2 py-0.5 text-[11px] font-semibold text-white hover:bg-white/10 shrink-0 cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
                  <span>Retry</span>
                </button>
              )}
            </div>
          )}
        </div>

        {(tickerItems.length > 1 || (onRefresh && tickerItems.length > 0)) && (
          <div className="flex items-center gap-1.5 shrink-0">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={loading}
                aria-label="Refresh breaking headlines"
                title="Refresh breaking headlines"
                className="inline-flex items-center gap-1 rounded border border-white/15 px-2 py-0.5 text-[11px] text-slate-300 hover:bg-white/10 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              </button>
            )}
            {tickerItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setActiveIndex((prev) => (prev - 1 + tickerItems.length) % tickerItems.length)
                  }
                  aria-label="Previous headline"
                  className="rounded border border-white/15 px-2 py-0.5 text-[11px] text-slate-300 hover:bg-white/10 cursor-pointer"
                >
                  Prev
                </button>
                <span className="font-mono-tabular text-[11px] text-slate-400">
                  {(activeIndex % tickerItems.length) + 1}/{tickerItems.length}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveIndex((prev) => (prev + 1) % tickerItems.length)}
                  aria-label="Next headline"
                  className="rounded border border-white/15 px-2 py-0.5 text-[11px] text-slate-300 hover:bg-white/10 cursor-pointer"
                >
                  Next
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
