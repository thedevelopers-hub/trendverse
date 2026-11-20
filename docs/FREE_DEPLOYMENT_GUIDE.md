# Free Deployment Instructions (TRENDVERSE 2.0 + CAREERS 1.0)

TRENDVERSE runs with zero paid infrastructure requirements:

## 1. Hosting Options (Free Tier Compatible)
Because the project uses a lightweight Express + Vite Node server (`server.ts` on Port `3000`) and browser `localStorage` instead of a paid database:
- **Cloud Run / Render / Railway / Fly.io Free Tier:**
  1. Build command: `npm install && npm run build`
  2. Start command: `NODE_ENV=production npm start` (executes `tsx server.ts`)
  3. Port: `3000` (reads `process.env.PORT || 3000`)
- **Optional Free-Tier Environment Variables:**
  - `GEMINI_API_KEY`: Optional server-side Google AI Studio free-tier key. Enables **Your World in 60 Seconds** and optional **Careers AI Assist** (`POST /api/careers/ai-assist`). If omitted, all news feeds, job feeds, scholarship directories, government portals, and all 16 browser-local tools work with zero errors.
  - Never expose `GEMINI_API_KEY` in client `VITE_*` variables.

## 2. Blogger (Blogspot) Companion Setup
- Upload `/blogger/trendverse-theme.xml` via **Blogger → Theme → Restore / Edit HTML** for your editorial publishing hub, and follow `/docs/BLOGGER_SETUP.md` to link live Blogspot posts into TRENDVERSE.
