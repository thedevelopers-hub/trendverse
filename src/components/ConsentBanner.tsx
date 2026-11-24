import React, { useEffect, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { AppRoute } from '../types/editorial';
import {
  getConsentState,
  OPEN_CONSENT_EVENT,
  PrivacyConsentState,
  saveConsentState,
} from '../utils/consent';
import { syncThirdPartyScriptsWithConsent } from '../utils/thirdPartyScripts';

interface ConsentBannerProps {
  onNavigate: (route: AppRoute) => void;
}

export const ConsentBanner: React.FC<ConsentBannerProps> = ({ onNavigate }) => {
  const [consent, setConsent] = useState<PrivacyConsentState>(() => getConsentState());
  const [visible, setVisible] = useState<boolean>(() => !getConsentState().decided);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(consent.analytics);
  const [adsEnabled, setAdsEnabled] = useState<boolean>(consent.advertising);

  useEffect(() => {
    syncThirdPartyScriptsWithConsent(consent);
  }, [consent]);

  useEffect(() => {
    const handleOpen = () => {
      const current = getConsentState();
      setAnalyticsEnabled(current.analytics);
      setAdsEnabled(current.advertising);
      setShowPreferences(true);
      setVisible(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, handleOpen);
  }, []);

  if (!visible) return null;

  const handleAcceptAll = () => {
    const next = saveConsentState({ analytics: true, advertising: true });
    setConsent(next);
    setVisible(false);
    setShowPreferences(false);
  };

  const handleEssentialOnly = () => {
    const next = saveConsentState({ analytics: false, advertising: false });
    setConsent(next);
    setVisible(false);
    setShowPreferences(false);
  };

  const handleSaveCustom = () => {
    const next = saveConsentState({
      analytics: analyticsEnabled,
      advertising: adsEnabled,
    });
    setConsent(next);
    setVisible(false);
    setShowPreferences(false);
  };

  return (
    <aside
      aria-label="Privacy and cookie preferences"
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-50 rounded-xl border border-slate-700/80 bg-[#0b1324] text-slate-100 shadow-2xl p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold text-white">
            Privacy &amp; Cookie Preferences
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-300">
            TRENDVERSE uses essential browser storage for reading preferences and tools. Optional
            analytics and advertising cookies load only with your consent.{' '}
            <a
              href="/policy/privacy-policy"
              onClick={(e) => {
                e.preventDefault();
                onNavigate({ view: 'policy', pageId: 'privacy-policy' });
              }}
              className="text-blue-400 underline hover:text-blue-300"
            >
              Privacy Policy
            </a>
          </p>
        </div>
        {consent.decided && (
          <button
            type="button"
            aria-label="Close privacy preferences"
            onClick={() => setVisible(false)}
            className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {showPreferences && (
        <div className="mt-3 space-y-2.5 border-t border-white/10 pt-3 text-xs">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-semibold text-white">Essential Storage</div>
              <div className="text-[11px] text-slate-400">
                Required for navigation, clock mode, and saved reading digest.
              </div>
            </div>
            <span className="font-mono-tabular text-[11px] text-blue-400">Always On</span>
          </div>

          <label className="flex items-center justify-between gap-2 cursor-pointer">
            <div>
              <div className="font-semibold text-white">Audience Analytics</div>
              <div className="text-[11px] text-slate-400">
                Aggregated traffic measurement when configured.
              </div>
            </div>
            <input
              type="checkbox"
              checked={analyticsEnabled}
              onChange={(e) => setAnalyticsEnabled(e.target.checked)}
              className="h-4 w-4 accent-blue-600 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between gap-2 cursor-pointer">
            <div>
              <div className="font-semibold text-white">Advertising Partners</div>
              <div className="text-[11px] text-slate-400">
                AdSense measurement and delivery when active.
              </div>
            </div>
            <input
              type="checkbox"
              checked={adsEnabled}
              onChange={(e) => setAdsEnabled(e.target.checked)}
              className="h-4 w-4 accent-blue-600 cursor-pointer"
            />
          </label>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleAcceptAll}
          className="rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors cursor-pointer"
        >
          Accept All
        </button>
        <button
          type="button"
          onClick={handleEssentialOnly}
          className="rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
        >
          Essential Only
        </button>
        {!showPreferences ? (
          <button
            type="button"
            onClick={() => setShowPreferences(true)}
            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Manage</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSaveCustom}
            className="rounded-lg border border-blue-400/50 bg-blue-950/60 px-3 py-1.5 text-xs font-semibold text-blue-200 hover:bg-blue-900/60 cursor-pointer"
          >
            Save Preferences
          </button>
        )}
      </div>
    </aside>
  );
};
