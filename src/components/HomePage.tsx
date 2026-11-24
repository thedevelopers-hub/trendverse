import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Calculator,
  Calendar,
  Check,
  FileText,
  Hash,
  Scale,
  Type,
} from 'lucide-react';
import {
  DailyBriefingResponse,
  LiveNewsResponse,
  NewsCategory,
  TrendGeoCode,
  TrendsResponse,
} from '../../server/types';
import { AppRoute, Article, EditorialDraft, ToolId } from '../types/editorial';
import { EDITORIAL_CATEGORIES } from '../data/categories';
import { formatPublicationTimestamp, formatRelativeTime } from '../utils/timeFormat';
import { VisitorActivityState } from '../utils/visitorActivity';
import { EditorialVisual } from './EditorialVisual';
import { AdSlot } from './AdSlot';
import { LiveWorldClock } from './LiveWorldClock';
import { BreakingTicker } from './BreakingTicker';
import { TrendsRadar } from './TrendsRadar';
import { NewsCenterSection } from './NewsCenterSection';
import { AIIntelligenceCenter } from './AIIntelligenceCenter';
import { GlobalNewsMap } from './GlobalNewsMap';
import { WorldIn60SecondsFeature } from './WorldIn60SecondsFeature';
import { TrendBattleFeature } from './TrendBattleFeature';
import { WhatsNewFeature } from './WhatsNewFeature';
import { CareersHomeHighlight } from './CareersHomeHighlight';

interface HomePageProps {
  articles: Article[];
  liveBlogTitle?: string | null;
  useUtc: boolean;
  onToggleUtc: (next: boolean) => void;
  newsData: LiveNewsResponse | null;
  newsLoading: boolean;
  newsError: string | null;
  autoRefreshMinutes: number;
  onChangeAutoRefresh: (minutes: number) => void;
  onRefreshNews: () => void;
  trendsData: TrendsResponse | null;
  selectedTrendGeo: TrendGeoCode;
  trendsLoading: boolean;
  onSelectTrendGeo: (geo: TrendGeoCode) => void;
  onRefreshTrends: () => void;
  briefingData: DailyBriefingResponse | null;
  briefingHistory: DailyBriefingResponse[];
  briefingLoading: boolean;
  briefingCountryPref: string;
  briefingCategoryPref: string;
  briefingCountPref: number;
  onChangeBriefingCountry: (c: string) => void;
  onChangeBriefingCategory: (c: string) => void;
  onChangeBriefingCount: (n: number) => void;
  onGenerateBriefing: () => void;
  onSelectBriefingHistory: (item: DailyBriefingResponse) => void;
  onClearBriefingHistory: () => void;
  onSaveDraft: (draft: EditorialDraft) => void;
  savedDraftUrls: string[];
  visitorState: VisitorActivityState;
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

const TOOL_CARDS: Array<{
  id: ToolId;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'word-counter',
    name: 'Word Counter',
    description: 'Count words, sentences, paragraphs, and reading time instantly.',
    icon: FileText,
  },
  {
    id: 'percentage-calculator',
    name: 'Percentage Calculator',
    description: 'Compute ratios, percentage changes, and margins with precision.',
    icon: Calculator,
  },
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    description: 'Calculate exact chronological age in years, months, and days.',
    icon: Calendar,
  },
  {
    id: 'unit-converter',
    name: 'Unit Converter',
    description: 'Convert length, mass, temperature, data storage, and speed.',
    icon: Scale,
  },
  {
    id: 'text-case-converter',
    name: 'Text Case Converter',
    description: 'Transform prose into Title Case, camelCase, snake_case, and more.',
    icon: Type,
  },
  {
    id: 'character-counter',
    name: 'Character Counter',
    description: 'Track UTF-8 bytes and optimal SEO title or description lengths.',
    icon: Hash,
  },
];

const NEWSROOM_DESK_SECTIONS: Array<{
  label: string;
  categories: NewsCategory[];
}> = [
  { label: 'Latest World News', categories: ['World'] },
  { label: 'India News', categories: ['India'] },
  { label: 'Technology & AI', categories: ['Technology', 'Artificial Intelligence'] },
  { label: 'Business & Economy', categories: ['Business'] },
  { label: 'Science & Space', categories: ['Science', 'Space', 'Climate'] },
  { label: 'Entertainment', categories: ['Entertainment'] },
];

export const HomePage: React.FC<HomePageProps> = ({
  articles,
  liveBlogTitle,
  useUtc,
  onToggleUtc,
  newsData,
  newsLoading,
  newsError,
  autoRefreshMinutes,
  onChangeAutoRefresh,
  onRefreshNews,
  trendsData,
  selectedTrendGeo,
  trendsLoading,
  onSelectTrendGeo,
  onRefreshTrends,
  briefingData,
  briefingHistory,
  briefingLoading,
  briefingCountryPref,
  briefingCategoryPref,
  briefingCountPref,
  onChangeBriefingCountry,
  onChangeBriefingCategory,
  onChangeBriefingCount,
  onGenerateBriefing,
  onSelectBriefingHistory,
  onClearBriefingHistory,
  onSaveDraft,
  savedDraftUrls,
  visitorState,
  onMarkRead,
  onToggleSave,
  onClearLocalHistory,
  onUpdateVisitCheckpoint,
  onNavigate,
}) => {
  const [discoverTab, setDiscoverTab] = useState<'popular' | 'editors-pick' | 'most-read'>('editors-pick');
  const [email, setEmail] = useState('');
  const [newsletterError, setNewsletterError] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const heroArticle = useMemo(
    () => articles.find((a) => a.featured) || articles[0],
    [articles]
  );

  const topLiveDispatches = useMemo(
    () => (newsData?.items ?? []).slice(0, 4),
    [newsData]
  );

  const discoverList = useMemo(() => {
    const grouped = articles.filter((a) => a.discoverGroup === discoverTab);
    return (grouped.length > 0 ? grouped : articles).slice(0, 4);
  }, [articles, discoverTab]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setNewsletterError('Please enter a valid international email address.');
      return;
    }
    setNewsletterError('');
    setNewsletterSubscribed(true);
    setEmail('');
  };

  return (
    <div>
      {/* 2. Live Date, Time & World Clock */}
      <LiveWorldClock useUtc={useUtc} onToggleUtc={onToggleUtc} />

      {/* 3. Breaking Developments Ticker */}
      <BreakingTicker
        items={newsData?.items ?? []}
        loading={newsLoading}
        error={newsError}
        onRefresh={onRefreshNews}
      />

      {/* 4. Hero Editorial Story + Live Wire */}
      {heroArticle && (
        <section className="bg-[#0b1324] text-white border-b border-white/10">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-10 lg:py-12">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
              <p className="text-sm font-medium tracking-wide text-blue-400">
                TRENDVERSE — Discover What&apos;s Next.
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                {liveBlogTitle && <span>Connected Blogger Feed: {liveBlogTitle}</span>}
                <button
                  type="button"
                  onClick={() => onNavigate({ view: 'ai-center' })}
                  className="hover:text-white underline underline-offset-4 cursor-pointer"
                >
                  AI Intelligence Center
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate({ view: 'blogger-hub' })}
                  className="hover:text-white underline underline-offset-4 cursor-pointer"
                >
                  Blogger Theme &amp; Drafts
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-stretch">
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mb-3">
                    <span className="font-semibold text-blue-400">{heroArticle.categoryName}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={heroArticle.publishedAt}>{heroArticle.publishedAt}</time>
                    <span aria-hidden="true">·</span>
                    <span>{heroArticle.readTimeMinutes} min read</span>
                  </div>

                  <h1 className="font-display text-3xl sm:text-4xl font-semibold leading-[1.14] tracking-tight text-white">
                    {heroArticle.title}
                  </h1>

                  <p className="mt-4 text-sm sm:text-base leading-relaxed text-slate-300">
                    {heroArticle.summary}
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate({ view: 'article', slug: heroArticle.slug })}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors cursor-pointer"
                  >
                    <span>Read Editorial</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate({ view: 'briefing' })}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/20 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Your World in 60s
                  </button>
                </div>
              </div>

              <div className="lg:col-span-4">
                <button
                  type="button"
                  onClick={() => onNavigate({ view: 'article', slug: heroArticle.slug })}
                  className="group block w-full h-full overflow-hidden rounded-xl border border-white/10 text-left cursor-pointer"
                >
                  <EditorialVisual
                    motif={heroArticle.visualMotif}
                    imageUrl={heroArticle.imageUrl}
                    alt={heroArticle.imageAlt}
                    aspectClass="aspect-[16/10] lg:h-full"
                    priority
                  />
                </button>
              </div>

              <div className="lg:col-span-3 rounded-xl border border-white/10 bg-[#13203b]/60 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                      Live Global Wire
                    </h2>
                    <span className="text-[11px] text-slate-400">
                      {newsData?.status ? newsData.status.toUpperCase() : 'SYNC'}
                    </span>
                  </div>
                  {topLiveDispatches.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      {newsLoading ? 'Fetching live RSS feeds...' : 'No live items cached.'}
                    </p>
                  ) : (
                    <div className="divide-y divide-white/10">
                      {topLiveDispatches.map((item) => (
                        <a
                          key={item.id}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block py-2.5 first:pt-0 last:pb-0 group"
                        >
                          <div className="text-[11px] text-slate-400">
                            <span className="text-blue-400 font-medium">{item.publisher}</span> ·{' '}
                            {formatRelativeTime(item.publishedAt)}
                          </div>
                          <div className="mt-1 text-xs font-medium text-slate-100 group-hover:text-blue-300 line-clamp-2 leading-snug">
                            {item.title}
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate({ view: 'news-center' })}
                  className="mt-3 pt-2.5 border-t border-white/10 inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  <span>Browse all 10 news desks</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* FEATURE 3 (Homepage Section): What's New Since Your Last Visit */}
      <WhatsNewFeature
        mode="section"
        visitorState={visitorState}
        liveNews={newsData?.items ?? []}
        articles={articles}
        trends={trendsData?.trends ?? []}
        useUtc={useUtc}
        onMarkRead={onMarkRead}
        onToggleSave={onToggleSave}
        onClearLocalHistory={onClearLocalHistory}
        onUpdateVisitCheckpoint={onUpdateVisitCheckpoint}
        onNavigate={onNavigate}
      />

      {/* FEATURE 1 (Homepage Section): Your World in 60 Seconds */}
      <WorldIn60SecondsFeature
        mode="section"
        briefing={briefingData}
        history={briefingHistory}
        loading={briefingLoading}
        useUtc={useUtc}
        countryPref={briefingCountryPref}
        categoryPref={briefingCategoryPref}
        countPref={briefingCountPref}
        onChangeCountry={onChangeBriefingCountry}
        onChangeCategory={onChangeBriefingCategory}
        onChangeCount={onChangeBriefingCount}
        onGenerate={onGenerateBriefing}
        onSelectHistoryItem={onSelectBriefingHistory}
        onClearHistory={onClearBriefingHistory}
        onSaveDraft={onSaveDraft}
        savedDraftUrls={savedDraftUrls}
        onNavigate={onNavigate}
      />

      {/* FEATURE 2 (Homepage Section): Trend Battle */}
      <TrendBattleFeature mode="section" useUtc={useUtc} onNavigate={onNavigate} />

      {/* 5. Global Trend Radar */}
      <TrendsRadar
        data={trendsData}
        selectedGeo={selectedTrendGeo}
        loading={trendsLoading}
        useUtc={useUtc}
        onSelectGeo={onSelectTrendGeo}
        onRefresh={onRefreshTrends}
      />

      {/* 6. Live Global News Center (All 10 Categories) */}
      <NewsCenterSection
        data={newsData}
        loading={newsLoading}
        error={newsError}
        useUtc={useUtc}
        autoRefreshMinutes={autoRefreshMinutes}
        onChangeAutoRefresh={onChangeAutoRefresh}
        onManualRefresh={onRefreshNews}
        compactMode
      />

      {/* Reserved Leaderboard AdSense Container */}
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 pb-8">
        <AdSlot variant="leaderboard" slotName="home-newsroom-leaderboard" />
      </div>

      {/* 7-12. Regional & Vertical Newsroom Desks Grid */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 pb-14">
        <div className="border-b border-slate-200 pb-3 mb-7 flex items-baseline justify-between">
          <h2 className="font-display text-2xl font-semibold text-slate-900">
            Global Coverage by Desk
          </h2>
          <button
            type="button"
            onClick={() => onNavigate({ view: 'news-center' })}
            className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
          >
            Open Full News Center →
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {NEWSROOM_DESK_SECTIONS.map((desk) => {
            const deskStories = (newsData?.items ?? [])
              .filter((item) => desk.categories.includes(item.category))
              .slice(0, 3);

            return (
              <div
                key={desk.label}
                className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-display text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2.5 mb-3">
                    {desk.label}
                  </h3>
                  {deskStories.length === 0 ? (
                    <p className="text-xs text-slate-500 py-3">
                      Awaiting verified dispatches for {desk.label}.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {deskStories.map((story) => (
                        <a
                          key={story.id}
                          href={story.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group block py-2.5 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                            <span className="font-semibold text-blue-600">{story.publisher}</span>
                            <span>{formatPublicationTimestamp(story.publishedAt, useUtc)}</span>
                          </div>
                          <div className="text-sm font-medium text-slate-900 group-hover:text-blue-600 leading-snug line-clamp-2 flex items-start justify-between gap-2">
                            <span>{story.title}</span>
                            <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" aria-hidden="true" />
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. AI Intelligence Center */}
      <AIIntelligenceCenter
        newsItems={newsData?.items ?? []}
        articles={articles}
        useUtc={useUtc}
        onNavigate={onNavigate}
      />

      {/* 13. Global News Map */}
      <GlobalNewsMap items={newsData?.items ?? []} useUtc={useUtc} />

      {/* 15 & 16. Editorial Archives + Most Read & Editor's Picks */}
      <section className="bg-slate-50 border-y border-slate-200 py-14">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h2 className="font-display text-2xl font-semibold text-slate-900 mb-2">
              Evergreen Editorial Archives
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              Deep-dive explainers and Blogger-synced guides across six core editorial desks.
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {EDITORIAL_CATEGORIES.map((cat) => (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => onNavigate({ view: 'category', slug: cat.slug })}
                  className="group rounded-xl border border-slate-200 bg-white p-5 text-left hover:border-blue-500 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </h3>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600" aria-hidden="true" />
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {cat.shortDescription}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-display text-2xl font-semibold text-slate-900 mb-4">
                Editor&apos;s Picks &amp; Most Read
              </h2>
              <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 mb-5">
                {[
                  { id: 'editors-pick' as const, label: "Editor's Picks" },
                  { id: 'popular' as const, label: 'Popular' },
                  { id: 'most-read' as const, label: 'Most Read' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDiscoverTab(tab.id)}
                    className={`flex-1 rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      discoverTab === tab.id
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="divide-y divide-slate-100">
                {discoverList.map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onNavigate({ view: 'article', slug: item.slug })}
                    className="flex w-full items-start gap-4 py-3.5 text-left hover:bg-slate-50 px-2 rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="font-mono-tabular text-sm font-semibold text-blue-600 mt-0.5">
                      0{idx + 1}
                    </span>
                    <div>
                      <div className="text-xs text-slate-500">
                        {item.categoryName} <span aria-hidden="true">·</span> {item.readTimeMinutes} min
                      </div>
                      <div className="mt-1 text-sm font-semibold text-slate-900 leading-snug">
                        {item.title}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 17. Free Online Tools */}
      {/* 16b. TRENDVERSE CAREERS 1.0 Portal Highlight */}
      <CareersHomeHighlight onNavigate={onNavigate} />

      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 py-14">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-slate-200 pb-4 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900">
              Free Online Tools
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Fast, browser-local calculators and text utilities. Zero server uploads or sign-up required.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate({ view: 'tools', toolId: 'word-counter' })}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer shrink-0"
          >
            <span>Open Full Tool Suite</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOL_CARDS.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => onNavigate({ view: 'tools', toolId: tool.id })}
                className="group rounded-xl border border-slate-200 bg-white p-5 text-left hover:border-blue-500 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600" aria-hidden="true" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">{tool.name}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{tool.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* 18. Newsletter Subscription */}
      <section className="mx-auto max-w-[1200px] px-4 sm:px-6 pb-16">
        <div className="rounded-2xl bg-[#0b1324] px-6 py-10 sm:px-10 sm:py-12 text-white">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white">
                The Daily Global Intelligence Digest
              </h2>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-300 max-w-xl">
                Receive verified international news summaries, trend radar highlights, and
                evergreen explainers. No spam or automated noise.
              </p>
            </div>

            <div className="lg:col-span-5">
              {newsletterSubscribed ? (
                <div className="flex items-start gap-3 rounded-xl border border-blue-400/40 bg-blue-950/50 p-4 text-sm text-slate-100">
                  <Check className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="font-semibold">Subscription preference recorded</p>
                    <p className="mt-1 text-xs text-slate-300">
                      Preview confirmation saved locally. Connect your Blogger Feedburner or email
                      provider endpoint in production to dispatch digests.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} noValidate className="space-y-2.5">
                  <div className="flex flex-col gap-2.5 sm:flex-row">
                    <label htmlFor="newsletter-email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="newsletter-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-slate-400 focus:border-blue-400 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Subscribe
                    </button>
                  </div>
                  {newsletterError && (
                    <p role="alert" className="text-xs text-amber-300">
                      {newsletterError}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400">
                    Read our{' '}
                    <button
                      type="button"
                      onClick={() => onNavigate({ view: 'policy', pageId: 'privacy-policy' })}
                      className="underline hover:text-white cursor-pointer"
                    >
                      Privacy Policy
                    </button>{' '}
                    before subscribing.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
