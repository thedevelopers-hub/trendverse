import React, { Suspense, useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { AppRoute } from '../types/editorial';
import { routeToUrl } from '../utils/routes';

interface DeferredSectionProps {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionRoute?: AppRoute;
  dark?: boolean;
  minHeightClass?: string;
  onNavigate?: (route: AppRoute) => void;
  children: React.ReactNode;
}

/**
 * Progressively hydrates below-the-fold interactive modules as they approach the viewport
 * (or when targeted via URL hash / focus / interaction), shrinking initial JS execution,
 * TBT, and initial DOM size while keeping every semantic heading and route link discoverable.
 */
export const DeferredSection: React.FC<DeferredSectionProps> = ({
  id,
  eyebrow,
  title,
  description,
  actionLabel,
  actionRoute,
  dark = false,
  minHeightClass = 'min-h-[380px]',
  onNavigate,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.location.hash === `#${id}`;
  });

  useEffect(() => {
    if (shouldMount) return;

    const activateIfHashMatches = () => {
      if (window.location.hash === `#${id}`) {
        setShouldMount(true);
      }
    };
    window.addEventListener('hashchange', activateIfHashMatches);

    const node = containerRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setShouldMount(true);
      return () => window.removeEventListener('hashchange', activateIfHashMatches);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldMount(true);
          observer.disconnect();
        }
      },
      { rootMargin: '450px 0px' }
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      window.removeEventListener('hashchange', activateIfHashMatches);
    };
  }, [id, shouldMount]);

  const shell = (
    <section
      id={id}
      aria-label={title}
      className={
        dark
          ? `bg-[#0b1324] text-white border-y border-white/10 py-12 ${minHeightClass}`
          : `mx-auto max-w-[1200px] px-4 sm:px-6 py-12 ${minHeightClass}`
      }
    >
      <div className={dark ? 'mx-auto max-w-[1200px] px-4 sm:px-6' : ''}>
        <div
          className={
            dark
              ? 'rounded-2xl border border-white/10 bg-[#13203b]/60 p-6 sm:p-8'
              : 'rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:p-8'
          }
        >
          <p className={`text-xs font-semibold uppercase tracking-wider ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
            {eyebrow}
          </p>
          <h2 className={`mt-1.5 font-display text-2xl sm:text-3xl font-semibold ${dark ? 'text-white' : 'text-slate-900'}`}>
            {title}
          </h2>
          <p className={`mt-2 max-w-2xl text-sm ${dark ? 'text-slate-300' : 'text-slate-600'}`}>
            {description}
          </p>
          {actionLabel && actionRoute && (
            <div className="mt-5">
              <a
                href={routeToUrl(actionRoute)}
                onClick={(e) => {
                  if (!onNavigate || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  onNavigate(actionRoute);
                }}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  dark
                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                    : 'bg-[#0b1324] text-white hover:bg-slate-800'
                }`}
              >
                <span>{actionLabel}</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );

  return (
    <div
      ref={containerRef}
      style={!shouldMount ? { contentVisibility: 'auto' } : undefined}
      onFocusCapture={() => {
        if (!shouldMount) setShouldMount(true);
      }}
      onMouseEnter={() => {
        if (!shouldMount) setShouldMount(true);
      }}
    >
      {shouldMount ? <Suspense fallback={shell}>{children}</Suspense> : shell}
    </div>
  );
};
