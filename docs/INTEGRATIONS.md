# TRENDVERSE 2.0 Modular Integrations & Configuration Guide

TRENDVERSE 2.0 separates every external data source into an isolated service adapter so the platform remains reliable even when an upstream API or key is unavailable.

## 1. Active Backend Service Adapters (`server/services/`)

| Adapter | Endpoint / Source | Auth Required | Fallback Behavior |
| :--- | :--- | :--- | :--- |
| `rssNewsAdapter.ts` | BBC News (World, India, Tech, Business, Science, Entertainment), NPR, The Hindu, NASA, Google AI Blog, MIT AI News, UN Climate | None (Public RSS) | Serves per-source cached verified items; reports `status: cached` or `error` per source. |
| `googleTrendsAdapter.ts` | Official Google Trends Public RSS (`https://trends.google.com/trending/rss?geo=...`) for 10 regions | None (Public RSS) | Serves regional cache or explicit unavailable message; never invents search volume. |
| `geminiBriefingAdapter.ts` | `@google/genai` (`gemini-4-hydrogen`) via `POST /api/briefing` with `country`, `category`, and `count` (5–10) preferences | `GEMINI_API_KEY` (server-side secret) | Returns `aiAvailable: false` with clear setup guidance when unconfigured; strictly grounded in verified RSS articles with source URLs and original timestamps. |
| `trendBattleAdapter.ts` | Official Wikimedia Pageviews REST API + Wikipedia Search + Google Public Suggest API + Live Google Trends RSS (`GET /api/trend-battle`) | None (Public APIs) | Explicitly normalizes reader interest to a `0–100` Relative Interest Index (never raw search volume); avoids Google Trends multiline HTTP 429 scraping and surfaces direct Explore links and honest unavailable notices if an entity cannot be resolved. |
| `bloggerFeed.ts` | Public Blogger JSON-in-Script (`/feeds/posts/default?alt=json-in-script`) | None | Built-in evergreen explainer library remains active when no custom Blogspot URL is connected. |

## 2. Browser-Local Interactive Capabilities (Zero Backend Tracking)
- **Browser Text-to-Speech (`Your World in 60 Seconds`)**: Uses standard `window.speechSynthesis` for Play, Pause, Resume, Stop, voice selection, and playback rate (`0.85x`–`1.5x`) synchronized with active bullet highlighting. Daily briefings are cached locally in `localStorage` (`trendverse_briefing_history_v1`).
- **Privacy-First Returning Visitor Digest (`What's New Since Your Last Visit`)**: Stores only anonymous article read IDs, saved slugs, session visit timestamps, and reading history in browser `localStorage` (`trendverse_visitor_activity_v1`). No PII or cross-site trackers are ever transmitted; users can wipe all local data at any time via **Clear Local History**.

## 3. Optional Future & Licensed Extensions
- **Reuters / Associated Press**: Neither publisher provides unrestricted public unauthenticated RSS feeds. Add licensed API credentials on the server (`server/services/`) rather than scraping.
- **NASA Open APIs (APOD / Mars Rover)**: Currently NASA Breaking News RSS runs without a key. For additional NASA REST endpoints, configure `NASA_API_KEY` on the server.
- **Google Search Console & Analytics (GA4)**: Add your verification meta tag and GA4 measurement ID directly in Blogger **Settings** or `index.html` after domain deployment.
