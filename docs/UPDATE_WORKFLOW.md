# TRENDVERSE — GitHub & Blogger Update Workflow

This guide explains how future feature, styling, SEO, or content updates map between **AI Studio**, **GitHub**, and **Google Blogger / Blogspot**.

---

## 1. Change Impact Matrix

| What You Changed | Files Modified | Where to Redeploy |
| :--- | :--- | :--- |
| **Blogger layout, header nav, footer, Schema JSON-LD, 404 page, AdSense containers** | `blogger/trendverse-theme.xml` | Commit to GitHub **+** Paste/Upload XML into **Blogger → Theme → Edit HTML** |
| **External Blogger CSS / JS assets** (if linked via jsDelivr CDN) | `blogger/trendverse-theme.css`, `blogger/trendverse-app.js` | Push to GitHub (purge/tag release for CDN cache refresh) |
| **New article or Briefing draft approved by human editor** | Draft exported from **Blogger Theme → Draft Queue** | Paste HTML into **Blogger → Posts → New Post**, add exact Labels & Search Description, click **Publish** |
| **Newsroom, Careers 1.0, Trend Battle, 60s Briefing, Free Tools web app** | `src/*`, `server/*`, `server.ts` | Commit to GitHub **+** Redeploy free Node host (Render / Railway / Fly.io / Cloud Run) |
| **Static institutional pages** (About, Contact, Privacy, Terms, Disclaimer, Editorial Policy) | `src/data/workflowAndPolicies.ts` | Redeploy Node web app **+** Update corresponding Blogger page under **Blogger → Pages** |

---

## 2. Safe Release Checklist (Every Blogger Theme Update)

1. **Run Local Verification First:**
   ```bash
   npm run lint
   npm run build
   ```
2. **Back Up Blogger Before Editing:**
   - Open **Blogger → Theme → Customize dropdown → Backup** and download the current XML file with today's date (`trendverse-backup-YYYY-MM-DD.xml`).
3. **Commit & Tag in GitHub:**
   ```bash
   git add .
   git commit -m "Describe update clearly"
   git push origin main
   ```
4. **Apply Updated XML in Blogger:**
   - Open **Blogger → Theme → Customize dropdown → Edit HTML** (or **Restore**).
   - Replace with `/blogger/trendverse-theme.xml` and click **Save** (confirm zero XML parse errors).
5. **Post-Deploy Verification:**
   - Check homepage, one article page, `/search?q=ai`, `/search/label/World`, and a non-existent URL (`/non-existent-check`) to verify custom 404 rendering.
   - Verify canonical & JSON-LD via **Google Rich Results Test** (`https://search.google.com/test/rich-results`).
   - Run **PageSpeed Insights** on Mobile and Desktop (`https://pagespeed.web.dev/`).

---

## 3. Syncing Embedded vs External CSS/JS Assets

- By default, `blogger/trendverse-theme.xml` embeds full CSS inside `<b:skin>` and JS inside `<script>` so a single XML upload works immediately with zero external dependency failures.
- If you later move CSS/JS to GitHub CDN (`jsDelivr`), keep `blogger/trendverse-theme.css` and `blogger/trendverse-app.js` updated in GitHub and tag releases (e.g. `@v2.1.0`) rather than relying on uncached `@main` URLs.
