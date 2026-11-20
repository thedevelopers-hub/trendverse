# TRENDVERSE — Complete Blogger (Blogspot) Setup Guide (Steps A–J)

**Brand:** `TRENDVERSE` · **Tagline:** `Discover What's Next.`  
**Founder & Developer:** `Vicky` · **Publisher:** `TRENDVERSE Editorial Team`

---

## Step A: Create & Configure Your Blogger Blog
1. Sign in to **Blogger** (`https://www.blogger.com`) with your Google account and click **New Blog**.
2. Set Title to **`TRENDVERSE`** and choose your Blogspot address (e.g., `trendverse-global.blogspot.com`).
3. Open **Settings → Basic**:
   - Set **Description** to: `Discover What's Next. Independent global platform covering technology, world news, AI, careers, scholarships, and free utilities.`
   - Enable **Visible to search engines** (`ON`).
4. Open **Settings → HTTPS** and enable **HTTPS availability** and **HTTPS redirect**.
5. Open **Settings → Formatting** and set **Time zone** cleanly (UTC or your primary editorial hub).

---

## Step B: Install the Production XML Theme
1. Back up your starter theme first (see Step G).
2. Go to **Theme → Customize dropdown → Edit HTML** (or **Restore → Upload**).
3. Paste or upload the full contents of `/blogger/trendverse-theme.xml` and click **Save**.
4. Go to **Theme → Customize dropdown → Mobile Settings**, select **Desktop**, and save (the TRENDVERSE theme is natively responsive and must not load Blogger's legacy mobile wrapper).
5. In **Layout**, confirm native widgets (`Header/Ad slots`, `Blog1`, `Label1`, `PopularPosts1`, `BlogArchive1`, `HTML1`) appear cleanly without overlap.

---

## Step C: Upload or Serve External Assets (`trendverse-theme.css` & `trendverse-app.js`)
`blogger/trendverse-theme.xml` includes complete embedded CSS (`<b:skin>`) and vanilla JS (`<script>`) so your Blogger site works immediately with zero external asset failures.

If you prefer serving `blogger/trendverse-theme.css` and `blogger/trendverse-app.js` externally for CDN versioning:
1. Push your repository to **GitHub** (Step D).
2. Create a version tag (for example `v2.1.0`) in GitHub Releases.
3. Reference the pinned **jsDelivr** CDN URLs in `<head>` / before `</body>`:
   - `https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USER/trendverse@v2.1.0/blogger/trendverse-theme.css`
   - `https://cdn.jsdelivr.net/gh/YOUR_GITHUB_USER/trendverse@v2.1.0/blogger/trendverse-app.js`
4. Keep the embedded `<b:skin>` fallback clean or empty only after verifying the external stylesheet returns HTTP `200`.

---

## Step D: Connect GitHub for Version Control
1. Initialize a GitHub repository (`trendverse`) and push this project:
   ```bash
   git init
   git add .
   git commit -m "Initial TRENDVERSE Blogger & Web App release"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USER/trendverse.git
   git push -u origin main
   ```
2. Keep `.env` out of GitHub (`.gitignore` already ignores secrets); only commit `.env.example`.
3. Follow `docs/UPDATE_WORKFLOW.md` whenever updating theme XML, docs, or React/Node app code.

---

## Step E: Create Essential Static Pages & Publish Articles
### 1. Essential Static Pages (**Pages → New Page**)
Create these exact pages matching the theme navigation and footer links:
- `About` (`/p/about.html`) — include the official Founder introduction for **Vicky** (`docs/FOUNDER_AND_BRANDING.md`)
- `Contact` (`/p/contact.html`)
- `Privacy Policy` (`/p/privacy-policy.html`)
- `Terms and Conditions` (`/p/terms-and-conditions.html`)
- `Disclaimer` (`/p/disclaimer.html`)
- `Editorial Policy` (`/p/editorial-policy.html`)
- `Free Tools` (`/p/free-tools.html`)

### 2. Publishing Articles (**Posts → New Post**)
1. Use one primary category Label per article matching theme menus:
   - `Technology & AI`, `World`, `Business & Finance`, `Science & Space`, `Entertainment`, `Lifestyle`, `Careers`, `Internships`, `Scholarships`, `Government Jobs`.
2. In the post editor sidebar, enable **Search Description** (**Settings → Meta tags → Enable search description** first) and write a unique 135–155 character summary for every post.
3. Set a clean **Custom Permalink** (short, lowercase, hyphenated keywords).
4. Upload crisp `16:9` or `16:10` featured images with descriptive `alt` text before clicking **Publish**.

---

## Step F: Update Theme Safely Without Data Loss
1. Always export a **Theme Backup** (Step G) before editing XML.
2. Never rename `<b:section id='...'/>` or `<b:widget id='Blog1'/>` IDs unnecessarily, as Blogger preserves widget settings by ID.
3. Paste updated `/blogger/trendverse-theme.xml` via **Theme → Edit HTML → Save** and verify homepage, post view, `/search?q=test`, and `/nonexistent-404` right after saving.

---

## Step G: Back Up Blogger Theme & Full Content
1. **Theme Backup:** Open **Blogger → Theme → Customize dropdown → Backup → Download** (`trendverse-theme-backup-YYYY-MM-DD.xml`).
2. **Full Content Backup:** Open **Blogger → Settings → Manage blog → Back up content → Download** (exports all posts, pages, comments, and labels as XML).
3. Store both backups outside Blogger (e.g., encrypted cloud drive or private archive).

---

## Step H: Connect Custom Domain & HTTPS
1. Open **Blogger → Settings → Publishing → Custom domain** and enter `www.yourdomain.com`.
2. Blogger displays two `CNAME` records (one `www -> ghs.google.com` and one unique ownership verification CNAME).
3. Add both `CNAME` records plus Google's four root `A` records (`216.239.32.21`, `216.239.34.21`, `216.239.36.21`, `216.239.38.21`) at your DNS registrar.
4. Wait for DNS propagation, click **Save**, enable **Redirect domain** (`yourdomain.com -> www.yourdomain.com`), and verify **HTTPS availability** + **HTTPS redirect** stay `ON`.

---

## Step I: Configure Google Search Console & Bing Webmaster Tools
1. **Google Search Console (`https://search.google.com/search-console`):**
   - Add Property (**URL prefix** for `https://www.yourdomain.com/` or **Domain** DNS TXT verification).
   - Inspect your homepage and a sample post URL with **URL Inspection → Test Live URL**.
2. **Bing Webmaster Tools (`https://www.bing.com/webmasters`):**
   - Import directly from your verified Google Search Console property (or add `<meta name='msvalidate.01' .../>` inside `<head>` of `trendverse-theme.xml`).
3. **Blogger Crawl Settings (**Settings → Crawlers and indexing**):**
   - Enable **Custom robots.txt** using `/public/robots.txt` (with your live domain).
   - Enable **Custom robots header tags**: Homepage `all, noodp`; Archive and search pages `noindex, follow`; Posts and pages `all, noodp`.
   - Under **Settings → Site feed**, set **Allow blog feed** to **Full** (so JSONP Related Posts & the TRENDVERSE web app read feeds cleanly).

---

## Step J: Submit Sitemaps & Atom/RSS Feeds
Inside **Google Search Console → Sitemaps** and **Bing Webmaster Tools → Sitemaps**, submit:
1. `https://YOUR-DOMAIN/sitemap.xml` (automatically maintained by Blogger for posts)
2. `https://YOUR-DOMAIN/sitemap-pages.xml` (automatically maintained by Blogger for static pages)
3. `https://YOUR-DOMAIN/feeds/posts/default?alt=rss` (RSS feed for rapid feed discovery)
4. `https://YOUR-DOMAIN/atom.xml?redirect=false&start-index=1&max-results=500` (legacy Atom sitemap fallback if needed)

---

## Connecting Your Live Blogger Feed to the TRENDVERSE Web App
Open the **Blogger Theme** page inside the TRENDVERSE web app, enter your public Blogger URL (`https://yourblog.blogspot.com` or `https://www.yourdomain.com`), and click **Connect Feed** to pull live posts via JSONP without any API keys.
