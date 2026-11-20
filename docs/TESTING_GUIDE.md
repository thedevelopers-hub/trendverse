# TRENDVERSE Testing & Verification Guide

## 1. Web App Functional Verification
- **Navigation & Routing**: Verify header links, mobile menu drawer, breadcrumbs, category archive filters, pagination, and footer policy links (including **About Us**, **Editorial Policy**, and **Founder: Vicky** credits).
- **Search**: Search by keyword (e.g., `infrared`, `inflation`, `streaming`) and verify instant article + tool results.
- **Article Experience**: Open any article and test Table of Contents anchor jumping, Copy Link button, Social Share links, Publisher/Founder byline (`TRENDVERSE Editorial Team · Founded by Vicky`), and Related Articles navigation.
- **Free Tools**:
  - **Word Counter**: Paste multi-paragraph text and check word, sentence, paragraph, and reading time accuracy.
  - **Percentage Calculator**: Test all 3 modes (`X% of Y`, `X is what % of Y`, `% change`) including zero-division handling.
  - **Age Calculator**: Enter a past birth date and verify exact years/months/days plus future-date validation.
  - **Unit Converter**: Test Length, Mass, Temperature (`0°C = 32°F`), Data Storage, and Speed.
  - **Text Case Converter**: Verify all 7 case transformations (`UPPER`, `lower`, `Title`, `Sentence`, `camelCase`, `snake_case`, `kebab-case`).
  - **Character Counter**: Check UTF-8 byte count and SEO Title/Meta Description length indicators.
- **Your World in 60 Seconds (`#briefing`)**:
  - Select country/category preferences and generate/refresh briefing via `POST /api/briefing`.
  - Verify 5–10 grounded developments with "Why this matters", original publisher links, and publication timestamps.
  - Test browser Text-to-Speech Play, Pause, Resume, Stop, Voice selector, Speed (`0.85x`–`1.5x`), and daily briefing history tabs.
- **Trend Battle (`#trend-battle`)**:
  - Test preset matchups (`ChatGPT vs Gemini`, `iPhone vs Samsung`, `AI vs Robotics`, `Netflix vs Amazon Prime`) and custom Topic A vs Topic B queries across `7d`, `30d`, `90d` and regional selectors.
  - Verify `GET /api/trend-battle` returns normalized `0–100` Relative Interest Index, interactive SVG chart tooltips, related/rising queries, honest Google Trends restriction attribution, and Share link copy.
- **What's New Since Your Last Visit (`#whats-new`)**:
  - Confirm first-visit welcome experience vs returning-visit `"Welcome Back! Here's What's New."` banner and `noindex, follow` robots meta.
  - Test unread/read/saved/history tabs, category filters, **Mark Read**, **Save**, **Mark Caught Up Now**, and **Clear Local History**.
- **TRENDVERSE CAREERS 1.0 (`/careers/*`)**:
  - Verify all 8 URL routes (`/careers`, `/careers/jobs`, `/careers/internships`, `/careers/remote`, `/careers/fresher`, `/careers/scholarships`, `/careers/government`, `/careers/tools`) resolve directly and update canonical URLs + breadcrumbs cleanly without emitting `JobPosting` schema on third-party jobs.
  - Verify `/api/careers/opportunities`, `/api/careers/scholarships`, `/api/careers/government`, `/api/careers/student-resources`, and `/api/careers/ai-assist`.
  - Test search, Country/City/Employment/Work Mode/Experience/`24h`–`30d` filters, sorting, explicit-consent **Use My Location**, **Save**, **Report**, Provider Freshness Telemetry, and all 10 Career Tools (including Resume Builder, ATS Checker, Salary Calculator, Hourly-to-Monthly, Job/Internship Trackers).

## 2. Blogger XML Theme Verification
1. Validate XML well-formedness using an XML validator (`fast-xml-parser`) and via **Blogger → Theme → Edit HTML**.
2. Verify `blogger/trendverse-app.js` parses cleanly (`node --check blogger/trendverse-app.js`).
3. Test responsive breakpoints at `375px` (mobile), `768px` (tablet), and `1440px` (desktop).
4. Inspect `<head>` output for single canonical URL, Open Graph tags, `noindex, follow` on `/search` / archive / `404` (`error_page`), `index, follow` on homepage/posts, and valid JSON-LD (`Organization`, `Person` Vicky, `WebSite`, `WebPage`, `Article`, `BreadcrumbList`) via **Google Rich Results Test**.

## 3. Performance & Accessibility Audits
- Run **Lighthouse** (Mobile & Desktop) verifying Performance, Accessibility (`WCAG AA`), Best Practices, and SEO scores.
- Confirm keyboard-only navigation (`Tab`, `Enter`, `Escape`) works across header, search modal, mobile drawer, and tool tabs.
