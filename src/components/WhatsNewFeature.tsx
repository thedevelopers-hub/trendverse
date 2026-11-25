import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  CheckCircle2,
  Clock,
  Shield,
  Trash2,
} from 'lucide-react';
import { LiveNewsItem, TrendItem } from '../../server/types';
import { AppRoute, Article } from '../types/editorial';
import { routeToUrl } from '../utils/routes';
import { formatPublicationTimestamp, formatRelativeTime } from '../utils/timeFormat';
import { VisitorActivityState } from '../utils/visitorActivity';

interface WhatsNewFeatureProps {
  mode: 'section' | 'page';
  visitorState: VisitorActivityState;
  liveNews: LiveNewsItem[];
  articles: Article[];
  trends: TrendItem[];
  useUtc: boolean;
  onMarkRead: (item: {
    id: string;
    title: string;
    category: string;
    publisher: string;
    url: string;
    isInternalSlug?: string;
  }) => void;
  onToggleSave: (item: {
    id: string;
    title: string;
    category: string;
    publisher: string;
    url: string;
    publishedAt: string;
    isInternalSlug?: string;
  }) => void;
  onClearLocalHistory: () => void;
  onUpdateVisitCheckpoint: () => void;
  onNavigate: (route: AppRoute) => void;
}

type FeedViewTab = 'new' | 'unread' | 'saved' | 'history';

export const WhatsNewFeature: React.FC<WhatsNewFeatureProps> = ({
  mode,
  visitorState,
  liveNews,
  articles,
  trends,
  useUtc,
  onMarkRead,
  onToggleSave,
  onClearLocalHistory,
  onUpdateVisitCheckpoint,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<FeedViewTab>('new');
  const [catFilter, setCatFilter] = useState<string>('All');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');

  const previousVisitMs = visitorState.previousVisitAt
    ? Date.parse(visitorState.previousVisitAt)
    : null;

  // Merge live RSS dispatches + evergreen updated stories into a unified feed for catch-up
  const unifiedFeed = useMemo(() => {
    const newsRows = liveNews.map((n) => ({
      id: n.id,
      title: n.title,
      category: n.category,
      publisher: n.publisher,
      url: n.url,
      publishedAt: n.publishedAt,
      updatedAt: n.publishedAt,
      isInternalSlug: undefined as string | undefined,
    }));
    const articleRows = articles.map((a) => ({
      id: a.id,
      title: a.title,
      category: a.categoryName,
      publisher: a.authorName,
      url: routeToUrl({ view: 'article', slug: a.slug }),
      publishedAt: a.publishedAt,
      updatedAt: a.updatedAt,
      isInternalSlug: a.slug,
    }));
    return [...newsRows, ...articleRows].sort(
      (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
    );
  }, [liveNews, articles]);

  const newStories = useMemo(() => {
    if (!previousVisitMs || Number.isNaN(previousVisitMs)) {
      return unifiedFeed.slice(0, 12);
    }
    return unifiedFeed.filter((item) => {
      const ts = Date.parse(item.updatedAt);
      return !Number.isNaN(ts) && ts > previousVisitMs;
    });
  }, [unifiedFeed, previousVisitMs]);

  const newTrends = useMemo(() => {
    if (!previousVisitMs || Number.isNaN(previousVisitMs)) return trends.slice(0, 4);
    return trends.filter((t) => Date.parse(t.publishedAt) > previousVisitMs).slice(0, 6);
  }, [trends, previousVisitMs]);

  const recentlyUpdatedExplainers = useMemo(() => {
    return [...articles]
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
      .slice(0, 3);
  }, [articles]);

  const categoriesAvailable = useMemo(() => {
    const set = new Set<string>(['All']);
    unifiedFeed.forEach((i) => set.add(i.category));
    return Array.from(set).slice(0, 10);
  }, [unifiedFeed]);

  const displayedStories = useMemo(() => {
    const source =
      activeTab === 'new'
        ? newStories.length > 0
          ? newStories
          : unifiedFeed.slice(0, 12)
        : unifiedFeed;

    return source
      .filter((item) => catFilter === 'All' || item.category === catFilter)
      .filter((item) => {
        const isRead = Boolean(visitorState.readMap[item.id]);
        if (activeTab === 'unread') return !isRead;
        if (readFilter === 'unread') return !isRead;
        if (readFilter === 'read') return isRead;
        return true;
      })
      .slice(0, mode === 'section' ? 6 : 24);
  }, [activeTab, newStories, unifiedFeed, catFilter, readFilter, visitorState.readMap, mode]);

  const savedIdSet = useMemo(
    () => new Set(visitorState.savedItems.map((s) => s.id)),
    [visitorState.savedItems]
  );

  return (
    <section
      id="whats-new-section"
      aria-label="What's New Since Your Last Visit"
      className="mx-auto max-w-[1200px] px-4 sm:px-6 py-12"
    >
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
        {/* Top Greeting Banner: First Visit vs Returning Visit */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between border-b border-slate-200 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span>Personal Reader Digest</span>
            </div>

            {visitorState.isReturningVisitor ? (
              <>
                {mode === 'page' ? (
                  <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900">
                    Welcome Back! Here&apos;s What&apos;s New.
                  </h1>
                ) : (
                  <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900">
                    Welcome Back! Here&apos;s What&apos;s New.
                  </h2>
                )}
                <p className="mt-1.5 text-sm text-slate-600">
                  Since your previous visit on{' '}
                  <strong>
                    {visitorState.previousVisitAt
                      ? formatPublicationTimestamp(visitorState.previousVisitAt, useUtc)
                      : 'earlier'}
                  </strong>
                  : <span className="font-mono-tabular font-semibold text-blue-600">{newStories.length}</span>{' '}
                  newly published stories,{' '}
                  <span className="font-mono-tabular font-semibold text-slate-900">{newTrends.length}</span>{' '}
                  new trending signals, and{' '}
                  <span className="font-mono-tabular font-semibold text-slate-900">
                    {visitorState.savedItems.length}
                  </span>{' '}
                  saved articles.
                </p>
              </>
            ) : (
              <>
                {mode === 'page' ? (
                  <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900">
                    Welcome to TRENDVERSE — Today&apos;s Essential Dispatches
                  </h1>
                ) : (
                  <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900">
                    Welcome to TRENDVERSE — Today&apos;s Essential Dispatches
                  </h2>
                )}
                <p className="mt-1.5 text-sm text-slate-600">
                  This appears to be your first visit on this browser. Save stories, mark articles
                  as read, and your private local digest will track what&apos;s new when you return.
                </p>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onUpdateVisitCheckpoint}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              Mark Caught Up Now
            </button>
            <button
              type="button"
              onClick={onClearLocalHistory}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Clear Local History</span>
            </button>
            {mode === 'section' && (
              <a
                href={routeToUrl({ view: 'whats-new' })}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  onNavigate({ view: 'whats-new' });
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 cursor-pointer"
              >
                <span>Open Full Digest</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            )}
          </div>
        </div>

        {/* Navigation Tabs + Category / Read Filters */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-200/70 p-1">
            {[
              {
                id: 'new' as const,
                label: visitorState.isReturningVisitor
                  ? `New Since Last Visit (${newStories.length})`
                  : `Latest Stories (${unifiedFeed.length})`,
              },
              {
                id: 'unread' as const,
                label: `Unread (${unifiedFeed.filter((i) => !visitorState.readMap[i.id]).length})`,
              },
              {
                id: 'saved' as const,
                label: `Saved (${visitorState.savedItems.length})`,
              },
              {
                id: 'history' as const,
                label: `Reading History (${visitorState.readingHistory.length})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {(activeTab === 'new' || activeTab === 'unread') && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <select
                aria-label="Filter updates by category"
                value={catFilter}
                onChange={(e) => setCatFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
              >
                {categoriesAvailable.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {activeTab === 'new' && (
                <select
                  aria-label="Filter by read status"
                  value={readFilter}
                  onChange={(e) => setReadFilter(e.target.value as 'all' | 'unread' | 'read')}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                >
                  <option value="all">All Statuses</option>
                  <option value="unread">Unread Only</option>
                  <option value="read">Read Only</option>
                </select>
              )}
            </div>
          )}
        </div>

        {/* Main Tab Content */}
        {(activeTab === 'new' || activeTab === 'unread') && (
          <div className="space-y-6">
            {displayedStories.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
                {activeTab === 'new' && visitorState.isReturningVisitor
                  ? 'You are all caught up — no newer dispatches have arrived since your last checkpoint.'
                  : 'No stories match the selected filters.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {displayedStories.map((item) => {
                  const isRead = Boolean(visitorState.readMap[item.id]);
                  const isSaved = savedIdSet.has(item.id);

                  return (
                    <article
                      key={item.id}
                      className={`rounded-xl border p-4 flex flex-col justify-between transition-colors ${
                        isRead
                          ? 'border-slate-200 bg-slate-50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 text-xs text-slate-600 mb-1.5">
                          <span>
                            <strong className="text-blue-600">{item.publisher}</strong> ·{' '}
                            {item.category}
                          </span>
                          <span>
                            {isRead ? 'Read' : 'Unread'} · {formatRelativeTime(item.updatedAt)}
                          </span>
                        </div>

                        <h3 className="font-display text-base font-semibold text-slate-900 leading-snug">
                          {item.isInternalSlug ? (
                            <button
                              type="button"
                              onClick={() => {
                                onMarkRead(item);
                                onNavigate({ view: 'article', slug: item.isInternalSlug! });
                              }}
                              className="text-left hover:text-blue-600 cursor-pointer"
                            >
                              {item.title}
                            </button>
                          ) : (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => onMarkRead(item)}
                              className="hover:text-blue-600"
                            >
                              {item.title}
                            </a>
                          )}
                        </h3>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onMarkRead(item)}
                            disabled={isRead}
                            className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                            <span>{isRead ? 'Read' : 'Mark Read'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleSave(item)}
                            className={`inline-flex items-center gap-1 rounded border px-2.5 py-1 text-[11px] font-medium cursor-pointer ${
                              isSaved
                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>{isSaved ? 'Saved' : 'Save'}</span>
                          </button>
                        </div>

                        {!item.isInternalSlug && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => onMarkRead(item)}
                            aria-label={`Open full story: ${item.title}`}
                            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
                          >
                            <span>Open</span>
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* New Trending Topics & Recently Updated Explainers */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 pt-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  New Trending Signals
                </h3>
                {newTrends.length === 0 ? (
                  <p className="text-xs text-slate-500">No new trending topics detected.</p>
                ) : (
                  <ul className="space-y-2 text-xs">
                    {newTrends.map((t) => (
                      <li key={t.id} className="flex items-center justify-between gap-2">
                        <a
                          href={t.trendsExploreUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-slate-900 hover:text-blue-600"
                        >
                          {t.query}
                        </a>
                        <span className="font-mono-tabular text-slate-500">{t.approxTraffic}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600 mb-3">
                  Recently Updated Explainers
                </h3>
                <ul className="space-y-2 text-xs">
                  {recentlyUpdatedExplainers.map((a) => (
                    <li key={a.id} className="flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => onNavigate({ view: 'article', slug: a.slug })}
                        className="text-left font-medium text-slate-900 hover:text-blue-600 truncate cursor-pointer"
                      >
                        {a.title}
                      </button>
                      <span className="font-mono-tabular text-slate-600 shrink-0">
                        {a.updatedAt}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Saved Articles Tab */}
        {activeTab === 'saved' && (
          <div>
            {visitorState.savedItems.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
                No saved articles yet. Click <strong>Save</strong> on any story to bookmark it in
                your browser.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {visitorState.savedItems.map((saved) => (
                  <div
                    key={saved.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-xs text-slate-500 mb-1">
                        <strong className="text-blue-600">{saved.publisher}</strong> ·{' '}
                        {saved.category} · Saved {formatRelativeTime(saved.savedAt)}
                      </div>
                      <h3 className="font-display text-base font-semibold text-slate-900">
                        {saved.isInternalSlug ? (
                          <button
                            type="button"
                            onClick={() =>
                              onNavigate({ view: 'article', slug: saved.isInternalSlug! })
                            }
                            className="text-left hover:text-blue-600 cursor-pointer"
                          >
                            {saved.title}
                          </button>
                        ) : (
                          <a
                            href={saved.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-600"
                          >
                            {saved.title}
                          </a>
                        )}
                      </h3>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => onToggleSave(saved)}
                        className="text-rose-600 hover:underline cursor-pointer"
                      >
                        Remove Bookmark
                      </button>
                      {!saved.isInternalSlug && (
                        <a
                          href={saved.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open source article: ${saved.title}`}
                          className="font-semibold text-blue-600 hover:underline"
                        >
                          Open Source →
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reading History Tab */}
        {activeTab === 'history' && (
          <div>
            {visitorState.readingHistory.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
                Your reading history is empty. Stories you open or mark as read appear here.
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
                {visitorState.readingHistory.map((h) => (
                  <div key={`${h.id}-${h.readAt}`} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <div className="text-slate-600">
                        {h.publisher} · {h.category}
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mt-0.5">{h.title}</div>
                    </div>
                    <span className="text-slate-600 whitespace-nowrap">
                      Read {formatPublicationTimestamp(h.readAt, useUtc)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Anonymous Privacy Guarantee */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-start gap-2 text-xs text-slate-500">
          <Shield className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Privacy Notice: Visit timestamps, saved articles, and reading history stay strictly inside
            your own browser&apos;s localStorage. TRENDVERSE collects zero personal data and does not
            track visitors across websites.
          </span>
        </div>
      </div>
    </section>
  );
};
