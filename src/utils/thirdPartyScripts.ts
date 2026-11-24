import { PrivacyConsentState } from './consent';

export const GTM_CONTAINER_ID = 'GTM-TXW2Z9KR';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    adsbygoogle?: unknown[];
    __trendverseGtmLoaded?: boolean;
  }
}

let gaLoaded = false;
let adsenseLoaded = false;
let lastConsentPushKey = '';
let initialPageLoadSeen = false;
let lastTrackedSpaPath = '';

export function isGtmInstalled(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false;
  return Boolean(
    window.__trendverseGtmLoaded ||
      document.querySelector(`script[src*="googletagmanager.com/gtm.js?id=${GTM_CONTAINER_ID}"]`)
  );
}

function ensureGtagInterface(): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function gtag() {
      // Push IArguments-style tuple compatible with GTM / gtag.js
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
  }
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

  // 1. Synchronize Google Consent Mode v2 for GTM (GTM-TXW2Z9KR) & GA4 without PII
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

    window.dataLayer?.push({
      event: 'trendverse_consent_update',
      gtm_container_id: GTM_CONTAINER_ID,
      consent_decided: consent.decided,
      analytics_storage: analyticsStatus,
      ad_storage: adStatus,
    });
  }

  // 2. Optional standalone Google Analytics 4 (only when valid Measurement ID is configured AND analytics consent granted)
  const gaId = (import.meta.env?.VITE_GA_MEASUREMENT_ID || '').trim();
  if (consent.analytics && /^G-[A-Z0-9]+$/i.test(gaId) && !gaLoaded && !document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}"]`)) {
    gaLoaded = true;
    window.gtag?.('js', new Date());
    window.gtag?.('config', gaId, { anonymize_ip: true, send_page_view: true });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(script);
  }

  // 3. Google AdSense (only loaded when explicitly enabled, valid client ID set, AND advertising consent granted)
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
 * Push a sanitized virtual pageview to GTM dataLayer on SPA client-side route transitions.
 * Strips query parameters and hash fragments so user search text or PII is never transmitted.
 * Skips the initial document mount so GTM's native Container Loaded pageview is not duplicated.
 */
export function trackSpaPageView(routeView: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const cleanPath = (window.location.pathname || '/').replace(/\/+$/, '') || '/';

  if (!initialPageLoadSeen) {
    initialPageLoadSeen = true;
    lastTrackedSpaPath = cleanPath;
    return;
  }

  if (cleanPath === lastTrackedSpaPath) return;
  lastTrackedSpaPath = cleanPath;

  ensureGtagInterface();
  window.dataLayer?.push({
    event: 'virtual_page_view',
    gtm_container_id: GTM_CONTAINER_ID,
    page_path: cleanPath,
    page_location: `${window.location.origin}${cleanPath}`,
    page_title: document.title,
    route_view: routeView,
  });
}

