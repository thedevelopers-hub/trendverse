import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import {
  DailyBriefingResponse,
  LiveNewsResponse,
  TrendGeoCode,
  TrendsResponse,
} from '../server/types';
import {
  AppRoute,
  Article,
  CareersTab,
  CareerToolId,
  EditorialDraft,
  PolicyPageId,
  ToolId,
} from './types/editorial';
import { EVERGREEN_ARTICLES, getArticleBySlug } from './data/articles';
import { getCategoryBySlug, mapBloggerLabelsToCategory } from './data/categories';
import { POLICY_PAGES } from './data/workflowAndPolicies';
import { fetchBloggerPosts } from './services/bloggerFeed';
import {
  fetchGoogleTrendsFeed,
  fetchLiveNewsFeed,
  requestDailyBriefing,
} from './services/newsroomApi';
import { routeToUrl } from './utils/routes';
import {
  applySeoForAICenter,
  applySeoForArticle,
  applySeoForBloggerHub,
  applySeoForBriefing,
  applySeoForCareers,
  applySeoForCategory,
  applySeoForHome,
  applySeoForNewsCenter,
  applySeoForPolicy,
  applySeoForTools,
  applySeoForTrendBattle,
  applySeoForWhatsNew,
  applyVerificationMetaTags,
} from './utils/seo';
import {
  clearVisitorActivity,
  initVisitorActivity,
  saveVisitorActivity,
  VisitorActivityState,
} from './utils/visitorActivity';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { ConsentBanner } from './components/ConsentBanner';
import { HomePage } from './components/HomePage';
import { AIIntelligenceCenter } from './components/AIIntelligenceCenter';
import { NewsCenterSection } from './components/NewsCenterSection';
import { LiveWorldClock } from './components/LiveWorldClock';
import { TrendsRadar } from './components/TrendsRadar';
import { WorldIn60SecondsFeature } from './components/WorldIn60SecondsFeature';
import { TrendBattleFeature } from './components/TrendBattleFeature';
import { WhatsNewFeature } from './components/WhatsNewFeature';

const ArticlePage = lazy(() =>
  import('./components/ArticlePage').then((m) => ({ default: m.ArticlePage }))
);
const CategoryPage = lazy(() =>
  import('./components/CategoryPage').then((m) => ({ default: m.CategoryPage }))
);
const ToolsHub = lazy(() =>
  import('./components/ToolsHub').then((m) => ({ default: m.ToolsHub }))
);
const BloggerThemeHub = lazy(() =>
  import('./components/BloggerThemeHub').then((m) => ({ default: m.BloggerThemeHub }))
);
const PolicyPages = lazy(() =>
  import('./components/PolicyPages').then((m) => ({ default: m.PolicyPages }))
);
const CareersPortal = lazy(() =>
  import('./components/careers/CareersPortal').then((m) => ({ default: m.CareersPortal }))
);

const DRAFTS_STORAGE_KEY = 'trendverse_editorial_drafts';
const BRIEFING_HISTORY_KEY = 'trendverse_briefing_history_v1';

const VALID_CAREERS_TABS: CareersTab[] = [
  'overview',
  'jobs',
  'internships',
  'remote',
  'fresher',
  'scholarships',
  'government',
  'tools',
];

function parseCareersTab(segment?: string): CareersTab {
  if (!segment) return 'overview';
  return VALID_CAREERS_TABS.includes(segment as CareersTab)
    ? (segment as CareersTab)
    : 'overview';
}

function resolveLabelRoute(rawLabel: string): AppRoute {
  const decoded = decodeURIComponent(rawLabel).trim();
  const lower = decoded.toLowerCase();
  if (!lower) return { view: 'home' };

  if (lower === 'careers' || lower === 'jobs' || lower === 'careers & jobs') {
    return { view: 'careers', tab: 'overview' };
  }
  if (lower === 'internships' || lower === 'student internships') {
    return { view: 'careers', tab: 'internships' };
  }
  if (lower === 'remote' || lower === 'remote jobs') {
    return { view: 'careers', tab: 'remote' };
  }
  if (lower === 'scholarships') {
    return { view: 'careers', tab: 'scholarships' };
  }
  if (lower === 'government jobs' || lower === 'government') {
    return { view: 'careers', tab: 'government' };
  }

  const exactSlug = getCategoryBySlug(lower);
  if (exactSlug) return { view: 'category', slug: exactSlug.slug };
  const mapped = mapBloggerLabelsToCategory([decoded]);
  return { view: 'category', slug: mapped.slug };
}

function resolvePolicyPageId(segment?: string): PolicyPageId {
  const cleaned = (segment || '').replace(/\.html$/i, '').toLowerCase();
  if (cleaned === 'about-us') return 'about';
  if (cleaned in POLICY_PAGES) return cleaned as PolicyPageId;
  return 'about';
}

function parseCurrentRoute(): AppRoute {
  const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
  const parts = pathname.split('/').filter(Boolean);

  // 1. Strict Root Path Check: "/" always resolves to complete TRENDVERSE homepage
  // unless an explicit legacy hash route (#article/..., #category/..., etc.) is provided.
  if (pathname !== '/') {
    if (parts[0] === 'careers') {
      const tab = parseCareersTab(parts[1]);
      return {
        view: 'careers',
        tab,
        toolId: parts[2] as CareerToolId | undefined,
      };
    }

    if (parts[0] === 'search' && parts[1] === 'label' && parts[2]) {
      return resolveLabelRoute(parts.slice(2).join('/'));
    }

    if (parts[0] === 'category' && parts[1]) {
      const cat = getCategoryBySlug(decodeURIComponent(parts[1]).toLowerCase());
      return cat ? { view: 'category', slug: cat.slug } : { view: 'home' };
    }

    if (parts[0] === 'article' && parts[1]) {
      return { view: 'article', slug: decodeURIComponent(parts[1]) };
    }

    if (parts[0] === 'tools') {
      return { view: 'tools', toolId: (parts[1] as ToolId) || 'word-counter' };
    }

    if (parts[0] === 'policy' || parts[0] === 'p') {
      if (parts[1]?.replace(/\.html$/i, '').toLowerCase() === 'free-tools') {
        return { view: 'tools', toolId: 'word-counter' };
      }
      return { view: 'policy', pageId: resolvePolicyPageId(parts[1]) };
    }

    if (parts[0] === 'briefing') return { view: 'briefing' };
    if (parts[0] === 'trend-battle') return { view: 'trend-battle' };
    if (parts[0] === 'whats-new') return { view: 'whats-new' };
    if (parts[0] === 'ai-center') return { view: 'ai-center' };
    if (parts[0] === 'news-center') return { view: 'news-center' };
    if (parts[0] === 'blogger-theme') return { view: 'blogger-hub' };
  }

  // 2. Legacy Hash Route Support (never falls back to any category on empty/unknown hash)
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return { view: 'home' };
  const [segment, param, subParam] = hash.split('/');
  if (segment === 'careers') {
    return {
      view: 'careers',
      tab: parseCareersTab(param),
      toolId: subParam as CareerToolId | undefined,
    };
  }
  if (segment === 'article' && param) return { view: 'article', slug: decodeURIComponent(param) };
  if (segment === 'category' && param) {
    const cat = getCategoryBySlug(decodeURIComponent(param).toLowerCase());
    return cat ? { view: 'category', slug: cat.slug } : { view: 'home' };
  }
  if (segment === 'tools') {
    return { view: 'tools', toolId: (param as ToolId) || 'word-counter' };
  }
  if (segment === 'ai-center') return { view: 'ai-center' };
  if (segment === 'news-center') return { view: 'news-center' };
  if (segment === 'briefing') return { view: 'briefing' };
  if (segment === 'trend-battle') return { view: 'trend-battle' };
  if (segment === 'whats-new') return { view: 'whats-new' };
  if (segment === 'blogger-theme') return { view: 'blogger-hub' };
  if (segment === 'policy' && param) {
    return { view: 'policy', pageId: resolvePolicyPageId(param) };
  }
  return { view: 'home' };
}

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => parseCurrentRoute());
  const [searchOpen, setSearchOpen] = useState(false);
  const [useUtc, setUseUtc] = useState(false);

  // Evergreen / Blogger Articles State
  const [articles, setArticles] = useState<Article[]>(EVERGREEN_ARTICLES);
  const [connectedBlogUrl, setConnectedBlogUrl] = useState('');
  const [connectedBlogTitle, setConnectedBlogTitle] = useState<string | null>(null);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);

  // Live Global News Center State
  const [newsData, setNewsData] = useState<LiveNewsResponse | null>(null);
  const [newsLoading, setNewsLoading] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);
  const [autoRefreshMinutes, setAutoRefreshMinutes] = useState(5);

  // Google Trends Radar State
  const [selectedTrendGeo, setSelectedTrendGeo] = useState<TrendGeoCode>('WORLD');
  const [trendsData, setTrendsData] = useState<TrendsResponse | null>(null);
  const [trendsLoading, setTrendsLoading] = useState(true);

  // Feature 1: Your World in 60 Seconds State & History
  const [briefingCountryPref, setBriefingCountryPref] = useState('All Countries');
  const [briefingCategoryPref, setBriefingCategoryPref] = useState('All Categories');
  const [briefingCountPref, setBriefingCountPref] = useState(7);
  const [briefingHistory, setBriefingHistory] = useState<DailyBriefingResponse[]>(() => {
    try {
      const raw = localStorage.getItem(BRIEFING_HISTORY_KEY);
      return raw ? (JSON.parse(raw) as DailyBriefingResponse[]) : [];
    } catch {
      return [];
    }
  });
  const [briefingData, setBriefingData] = useState<DailyBriefingResponse | null>(
    () => briefingHistory[0] ?? null
  );
  const [briefingLoading, setBriefingLoading] = useState(false);

  // Feature 3: What's New Since Your Last Visit State
  const [visitorState, setVisitorState] = useState<VisitorActivityState>(() =>
    initVisitorActivity()
  );

  // Human Editorial Draft Queue State
  const [drafts, setDrafts] = useState<EditorialDraft[]>(() => {
    try {
      const raw = localStorage.getItem(DRAFTS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as EditorialDraft[]) : [];
    } catch {
      return [];
    }
  });

  const navigate = useCallback((nextRoute: AppRoute) => {
    setRoute(nextRoute);
    const nextUrl = routeToUrl(nextRoute);
    const currentUrl = `${window.location.pathname}${window.location.hash}`;
    if (currentUrl !== nextUrl) {
      window.history.pushState(null, '', nextUrl);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onRouteChange = () => setRoute(parseCurrentRoute());
    window.addEventListener('hashchange', onRouteChange);
    window.addEventListener('popstate', onRouteChange);
    return () => {
      window.removeEventListener('hashchange', onRouteChange);
      window.removeEventListener('popstate', onRouteChange);
    };
  }, []);

  const newsAbortRef = useRef<AbortController | null>(null);
  const newsReqIdRef = useRef(0);
  const newsInFlightRef = useRef(false);
  const lastNewsSyncMsRef = useRef(0);

  const trendsAbortRef = useRef<AbortController | null>(null);
  const trendsReqIdRef = useRef(0);

  const loadNews = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && newsInFlightRef.current) {
      return;
    }

    newsAbortRef.current?.abort();
    const controller = new AbortController();
    newsAbortRef.current = controller;
    newsInFlightRef.current = true;
    const reqId = ++newsReqIdRef.current;

    setNewsLoading(true);
    setNewsError(null);
    try {
      const data = await fetchLiveNewsFeed({
        refresh: forceRefresh,
        signal: controller.signal,
      });
      if (controller.signal.aborted || reqId !== newsReqIdRef.current) return;
      setNewsData(data);
      if (data.status === 'unavailable' && data.items.length === 0) {
        setNewsError('Upstream RSS feeds are temporarily unavailable. Select Refresh to retry.');
      } else {
        lastNewsSyncMsRef.current = Date.now();
      }
    } catch (err) {
      if (controller.signal.aborted || reqId !== newsReqIdRef.current) return;
      setNewsError(err instanceof Error ? err.message : 'Unable to refresh live news feeds.');
    } finally {
      if (reqId === newsReqIdRef.current) {
        newsInFlightRef.current = false;
        setNewsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadNews(false);
    return () => {
      newsAbortRef.current?.abort();
    };
  }, [loadNews]);

  useEffect(() => {
    if (autoRefreshMinutes <= 0) return;
    const intervalMs = autoRefreshMinutes * 60 * 1000;
    const id = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }
      void loadNews(true);
    }, intervalMs);

    const onVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        Date.now() - lastNewsSyncMsRef.current >= intervalMs
      ) {
        void loadNews(true);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [autoRefreshMinutes, loadNews]);

  const loadTrends = useCallback(async (geo: TrendGeoCode, forceRefresh = false) => {
    trendsAbortRef.current?.abort();
    const controller = new AbortController();
    trendsAbortRef.current = controller;
    const reqId = ++trendsReqIdRef.current;

    setTrendsLoading(true);
    try {
      const res = await fetchGoogleTrendsFeed(geo, forceRefresh, controller.signal);
      if (controller.signal.aborted || reqId !== trendsReqIdRef.current) return;
      setTrendsData(res);
    } catch (err) {
      if (controller.signal.aborted || reqId !== trendsReqIdRef.current) return;
      setTrendsData({
        geo,
        geoName: geo,
        sourceName: 'Google Trends Official RSS',
        sourceUrl: 'https://trends.google.com/trending',
        lastUpdated: null,
        status: 'unavailable',
        note: 'Google Trends feed could not be reached.',
        errorMessage:
          err instanceof Error ? err.message : 'Network error fetching Google Trends RSS.',
        trends: [],
      });
    } finally {
      if (reqId === trendsReqIdRef.current) {
        setTrendsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadTrends(selectedTrendGeo, false);
    return () => {
      trendsAbortRef.current?.abort();
    };
  }, [selectedTrendGeo, loadTrends]);

  // Search engine verification meta tags (when env tokens are provided)
  useEffect(() => {
    applyVerificationMetaTags();
  }, []);

  // Dynamic SEO per route
  useEffect(() => {
    if (route.view === 'home') applySeoForHome();
    else if (route.view === 'article') {
      const found = getArticleBySlug(route.slug, articles) || articles[0];
      if (found) applySeoForArticle(found);
    } else if (route.view === 'category') {
      const cat = getCategoryBySlug(route.slug);
      if (cat) applySeoForCategory(cat);
    } else if (route.view === 'tools') applySeoForTools(route.toolId);
    else if (route.view === 'policy') applySeoForPolicy(route.pageId);
    else if (route.view === 'blogger-hub') applySeoForBloggerHub();
    else if (route.view === 'ai-center') applySeoForAICenter();
    else if (route.view === 'news-center') applySeoForNewsCenter();
    else if (route.view === 'briefing') applySeoForBriefing();
    else if (route.view === 'trend-battle') applySeoForTrendBattle();
    else if (route.view === 'whats-new') applySeoForWhatsNew();
    else if (route.view === 'careers') applySeoForCareers(route.tab);
  }, [route, articles]);

  const handleGenerateBriefing = async () => {
    setBriefingLoading(true);
    try {
      const res = await requestDailyBriefing({
        refreshNews: false,
        country: briefingCountryPref,
        category: briefingCategoryPref,
        count: briefingCountPref,
      });
      setBriefingData(res);
      if (res.aiAvailable && res.stories.length > 0) {
        setBriefingHistory((prev) => {
          const next = [res, ...prev.filter((p) => p.id !== res.id)].slice(0, 14);
          try {
            localStorage.setItem(BRIEFING_HISTORY_KEY, JSON.stringify(next));
          } catch {
            // ignore
          }
          return next;
        });
      }
    } catch (err) {
      setBriefingData({
        id: `briefing-err-${Date.now()}`,
        aiAvailable: false,
        label: 'AI-Generated Summary',
        briefingDate: new Date().toISOString().slice(0, 10),
        generatedAt: new Date().toISOString(),
        modelName: 'gemini-4-hydrogen',
        countryPreference: briefingCountryPref,
        categoryPreference: briefingCategoryPref,
        overview: '',
        stories: [],
        errorMessage: err instanceof Error ? err.message : 'Unable to reach briefing endpoint.',
      });
    } finally {
      setBriefingLoading(false);
    }
  };

  const handleClearBriefingHistory = () => {
    setBriefingHistory([]);
    try {
      localStorage.removeItem(BRIEFING_HISTORY_KEY);
    } catch {
      // ignore
    }
  };

  // Visitor Activity Handlers (What's New Since Your Last Visit)
  const handleMarkRead = useCallback(
    (item: {
      id: string;
      title: string;
      category: string;
      publisher: string;
      url: string;
      isInternalSlug?: string;
    }) => {
      const nowIso = new Date().toISOString();
      setVisitorState((prev) => {
        const next: VisitorActivityState = {
          ...prev,
          readMap: { ...prev.readMap, [item.id]: nowIso },
          readingHistory: [
            {
              id: item.id,
              title: item.title,
              category: item.category,
              publisher: item.publisher,
              url: item.url,
              readAt: nowIso,
              isInternalSlug: item.isInternalSlug,
            },
            ...prev.readingHistory.filter((h) => h.id !== item.id),
          ].slice(0, 40),
        };
        saveVisitorActivity(next);
        return next;
      });
    },
    []
  );

  const handleToggleSave = useCallback(
    (item: {
      id: string;
      title: string;
      category: string;
      publisher: string;
      url: string;
      publishedAt: string;
      isInternalSlug?: string;
    }) => {
      const nowIso = new Date().toISOString();
      setVisitorState((prev) => {
        const exists = prev.savedItems.some((s) => s.id === item.id);
        const savedItems = exists
          ? prev.savedItems.filter((s) => s.id !== item.id)
          : [
              {
                id: item.id,
                title: item.title,
                category: item.category,
                publisher: item.publisher,
                url: item.url,
                publishedAt: item.publishedAt,
                savedAt: nowIso,
                isInternalSlug: item.isInternalSlug,
              },
              ...prev.savedItems,
            ];
        const next = { ...prev, savedItems };
        saveVisitorActivity(next);
        return next;
      });
    },
    []
  );

  const handleUpdateVisitCheckpoint = useCallback(() => {
    const nowIso = new Date().toISOString();
    setVisitorState((prev) => {
      const next: VisitorActivityState = {
        ...prev,
        isReturningVisitor: true,
        previousVisitAt: nowIso,
        currentVisitAt: nowIso,
      };
      saveVisitorActivity(next);
      return next;
    });
  }, []);

  const handleClearLocalHistory = useCallback(() => {
    setVisitorState(clearVisitorActivity());
  }, []);

  const persistDrafts = (next: EditorialDraft[]) => {
    setDrafts(next);
    try {
      localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const handleSaveDraft = (draft: EditorialDraft) => {
    if (drafts.some((d) => d.sourceUrl === draft.sourceUrl)) return;
    persistDrafts([draft, ...drafts]);
  };

  const handleApproveDraft = (id: string) => {
    persistDrafts(
      drafts.map((d) => (d.id === id ? { ...d, status: 'approved-for-blogger' } : d))
    );
  };

  const handleRemoveDraft = (id: string) => {
    persistDrafts(drafts.filter((d) => d.id !== id));
  };

  const handleConnectBlog = async (url: string) => {
    setFeedLoading(true);
    setFeedError(null);
    try {
      const res = await fetchBloggerPosts(url, { maxResults: 12 });
      if (res.articles.length === 0) {
        setFeedError('Connected successfully, but no published posts were found in that feed.');
      } else {
        setArticles(res.articles);
        setConnectedBlogUrl(url);
        setConnectedBlogTitle(res.blogTitle);
      }
    } catch (err) {
      setFeedError(err instanceof Error ? err.message : 'Unable to connect Blogger feed.');
    } finally {
      setFeedLoading(false);
    }
  };

  const handleResetFeed = () => {
    setArticles(EVERGREEN_ARTICLES);
    setConnectedBlogUrl('');
    setConnectedBlogTitle(null);
    setFeedError(null);
  };

  const activeArticle =
    route.view === 'article' ? getArticleBySlug(route.slug, articles) || articles[0] : null;

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to main content
      </a>

      <Header
        currentRoute={route}
        onNavigate={navigate}
        onOpenSearch={() => setSearchOpen(true)}
      />

      <main id="main-content" className="flex-1">
        <Suspense
          fallback={
            <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-16 text-sm text-slate-500">
              Loading section…
            </div>
          }
        >
        {route.view === 'home' && (
          <HomePage
            articles={articles}
            liveBlogTitle={connectedBlogTitle}
            useUtc={useUtc}
            onToggleUtc={setUseUtc}
            newsData={newsData}
            newsLoading={newsLoading}
            newsError={newsError}
            autoRefreshMinutes={autoRefreshMinutes}
            onChangeAutoRefresh={setAutoRefreshMinutes}
            onRefreshNews={() => void loadNews(true)}
            trendsData={trendsData}
            selectedTrendGeo={selectedTrendGeo}
            trendsLoading={trendsLoading}
            onSelectTrendGeo={setSelectedTrendGeo}
            onRefreshTrends={() => void loadTrends(selectedTrendGeo, true)}
            briefingData={briefingData}
            briefingHistory={briefingHistory}
            briefingLoading={briefingLoading}
            briefingCountryPref={briefingCountryPref}
            briefingCategoryPref={briefingCategoryPref}
            briefingCountPref={briefingCountPref}
            onChangeBriefingCountry={setBriefingCountryPref}
            onChangeBriefingCategory={setBriefingCategoryPref}
            onChangeBriefingCount={setBriefingCountPref}
            onGenerateBriefing={() => void handleGenerateBriefing()}
            onSelectBriefingHistory={setBriefingData}
            onClearBriefingHistory={handleClearBriefingHistory}
            onSaveDraft={handleSaveDraft}
            savedDraftUrls={drafts.map((d) => d.sourceUrl)}
            visitorState={visitorState}
            onMarkRead={handleMarkRead}
            onToggleSave={handleToggleSave}
            onClearLocalHistory={handleClearLocalHistory}
            onUpdateVisitCheckpoint={handleUpdateVisitCheckpoint}
            onNavigate={navigate}
          />
        )}

        {route.view === 'briefing' && (
          <div>
            <LiveWorldClock useUtc={useUtc} onToggleUtc={setUseUtc} />
            <WorldIn60SecondsFeature
              mode="page"
              briefing={briefingData}
              history={briefingHistory}
              loading={briefingLoading}
              useUtc={useUtc}
              countryPref={briefingCountryPref}
              categoryPref={briefingCategoryPref}
              countPref={briefingCountPref}
              onChangeCountry={setBriefingCountryPref}
              onChangeCategory={setBriefingCategoryPref}
              onChangeCount={setBriefingCountPref}
              onGenerate={() => void handleGenerateBriefing()}
              onSelectHistoryItem={setBriefingData}
              onClearHistory={handleClearBriefingHistory}
              onSaveDraft={handleSaveDraft}
              savedDraftUrls={drafts.map((d) => d.sourceUrl)}
              onNavigate={navigate}
            />
          </div>
        )}

        {route.view === 'trend-battle' && (
          <div>
            <LiveWorldClock useUtc={useUtc} onToggleUtc={setUseUtc} />
            <TrendBattleFeature mode="page" useUtc={useUtc} onNavigate={navigate} />
          </div>
        )}

        {route.view === 'whats-new' && (
          <div>
            <LiveWorldClock useUtc={useUtc} onToggleUtc={setUseUtc} />
            <WhatsNewFeature
              mode="page"
              visitorState={visitorState}
              liveNews={newsData?.items ?? []}
              articles={articles}
              trends={trendsData?.trends ?? []}
              useUtc={useUtc}
              onMarkRead={handleMarkRead}
              onToggleSave={handleToggleSave}
              onClearLocalHistory={handleClearLocalHistory}
              onUpdateVisitCheckpoint={handleUpdateVisitCheckpoint}
              onNavigate={navigate}
            />
          </div>
        )}

        {route.view === 'careers' && (
          <CareersPortal
            activeTab={route.tab}
            initialToolId={route.toolId}
            onNavigate={navigate}
          />
        )}

        {route.view === 'news-center' && (
          <div>
            <LiveWorldClock useUtc={useUtc} onToggleUtc={setUseUtc} />
            <NewsCenterSection
              data={newsData}
              loading={newsLoading}
              error={newsError}
              useUtc={useUtc}
              autoRefreshMinutes={autoRefreshMinutes}
              onChangeAutoRefresh={setAutoRefreshMinutes}
              onManualRefresh={() => void loadNews(true)}
            />
            <TrendsRadar
              data={trendsData}
              selectedGeo={selectedTrendGeo}
              loading={trendsLoading}
              useUtc={useUtc}
              onSelectGeo={setSelectedTrendGeo}
              onRefresh={() => void loadTrends(selectedTrendGeo, true)}
            />
          </div>
        )}

        {route.view === 'ai-center' && (
          <div>
            <LiveWorldClock useUtc={useUtc} onToggleUtc={setUseUtc} />
            <AIIntelligenceCenter
              newsItems={newsData?.items ?? []}
              articles={articles}
              useUtc={useUtc}
              onNavigate={navigate}
            />
          </div>
        )}

        {route.view === 'article' && activeArticle && (
          <ArticlePage
            article={activeArticle}
            allArticles={articles}
            onNavigate={navigate}
          />
        )}

        {route.view === 'category' && (
          <CategoryPage
            slug={route.slug}
            articles={articles}
            onNavigate={navigate}
          />
        )}

        {route.view === 'tools' && (
          <ToolsHub
            activeTool={route.toolId || 'word-counter'}
            onSelectTool={(toolId) => navigate({ view: 'tools', toolId })}
            onNavigate={navigate}
          />
        )}

        {route.view === 'blogger-hub' && (
          <BloggerThemeHub
            connectedBlogUrl={connectedBlogUrl}
            connectedBlogTitle={connectedBlogTitle}
            feedLoading={feedLoading}
            feedError={feedError}
            drafts={drafts}
            onApproveDraft={handleApproveDraft}
            onRemoveDraft={handleRemoveDraft}
            onConnectBlog={handleConnectBlog}
            onResetFeed={handleResetFeed}
            onNavigate={navigate}
          />
        )}

        {route.view === 'policy' && (
          <PolicyPages
            pageId={route.pageId}
            onNavigate={navigate}
          />
        )}
        </Suspense>
      </main>

      <Footer onNavigate={navigate} />

      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        articles={articles}
        liveNews={newsData?.items ?? []}
        trends={trendsData?.trends ?? []}
        onNavigate={navigate}
      />

      <ConsentBanner onNavigate={navigate} />
    </div>
  );
}
