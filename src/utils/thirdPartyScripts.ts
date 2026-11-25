import { PrivacyConsentState } from './consent';

export const GA_MEASUREMENT_ID = 'G-TN4QF7535G';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    adsbygoogle?: unknown[];
  }
}

let adsenseLoaded = false;
let lastConsentPushKey = '';
let initialPageLoadSeen = false;
let lastTrackedSpaPath = '';

export function isGa4Installed(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  return Boolean(
    typeof window.gtag === 'function' &&
      document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`)
  );
}

function ensureGtagInterface(): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
  }
}

function sanitizeEventString(value: string, maxLength = 80): string {
  return value.trim().slice(0, maxLength);
}

function sanitizePathOrLabel(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.startsWith('/')) {
    return trimmed.split(/[?#]/)[0].slice(0, 120) || '/';
  }
  return trimmed.slice(0, 80);
}

export function getNormalizedAdSenseClientId(): string | null {
  const raw = (import.meta.env?.VITE_ADSENSE_PUBLISHER_ID || '').trim();
  if (!raw) return null;
  const prefixed = raw.startsWith('ca-') ? raw : `ca-${raw}`;
  return /^ca-pub-\d{10,20}$/.test(prefixed) ? prefixed : null;
}

export function isAdSenseActive(): boolean {
  return (
    import.meta.env?.VITE_ADSENSE_ENABLED === 'true' &&
    Boolean(getNormalizedAdSenseClientId())
  );
}

export function getAdSenseSlotId(
  variant: 'leaderboard' | 'rectangle' | 'in-article'
): string | null {
  const raw =
    variant === 'leaderboard'
      ? import.meta.env?.VITE_ADSENSE_SLOT_LEADERBOARD
      : variant === 'rectangle'
      ? import.meta.env?.VITE_ADSENSE_SLOT_RECTANGLE
      : import.meta.env?.VITE_ADSENSE_SLOT_IN_ARTICLE;
  const trimmed = (raw || '').trim();
  return /^\d{6,20}$/.test(trimmed) ? trimmed : null;
}

export function syncThirdPartyScriptsWithConsent(consent: PrivacyConsentState): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;

  ensureGtagInterface();

  // 1. Synchronize Google Consent Mode v2 for direct GA4 (G-TN4QF7535G) & AdSense without PII
  const analyticsStatus = consent.analytics ? 'granted' : 'denied';
  const adStatus = consent.advertising ? 'granted' : 'denied';
  const consentKey = `${consent.decided}:${analyticsStatus}:${adStatus}`;

  if (consentKey !== lastConsentPushKey) {
    lastConsentPushKey = consentKey;
    window.gtag?.('consent', 'update', {
      analytics_storage: analyticsStatus,
      ad_storage: adStatus,
      ad_user_data: adStatus,
      ad_personalization: adStatus,
      personalization_storage: analyticsStatus,
    });
    window.gtag?.('set', 'ads_data_redaction', !consent.advertising);
    window.gtag?.('set', 'url_passthrough', false);
  }

  // 2. Google AdSense (only loaded when explicitly enabled, valid client ID set, AND advertising consent granted)
  const adsClient = getNormalizedAdSenseClientId();
  if (
    isAdSenseActive() &&
    adsClient &&
    consent.advertising &&
    !adsenseLoaded &&
    !document.querySelector('script[data-trendverse-adsense="true"]')
  ) {
    adsenseLoaded = true;
    const adScript = document.createElement('script');
    adScript.async = true;
    adScript.crossOrigin = 'anonymous';
    adScript.dataset.trendverseAdsense = 'true';
    adScript.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsClient)}`;
    document.head.appendChild(adScript);
  }
}

/**
 * Send deduplicated GA4 page_view and SPA page_navigation events via gtag.js.
 * Strips query parameters and hash fragments so search inputs or PII are never transmitted.
 * Deduplicates by cleanPath so React StrictMode double-mounts or data refreshes never double-count.
 */
export function trackSpaPageView(routeView: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const cleanPath = (window.location.pathname || '/').replace(/\/+$/, '') || '/';

  if (initialPageLoadSeen && cleanPath === lastTrackedSpaPath) {
    return;
  }

  const previousPath = lastTrackedSpaPath;
  const isSpaNavigation = initialPageLoadSeen && previousPath !== '' && previousPath !== cleanPath;

  initialPageLoadSeen = true;
  lastTrackedSpaPath = cleanPath;

  ensureGtagInterface();

  window.gtag?.('event', 'page_view', {
    page_title: document.title,
    page_path: cleanPath,
    page_location: `${window.location.origin}${cleanPath}`,
    route_view: sanitizeEventString(routeView, 40),
  });

  if (isSpaNavigation) {
    window.gtag?.('event', 'page_navigation', {
      from_path: previousPath,
      to_path: cleanPath,
      route_view: sanitizeEventString(routeView, 40),
      navigation_type: 'spa',
    });
  }
}

export function trackCtaClick(params: {
  ctaName: string;
  ctaLocation: string;
  destination?: string;
}): void {
  if (typeof window === 'undefined') return;
  ensureGtagInterface();
  const cleanDest = sanitizePathOrLabel(params.destination);
  window.gtag?.('event', 'cta_click', {
    cta_name: sanitizeEventString(params.ctaName, 60),
    cta_location: sanitizeEventString(params.ctaLocation, 60),
    ...(cleanDest ? { link_destination: cleanDest } : {}),
  });
}

export function trackFormSubmit(params: {
  formName: string;
  formLocation: string;
  formCategory?: string;
}): void {
  if (typeof window === 'undefined') return;
  ensureGtagInterface();
  const cleanCat = params.formCategory ? sanitizeEventString(params.formCategory, 60) : undefined;
  window.gtag?.('event', 'form_submit', {
    form_name: sanitizeEventString(params.formName, 60),
    form_location: sanitizeEventString(params.formLocation, 60),
    ...(cleanCat ? { form_category: cleanCat } : {}),
  });
}
