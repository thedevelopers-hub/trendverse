import { Article, CategoryInfo, PolicyPageId } from '../types/editorial';
import { FOUNDER_BRAND_IDENTITY, POLICY_PAGES } from '../data/workflowAndPolicies';
import { getCanonicalOrigin } from './routes';

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function removeMeta(attr: 'name' | 'property', key: string): void {
  const el = document.querySelector(`meta[${attr}="${key}"]`);
  if (el) el.remove();
}

export function upsertRobots(content = 'index, follow, max-image-preview:large'): void {
  const hasSearchQuery =
    typeof window !== 'undefined' &&
    /(^\?|&)(q|query|s)=/i.test(window.location.search || '');
  upsertMeta('name', 'robots', hasSearchQuery ? 'noindex, follow' : content);
}

function upsertCanonical(url: string): void {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
}

function applySharedSocialTags(opts: {
  title: string;
  description: string;
  url: string;
  ogType: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  articleSection?: string;
}): void {
  upsertMeta('name', 'description', opts.description);
  upsertMeta('name', 'author', opts.author || FOUNDER_BRAND_IDENTITY.founderName);
  upsertMeta('property', 'og:type', opts.ogType);
  upsertMeta('property', 'og:site_name', 'TRENDVERSE');
  upsertMeta('property', 'og:title', opts.title);
  upsertMeta('property', 'og:description', opts.description);
  upsertMeta('property', 'og:url', opts.url);
  upsertMeta('property', 'og:locale', 'en_US');
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', opts.title);
  upsertMeta('name', 'twitter:description', opts.description);
  upsertMeta('name', 'twitter:url', opts.url);

  if (opts.ogType === 'article') {
    if (opts.publishedTime) upsertMeta('property', 'article:published_time', opts.publishedTime);
    if (opts.modifiedTime) upsertMeta('property', 'article:modified_time', opts.modifiedTime);
    if (opts.articleSection) upsertMeta('property', 'article:section', opts.articleSection);
  } else {
    removeMeta('property', 'article:published_time');
    removeMeta('property', 'article:modified_time');
    removeMeta('property', 'article:section');
  }
}

export function applyVerificationMetaTags(): void {
  const gsc = (import.meta.env?.VITE_GSC_VERIFICATION || '').trim();
  const bing = (import.meta.env?.VITE_BING_VERIFICATION || '').trim();
  if (gsc) upsertMeta('name', 'google-site-verification', gsc);
  if (bing) upsertMeta('name', 'msvalidate.01', bing);
}

function setRouteJsonLd(data: Record<string, unknown> | null): void {
  const existing = document.getElementById('trendverse-route-schema');
  if (!data) {
    if (existing) existing.remove();
    return;
  }
  const script = existing ?? document.createElement('script');
  script.id = 'trendverse-route-schema';
  script.setAttribute('type', 'application/ld+json');
  script.textContent = JSON.stringify(data);
  if (!existing) {
    document.head.appendChild(script);
  }
}

function buildCoreGraphNodes(
  origin: string,
  pageUrl: string,
  pageTitle: string,
  pageType: 'WebPage' | 'CollectionPage' | 'AboutPage' | 'ContactPage' = 'WebPage'
) {
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
      slogan: FOUNDER_BRAND_IDENTITY.tagline,
      url: `${origin}/`,
      description:
        "Discover What's Next. An independent global digital media, live trend intelligence, careers, and free utilities platform founded and developed by Vicky.",
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
      name: pageTitle,
      inLanguage: 'en',
      isPartOf: { '@id': `${origin}/#website` },
      publisher: { '@id': `${origin}/#organization` },
    },
  ];
}

export function applySeoForHome(): void {
  const title = "TRENDVERSE — Discover What's Next | International Media & Tools";
  const desc =
    'TRENDVERSE delivers technology explainers, world affairs, business education, science discoveries, careers intelligence, and free online utilities for global readers.';
  const origin = getCanonicalOrigin();
  const url = `${origin}/`;

  document.title = title;
  upsertRobots('index, follow, max-image-preview:large');
  applySharedSocialTags({
    title,
    description: desc,
    url,
    ogType: 'website',
    author: `${FOUNDER_BRAND_IDENTITY.founderName} — Founder & Developer, TRENDVERSE`,
  });
  upsertCanonical(url);

  setRouteJsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      ...buildCoreGraphNodes(origin, url, title),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: url }],
      },
    ],
  });
}

export function applySeoForArticle(article: Article): void {
  const title = `${article.title} — TRENDVERSE`;
  const desc = article.summary.slice(0, 160);
  const origin = getCanonicalOrigin();
  const articleUrl = `${origin}/article/${encodeURIComponent(article.slug)}`;
  const canonicalUrl = article.externalUrl || articleUrl;
  const categoryPath = `/search/label/${encodeURIComponent(article.categoryName)}`;

  const isDraft = article.editorialStatus === 'draft-pending-review';
  const authorType = article.authorId === 'vicky' ? 'Person' : 'Organization';

  document.title = title;
  upsertRobots(isDraft ? 'noindex, follow' : 'index, follow, max-image-preview:large');
  applySharedSocialTags({
    title: article.title,
    description: desc,
    url: canonicalUrl,
    ogType: 'article',
    author: article.authorName || FOUNDER_BRAND_IDENTITY.founderName,
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    articleSection: article.categoryName,
  });
  upsertCanonical(canonicalUrl);

  setRouteJsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      ...buildCoreGraphNodes(origin, canonicalUrl, title),
      {
        '@type': article.schemaType,
        '@id': `${canonicalUrl}#article`,
        headline: article.title,
        description: desc,
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
          { '@type': 'ListItem', position: 2, name: article.categoryName, item: `${origin}${categoryPath}` },
          { '@type': 'ListItem', position: 3, name: article.title, item: canonicalUrl },
        ],
      },
    ],
  });
}

export function applySeoForCategory(category: CategoryInfo): void {
  const title = `${category.name} — News, Analysis & Explainers | TRENDVERSE`;
  const desc = category.seoDescription.slice(0, 160);
  const origin = getCanonicalOrigin();
  const catUrl = `${origin}/search/label/${encodeURIComponent(category.bloggerLabel)}`;

  document.title = title;
  upsertRobots('index, follow, max-image-preview:large');
  applySharedSocialTags({
    title,
    description: desc,
    url: catUrl,
    ogType: 'website',
    author: FOUNDER_BRAND_IDENTITY.publisherName,
  });
  upsertCanonical(catUrl);

  setRouteJsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      ...buildCoreGraphNodes(origin, catUrl, title, 'CollectionPage'),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
          { '@type': 'ListItem', position: 2, name: category.name, item: catUrl },
        ],
      },
    ],
  });
}

const TOOL_TITLES: Record<string, string> = {
  'word-counter': 'Free Word Counter & Reading Time Estimator — TRENDVERSE',
  'percentage-calculator': 'Free Percentage Calculator & Change Tool — TRENDVERSE',
  'age-calculator': 'Exact Age Calculator in Years, Months & Days — TRENDVERSE',
  'unit-converter': 'International Unit Converter (Length, Mass, Data, Speed) — TRENDVERSE',
  'text-case-converter': 'Free Text Case Converter (Title, camelCase, snake_case) — TRENDVERSE',
  'character-counter': 'Character Counter & SEO Snippet Length Checker — TRENDVERSE',
};

export function applySeoForTools(toolId?: string): void {
  const title =
    (toolId && TOOL_TITLES[toolId]) || 'Free Online Utilities & Calculators — TRENDVERSE';
  const desc =
    'Fast, browser-based utilities including Word Counter, Percentage Calculator, Age Calculator, Unit Converter, Text Case Converter, and Character Counter.';
  const origin = getCanonicalOrigin();
  const toolsUrl = toolId ? `${origin}/tools/${encodeURIComponent(toolId)}` : `${origin}/tools`;

  document.title = title;
  upsertRobots('index, follow, max-image-preview:large');
  applySharedSocialTags({
    title,
    description: desc,
    url: toolsUrl,
    ogType: 'website',
    author: FOUNDER_BRAND_IDENTITY.founderName,
  });
  upsertCanonical(toolsUrl);

  setRouteJsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      ...buildCoreGraphNodes(origin, toolsUrl, title),
      {
        '@type': 'WebApplication',
        name: 'TRENDVERSE Online Utilities',
        url: toolsUrl,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All',
        description: desc,
        creator: { '@id': `${origin}/#founder-vicky` },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Free Online Tools', item: `${origin}/tools` },
          ...(toolId
            ? [{ '@type': 'ListItem', position: 3, name: toolId, item: toolsUrl }]
            : []),
        ],
      },
    ],
  });
}

export function applySeoForPolicy(pageId: PolicyPageId): void {
  const page = POLICY_PAGES[pageId];
  const title = `${page.title} — TRENDVERSE`;
  const desc = page.subtitle.slice(0, 160);
  const origin = getCanonicalOrigin();
  const pageUrl = `${origin}/policy/${encodeURIComponent(pageId)}`;
  const pageType =
    pageId === 'about' ? 'AboutPage' : pageId === 'contact' ? 'ContactPage' : 'WebPage';

  document.title = title;
  upsertRobots('index, follow, max-image-preview:large');
  applySharedSocialTags({
    title,
    description: desc,
    url: pageUrl,
    ogType: 'website',
    author: FOUNDER_BRAND_IDENTITY.founderName,
  });
  upsertCanonical(pageUrl);

  setRouteJsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      ...buildCoreGraphNodes(origin, pageUrl, title, pageType),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
          { '@type': 'ListItem', position: 2, name: page.title, item: pageUrl },
        ],
      },
    ],
  });
}

export function applySeoForBloggerHub(): void {
  const title = 'Blogger XML Theme, Draft Queue & Documentation — TRENDVERSE';
  const desc =
    'Internal Blogger XML theme documentation, feed connector, editorial draft queue, and integration readiness overview.';
  const origin = getCanonicalOrigin();
  const url = `${origin}/blogger-theme`;

  document.title = title;
  // Internal documentation & local draft queue should not compete in organic search results
  upsertRobots('noindex, follow');
  applySharedSocialTags({
    title,
    description: desc,
    url,
    ogType: 'website',
    author: FOUNDER_BRAND_IDENTITY.founderName,
  });
  upsertCanonical(url);
  setRouteJsonLd({
    '@context': 'https://schema.org',
    '@graph': buildCoreGraphNodes(origin, url, title),
  });
}

export function applySeoForAICenter(): void {
  const title = 'AI Intelligence Center — Models, Tools & News | TRENDVERSE';
  const desc =
    'Live official AI research news, verified AI tools directory across seven categories, model references, and technical explainers.';
  const origin = getCanonicalOrigin();
  const url = `${origin}/ai-center`;

  document.title = title;
  upsertRobots('index, follow, max-image-preview:large');
  applySharedSocialTags({
    title,
    description: desc,
    url,
    ogType: 'website',
    author: FOUNDER_BRAND_IDENTITY.publisherName,
  });
  upsertCanonical(url);
  setRouteJsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      ...buildCoreGraphNodes(origin, url, title),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
          { '@type': 'ListItem', position: 2, name: 'AI Intelligence Center', item: url },
        ],
      },
    ],
  });
}

export function applySeoForNewsCenter(): void {
  const title = 'Live Global News Center & Trend Radar — TRENDVERSE';
  const desc =
    'Real-time headlines from reputable international RSS feeds, live Google Trends radar, world clock, and global news coverage map.';
  const origin = getCanonicalOrigin();
  const url = `${origin}/news-center`;

  document.title = title;
  upsertRobots('index, follow, max-image-preview:large');
  applySharedSocialTags({
    title,
    description: desc,
    url,
    ogType: 'website',
    author: FOUNDER_BRAND_IDENTITY.publisherName,
  });
  upsertCanonical(url);
  setRouteJsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      ...buildCoreGraphNodes(origin, url, title, 'CollectionPage'),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Live Global News Center', item: url },
        ],
      },
    ],
  });
}

export function applySeoForBriefing(): void {
  const title = 'Your World in 60 Seconds — Daily Briefing & Audio | TRENDVERSE';
  const desc =
    'Concise daily global news briefing grounded in verified international feeds with source links, timestamps, and browser audio playback.';
  const origin = getCanonicalOrigin();
  const url = `${origin}/briefing`;

  document.title = title;
  upsertRobots('index, follow, max-image-preview:large');
  applySharedSocialTags({
    title,
    description: desc,
    url,
    ogType: 'website',
    author: FOUNDER_BRAND_IDENTITY.publisherName,
  });
  upsertCanonical(url);
  setRouteJsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      ...buildCoreGraphNodes(origin, url, title),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Your World in 60 Seconds', item: url },
        ],
      },
    ],
  });
}

export function applySeoForTrendBattle(): void {
  const title = 'Trend Battle — Compare Global Topic Interest | TRENDVERSE';
  const desc =
    'Compare relative search and reader interest between two topics across global regions, timelines, and related queries.';
  const origin = getCanonicalOrigin();
  const url = `${origin}/trend-battle`;

  document.title = title;
  upsertRobots('index, follow, max-image-preview:large');
  applySharedSocialTags({
    title,
    description: desc,
    url,
    ogType: 'website',
    author: FOUNDER_BRAND_IDENTITY.publisherName,
  });
  upsertCanonical(url);
  setRouteJsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      ...buildCoreGraphNodes(origin, url, title),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
          { '@type': 'ListItem', position: 2, name: 'Trend Battle', item: url },
        ],
      },
    ],
  });
}

export function applySeoForWhatsNew(): void {
  const title = "What's New Since Your Last Visit — Reader Digest | TRENDVERSE";
  const desc =
    'Catch up on newly published dispatches, rising topics, saved articles, and reading history stored privately in your browser.';
  const origin = getCanonicalOrigin();
  const url = `${origin}/whats-new`;

  document.title = title;
  upsertRobots('noindex, follow');
  applySharedSocialTags({
    title,
    description: desc,
    url,
    ogType: 'website',
    author: FOUNDER_BRAND_IDENTITY.publisherName,
  });
  upsertCanonical(url);
  setRouteJsonLd({
    '@context': 'https://schema.org',
    '@graph': buildCoreGraphNodes(origin, url, title),
  });
}

const CAREERS_SEO_MAP: Record<
  string,
  { path: string; label: string; title: string; desc: string }
> = {
  overview: {
    path: '/careers',
    label: 'Careers',
    title: 'TRENDVERSE CAREERS — Jobs, Internships & Scholarships',
    desc: 'Free international portal for verified jobs, student internships, remote work, scholarships, government recruitment links, and career tools.',
  },
  jobs: {
    path: '/careers/jobs',
    label: 'Jobs',
    title: 'Global Job Search — TRENDVERSE CAREERS',
    desc: 'Search verified remote, hybrid, and on-site openings sourced from free public job boards and official employer career pages.',
  },
  internships: {
    path: '/careers/internships',
    label: 'Internships',
    title: 'Student Internships & Paid Roles — TRENDVERSE CAREERS',
    desc: 'Discover verified student internships, working-student roles, remote internships, and free career preparation resources worldwide.',
  },
  remote: {
    path: '/careers/remote',
    label: 'Remote Jobs',
    title: 'Remote & Work From Home Jobs — TRENDVERSE CAREERS',
    desc: 'Explore global remote and work-from-home roles with transparent region eligibility and timezone alignment.',
  },
  fresher: {
    path: '/careers/fresher',
    label: 'Student & Fresher Center',
    title: 'Student Opportunity Center & Fresher Jobs — TRENDVERSE CAREERS',
    desc: 'Entry-level jobs, apprenticeships, graduate programmes, fellowships, free certifications, and student competitions.',
  },
  scholarships: {
    path: '/careers/scholarships',
    label: 'Scholarships',
    title: 'International Scholarship Directory — TRENDVERSE CAREERS',
    desc: 'Official university and government scholarships, NSF and UKRI research funding feeds, eligibility rules, and direct application links.',
  },
  government: {
    path: '/careers/government',
    label: 'Government Jobs',
    title: 'Official Government Recruitment Portals — TRENDVERSE CAREERS',
    desc: 'Official country-specific civil service and public sector recruitment portals for India, USA, UK, Canada, Australia, Germany, Singapore, UAE, and Japan.',
  },
  tools: {
    path: '/careers/tools',
    label: 'Career Tools',
    title: 'Free Student & Career Tools — TRENDVERSE CAREERS',
    desc: 'Free browser-local Resume Builder, ATS Resume Checker, Cover Letter Builder, Interview Practice, Salary Calculator, and Trackers.',
  },
};

export function applySeoForCareers(tab: string): void {
  const cfg = CAREERS_SEO_MAP[tab] || CAREERS_SEO_MAP.overview;
  const origin = getCanonicalOrigin();
  const canonicalUrl = `${origin}${cfg.path}`;

  document.title = cfg.title;
  upsertRobots('index, follow, max-image-preview:large');
  applySharedSocialTags({
    title: cfg.title,
    description: cfg.desc,
    url: canonicalUrl,
    ogType: 'website',
    author: FOUNDER_BRAND_IDENTITY.founderName,
  });
  upsertCanonical(canonicalUrl);

  const breadcrumbs = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
    { '@type': 'ListItem', position: 2, name: 'Careers', item: `${origin}/careers` },
  ];
  if (tab !== 'overview') {
    breadcrumbs.push({ '@type': 'ListItem', position: 3, name: cfg.label, item: canonicalUrl });
  }

  if (tab === 'tools') {
    setRouteJsonLd({
      '@context': 'https://schema.org',
      '@graph': [
        ...buildCoreGraphNodes(origin, canonicalUrl, cfg.title),
        {
          '@type': 'WebApplication',
          name: 'TRENDVERSE CAREERS Free Tools',
          url: canonicalUrl,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'All',
          description: cfg.desc,
          creator: { '@id': `${origin}/#founder-vicky` },
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs,
        },
      ],
    });
  } else {
    setRouteJsonLd({
      '@context': 'https://schema.org',
      '@graph': [
        ...buildCoreGraphNodes(origin, canonicalUrl, cfg.title),
        {
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs,
        },
      ],
    });
  }
}
