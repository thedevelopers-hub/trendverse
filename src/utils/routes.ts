import { AppRoute } from '../types/editorial';
import { getCategoryBySlug } from '../data/categories';

export const PRODUCTION_SITE_URL = 'https://trendverse-ten.vercel.app';

/**
 * Resolves the canonical production origin for metadata, Open Graph, and sitemaps.
 * Always normalizes to the configured site URL (defaulting to production Vercel URL)
 * so preview subdomains or local dev ports never leak into canonical tags.
 */
export function getCanonicalOrigin(): string {
  const configured =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SITE_URL) || '';
  const trimmed = configured.trim().replace(/\/+$/, '');
  if (
    trimmed &&
    /^https?:\/\//i.test(trimmed) &&
    !trimmed.includes('example.com') &&
    !trimmed.includes('YOUR-DOMAIN')
  ) {
    return trimmed;
  }
  return PRODUCTION_SITE_URL;
}

export function routeToUrl(route: AppRoute): string {
  switch (route.view) {
    case 'careers': {
      if (route.tab === 'overview') return '/careers';
      if (route.tab === 'tools' && route.toolId) return `/careers/tools/${route.toolId}`;
      return `/careers/${route.tab}`;
    }
    case 'home':
      return '/';
    case 'article':
      return `/article/${encodeURIComponent(route.slug)}`;
    case 'category': {
      const cat = getCategoryBySlug(route.slug);
      return `/search/label/${encodeURIComponent(cat?.bloggerLabel || route.slug)}`;
    }
    case 'tools':
      return route.toolId ? `/tools/${encodeURIComponent(route.toolId)}` : '/tools';
    case 'ai-center':
      return '/ai-center';
    case 'news-center':
      return '/news-center';
    case 'briefing':
      return '/briefing';
    case 'trend-battle':
      return '/trend-battle';
    case 'whats-new':
      return '/whats-new';
    case 'blogger-hub':
      return '/blogger-theme';
    case 'policy':
      return `/policy/${encodeURIComponent(route.pageId)}`;
    case 'not-found':
      return route.attemptedPath || '/404';
  }
}
