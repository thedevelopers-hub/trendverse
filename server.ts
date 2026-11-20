import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { getLiveNews, PUBLIC_NEWS_SOURCES } from './server/services/rssNewsAdapter.js';
import { getGoogleTrends, TREND_GEO_OPTIONS } from './server/services/googleTrendsAdapter.js';
import {
  generateDailyGlobalBriefing,
  isGeminiConfigured,
} from './server/services/geminiBriefingAdapter.js';
import { runTrendBattleComparison } from './server/services/trendBattleAdapter.js';
import { getAllCareerJobs } from './server/services/careers/jobProvidersAdapter.js';
import {
  getGovernmentRecruitmentData,
  getLiveScholarshipFeeds,
  STUDENT_CERTIFICATIONS_AND_COMPETITIONS,
} from './server/services/careers/scholarshipsAndGovAdapter.js';
import { runCareerAiAssist } from './server/services/careers/careerAiAssistAdapter.js';
import { CareerAiAssistRequest, TrendBattleRange, TrendGeoCode } from './server/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json({ limit: '1mb' }));

  // 1. Live Global News Center API
  app.get('/api/news', async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === '1' || req.query.refresh === 'true';
      const categoryFilter = typeof req.query.category === 'string' ? req.query.category : '';
      const countryFilter = typeof req.query.country === 'string' ? req.query.country : '';
      const queryFilter = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';

      const data = await getLiveNews(forceRefresh);
      let items = data.items;

      if (categoryFilter && categoryFilter !== 'All') {
        if (categoryFilter === 'Breaking Developments') {
          items = items.filter((item) => item.isBreakingEligible);
        } else {
          items = items.filter((item) => item.category === categoryFilter);
        }
      }

      if (countryFilter && countryFilter !== 'All') {
        items = items.filter(
          (item) => item.countryTag.toLowerCase() === countryFilter.toLowerCase()
        );
      }

      if (queryFilter) {
        items = items.filter(
          (item) =>
            item.title.toLowerCase().includes(queryFilter) ||
            item.summary.toLowerCase().includes(queryFilter) ||
            item.publisher.toLowerCase().includes(queryFilter)
        );
      }

      res.json({
        ...data,
        items,
      });
    } catch (err) {
      res.status(500).json({
        items: [],
        sources: [],
        lastSuccessfulRefresh: null,
        duplicatesRemoved: 0,
        status: 'unavailable',
        errorMessage: err instanceof Error ? err.message : 'Unable to fetch news feeds.',
      });
    }
  });

  // 2. Google Trends Radar API
  app.get('/api/trends', async (req, res) => {
    try {
      const geo = (typeof req.query.geo === 'string' ? req.query.geo.toUpperCase() : 'WORLD') as TrendGeoCode;
      const forceRefresh = req.query.refresh === '1' || req.query.refresh === 'true';
      const result = await getGoogleTrends(geo, forceRefresh);
      res.json(result);
    } catch (err) {
      res.status(500).json({
        geo: 'WORLD',
        geoName: 'Worldwide',
        sourceName: 'Google Trends Official RSS',
        sourceUrl: 'https://trends.google.com/trending',
        lastUpdated: null,
        status: 'unavailable',
        note: 'Trend service error.',
        errorMessage: err instanceof Error ? err.message : 'Trends error',
        trends: [],
      });
    }
  });

  // 2b. Trend Battle Comparison API
  app.get('/api/trend-battle', async (req, res) => {
    const topicA = typeof req.query.topicA === 'string' ? req.query.topicA.trim() : '';
    const topicB = typeof req.query.topicB === 'string' ? req.query.topicB.trim() : '';
    const geo = (typeof req.query.geo === 'string' ? req.query.geo.toUpperCase() : 'WORLD') as TrendGeoCode;
    const range = (typeof req.query.range === 'string' ? req.query.range : '30d') as TrendBattleRange;

    if (!topicA || !topicB) {
      res.status(400).json({
        status: 'unavailable',
        errorMessage: 'Both Topic A and Topic B are required for comparison.',
      });
      return;
    }

    try {
      const result = await runTrendBattleComparison(topicA, topicB, geo, range);
      res.json(result);
    } catch (err) {
      res.status(500).json({
        status: 'unavailable',
        errorMessage: err instanceof Error ? err.message : 'Trend comparison failed.',
      });
    }
  });

  // 3. AI Daily Global Briefing ("Your World in 60 Seconds") API (Server-Side Gemini)
  app.post('/api/briefing', async (req, res) => {
    try {
      const forceRefresh = Boolean(req.body?.refreshNews);
      const country = typeof req.body?.country === 'string' ? req.body.country : 'All Countries';
      const category = typeof req.body?.category === 'string' ? req.body.category : 'All Categories';
      const count = typeof req.body?.count === 'number' ? req.body.count : 7;

      const newsData = await getLiveNews(forceRefresh);
      const briefing = await generateDailyGlobalBriefing(newsData.items, {
        country,
        category,
        count,
      });
      if (!briefing.aiAvailable) {
        res.status(503).json(briefing);
        return;
      }
      res.json(briefing);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gemini briefing generation failed.';
      res.status(500).json({
        id: `briefing-err-${Date.now()}`,
        aiAvailable: isGeminiConfigured(),
        label: 'AI-Generated Summary',
        briefingDate: new Date().toISOString().slice(0, 10),
        generatedAt: new Date().toISOString(),
        modelName: 'gemini-4-hydrogen',
        countryPreference: 'All Countries',
        categoryPreference: 'All Categories',
        overview: '',
        stories: [],
        errorMessage: message,
      });
    }
  });

  // 4. Modular Integration Health Status
  app.get('/api/integrations/status', (_req, res) => {
    res.json({
      geminiServerConfigured: isGeminiConfigured(),
      rssFeedCount: PUBLIC_NEWS_SOURCES.length,
      trendRegionsCount: TREND_GEO_OPTIONS.length,
      nasaFeedActive: PUBLIC_NEWS_SOURCES.some((s) => s.id === 'nasa-news'),
      bloggerFeedMode: 'Public JSON-in-Script (No API Key Required)',
      careersProvidersCount: 11,
      careersPaidApisRequired: false,
    });
  });

  // ============================================================
  // 5. TRENDVERSE CAREERS 1.0 APIs (100% Free Public Integrations)
  // ============================================================

  app.get('/api/careers/opportunities', async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === '1' || req.query.refresh === 'true';
      const q = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : '';
      const country = typeof req.query.country === 'string' ? req.query.country.trim() : '';
      const city = typeof req.query.city === 'string' ? req.query.city.trim().toLowerCase() : '';
      const employmentType =
        typeof req.query.employmentType === 'string' ? req.query.employmentType.trim() : '';
      const workMode = typeof req.query.workMode === 'string' ? req.query.workMode.trim() : '';
      const experience =
        typeof req.query.experience === 'string' ? req.query.experience.trim() : '';
      const postedWithin =
        typeof req.query.postedWithin === 'string' ? req.query.postedWithin.trim() : '';
      const salaryMin = Number(req.query.salaryMin || 0);
      const salaryOnly = req.query.salaryOnly === '1' || req.query.salaryOnly === 'true';
      const sort = typeof req.query.sort === 'string' ? req.query.sort.trim() : 'newest';

      const [jobsData, schData, govData] = await Promise.all([
        getAllCareerJobs(forceRefresh),
        getLiveScholarshipFeeds(false),
        getGovernmentRecruitmentData(false),
      ]);

      const allProviders = [...jobsData.providers, ...schData.providers, ...govData.providers];
      let filtered = [...jobsData.items];

      if (q) {
        filtered = filtered.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.company.toLowerCase().includes(q) ||
            item.summary.toLowerCase().includes(q) ||
            item.skills.some((s) => s.toLowerCase().includes(q)) ||
            item.location.toLowerCase().includes(q)
        );
      }

      if (country && country !== 'All' && country !== 'Worldwide') {
        filtered = filtered.filter(
          (item) =>
            item.country.toLowerCase() === country.toLowerCase() ||
            item.location.toLowerCase().includes(country.toLowerCase()) ||
            item.remoteScope.toLowerCase().includes(country.toLowerCase()) ||
            item.remoteScope.toLowerCase().includes('worldwide')
        );
      } else if (country === 'Worldwide') {
        filtered = filtered.filter(
          (item) =>
            item.country === 'Worldwide' ||
            item.remoteScope.toLowerCase().includes('worldwide')
        );
      }

      if (city) {
        filtered = filtered.filter(
          (item) =>
            item.city.toLowerCase().includes(city) ||
            item.location.toLowerCase().includes(city)
        );
      }

      if (employmentType && employmentType !== 'All') {
        filtered = filtered.filter((item) => item.employmentType === employmentType);
      }

      if (workMode && workMode !== 'All') {
        filtered = filtered.filter((item) => item.workMode === workMode);
      }

      if (experience && experience !== 'All') {
        filtered = filtered.filter((item) => item.experienceLevel === experience);
      }

      if (postedWithin && postedWithin !== 'all') {
        const hoursMap: Record<string, number> = {
          '24h': 24,
          '3d': 72,
          '7d': 168,
          '30d': 720,
        };
        const hours = hoursMap[postedWithin];
        if (hours) {
          const cutoff = Date.now() - hours * 60 * 60 * 1000;
          filtered = filtered.filter((item) => Date.parse(item.postedAt) >= cutoff);
        }
      }

      if (salaryOnly) {
        filtered = filtered.filter((item) => Boolean(item.salaryText));
      }

      if (!Number.isNaN(salaryMin) && salaryMin > 0) {
        filtered = filtered.filter(
          (item) => item.salaryMinAnnualUsd !== undefined && item.salaryMinAnnualUsd >= salaryMin
        );
      }

      if (sort === 'salary-desc') {
        filtered.sort(
          (a, b) => (b.salaryMinAnnualUsd ?? -1) - (a.salaryMinAnnualUsd ?? -1)
        );
      } else if (sort === 'salary-asc') {
        filtered.sort((a, b) => {
          const aVal = a.salaryMinAnnualUsd ?? Number.MAX_SAFE_INTEGER;
          const bVal = b.salaryMinAnnualUsd ?? Number.MAX_SAFE_INTEGER;
          return aVal - bVal;
        });
      } else if (sort === 'relevant' && q) {
        filtered.sort((a, b) => {
          const aTitle = a.title.toLowerCase().includes(q) ? 2 : 0;
          const bTitle = b.title.toLowerCase().includes(q) ? 2 : 0;
          const aSkill = a.skills.some((s) => s.toLowerCase().includes(q)) ? 1 : 0;
          const bSkill = b.skills.some((s) => s.toLowerCase().includes(q)) ? 1 : 0;
          if (bTitle + bSkill !== aTitle + aSkill) return bTitle + bSkill - (aTitle + aSkill);
          return Date.parse(b.postedAt) - Date.parse(a.postedAt);
        });
      } else {
        filtered.sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt));
      }

      res.json({
        ...jobsData,
        items: filtered,
        totalMatched: filtered.length,
        providers: allProviders,
      });
    } catch (err) {
      res.status(500).json({
        items: [],
        totalMatched: 0,
        providers: [],
        trendingSkills: [],
        metrics: {
          totalRawFetched: 0,
          duplicatesRemoved: 0,
          expiredFiltered: 0,
          brokenLinksFiltered: 0,
          suspiciousFlagged: 0,
          missingSalaryCount: 0,
        },
        lastUpdated: new Date().toISOString(),
        status: 'unavailable',
        errorMessage: err instanceof Error ? err.message : 'Unable to load career opportunities.',
      });
    }
  });

  app.get('/api/careers/scholarships', async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === '1' || req.query.refresh === 'true';
      const country = typeof req.query.country === 'string' ? req.query.country.trim() : '';
      const data = await getLiveScholarshipFeeds(forceRefresh);

      const directory =
        country && country !== 'All' && country !== 'Worldwide'
          ? data.directory.filter(
              (d) =>
                d.country.toLowerCase() === country.toLowerCase() ||
                d.country === 'Worldwide'
            )
          : data.directory;

      res.json({
        ...data,
        directory,
        lastUpdated: new Date().toISOString(),
      });
    } catch (err) {
      res.status(500).json({
        items: [],
        providers: [],
        directory: [],
        errorMessage: err instanceof Error ? err.message : 'Unable to fetch scholarship feeds.',
      });
    }
  });

  app.get('/api/careers/government', async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === '1' || req.query.refresh === 'true';
      const country = typeof req.query.country === 'string' ? req.query.country.trim() : '';
      const data = await getGovernmentRecruitmentData(forceRefresh);

      const portals =
        country && country !== 'All' && country !== 'Worldwide'
          ? data.portals.filter((p) => p.country.toLowerCase() === country.toLowerCase())
          : data.portals;

      res.json({
        ...data,
        portals,
        lastUpdated: new Date().toISOString(),
      });
    } catch (err) {
      res.status(500).json({
        items: [],
        providers: [],
        portals: [],
        errorMessage: err instanceof Error ? err.message : 'Unable to load government recruitment data.',
      });
    }
  });

  app.get('/api/careers/student-resources', (_req, res) => {
    res.json({
      programs: STUDENT_CERTIFICATIONS_AND_COMPETITIONS,
      lastUpdated: new Date().toISOString(),
    });
  });

  app.post('/api/careers/ai-assist', async (req, res) => {
    try {
      const body = (req.body || {}) as Partial<CareerAiAssistRequest>;
      if (!body.mode || !body.text || !body.text.trim()) {
        res.status(400).json({
          aiAvailable: isGeminiConfigured(),
          mode: body.mode || 'resume-review',
          modelName: 'gemini-4-hydrogen',
          generatedAt: new Date().toISOString(),
          suggestions: [],
          disclaimer:
            'Provide your draft text and target role to request optional AI suggestions.',
          errorMessage: 'Input text is required.',
        });
        return;
      }

      const result = await runCareerAiAssist({
        mode: body.mode,
        targetRole: body.targetRole || 'Early Career / Student Candidate',
        company: body.company,
        experienceLevel: body.experienceLevel,
        text: body.text,
      });

      if (!result.aiAvailable) {
        res.status(503).json(result);
        return;
      }
      res.json(result);
    } catch (err) {
      res.status(500).json({
        aiAvailable: isGeminiConfigured(),
        mode: 'resume-review',
        modelName: 'gemini-4-hydrogen',
        generatedAt: new Date().toISOString(),
        suggestions: [],
        disclaimer:
          'Browser-local tools remain available without AI assistance.',
        errorMessage: err instanceof Error ? err.message : 'Optional AI assistance temporarily unavailable.',
      });
    }
  });

  // Rewrite Blogger-style /p/*.html static page URLs cleanly to SPA shell when not a static file
  app.use((req, _res, next) => {
    if (req.method === 'GET' && /^\/p\/[a-z0-9-]+\.html$/i.test(req.path)) {
      req.url = '/index.html';
    }
    next();
  });

  // Vite Middleware in Development / Static Dist in Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TRENDVERSE 2.0 server listening on http://localhost:${PORT}`);
  });
}

startServer();
