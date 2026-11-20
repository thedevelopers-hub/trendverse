# TRENDVERSE — Global Digital Media, Careers & Blogger Platform

**Tagline:** *Discover What's Next.*  
**Founder & Developer:** *Vicky*  
**Publisher:** *TRENDVERSE Editorial Team*  
**Publishing Platform:** Google Blogger / Blogspot · **Source Control:** GitHub

TRENDVERSE combines a live international digital newsroom, AI-assisted daily briefing (`Your World in 60 Seconds`), search-interest comparison (`Trend Battle`), returning-reader digest (`What's New Since Your Last Visit`), `TRENDVERSE CAREERS 1.0`, browser-local utilities, and a production-ready Blogger XML theme & documentation suite—all built on **100% free-tier and open interfaces**.

---

## 1. Architecture Overview

```
+-------------------------------------------------------------------+
|  Full-Stack Express Server (server.ts, Port 3000)                 |
|  - GET  /api/news          (Multi-source RSS + Deduplication)     |
|  - GET  /api/trends        (Google Trends RSS across 10 regions)  |
|  - GET  /api/trend-battle  (Wikimedia Pageviews + Google Suggest  |
|                             + Live Trends RSS topic comparison)   |
|  - POST /api/briefing      (Server-side @google/genai 60s digest  |
|                             with country, category & count prefs) |
|  - GET  /api/careers/opportunities (Free jobs: Himalayas, Remotive |
|                             Arbeitnow, Jobicy, Greenhouse, Lever) |
|  - GET  /api/careers/scholarships  (NSF, UKRI, Scholars4Dev + Dir)  |
|  - GET  /api/careers/government    (US FedReg, UK GOV.UK + Portals)|
|  - POST /api/careers/ai-assist     (Optional free Gemini career aid)|
|  - GET  /api/integrations/status                                  |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|  TRENDVERSE Frontend (React + TypeScript + Tailwind CSS v4)       |
|  - TRENDVERSE CAREERS 1.0 (/careers, /jobs, /internships, /remote |
|    /fresher, /scholarships, /government, /tools + Safety Monitor) |
|  - Your World in 60 Seconds (AI Briefing + Web Speech TTS Audio   |
|    + Country/Category Preferences + Daily Briefing History)       |
|  - Trend Battle (Interactive Dual-Line SVG Comparison Chart +     |
|    Related & Rising Queries + Shareable Links)                    |
|  - What's New Since Your Last Visit (Privacy-first localStorage   |
|    Return Digest + Read/Unread/Saved Filters + Reading History)   |
|  - Live World Clock (8 IANA DST-aware cities + Local/UTC toggle)  |
|  - Breaking Ticker (<6h eligibility) & 10-Category News Center    |
|  - Google Trends Radar & Interactive Global News Map              |
|  - AI Intelligence Center (News, 7-Cat Tools, Model Comparison)   |
|  - Human-Approved Draft Queue & Live Blogger JSONP Integration    |
|  - 6 Browser-Local Free Tools & AdSense-Compliant Policy Pages    |
+-------------------------------------------------------------------+
```

## 2. Project Folder Structure

```
trendverse/
├── server.ts                            # Express + Vite server (dev & production)
├── server/
│   ├── types.ts                         # Shared news, trends, briefing, battle & careers contracts
│   └── services/
│       ├── rssNewsAdapter.ts            # BBC, NPR, Hindu, NASA, Google AI, MIT AI, UN Climate
│       ├── googleTrendsAdapter.ts       # Official Google Trends public RSS adapter
│       ├── trendBattleAdapter.ts        # Wikimedia Pageviews + Suggest + Trends RSS battle engine
│       ├── geminiBriefingAdapter.ts     # Server-side Gemini Daily Briefing adapter
│       └── careers/
│           ├── safetyScanner.ts         # Anti-scam scanner, dedupe, remote scope & classifier
│           ├── jobProvidersAdapter.ts   # Himalayas, Remotive (6h), Arbeitnow, Jobicy, GH & Lever
│           ├── scholarshipsAndGovAdapter.ts # NSF, UKRI, Scholars4Dev, FedReg, GOV.UK + Portals
│           └── careerAiAssistAdapter.ts # Optional server-side Gemini Career Assist
├── blogger/
│   ├── trendverse-theme.xml             # Production Blogger XML theme (Search, 404, Schema, Widgets)
│   ├── trendverse-theme.css             # External/GitHub CDN CSS3 stylesheet
│   └── trendverse-app.js                # Standalone vanilla JS (Nav, TOC, JSONP Related, Share)
├── docs/
│   ├── FOUNDER_AND_BRANDING.md          # Official brand, Vicky founder profile & attribution rules
│   ├── BLOGGER_SETUP.md                 # Complete Step A–J Blogger & domain setup guide
│   ├── UPDATE_WORKFLOW.md               # GitHub + Blogger future update & rollback workflow
│   ├── SEO_GUIDE.md                     # International English SEO, GSC, Bing, Sitemaps & Schema
│   ├── ADSENSE_CHECKLIST.md             # Policy pages, CLS-safe containers & honest disclaimers
│   ├── TESTING_GUIDE.md                 # Functional, XML, Schema & Lighthouse QA steps
│   ├── CAREERS_ARCHITECTURE.md          # TRENDVERSE CAREERS 1.0 routes & API architecture
│   ├── DATA_SOURCES_ATTRIBUTION.md      # Attribution, caching rules & honest limitations
│   ├── PRIVACY_AND_SAFETY.md            # Zero-PII localStorage & student safety checks
│   ├── FREE_DEPLOYMENT_GUIDE.md         # Free-tier hosting & Blogger setup
│   └── INTEGRATIONS.md                  # Modular adapter & API configuration guide
├── public/robots.txt
└── src/
```

## 3. Running & Verifying Locally

```bash
npm install
npm run dev     # Starts Express + Vite server on port 3000
npm run lint    # TypeScript verification (tsc --noEmit)
npm run build   # Builds production client bundle into dist/
```

### Environment Variables (`.env` / Secrets)
- `GEMINI_API_KEY`: Optional server-side secret for **AI Daily Global Briefing** (`POST /api/briefing`) and **Career AI Assist** (`POST /api/careers/ai-assist`). Never expose in client code. When absent, the newsroom and careers portal operate normally without paid APIs.
