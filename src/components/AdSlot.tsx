import React from 'react';

interface AdSlotProps {
  variant: 'leaderboard' | 'rectangle' | 'in-article';
  slotName: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ variant, slotName }) => {
  const heightClass =
    variant === 'leaderboard'
      ? 'min-h-[104px]'
      : variant === 'rectangle'
      ? 'min-h-[260px]'
      : 'min-h-[140px]';

  const dimensionsLabel =
    variant === 'leaderboard'
      ? 'Responsive Leaderboard Container (728 × 90 / Fluid)'
      : variant === 'rectangle'
      ? 'Responsive Medium Rectangle Container (300 × 250)'
      : 'Responsive In-Article Container (Fluid Width)';

  return (
    <aside
      aria-label={`Reserved Advertisement Placement: ${slotName}`}
      className={`w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 flex flex-col items-center justify-center text-center ${heightClass}`}
    >
      <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">
        Advertisement
      </span>
      <p className="mt-1 text-xs text-slate-400">
        {dimensionsLabel} — Reserved AdSense Slot ({slotName})
      </p>
    </aside>
  );
};
