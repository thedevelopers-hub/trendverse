import React, { useEffect, useRef, useState } from 'react';
import { CONSENT_UPDATED_EVENT, getConsentState } from '../utils/consent';
import {
  getAdSenseSlotId,
  getNormalizedAdSenseClientId,
  isAdSenseActive,
} from '../utils/thirdPartyScripts';

interface AdSlotProps {
  variant: 'leaderboard' | 'rectangle' | 'in-article';
  slotName: string;
}

/**
 * AdSense-ready placement container.
 * - Pre-approval (when AdSense is not configured/enabled): renders nothing so
 *   visitors and AdSense policy reviewers never encounter empty placeholder boxes.
 * - Live mode (when VITE_ADSENSE_ENABLED=true + valid ca-pub ID + advertising consent):
 *   renders a CLS-safe container labeled "Advertisement" with a real <ins class="adsbygoogle"> unit.
 */
export const AdSlot: React.FC<AdSlotProps> = ({ variant, slotName }) => {
  const adClient = getNormalizedAdSenseClientId();
  const adSlotId = getAdSenseSlotId(variant);
  const enabled = isAdSenseActive();
  const showPreview = import.meta.env?.VITE_ADSENSE_SHOW_PREVIEW === 'true';

  const [advertisingConsent, setAdvertisingConsent] = useState<boolean>(
    () => getConsentState().advertising
  );
  const pushedRef = useRef(false);

  useEffect(() => {
    const onConsentUpdate = () => {
      setAdvertisingConsent(getConsentState().advertising);
    };
    window.addEventListener(CONSENT_UPDATED_EVENT, onConsentUpdate);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, onConsentUpdate);
  }, []);

  useEffect(() => {
    if (!enabled || !adClient || !adSlotId || !advertisingConsent || pushedRef.current) return;
    try {
      pushedRef.current = true;
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Ignore AdSense push errors before script hydration
    }
  }, [enabled, adClient, adSlotId, advertisingConsent]);

  const heightClass =
    variant === 'leaderboard'
      ? 'min-h-[104px]'
      : variant === 'rectangle'
      ? 'min-h-[260px]'
      : 'min-h-[140px]';

  if (enabled && adClient && adSlotId && advertisingConsent) {
    return (
      <aside
        aria-label={`Advertisement: ${slotName}`}
        className={`w-full rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5 flex flex-col items-center justify-center ${heightClass}`}
      >
        <span className="mb-1.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500">
          Advertisement
        </span>
        <ins
          className="adsbygoogle block w-full"
          style={{ display: 'block' }}
          data-ad-client={adClient}
          data-ad-slot={adSlotId}
          data-ad-format={variant === 'in-article' ? 'fluid' : 'auto'}
          data-ad-layout={variant === 'in-article' ? 'in-article' : undefined}
          data-full-width-responsive="true"
        />
      </aside>
    );
  }

  if (showPreview) {
    return (
      <aside
        aria-label={`Reserved Advertisement Placement: ${slotName}`}
        className={`w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 flex flex-col items-center justify-center text-center ${heightClass}`}
      >
        <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">
          Advertisement
        </span>
        <p className="mt-1 text-xs text-slate-400">
          Layout Preview Container ({slotName})
        </p>
      </aside>
    );
  }

  return null;
};
