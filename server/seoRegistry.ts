import { EVERGREEN_ARTICLES, getArticleBySlug } from '../src/data/articles.js';
import { EDITORIAL_CATEGORIES, getCategoryBySlug } from '../src/data/categories.js';
import { FOUNDER_BRAND_IDENTITY, POLICY_PAGES } from '../src/data/workflowAndPolicies.js';
import { Article, CategoryInfo, PolicyPageId } from '../src/types/editorial.js';

export const DEFAULT_PRODUCTION_ORIGIN = 'https://trendverse-ten.vercel.app';

export interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'hourly' | 'daily' | 'weekly' | 'monthly';
  priority: string;
}

export interface RouteSeoData {
  title: string;
  description: string;
  canonicalUrl: string;
  robots: string;
  ogType: 'website' | 'article';
  author: string;
  publishedTime?: string;
  modifiedTime?: string;
  articleSection?: string;
  jsonLd: Record<string, unknown>;
  noscriptHtml: string;
  prerenderPath: string;
}

export const TOOL_SEO_ITEMS: Array<{
  id: string;
  label: string;
  title: string;
  description: string;
  summary: string;
}> = [
  {
    id: 'word-counter',
    label: 'Word Counter',
    title: 'Free Word Counter & Reading Time Estimator — TRENDVERSE',
    description:
      'Count words, sentences, paragraphs, characters, keyword frequency, and reading time instantly in your browser with zero server uploads.',
    summary:
      'Measures word count, sentence count, paragraph count, reading duration at 210 WPM, and top repeated terms directly in your browser.',
  },
  {
    id: 'percentage-calculator',
    label: 'Percentage Calculator',
    title: 'Free Percentage Calculator & Change Tool — TRENDVERSE',
    description:
      'Calculate percentage of a number, percentage share, and percentage increase or decrease instantly with browser-local precision.',
    summary:
      'Computes X% of Y, X as a percentage of Y, and percentage growth or decline between two values cleanly inside your browser.',
  },
  {
    id: 'age-calculator',
    label: 'Age Calculator',
    title: 'Exact Age Calculator in Years, Months & Days — TRENDVERSE',
    description:
      'Calculate exact chronological age in years, months, weeks, days, and days until next birthday using standard calendar rules.',
    summary:
      'Calculates exact chronological age between any birth date and target date, including leap-year day counts and total days lived.',
  },
  {
    id: 'unit-converter',
    label: 'Unit Converter',
    title: 'International Unit Converter (Length, Mass, Data, Speed) — TRENDVERSE',
    description:
      'Convert length, weight, Celsius/Fahrenheit/Kelvin temperature, decimal and binary data storage, and speed units accurately offline.',
    summary:
      'Converts metric and imperial units across length, mass, temperature, digital storage (KB/MB/GiB), and velocity using SI constants.',
  },
  {
    id: 'text-case-converter',
    label: 'Text Case Converter',
    title: 'Free Text Case Converter (Title, camelCase, snake_case) — TRENDVERSE',
    description:
      'Convert text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and kebab-case with one click.',
    summary:
      'Transforms headlines, paragraphs, and developer identifiers into standardized editorial or programming casing formats locally.',
  },
  {
    id: 'character-counter',
    label: 'Character Counter',
    title: 'Character Counter & SEO Snippet Length Checker — TRENDVERSE',
    description:
      'Inspect exact character count, non-space characters, UTF-8 byte size, and SEO title/meta description length guidance locally.',
    summary:
      'Tracks total characters, UTF-8 byte lengths, line breaks, and optimal search snippet thresholds (<= 60 title, 120-160 meta).',
  },
];

export const CAREERS_TAB_SEO: Array<{
  tab: string;
  path: string;
  label: string;
  title: string;
  description: string;
  summary: string;
}> = [
  {
    tab: 'overview',
    path: '/careers',
    label: 'Careers',
    title: 'TRENDVERSE CAREERS — Jobs, Internships & Scholarships',
    description:
      'Free international portal for verified jobs, student internships, remote work, scholarships, government recruitment links, and career tools.',
    summary:
      'TRENDVERSE CAREERS aggregates free public job boards, student internships, scholarships, official government portals, and resume tools.',
  },
  {
    tab: 'jobs',
    path: '/careers/jobs',
    label: 'Jobs',
    title: 'Global Job Search — TRENDVERSE CAREERS',
    description:
      'Search verified remote, hybrid, and on-site openings sourced from free public job boards and official employer career pages.',
    summary:
      'Browse international technology, engineering, editorial, and business openings sourced from open employer feeds.',
  },
  {
    tab: 'internships',
    path: '/careers/internships',
    label: 'Internships',
    title: 'Student Internships & Paid Roles — TRENDVERSE CAREERS',
    description:
      'Discover verified student internships, working-student roles, remote internships, and free career preparation resources worldwide.',
    summary:
      'Explore paid student internships, graduate trainee listings, and remote early-career opportunities worldwide.',
  },
  {
    tab: 'remote',
    path: '/careers/remote',
    label: 'Remote Jobs',
    title: 'Remote & Work From Home Jobs — TRENDVERSE CAREERS',
    description:
      'Explore global remote and work-from-home roles with transparent region eligibility and timezone alignment.',
    summary:
      'Filter distributed and remote-first roles across software, research, operations, and international media.',
  },
  {
    tab: 'fresher',
    path: '/careers/fresher',
    label: 'Student & Fresher Center',
    title: 'Student Opportunity Center & Fresher Jobs — TRENDVERSE CAREERS',
    description:
      'Entry-level jobs, apprenticeships, graduate programmes, fellowships, free certifications, and student competitions.',
    summary:
      'Central hub for university graduates, apprentices, fellowships, research grants, and open-access skill certifications.',
  },
  {
    tab: 'scholarships',
    path: '/careers/scholarships',
    label: 'Scholarships',
    title: 'International Scholarship Directory — TRENDVERSE CAREERS',
    description:
      'Official university and government scholarships, NSF and UKRI research funding feeds, eligibility rules, and direct application links.',
    summary:
      'Verified database of international scholarships, merit fellowships, and public research funding opportunities.',
  },
  {
    tab: 'government',
    path: '/careers/government',
    label: 'Government Jobs',
    title: 'Official Government Recruitment Portals — TRENDVERSE CAREERS',
    description:
      'Official country-specific civil service and public sector recruitment portals for India, USA, UK, Canada, Australia, Germany, Singapore, UAE, and Japan.',
    summary:
      'Direct links to verified national civil service portals including UPSC, SSC, NCS, USAJOBS, Civil Service Jobs UK, and more.',
  },
  {
    tab: 'tools',
    path: '/careers/tools',
    label: 'Career Tools',
    title: 'Free Student & Career Tools — TRENDVERSE CAREERS',
    description:
      'Free browser-local Resume Builder, ATS Resume Checker, Cover Letter Builder, Interview Practice, Salary Calculator, and Trackers.',
    summary:
      'Zero-cost browser utilities helping students and professionals draft resumes, audit ATS readiness, and plan applications.',
  },
];

export function resolveSiteOrigin(env: Record<string, string | undefined> = process.env): string {
  const candidates = [env.SITE_URL, env.VITE_SITE_URL, env.APP_URL];
  for (const raw of candidates) {
    const cleaned = (raw || '').trim().replace(/\/+$/, '');
    if (
      cleaned &&
      /^https?:\/\//i.test(cleaned) &&
      !cleaned.includes('example.com') &&
      !cleaned.includes('YOUR-DOMAIN') &&
      !cleaned.includes('localhost') &&
      !cleaned.includes('127.0.0.1') &&
      !cleaned.includes('.run.app')
    ) {
      return cleaned;
    }
  }
  return DEFAULT_PRODUCTION_ORIGIN;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildCoreNodes(origin: string, pageUrl: string, title: string, pageType = 'WebPage') {
  return [
    {
      '@type': 'Person',
      '@id': `${origin}/#founder-vicky`,
      name: FOUNDER_BRAND_IDENTITY.founderName,
      jobTitle: 'Founder & Developer',
      description: 'Founder and Developer of TRENDVERSE.',
      worksFor: { '@id': `${origin}/#organization` },
    },
    {
      '@type': 'Organization',
      '@id': `${origin}/#organization`,
      name: FOUNDER_BRAND_IDENTITY.brandName,
      url: `${origin}/`,
      slogan: FOUNDER_BRAND_IDENTITY.tagline,
      description:
        'Discover What\'s Next. An independent global digital media, live trend intelligence, careers, and free utilities platform founded and developed by Vicky.',
      founder: { '@id': `${origin}/#founder-vicky` },
    },
    {
      '@type': 'WebSite',
      '@id': `${origin}/#website`,
      name: FOUNDER_BRAND_IDENTITY.brandName,
      url: `${origin}/`,
      inLanguage: 'en',
      publisher: { '@id': `${origin}/#organization` },
      creator: { '@id': `${origin}/#founder-vicky` },
    },
    {
      '@type': pageType,
      '@id': `${pageUrl}#webpage`,
      url: pageUrl,
      name: title,
      inLanguage: 'en',
      isPartOf: { '@id': `${origin}/#website` },
      publisher: { '@id': `${origin}/#organization` },
    },
  ];
}

function renderNoscriptFooterLinks(): string {
  const catLinks = EDITORIAL_CATEGORIES.map(
    (c) =>
      `<li><a href="/search/label/${encodeURIComponent(c.bloggerLabel)}">${escapeHtml(c.name)}</a></li>`
  ).join('');
  const policyLinks = (Object.keys(POLICY_PAGES) as PolicyPageId[])
    .map(
      (id) =>
        `<li><a href="/policy/${encodeURIComponent(id)}">${escapeHtml(POLICY_PAGES[id].title)}</a></li>`
    )
    .join('');
  return `
    <nav aria-label="TRENDVERSE Directory">
      <h2>Explore TRENDVERSE</h2>
      <ul>
        <li><a href="/">Home Newsroom</a></li>
        <li><a href="/briefing">Your World in 60 Seconds</a></li>
        <li><a href="/news-center">Live Global News Center</a></li>
        <li><a href="/ai-center">AI Intelligence Center</a></li>
        <li><a href="/trend-battle">Trend Battle</a></li>
        <li><a href="/careers">TRENDVERSE CAREERS</a></li>
        <li><a href="/tools">Free Online Tools</a></li>
      </ul>
      <h3>Editorial Desks</h3>
      <ul>${catLinks}</ul>
      <h3>Institutional &amp; Policies</h3>
      <ul>${policyLinks}</ul>
    </nav>
  `.trim();
}

function buildArticleSeo(article: Article, origin: string): RouteSeoData {
  const canonicalUrl = `${origin}/article/${encodeURIComponent(article.slug)}`;
  const categoryUrl = `${origin}/search/label/${encodeURIComponent(article.categoryName)}`;
  const title = `${article.title} — TRENDVERSE`;
  const description = article.summary.slice(0, 160);

  const sectionsHtml = article.sections
    .map(
      (sec) => `
      <section>
        <h2>${escapeHtml(sec.heading)}</h2>
        ${sec.paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
        ${sec.pullQuote ? `<blockquote>${escapeHtml(sec.pullQuote)}</blockquote>` : ''}
      </section>`
    )
    .join('');

  const sourcesHtml = article.sources.length
    ? `<section><h2>Sources &amp; Primary References</h2><ul>${article.sources
        .map(
          (s) =>
            `<li><a href="${escapeHtml(s.url)}" rel="noopener noreferrer">${escapeHtml(s.label)}</a> — ${escapeHtml(s.publisher)}</li>`
        )
        .join('')}</ul></section>`
    : '';

  const isDraft = article.editorialStatus === 'draft-pending-review';
  const authorType = article.authorId === 'vicky' ? 'Person' : 'Organization';

  return {
    title,
    description,
    canonicalUrl,
    robots: isDraft ? 'noindex, follow' : 'index, follow, max-image-preview:large',
    ogType: 'article',
    author: article.authorName || FOUNDER_BRAND_IDENTITY.founderName,
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    articleSection: article.categoryName,
    prerenderPath: `/article/${article.slug}`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        ...buildCoreNodes(origin, canonicalUrl, title, 'WebPage'),
        {
          '@type': article.schemaType,
          '@id': `${canonicalUrl}#article`,
          headline: article.title,
          description,
          url: canonicalUrl,
          datePublished: article.publishedAt,
          dateModified: article.updatedAt,
          inLanguage: 'en',
          articleSection: article.categoryName,
          keywords: article.labels.join(', '),
          author:
            authorType === 'Person'
              ? {
                  '@type': 'Person',
                  '@id': `${origin}/#founder-vicky`,
                  name: article.authorName,
                }
              : {
                  '@type': 'Organization',
                  name: article.authorName,
                },
          ...(article.reviewedBy
            ? {
                editor: {
                  '@type': 'Person',
                  '@id': `${origin}/#founder-vicky`,
                  name: FOUNDER_BRAND_IDENTITY.founderName,
                },
              }
            : {}),
          publisher: {
            '@type': 'Organization',
            '@id': `${origin}/#organization`,
            name: FOUNDER_BRAND_IDENTITY.brandName,
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${canonicalUrl}#webpage`,
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
            { '@type': 'ListItem', position: 2, name: article.categoryName, item: categoryUrl },
            { '@type': 'ListItem', position: 3, name: article.title, item: canonicalUrl },
          ],
        },
      ],
    },
    noscriptHtml: `
      <main>
        <article>
          <p><a href="/">Home</a> / <a href="/search/label/${encodeURIComponent(article.categoryName)}">${escapeHtml(article.categoryName)}</a></p>
          <h1>${escapeHtml(article.title)}</h1>
          <p>${escapeHtml(article.subtitle)}</p>
          <p>By ${escapeHtml(article.authorName)} · Published ${escapeHtml(article.publishedAt)} · Updated ${escapeHtml(article.updatedAt)}</p>
          ${sectionsHtml}
          ${sourcesHtml}
        </article>
        ${renderNoscriptFooterLinks()}
      </main>
    `.trim(),
  };
}

function buildCategorySeo(category: CategoryInfo, origin: string, prerenderPath?: string): RouteSeoData {
  const canonicalUrl = `${origin}/search/label/${encodeURIComponent(category.bloggerLabel)}`;
  const title = `${category.name} — News, Analysis & Explainers | TRENDVERSE`;
  const description = category.seoDescription.slice(0, 160);
  const matching = EVERGREEN_ARTICLES.filter((a) => a.category === category.slug);

  return {
    title,
    description,
    canonicalUrl,
    robots: 'index, follow, max-image-preview:large',
    ogType: 'website',
    author: FOUNDER_BRAND_IDENTITY.publisherName,
    prerenderPath: prerenderPath || `/search/label/${category.bloggerLabel}`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        ...buildCoreNodes(origin, canonicalUrl, title, 'CollectionPage'),
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
            { '@type': 'ListItem', position: 2, name: category.name, item: canonicalUrl },
          ],
        },
      ],
    },
    noscriptHtml: `
      <main>
        <h1>${escapeHtml(category.name)} — TRENDVERSE</h1>
        <p>${escapeHtml(category.seoDescription)}</p>
        <ul>
          ${matching
            .map(
              (a) =>
                `<li><a href="/article/${encodeURIComponent(a.slug)}">${escapeHtml(a.title)}</a> — ${escapeHtml(a.summary)}</li>`
            )
            .join('')}
        </ul>
        ${renderNoscriptFooterLinks()}
      </main>
    `.trim(),
  };
}

export function resolveRouteSeo(
  rawPathname: string,
  rawSearch = '',
  env: Record<string, string | undefined> = process.env
): RouteSeoData {
  const origin = resolveSiteOrigin(env);
  const pathname = (rawPathname || '/').replace(/\/+$/, '') || '/';
  const parts = pathname.split('/').filter(Boolean);
  const hasSearchQuery =
    Boolean(rawSearch && rawSearch.length > 1) &&
    /(^\?|&)(q|query|s)=/i.test(rawSearch);

  // Explicit search query URLs (?q=...) should remain noindex, follow
  if (hasSearchQuery || (parts[0] === 'search' && parts[1] !== 'label')) {
    const homeSeo = resolveRouteSeo('/', '', env);
    return {
      ...homeSeo,
      robots: 'noindex, follow',
    };
  }

  // Article pages
  if (parts[0] === 'article' && parts[1]) {
    const slug = decodeURIComponent(parts[1]);
    const article = getArticleBySlug(slug, EVERGREEN_ARTICLES);
    if (article) return buildArticleSeo(article, origin);
  }

  // Category pages (/search/label/<Label> or /category/<slug>)
  if (parts[0] === 'search' && parts[1] === 'label' && parts[2]) {
    const decoded = decodeURIComponent(parts.slice(2).join('/')).toLowerCase();
    const cat =
      EDITORIAL_CATEGORIES.find(
        (c) =>
          c.bloggerLabel.toLowerCase() === decoded ||
          c.name.toLowerCase() === decoded ||
          c.slug === decoded
      ) || EDITORIAL_CATEGORIES[0];
    return buildCategorySeo(cat, origin, `/search/label/${parts.slice(2).join('/')}`);
  }

  if (parts[0] === 'category' && parts[1]) {
    const cat = getCategoryBySlug(decodeURIComponent(parts[1]).toLowerCase());
    if (cat) return buildCategorySeo(cat, origin, `/category/${cat.slug}`);
  }

  // Tools pages (/tools and /tools/<id>)
  if (parts[0] === 'tools') {
    const toolId = parts[1] || '';
    const toolItem = TOOL_SEO_ITEMS.find((t) => t.id === toolId);
    const canonicalUrl = toolItem ? `${origin}/tools/${toolItem.id}` : `${origin}/tools`;
    const title = toolItem
      ? toolItem.title
      : 'Free Online Utilities & Calculators — TRENDVERSE';
    const description = toolItem
      ? toolItem.description
      : 'Fast, browser-based utilities including Word Counter, Percentage Calculator, Age Calculator, Unit Converter, Text Case Converter, and Character Counter.';

    return {
      title,
      description,
      canonicalUrl,
      robots: 'index, follow, max-image-preview:large',
      ogType: 'website',
      author: FOUNDER_BRAND_IDENTITY.founderName,
      prerenderPath: toolItem ? `/tools/${toolItem.id}` : '/tools',
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          ...buildCoreNodes(origin, canonicalUrl, title, 'WebPage'),
          {
            '@type': 'WebApplication',
            name: toolItem ? `TRENDVERSE ${toolItem.label}` : 'TRENDVERSE Online Utilities',
            url: canonicalUrl,
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'All',
            description,
            creator: { '@id': `${origin}/#founder-vicky` },
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
              { '@type': 'ListItem', position: 2, name: 'Free Online Tools', item: `${origin}/tools` },
              ...(toolItem
                ? [{ '@type': 'ListItem', position: 3, name: toolItem.label, item: canonicalUrl }]
                : []),
            ],
          },
        ],
      },
      noscriptHtml: `
        <main>
          <h1>${escapeHtml(toolItem ? toolItem.label : 'TRENDVERSE Free Online Tools')}</h1>
          <p>${escapeHtml(description)}</p>
          <ul>
            ${TOOL_SEO_ITEMS.map(
              (t) =>
                `<li><a href="/tools/${t.id}">${escapeHtml(t.label)}</a>: ${escapeHtml(t.summary)}</li>`
            ).join('')}
          </ul>
          ${renderNoscriptFooterLinks()}
        </main>
      `.trim(),
    };
  }

  // Policy pages (/policy/<id> or /p/<id>.html)
  if (parts[0] === 'policy' || parts[0] === 'p') {
    const rawId = (parts[1] || 'about').replace(/\.html$/i, '').toLowerCase();
    if (rawId === 'free-tools') {
      return resolveRouteSeo('/tools', '', env);
    }
    const pageId: PolicyPageId =
      rawId === 'about-us'
        ? 'about'
        : rawId in POLICY_PAGES
        ? (rawId as PolicyPageId)
        : 'about';
    const page = POLICY_PAGES[pageId];
    const canonicalUrl = `${origin}/policy/${pageId}`;
    const title = `${page.title} — TRENDVERSE`;
    const description = page.subtitle.slice(0, 160);
    const schemaPageType =
      pageId === 'about' ? 'AboutPage' : pageId === 'contact' ? 'ContactPage' : 'WebPage';

    return {
      title,
      description,
      canonicalUrl,
      robots: 'index, follow, max-image-preview:large',
      ogType: 'website',
      author: FOUNDER_BRAND_IDENTITY.founderName,
      prerenderPath: `/policy/${pageId}`,
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          ...buildCoreNodes(origin, canonicalUrl, title, schemaPageType),
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
              { '@type': 'ListItem', position: 2, name: page.title, item: canonicalUrl },
            ],
          },
        ],
      },
      noscriptHtml: `
        <main>
          <h1>${escapeHtml(page.title)}</h1>
          <p>${escapeHtml(page.subtitle)}</p>
          ${page.sections
            .map(
              (s) =>
                `<section><h2>${escapeHtml(s.heading)}</h2>${s.body
                  .map((b) => `<p>${escapeHtml(b)}</p>`)
                  .join('')}</section>`
            )
            .join('')}
          ${renderNoscriptFooterLinks()}
        </main>
      `.trim(),
    };
  }

  // Careers routes (/careers and /careers/<tab>)
  if (parts[0] === 'careers') {
    const tabKey = parts[1] || 'overview';
    const cfg = CAREERS_TAB_SEO.find((c) => c.tab === tabKey) || CAREERS_TAB_SEO[0];
    const canonicalUrl = `${origin}${cfg.path}`;
    const breadcrumbs = [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
      { '@type': 'ListItem', position: 2, name: 'Careers', item: `${origin}/careers` },
      ...(cfg.tab !== 'overview'
        ? [{ '@type': 'ListItem', position: 3, name: cfg.label, item: canonicalUrl }]
        : []),
    ];

    const graph: Record<string, unknown>[] = [
      ...buildCoreNodes(origin, canonicalUrl, cfg.title, 'WebPage'),
      { '@type': 'BreadcrumbList', itemListElement: breadcrumbs },
    ];
    if (cfg.tab === 'tools') {
      graph.push({
        '@type': 'WebApplication',
        name: 'TRENDVERSE CAREERS Free Tools',
        url: canonicalUrl,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'All',
        description: cfg.description,
        creator: { '@id': `${origin}/#founder-vicky` },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      });
    }

    return {
      title: cfg.title,
      description: cfg.description,
      canonicalUrl,
      robots: 'index, follow, max-image-preview:large',
      ogType: 'website',
      author: FOUNDER_BRAND_IDENTITY.founderName,
      prerenderPath: cfg.path,
      jsonLd: { '@context': 'https://schema.org', '@graph': graph },
      noscriptHtml: `
        <main>
          <h1>${escapeHtml(cfg.title)}</h1>
          <p>${escapeHtml(cfg.summary)}</p>
          <ul>
            ${CAREERS_TAB_SEO.map(
              (t) =>
                `<li><a href="${t.path}">${escapeHtml(t.label)}</a> — ${escapeHtml(t.description)}</li>`
            ).join('')}
          </ul>
          ${renderNoscriptFooterLinks()}
        </main>
      `.trim(),
    };
  }

  // Standalone public editorial apps
  if (parts[0] === 'briefing') {
    const canonicalUrl = `${origin}/briefing`;
    const title = 'Your World in 60 Seconds — Daily Briefing & Audio | TRENDVERSE';
    const description =
      'Concise daily global news briefing grounded in verified international feeds with source links, timestamps, and browser audio playback.';
    return {
      title,
      description,
      canonicalUrl,
      robots: 'index, follow, max-image-preview:large',
      ogType: 'website',
      author: FOUNDER_BRAND_IDENTITY.publisherName,
      prerenderPath: '/briefing',
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          ...buildCoreNodes(origin, canonicalUrl, title, 'WebPage'),
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
              { '@type': 'ListItem', position: 2, name: 'Your World in 60 Seconds', item: canonicalUrl },
            ],
          },
        ],
      },
      noscriptHtml: `<main><h1>Your World in 60 Seconds</h1><p>${escapeHtml(description)}</p>${renderNoscriptFooterLinks()}</main>`,
    };
  }

  if (parts[0] === 'trend-battle') {
    const canonicalUrl = `${origin}/trend-battle`;
    const title = 'Trend Battle — Compare Global Topic Interest | TRENDVERSE';
    const description =
      'Compare relative search and reader interest between two topics across global regions, timelines, and related queries.';
    return {
      title,
      description,
      canonicalUrl,
      robots: 'index, follow, max-image-preview:large',
      ogType: 'website',
      author: FOUNDER_BRAND_IDENTITY.publisherName,
      prerenderPath: '/trend-battle',
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          ...buildCoreNodes(origin, canonicalUrl, title, 'WebPage'),
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
              { '@type': 'ListItem', position: 2, name: 'Trend Battle', item: canonicalUrl },
            ],
          },
        ],
      },
      noscriptHtml: `<main><h1>Trend Battle</h1><p>${escapeHtml(description)}</p>${renderNoscriptFooterLinks()}</main>`,
    };
  }

  if (parts[0] === 'ai-center') {
    const canonicalUrl = `${origin}/ai-center`;
    const title = 'AI Intelligence Center — Models, Tools & News | TRENDVERSE';
    const description =
      'Live official AI research news, verified AI tools directory across seven categories, model references, and technical explainers.';
    return {
      title,
      description,
      canonicalUrl,
      robots: 'index, follow, max-image-preview:large',
      ogType: 'website',
      author: FOUNDER_BRAND_IDENTITY.publisherName,
      prerenderPath: '/ai-center',
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          ...buildCoreNodes(origin, canonicalUrl, title, 'WebPage'),
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
              { '@type': 'ListItem', position: 2, name: 'AI Intelligence Center', item: canonicalUrl },
            ],
          },
        ],
      },
      noscriptHtml: `<main><h1>AI Intelligence Center</h1><p>${escapeHtml(description)}</p>${renderNoscriptFooterLinks()}</main>`,
    };
  }

  if (parts[0] === 'news-center') {
    const canonicalUrl = `${origin}/news-center`;
    const title = 'Live Global News Center & Trend Radar — TRENDVERSE';
    const description =
      'Real-time headlines from reputable international RSS feeds, live Google Trends radar, world clock, and global news coverage map.';
    return {
      title,
      description,
      canonicalUrl,
      robots: 'index, follow, max-image-preview:large',
      ogType: 'website',
      author: FOUNDER_BRAND_IDENTITY.publisherName,
      prerenderPath: '/news-center',
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          ...buildCoreNodes(origin, canonicalUrl, title, 'CollectionPage'),
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
              { '@type': 'ListItem', position: 2, name: 'Live Global News Center', item: canonicalUrl },
            ],
          },
        ],
      },
      noscriptHtml: `<main><h1>Live Global News Center</h1><p>${escapeHtml(description)}</p>${renderNoscriptFooterLinks()}</main>`,
    };
  }

  // Non-indexed personal / internal admin routes
  if (parts[0] === 'whats-new') {
    const canonicalUrl = `${origin}/whats-new`;
    const title = "What's New Since Your Last Visit — Reader Digest | TRENDVERSE";
    const description =
      'Catch up on newly published dispatches, rising topics, saved articles, and reading history stored locally in your browser.';
    return {
      title,
      description,
      canonicalUrl,
      robots: 'noindex, follow',
      ogType: 'website',
      author: FOUNDER_BRAND_IDENTITY.publisherName,
      prerenderPath: '/whats-new',
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': buildCoreNodes(origin, canonicalUrl, title, 'WebPage'),
      },
      noscriptHtml: `<main><h1>What's New Since Your Last Visit</h1><p>${escapeHtml(description)}</p>${renderNoscriptFooterLinks()}</main>`,
    };
  }

  if (parts[0] === 'blogger-theme') {
    const canonicalUrl = `${origin}/blogger-theme`;
    const title = 'Blogger XML Theme, Draft Queue & Documentation — TRENDVERSE';
    const description =
      'Internal Blogger XML theme documentation, feed connector, editorial draft queue, and integration readiness overview.';
    return {
      title,
      description,
      canonicalUrl,
      robots: 'noindex, follow',
      ogType: 'website',
      author: FOUNDER_BRAND_IDENTITY.founderName,
      prerenderPath: '/blogger-theme',
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': buildCoreNodes(origin, canonicalUrl, title, 'WebPage'),
      },
      noscriptHtml: `<main><h1>Blogger Theme &amp; Architecture Documentation</h1><p>${escapeHtml(description)}</p>${renderNoscriptFooterLinks()}</main>`,
    };
  }

  // Default: Homepage ("/")
  const canonicalUrl = `${origin}/`;
  const title = "TRENDVERSE — Discover What's Next | International Media & Tools";
  const description =
    'TRENDVERSE delivers technology explainers, world affairs, business education, science discoveries, careers intelligence, and free online utilities for global readers.';

  const featuredArticlesHtml = EVERGREEN_ARTICLES.map(
    (a) =>
      `<li><a href="/article/${encodeURIComponent(a.slug)}">${escapeHtml(a.title)}</a> (${escapeHtml(a.categoryName)}) — ${escapeHtml(a.summary)}</li>`
  ).join('');

  return {
    title,
    description,
    canonicalUrl,
    robots: 'index, follow, max-image-preview:large',
    ogType: 'website',
    author: `${FOUNDER_BRAND_IDENTITY.founderName} — Founder & Developer, TRENDVERSE`,
    prerenderPath: '/',
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        ...buildCoreNodes(origin, canonicalUrl, title, 'WebPage'),
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: canonicalUrl },
          ],
        },
      ],
    },
    noscriptHtml: `
      <main>
        <h1>TRENDVERSE — Discover What's Next</h1>
        <p>${escapeHtml(description)}</p>
        <section>
          <h2>Featured Evergreen Editorial Explainers</h2>
          <ul>${featuredArticlesHtml}</ul>
        </section>
        ${renderNoscriptFooterLinks()}
      </main>
    `.trim(),
  };
}

export function getIndexableSitemapEntries(
  env: Record<string, string | undefined> = process.env
): SitemapEntry[] {
  const origin = resolveSiteOrigin(env);
  const todayIso = new Date().toISOString().slice(0, 10);

  const entries: SitemapEntry[] = [
    { loc: `${origin}/`, lastmod: todayIso, changefreq: 'daily', priority: '1.0' },
    { loc: `${origin}/news-center`, lastmod: todayIso, changefreq: 'hourly', priority: '0.9' },
    { loc: `${origin}/briefing`, lastmod: todayIso, changefreq: 'daily', priority: '0.9' },
    { loc: `${origin}/ai-center`, lastmod: todayIso, changefreq: 'daily', priority: '0.9' },
    { loc: `${origin}/trend-battle`, lastmod: todayIso, changefreq: 'daily', priority: '0.8' },
  ];

  // Careers portal & sub-tabs
  for (const c of CAREERS_TAB_SEO) {
    entries.push({
      loc: `${origin}${c.path}`,
      lastmod: todayIso,
      changefreq: c.tab === 'overview' || c.tab === 'jobs' ? 'daily' : 'weekly',
      priority: c.tab === 'overview' ? '0.9' : '0.8',
    });
  }

  // Tools hub & individual utilities
  entries.push({
    loc: `${origin}/tools`,
    lastmod: todayIso,
    changefreq: 'monthly',
    priority: '0.8',
  });
  for (const tool of TOOL_SEO_ITEMS) {
    entries.push({
      loc: `${origin}/tools/${tool.id}`,
      lastmod: todayIso,
      changefreq: 'monthly',
      priority: '0.7',
    });
  }

  // Editorial categories (canonical Blogger label routes)
  for (const cat of EDITORIAL_CATEGORIES) {
    entries.push({
      loc: `${origin}/search/label/${encodeURIComponent(cat.bloggerLabel)}`,
      lastmod: todayIso,
      changefreq: 'weekly',
      priority: '0.8',
    });
  }

  // Evergreen human-reviewed articles (unpublished drafts excluded from sitemap)
  for (const article of EVERGREEN_ARTICLES) {
    if (article.editorialStatus === 'draft-pending-review') continue;
    entries.push({
      loc: `${origin}/article/${encodeURIComponent(article.slug)}`,
      lastmod: article.updatedAt || article.publishedAt || todayIso,
      changefreq: 'monthly',
      priority: article.featured ? '0.9' : '0.8',
    });
  }

  // Institutional & policy pages
  for (const pageId of Object.keys(POLICY_PAGES) as PolicyPageId[]) {
    entries.push({
      loc: `${origin}/policy/${pageId}`,
      lastmod: '2026-11-24',
      changefreq: 'monthly',
      priority: '0.5',
    });
  }

  return entries;
}

export function getAllPrerenderPaths(): string[] {
  const paths = new Set<string>([
    '/',
    '/briefing',
    '/trend-battle',
    '/ai-center',
    '/news-center',
    '/tools',
    '/whats-new',
    '/blogger-theme',
  ]);

  for (const c of CAREERS_TAB_SEO) paths.add(c.path);
  for (const t of TOOL_SEO_ITEMS) paths.add(`/tools/${t.id}`);
  for (const cat of EDITORIAL_CATEGORIES) {
    paths.add(`/search/label/${encodeURIComponent(cat.bloggerLabel)}`);
    paths.add(`/category/${cat.slug}`);
  }
  for (const art of EVERGREEN_ARTICLES) {
    paths.add(`/article/${art.slug}`);
  }
  for (const pageId of Object.keys(POLICY_PAGES) as PolicyPageId[]) {
    paths.add(`/policy/${pageId}`);
  }

  return Array.from(paths);
}

export function generateSitemapXml(
  env: Record<string, string | undefined> = process.env
): string {
  const entries = getIndexableSitemapEntries(env);
  const urlNodes = entries
    .map(
      (item) => `  <url>
    <loc>${escapeXml(item.loc)}</loc>
    <lastmod>${escapeXml(item.lastmod)}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlNodes}
</urlset>
`;
}

export function generateRobotsTxt(
  env: Record<string, string | undefined> = process.env
): string {
  const origin = resolveSiteOrigin(env);
  return `# TRENDVERSE Robots Directives
# Production URL: ${origin}

User-agent: *
Allow: /
Allow: /search/label/
Disallow: /api/
Disallow: /*?q=
Disallow: /*?query=
Disallow: /search?

Sitemap: ${origin}/sitemap.xml
`;
}

export function generateAdsTxt(
  env: Record<string, string | undefined> = process.env
): string {
  const rawId = (env.ADSENSE_PUBLISHER_ID || env.VITE_ADSENSE_PUBLISHER_ID || '').trim();
  const normalized = rawId.replace(/^ca-/i, '');
  if (/^pub-\d{10,20}$/.test(normalized)) {
    return `google.com, ${normalized}, DIRECT, f08c47fec0942fa0\n`;
  }
  return `# TRENDVERSE ads.txt
# No active AdSense publisher ID is configured yet.
# After Google AdSense approves your site, set ADSENSE_PUBLISHER_ID=pub-XXXXXXXXXXXXXXXX
# (or ca-pub-XXXXXXXXXXXXXXXX) in your Vercel environment variables to publish your verified line automatically.
`;
}

export function injectSeoIntoHtml(
  templateHtml: string,
  pathname: string,
  search = '',
  env: Record<string, string | undefined> = process.env
): string {
  const seo = resolveRouteSeo(pathname, search, env);
  const gscToken = (env.VITE_GSC_VERIFICATION || env.GSC_VERIFICATION || '').trim();
  const bingToken = (env.VITE_BING_VERIFICATION || env.BING_VERIFICATION || '').trim();
  const hasStaticGscTag = /<meta\s+[^>]*name=["']google-site-verification["']/i.test(templateHtml);

  const verificationTags = [
    gscToken && !hasStaticGscTag
      ? `    <meta name="google-site-verification" content="${escapeHtml(gscToken)}" />`
      : '',
    bingToken
      ? `    <meta name="msvalidate.01" content="${escapeHtml(bingToken)}" />`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  const articleMetaTags =
    seo.ogType === 'article'
      ? [
          seo.publishedTime
            ? `    <meta property="article:published_time" content="${escapeHtml(seo.publishedTime)}" />`
            : '',
          seo.modifiedTime
            ? `    <meta property="article:modified_time" content="${escapeHtml(seo.modifiedTime)}" />`
            : '',
          seo.articleSection
            ? `    <meta property="article:section" content="${escapeHtml(seo.articleSection)}" />`
            : '',
        ]
          .filter(Boolean)
          .join('\n')
      : '';

  const routeMetaBlock = `
    <title>${escapeHtml(seo.title)}</title>
    <meta name="description" content="${escapeHtml(seo.description)}" />
    <meta name="robots" content="${escapeHtml(seo.robots)}" />
    <meta name="author" content="${escapeHtml(seo.author)}" />
    <link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}" />
    <meta property="og:type" content="${seo.ogType}" />
    <meta property="og:site_name" content="TRENDVERSE" />
    <meta property="og:title" content="${escapeHtml(seo.title)}" />
    <meta property="og:description" content="${escapeHtml(seo.description)}" />
    <meta property="og:url" content="${escapeHtml(seo.canonicalUrl)}" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(seo.title)}" />
    <meta name="twitter:description" content="${escapeHtml(seo.description)}" />
    <meta name="twitter:url" content="${escapeHtml(seo.canonicalUrl)}" />
${articleMetaTags}${verificationTags ? `\n${verificationTags}` : ''}
    <script type="application/ld+json" id="trendverse-route-schema">${JSON.stringify(seo.jsonLd)}</script>
  `.trim();

  let html = templateHtml;

  // Replace existing head SEO block between markers if present, else replace <title>..canonical/og/twitter/base schema cleanly
  if (html.includes('<!-- SEO_HEAD_START -->') && html.includes('<!-- SEO_HEAD_END -->')) {
    html = html.replace(
      /<!-- SEO_HEAD_START -->[\s\S]*?<!-- SEO_HEAD_END -->/,
      `<!-- SEO_HEAD_START -->\n    ${routeMetaBlock}\n    <!-- SEO_HEAD_END -->`
    );
  } else {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(seo.title)}</title>`);
  }

  // Inject crawlable <noscript> semantic fallback for non-JS crawlers without disturbing React mount
  const noscriptBlock = `<noscript data-seo-fallback="true">${seo.noscriptHtml}</noscript>`;
  if (html.includes('<noscript data-seo-fallback="true">')) {
    html = html.replace(
      /<noscript data-seo-fallback="true">[\s\S]*?<\/noscript>/,
      noscriptBlock
    );
  } else {
    html = html.replace('<div id="root"></div>', `<div id="root"></div>\n    ${noscriptBlock}`);
  }

  return html;
}
