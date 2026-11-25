import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Clock, Search, TrendingUp, Wrench, X } from 'lucide-react';
import { LiveNewsItem, TrendItem } from '../../server/types';
import { AppRoute, Article, ToolId } from '../types/editorial';
import { AI_TOOLS_DIRECTORY } from '../data/aiDirectory';
import { formatRelativeTime } from '../utils/timeFormat';
import { trackFormSubmit } from '../utils/thirdPartyScripts';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: Article[];
  liveNews: LiveNewsItem[];
  trends: TrendItem[];
  onNavigate: (route: AppRoute) => void;
}

const TOOL_INDEX: Array<{ id: ToolId; name: string; keywords: string }> = [
  { id: 'word-counter', name: 'Word Counter', keywords: 'words reading time sentences paragraphs density' },
  { id: 'percentage-calculator', name: 'Percentage Calculator', keywords: 'percent ratio discount increase decrease math' },
  { id: 'age-calculator', name: 'Age Calculator', keywords: 'birthday age years months days countdown' },
  { id: 'unit-converter', name: 'Unit Converter', keywords: 'length weight mass temperature celsius fahrenheit data speed' },
  { id: 'text-case-converter', name: 'Text Case Converter', keywords: 'uppercase lowercase title case camel snake kebab' },
  { id: 'character-counter', name: 'Character Counter & SEO Meter', keywords: 'characters bytes utf8 meta title description length' },
];

const RECENT_STORAGE_KEY = 'trendverse_recent_searches';

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  articles,
  liveNews,
  trends,
  onNavigate,
}) => {
  const [query, setQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState<'all' | 'news' | 'articles' | 'trends' | 'ai-tools' | 'utilities'>('all');
  const [dateFilter, setDateFilter] = useState<'any' | '24h' | '7d'>('any');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(RECENT_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  });

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 40);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const recordSearch = (term: string) => {
    const clean = term.trim();
    if (clean.length < 2) return;
    setRecentSearches((prev) => {
      const next = [clean, ...prev.filter((p) => p.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage quota errors
      }
      return next;
    });
  };

  const normalized = query.trim().toLowerCase();

  const passesDateFilter = (iso: string): boolean => {
    if (dateFilter === 'any') return true;
    const ms = Date.parse(iso);
    if (Number.isNaN(ms)) return true;
    const ageHours = (Date.now() - ms) / (1000 * 60 * 60);
    return dateFilter === '24h' ? ageHours <= 24 : ageHours <= 24 * 7;
  };

  const matchingNews = useMemo(() => {
    if (scopeFilter !== 'all' && scopeFilter !== 'news') return [];
    const pool = liveNews.filter((item) => passesDateFilter(item.publishedAt));
    if (!normalized) return pool.slice(0, 4);
    return pool
      .filter(
        (n) =>
          n.title.toLowerCase().includes(normalized) ||
          n.summary.toLowerCase().includes(normalized) ||
          n.publisher.toLowerCase().includes(normalized) ||
          n.category.toLowerCase().includes(normalized)
      )
      .slice(0, 6);
  }, [liveNews, normalized, scopeFilter, dateFilter]);

  const matchingArticles = useMemo(() => {
    if (scopeFilter !== 'all' && scopeFilter !== 'articles') return [];
    const pool = articles.filter((a) => passesDateFilter(a.publishedAt));
    if (!normalized) return pool.slice(0, 3);
    return pool.filter(
      (a) =>
        a.title.toLowerCase().includes(normalized) ||
        a.summary.toLowerCase().includes(normalized) ||
        a.categoryName.toLowerCase().includes(normalized) ||
        a.labels.some((l) => l.toLowerCase().includes(normalized))
    );
  }, [articles, normalized, scopeFilter, dateFilter]);

  const matchingTrends = useMemo(() => {
    if (scopeFilter !== 'all' && scopeFilter !== 'trends') return [];
    if (!normalized) return trends.slice(0, 3);
    return trends
      .filter(
        (t) =>
          t.query.toLowerCase().includes(normalized) ||
          t.category.toLowerCase().includes(normalized)
      )
      .slice(0, 5);
  }, [trends, normalized, scopeFilter]);

  const matchingAiTools = useMemo(() => {
    if (scopeFilter !== 'all' && scopeFilter !== 'ai-tools') return [];
    if (!normalized) return AI_TOOLS_DIRECTORY.slice(0, 3);
    return AI_TOOLS_DIRECTORY.filter(
      (t) =>
        t.name.toLowerCase().includes(normalized) ||
        t.category.toLowerCase().includes(normalized) ||
        t.summary.toLowerCase().includes(normalized)
    ).slice(0, 5);
  }, [normalized, scopeFilter]);

  const matchingUtilities = useMemo(() => {
    if (scopeFilter !== 'all' && scopeFilter !== 'utilities') return [];
    if (!normalized) return TOOL_INDEX.slice(0, 3);
    return TOOL_INDEX.filter(
      (t) => t.name.toLowerCase().includes(normalized) || t.keywords.includes(normalized)
    );
  }, [normalized, scopeFilter]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Smart Search across news, articles, trends, AI tools, and utilities"
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/75 px-4 pt-12 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            recordSearch(query);
            if (query.trim().length >= 2) {
              trackFormSubmit({
                formName: 'site_search',
                formLocation: 'search_modal',
                formCategory: scopeFilter,
              });
            }
          }}
          className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5"
        >
          <Search className="h-5 w-5 text-slate-400 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search live headlines, articles, Google Trends, AI tools, or free utilities..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </form>

        {/* Scope & Date Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs">
          <div className="flex flex-wrap gap-1">
            {(
              [
                ['all', 'All'],
                ['news', 'Live News'],
                ['articles', 'Explainers'],
                ['trends', 'Trends'],
                ['ai-tools', 'AI Tools'],
                ['utilities', 'Free Tools'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setScopeFilter(id)}
                className={`rounded-md px-2.5 py-1 font-medium cursor-pointer transition-colors ${
                  scopeFilter === id
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <label className="flex items-center gap-1.5 text-slate-600">
            <span>Date:</span>
            <select
              aria-label="Filter search results by date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'any' | '24h' | '7d')}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-800 focus:outline-none"
            >
              <option value="any">Any time</option>
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
            </select>
          </label>
        </div>

        <div className="max-h-[68vh] overflow-y-auto p-5 space-y-6">
          {/* Recent Searches */}
          {!normalized && recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Recent Searches
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setRecentSearches([]);
                    localStorage.removeItem(RECENT_STORAGE_KEY);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 hover:border-blue-500 cursor-pointer"
                  >
                    <Clock className="h-3 w-3 text-slate-400" aria-hidden="true" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live News Headlines */}
          {matchingNews.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Live Global Headlines
              </h3>
              <div className="divide-y divide-slate-100">
                {matchingNews.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => recordSearch(query)}
                    className="flex items-start justify-between gap-4 py-2.5 px-2 rounded-lg hover:bg-slate-50"
                  >
                    <div>
                      <div className="text-xs text-slate-500">
                        <span className="font-semibold text-blue-600">{item.publisher}</span> ·{' '}
                        {item.category} · {formatRelativeTime(item.publishedAt)}
                      </div>
                      <div className="text-sm font-semibold text-slate-900">{item.title}</div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400 shrink-0 mt-1" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Editorial Articles */}
          {matchingArticles.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Editorial Explainers
              </h3>
              <div className="divide-y divide-slate-100">
                {matchingArticles.map((article) => (
                  <button
                    key={article.id}
                    type="button"
                    onClick={() => {
                      recordSearch(query);
                      onNavigate({ view: 'article', slug: article.slug });
                      onClose();
                    }}
                    className="flex w-full items-start justify-between gap-4 py-2.5 px-2 text-left rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    <div>
                      <div className="text-xs text-slate-500">
                        {article.categoryName} · {article.publishedAt}
                      </div>
                      <div className="font-display text-base font-semibold text-slate-900">
                        {article.title}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-blue-600 shrink-0 mt-1" aria-hidden="true" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Topics */}
          {matchingTrends.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Google Trends Signals
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {matchingTrends.map((t) => (
                  <a
                    key={t.id}
                    href={t.trendsExploreUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs hover:border-blue-500"
                  >
                    <span className="flex items-center gap-2 font-medium text-slate-900">
                      <TrendingUp className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                      {t.query}
                    </span>
                    <span className="font-mono-tabular text-slate-500">{t.approxTraffic}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* AI Tools & Free Utilities */}
          {(matchingAiTools.length > 0 || matchingUtilities.length > 0) && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {matchingAiTools.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    AI Tools Directory
                  </h3>
                  <div className="space-y-1.5">
                    {matchingAiTools.map((tool) => (
                      <a
                        key={tool.id}
                        href={tool.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 hover:border-blue-500"
                      >
                        <span>
                          {tool.name} <span className="text-slate-400">· {tool.category}</span>
                        </span>
                        <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {matchingUtilities.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Free Online Utilities
                  </h3>
                  <div className="space-y-1.5">
                    {matchingUtilities.map((tool) => (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => {
                          recordSearch(query);
                          onNavigate({ view: 'tools', toolId: tool.id });
                          onClose();
                        }}
                        className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-left text-xs font-medium text-slate-800 hover:border-blue-500 cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Wrench className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
                          {tool.name}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
