import { Article, CategoryInfo, PolicyPageId } from '../types/editorial';
import { FOUNDER_BRAND_IDENTITY, POLICY_PAGES } from '../data/workflowAndPolicies';

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function upsertRobots(content = 'index, follow, max-image-preview:large'): void {
  upsertMeta('name', 'robots', content);
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

function buildPublisherAndFounderNodes(origin: string, pageUrl: string, pageTitle: string) {
  return [
    {
      '@type': 'Organization',
      '@id': `${origin}/#organization`,
      name: FOUNDER_BRAND_IDENTITY.brandName,
      slogan: FOUNDER_BRAND_IDENTITY.tagline,
      url: `${origin}/`,
      founder: { '@id': `${origin}/#founder-vicky` },
    },
    {
      '@type': 'Person',
      '@id': `${origin}/#founder-vicky`,
      name: FOUNDER_BRAND_IDENTITY.founderName,
      jobTitle: 'Founder & Developer',
      worksFor: { '@id': `${origin}/#organization` },
    },
    {
      '@type': 'WebPage',
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
  const origin = window.location.origin;
  const url = `${origin}/`;

  document.title = title;
  upsertRobots('index, follow, max-image-preview:large');
  upsertMeta('name', 'description', desc);
  upsertMeta('name', 'author', FOUNDER_BRAND_IDENTITY.founderName);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', desc);
  upsertMeta('property', 'og:url', url);
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', desc);
  upsertCanonical(url);

  setRouteJsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      ...buildPublisherAndFounderNodes(origin, url, title),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: url,
          },
        ],
      },
    ],
  });
}

export function applySeoForArticle(article: Article): void {
  const title = `${article.title} — TRENDVERSE`;
  const desc = article.summary.slice(0, 160);
  const origin = window.location.origin;
  const articleUrl = `${origin}/article/${encodeURIComponent(article.slug)}`;
  const categoryPath = `/search/label/${encodeURIComponent(article.categoryName)}`;

  document.title = title;
  upsertRobots('index, follow, max-image-preview:large');
  upsertMeta('name', 'description', desc);
  upsertMeta('name', 'author', article.authorName || FOUNDER_BRAND_IDENTITY.founderName);
  upsertMeta('property', 'og:type', 'article');
  upsertMeta('property', 'og:title', article.title);
  upsertMeta('property', 'og:description', desc);
  upsertMeta('property', 'og:url', articleUrl);
  upsertMeta('name', 'twitter:title', article.title);
  upsertMeta('name', 'twitter:description', desc);
  upsertCanonical(article.externalUrl || articleUrl);

  setRouteJsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      ...buildPublisherAndFounderNodes(origin, articleUrl, title),
      {
        '@type': article.schemaType,
        headline: article.title,
        description: desc,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        inLanguage: 'en',
        articleSection: article.categoryName,
        author: {
          '@type': 'Organization',
          name: article.authorName,
        },
        publisher: {
          '@type': 'Organization',
          '@id': `${origin}/#organization`,
          name: FOUNDER_BRAND_IDENTITY.brandName,
          founder: { '@id': `${origin}/#founder-vicky` },
        },
        mainEntityOfPage: article.externalUrl || articleUrl,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${origin}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: article.categoryName,
            item: `${origin}${categoryPath}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: article.title,
            item: articleUrl,
          },
        ],
      },
    ],
  });
}

export function applySeoForCategory(category: CategoryInfo): void {
  const title = `${category.name} — TRENDVERSE`;
  const origin = window.location.origin;
  const catUrl = `${origin}/search/label/${encodeURIComponent(category.bloggerLabel)}`;

  document.title = title;
  upsertRobots('index, follow, max-image-preview:large');
  upsertMeta('name', 'description', category.seoDescription);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', category.seoDescription);
  upsertMeta('property', 'og:url', catUrl);
  upsertCanonical(catUrl);

  setRouteJsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      ...buildPublisherAndFounderNodes(origin, catUrl, title),
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

export function applySeoForTools(toolLabel?: string): void {
  const title = toolLabel
    ? `${toolLabel} — Free Online Tools | TRENDVERSE`
    : 'Free Online Utilities & Calculators — TRENDVERSE';
  const desc =
    'Fast, browser-based utilities including Word Counter, Percentage Calculator, Age Calculator, Unit Converter, Text Case Converter, and Character Counter.';
  const origin = window.location.origin;
  const toolsUrl = toolLabel ? `${origin}/tools/${encodeURIComponent(toolLabel)}` : `${origin}/tools`;

  document.title = title;
  upsertRobots('index, follow, max-image-preview:large');
  upsertMeta('name', 'description', desc);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', desc);
  upsertMeta('property', 'og:url', toolsUrl);
  upsertCanonical(toolsUrl);

  setRouteJsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      ...buildPublisherAndFounderNodes(origin, toolsUrl, title),
      {
        '@type': 'WebApplication',
        name: 'TRENDVERSE Online Utilities',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'All',
        description: desc,
        creator: { '@id': `${origin}/#founder-vicky` },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      },
    ],
  });
}

export function applySeoForPolicy(pageId: PolicyPageId): void {
  const page = POLICY_PAGES[pageId];
  const title = `${page.title} — TRENDVERSE`;
  const origin = window.location.origin;
  const pageUrl = `${origin}/policy/${encodeURIComponent(pageId)}`;

  document.title = title;
  upsertRobots('index, follow, max-image-preview:large');
  upsertMeta('name', 'description', page.subtitle);
  upsertMeta('name', 'author', FOUNDER_BRAND_IDENTITY.founderName);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', page.subtitle);
  upsertMeta('property', 'og:url', pageUrl);
  upsertCanonical(pageUrl);

  setRouteJsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      ...buildPublisherAndFounderNodes(origin, pageUrl, title),
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
  const title = 'Blogger XML Theme, Architecture & SEO Guide — TRENDVERSE';
  const desc =
    'Complete responsive Blogger XML theme, architecture blueprint, GitHub structure, SEO setup, and Google AdSense readiness documentation for TRENDVERSE.';
  const origin = window.location.origin;
  const url = `${origin}/blogger-theme`;

  document.title = title;
  upsertRobots('index, follow, max-image-preview:large');
  upsertMeta('name', 'description', desc);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', desc);
  upsertMeta('property', 'og:url', url);
  upsertCanonical(url);
  setRouteJsonLd({
    '@context': 'https://schema.org',
    '@graph': buildPublisherAndFounderNodes(origin, url, title),
  });
}

export function applySeoForAICenter(): void {
  const title = 'AI Intelligence Center — Models, Tools & News | TRENDVERSE';
  const desc =
    'Live official AI research news, verified AI tools directory across seven categories, official model pricing references, and technical explainers.';
  const origin = window.location.origin;
  const url = `${origin}/ai-center`;

  document.title = title;
  upsertRobots('index, follow, max-image-preview:large');
  upsertMeta('name', 'description', desc);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', desc);
  upsertMeta('property', 'og:url', url);
  upsertCanonical(url);
  setRouteJsonLd({
    '@context': 'https://schema.org',
    '@graph': buildPublisherAndFounderNodes(origin, url, title),
  });
}

export function applySeoForNewsCenter(): void {
  const title = 'Live Global News Center & Trend Radar — TRENDVERSE';
  const desc =
    'Real-time headlines from reputable international RSS feeds, live Google Trends radar, world clock, and global news map.';
  const origin = window.location.origin;
  const url = `${origin}/news-center`;

  document.title = title;
  upsertRobots('index, follow, max-image-preview:large');
  upsertMeta('name', 'description', desc);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', desc);
  upsertMeta('property', 'og:url', url);
  upsertCanonical(url);
  setRouteJsonLd({
    '@context': 'https://schema.org',
    '@graph': buildPublisherAndFounderNodes(origin, url, title),
  });
}

export function applySeoForBriefing(): void {
  const title = 'Your World in 60 Seconds — Daily Briefing & Audio | TRENDVERSE';
  const desc =
    'Concise daily global briefing grounded in verified international feeds with source links, publication timestamps, and browser audio playback.';
  const origin = window.location.origin;
  const url = `${origin}/briefing`;

  document.title = title;
  upsertRobots('index, follow, max-image-preview:large');
  upsertMeta('name', 'description', desc);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', desc);
  upsertMeta('property', 'og:url', url);
  upsertCanonical(url);
  setRouteJsonLd({
    '@context': 'https://schema.org',
    '@graph': buildPublisherAndFounderNodes(origin, url, title),
  });
}

export function applySeoForTrendBattle(): void {
  const title = 'Trend Battle — Compare Global Topic Interest | TRENDVERSE';
  const desc =
    'Compare relative search and public reader interest between two topics across regions, timelines, and related search queries.';
  const origin = window.location.origin;
  const url = `${origin}/trend-battle`;

  document.title = title;
  upsertRobots('index, follow, max-image-preview:large');
  upsertMeta('name', 'description', desc);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', desc);
  upsertMeta('property', 'og:url', url);
  upsertCanonical(url);
  setRouteJsonLd({
    '@context': 'https://schema.org',
    '@graph': buildPublisherAndFounderNodes(origin, url, title),
  });
}

export function applySeoForWhatsNew(): void {
  const title = "What's New Since Your Last Visit — Reader Digest | TRENDVERSE";
  const desc =
    'Catch up on newly published dispatches, rising topics, saved articles, and reading history stored privately in your browser.';
  const origin = window.location.origin;
  const url = `${origin}/whats-new`;

  document.title = title;
  // Personalized local reader digest should not be indexed as duplicate static content
  upsertRobots('noindex, follow');
  upsertMeta('name', 'description', desc);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', desc);
  upsertCanonical(url);
  setRouteJsonLd({
    '@context': 'https://schema.org',
    '@graph': buildPublisherAndFounderNodes(origin, url, title),
  });
}

const CAREERS_SEO_MAP: Record<
  string,
  { path: string; label: string; title: string; desc: string }
> = {
  overview: {
    path: '/careers',
    label: 'Careers',
    title: 'TRENDVERSE CAREERS — Discover Opportunities. Build Your Future.',
    desc: 'Free international portal for jobs, student internships, remote work, international scholarships, government recruitment links, and career tools.',
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
    title: 'Internships & Paid Student Roles — TRENDVERSE CAREERS',
    desc: 'Discover verified student internships, working-student roles, remote internships, and free career resources worldwide.',
  },
  remote: {
    path: '/careers/remote',
    label: 'Remote Jobs',
    title: 'Remote & Work From Home Opportunities — TRENDVERSE CAREERS',
    desc: 'Explore remote and work-from-home roles with transparent country eligibility and local timezone indicators.',
  },
  fresher: {
    path: '/careers/fresher',
    label: 'Student & Fresher Center',
    title: 'Student Opportunity Center & Fresher Jobs — TRENDVERSE CAREERS',
    desc: 'Fresher jobs, internships, apprenticeships, graduate programmes, fellowships, research funding, free certifications, and student competitions.',
  },
  scholarships: {
    path: '/careers/scholarships',
    label: 'Scholarships',
    title: 'International Scholarship Discovery Directory — TRENDVERSE CAREERS',
    desc: 'Official university and government scholarships, NSF and UKRI research funding feeds, eligibility rules, and official application links.',
  },
  government: {
    path: '/careers/government',
    label: 'Government Jobs',
    title: 'Official Government Recruitment & Public Portals — TRENDVERSE CAREERS',
    desc: 'Country-specific official government recruitment portals including India (UPSC, SSC, NCS), USA, UK, Canada, Australia, Germany, Singapore, UAE, and Japan.',
  },
  tools: {
    path: '/careers/tools',
    label: 'Career Tools',
    title: 'Free Student & Career Tools — TRENDVERSE CAREERS',
    desc: 'Free browser-local Resume Builder, ATS Resume Checker, Cover Letter Builder, Interview Practice, Salary Calculator, and Application Trackers.',
  },
};

export function applySeoForCareers(tab: string): void {
  const cfg = CAREERS_SEO_MAP[tab] || CAREERS_SEO_MAP.overview;
  const origin = window.location.origin;
  const canonicalUrl = `${origin}${cfg.path}`;

  document.title = cfg.title;
  upsertRobots('index, follow, max-image-preview:large');
  upsertMeta('name', 'description', cfg.desc);
  upsertMeta('name', 'author', FOUNDER_BRAND_IDENTITY.founderName);
  upsertMeta('property', 'og:type', 'website');
  upsertMeta('property', 'og:title', cfg.title);
  upsertMeta('property', 'og:description', cfg.desc);
  upsertMeta('property', 'og:url', canonicalUrl);
  upsertMeta('name', 'twitter:title', cfg.title);
  upsertMeta('name', 'twitter:description', cfg.desc);
  upsertCanonical(canonicalUrl);

  const breadcrumbs = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
    { '@type': 'ListItem', position: 2, name: 'Careers', item: `${origin}/careers` },
  ];
  if (tab !== 'overview') {
    breadcrumbs.push({ '@type': 'ListItem', position: 3, name: cfg.label, item: canonicalUrl });
  }

  // Strictly avoid JobPosting JSON-LD on third-party job listings per provider terms;
  // use clean BreadcrumbList + WebPage/Organization (plus WebApplication on free Career Tools).
  if (tab === 'tools') {
    setRouteJsonLd({
      '@context': 'https://schema.org',
      '@graph': [
        ...buildPublisherAndFounderNodes(origin, canonicalUrl, cfg.title),
        {
          '@type': 'WebApplication',
          name: 'TRENDVERSE CAREERS Free Tools',
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
        ...buildPublisherAndFounderNodes(origin, canonicalUrl, cfg.title),
        {
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs,
        },
      ],
    });
  }
}
