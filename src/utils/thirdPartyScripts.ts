import { PrivacyConsentState } from './consent';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    adsbygoogle?: unknown[];
  }
}

let gaLoaded = false;
let adsenseLoaded = false;

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

  // 1. Google Analytics 4 (only loaded when valid Measurement ID is configured AND analytics consent granted)
  const gaId = (import.meta.env?.VITE_GA_MEASUREMENT_ID || '').trim();
  if (consent.analytics && /^G-[A-Z0-9]+$/i.test(gaId) && !gaLoaded) {
    gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: consent.advertising ? 'granted' : 'denied',
      ad_user_data: consent.advertising ? 'granted' : 'denied',
      ad_personalization: consent.advertising ? 'granted' : 'denied',
    });
    window.gtag('js', new Date());
    window.gtag('config', gaId, { anonymize_ip: true });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
    document.head.appendChild(script);
  } else if (gaLoaded && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      ad_storage: consent.advertising ? 'granted' : 'denied',
      ad_user_data: consent.advertising ? 'granted' : 'denied',
      ad_personalization: consent.advertising ? 'granted' : 'denied',
    });
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
