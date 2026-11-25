import React, { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, Cpu } from 'lucide-react';
import { LiveNewsItem } from '../../server/types';
import { AppRoute, Article } from '../types/editorial';
import {
  AI_MODEL_COMPARISON,
  AI_TOOL_CATEGORIES,
  AI_TOOLS_DIRECTORY,
  AIToolCategory,
} from '../data/aiDirectory';
import { formatPublicationTimestamp } from '../utils/timeFormat';
import { routeToUrl } from '../utils/routes';

interface AIIntelligenceCenterProps {
  mode?: 'section' | 'page';
  newsItems: LiveNewsItem[];
  articles: Article[];
  useUtc: boolean;
  onNavigate: (route: AppRoute) => void;
}

type AITab = 'news' | 'tools' | 'models' | 'learning';

export const AIIntelligenceCenter: React.FC<AIIntelligenceCenterProps> = ({
  mode = 'section',
  newsItems,
  articles,
  useUtc,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<AITab>('news');
  const [toolCat, setToolCat] = useState<'All' | AIToolCategory>('All');

  const aiNews = useMemo(() => {
    const exact = newsItems.filter(
      (item) =>
        item.category === 'Artificial Intelligence' ||
        item.category === 'Technology' ||
        /\bai\b|artificial intelligence|machine learning|llm|gemini|model/i.test(item.title)
    );
    return exact.slice(0, 6);
  }, [newsItems]);

  const filteredTools = useMemo(() => {
    if (toolCat === 'All') return AI_TOOLS_DIRECTORY;
    return AI_TOOLS_DIRECTORY.filter((t) => t.category === toolCat);
  }, [toolCat]);

  const learningArticles = useMemo(() => {
    return articles.filter(
      (a) => a.category === 'technology-ai' || a.category === 'science-space'
    );
  }, [articles]);

  return (
    <section
      id="ai-intelligence-center"
      aria-label="AI Intelligence Center"
      className="bg-slate-50 border-y border-slate-200 py-14"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between border-b border-slate-200 pb-5 mb-7">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1.5">
              <Cpu className="h-4 w-4" aria-hidden="true" />
              <span>AI Intelligence Center</span>
            </div>
            {mode === 'page' ? (
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900">
                AI News, Verified Tools &amp; Model Reference
              </h1>
            ) : (
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900">
                AI News, Verified Tools &amp; Model Reference
              </h2>
            )}
            <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">
              Live official AI research dispatches, verified tool directory, model pricing
              documentation links, and practical technical explainers.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="AI Intelligence Center sections"
            className="flex flex-wrap gap-1.5 rounded-xl bg-slate-200/70 p-1"
          >
            {[
              { id: 'news' as const, label: 'Latest AI News' },
              { id: 'tools' as const, label: 'AI Tools Directory' },
              { id: 'models' as const, label: 'Model Comparison' },
              { id: 'learning' as const, label: 'Learning Center' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
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
        </div>

        {/* Section A: Latest AI News */}
        {activeTab === 'news' && (
          <div>
            {aiNews.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
                No AI or Technology RSS dispatches loaded yet. Use Refresh in the Live News Center
                to query Google AI Blog, MIT News AI, and BBC Technology.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {aiNews.map((item) => (
                  <article
                    key={item.id}
                    className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-500 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                        <span className="font-semibold text-blue-600">{item.publisher}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.category}</span>
                      </div>
                      <h3 className="font-display text-lg font-semibold text-slate-900 leading-snug">
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                          {item.title}
                        </a>
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-3">{item.summary}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <time dateTime={item.publishedAt}>
                        {formatPublicationTimestamp(item.publishedAt, useUtc)}
                      </time>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Read AI source dispatch: ${item.title}`}
                        className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <span>Source</span>
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section B: AI Tools Directory */}
        {activeTab === 'tools' && (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setToolCat('All')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                  toolCat === 'All'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                All Categories
              </button>
              {AI_TOOL_CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setToolCat(c)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                    toolCat === c
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5"
                >
                  <div>
                    <div className="text-xs text-slate-600 mb-1.5">
                      <span className="font-semibold text-blue-600">{tool.category}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{tool.provider}</span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-900">{tool.name}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">{tool.summary}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600">Verified: {tool.lastVerified}</span>
                    <a
                      href={tool.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit official site for ${tool.name}`}
                      className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
                    >
                      <span>Official Site</span>
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section C: AI Model Comparison */}
        {activeTab === 'models' && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-100/70 text-xs font-semibold uppercase tracking-wider text-slate-600">
                  <th className="px-4 py-3.5">Model Family</th>
                  <th className="px-4 py-3.5">Provider</th>
                  <th className="px-4 py-3.5">Documented Capabilities</th>
                  <th className="px-4 py-3.5">Official Docs</th>
                  <th className="px-4 py-3.5">Pricing Reference</th>
                  <th className="px-4 py-3.5">Last Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {AI_MODEL_COMPARISON.map((row) => (
                  <tr key={row.modelName} className="hover:bg-slate-50">
                    <td className="px-4 py-3.5 font-semibold text-slate-900 whitespace-nowrap">
                      {row.modelName}
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 whitespace-nowrap">{row.provider}</td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-md">{row.capabilities}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <a
                        href={row.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Read official documentation for ${row.modelName}`}
                        className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline"
                      >
                        <span>Docs</span>
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <a
                        href={row.pricingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`View official pricing for ${row.modelName}`}
                        className="inline-flex items-center gap-1 font-medium text-blue-600 hover:underline"
                      >
                        <span>Official Pricing</span>
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </td>
                    <td className="px-4 py-3.5 font-mono-tabular text-xs text-slate-600 whitespace-nowrap">
                      {row.lastVerified}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Section D: AI Learning Center */}
        {activeTab === 'learning' && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {learningArticles.map((art) => {
              const artUrl = routeToUrl({ view: 'article', slug: art.slug });
              return (
                <div
                  key={art.id}
                  className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6"
                >
                  <div>
                    <div className="text-xs text-slate-500 mb-2">
                      <span className="font-semibold text-blue-600">{art.categoryName}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{art.readTimeMinutes} min guide</span>
                    </div>
                    <h3 className="font-display text-xl font-semibold text-slate-900">
                      <a
                        href={artUrl}
                        onClick={(e) => {
                          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                          e.preventDefault();
                          onNavigate({ view: 'article', slug: art.slug });
                        }}
                        className="text-left hover:text-blue-600 cursor-pointer"
                      >
                        {art.title}
                      </a>
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">{art.summary}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <a
                      href={artUrl}
                      aria-label={`Read technical guide: ${art.title}`}
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                        e.preventDefault();
                        onNavigate({ view: 'article', slug: art.slug });
                      }}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                    >
                      <span>Read Technical Guide</span>
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
