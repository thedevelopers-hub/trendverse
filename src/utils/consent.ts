export interface PrivacyConsentState {
  decided: boolean;
  essential: true;
  analytics: boolean;
  advertising: boolean;
  updatedAt: string;
}

const CONSENT_STORAGE_KEY = 'trendverse_privacy_consent_v1';
export const OPEN_CONSENT_EVENT = 'trendverse:open-consent';
export const CONSENT_UPDATED_EVENT = 'trendverse:consent-updated';

const DEFAULT_CONSENT: PrivacyConsentState = {
  decided: false,
  essential: true,
  analytics: false,
  advertising: false,
  updatedAt: '',
};

export function getConsentState(): PrivacyConsentState {
  if (typeof window === 'undefined') return DEFAULT_CONSENT;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return DEFAULT_CONSENT;
    const parsed = JSON.parse(raw) as Partial<PrivacyConsentState>;
    return {
      decided: Boolean(parsed.decided),
      essential: true,
      analytics: Boolean(parsed.analytics),
      advertising: Boolean(parsed.advertising),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
    };
  } catch {
    return DEFAULT_CONSENT;
  }
}

export function saveConsentState(next: {
  analytics: boolean;
  advertising: boolean;
}): PrivacyConsentState {
  const state: PrivacyConsentState = {
    decided: true,
    essential: true,
    analytics: next.analytics,
    advertising: next.advertising,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage quota errors
    }
    window.dispatchEvent(new CustomEvent(CONSENT_UPDATED_EVENT, { detail: state }));
  }
  return state;
}

export function openConsentPreferences(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OPEN_CONSENT_EVENT));
  }
}
