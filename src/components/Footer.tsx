import React from 'react';
import { AppRoute, PolicyPageId } from '../types/editorial';
import { EDITORIAL_CATEGORIES } from '../data/categories';
import { routeToUrl } from '../utils/routes';
import { openConsentPreferences } from '../utils/consent';

interface FooterProps {
  onNavigate: (route: AppRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const policyLinks: Array<{ id: PolicyPageId; label: string }> = [
    { id: 'about', label: 'About' },
    { id: 'contact', label: 'Contact' },
    { id: 'privacy-policy', label: 'Privacy Policy' },
    { id: 'terms-and-conditions', label: 'Terms and Conditions' },
    { id: 'disclaimer', label: 'Disclaimer' },
    { id: 'editorial-policy', label: 'Editorial Policy' },
  ];

  const handleNavClick = (e: React.MouseEvent, route: AppRoute) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    onNavigate(route);
  };

  return (
    <footer className="bg-[#060b16] text-slate-300 border-t border-white/10">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <a
              href="/"
              onClick={(e) => handleNavClick(e, { view: 'home' })}
              className="inline-block font-display text-2xl font-bold tracking-wider text-white cursor-pointer"
            >
              TRENDVERSE
            </a>
            <p className="mt-2 text-sm font-medium text-blue-400">Discover What&apos;s Next.</p>
            <p className="mt-4 text-sm leading-relaxed text-slate-400 max-w-sm">
              Independent international digital media, live trend intelligence, career opportunities,
              and browser-local tools. Founded and developed by <strong className="text-white">Vicky</strong>.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Publisher: <span className="text-slate-200">TRENDVERSE Editorial Team</span>
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Editorial Sections
            </h3>
            <ul className="space-y-2.5 text-sm">
              {EDITORIAL_CATEGORIES.map((cat) => {
                const route: AppRoute = { view: 'category', slug: cat.slug };
                return (
                  <li key={cat.slug}>
                    <a
                      href={routeToUrl(route)}
                      onClick={(e) => handleNavClick(e, route)}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
                    >
                      {cat.name}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Careers &amp; Tools
            </h3>
            <ul className="space-y-2.5 text-sm">
              {(
                [
                  { label: 'Careers Portal', route: { view: 'careers', tab: 'overview' } },
                  { label: 'Student Internships', route: { view: 'careers', tab: 'internships' } },
                  { label: 'Scholarships', route: { view: 'careers', tab: 'scholarships' } },
                  { label: 'Government Portals', route: { view: 'careers', tab: 'government' } },
                  { label: 'Career & Resume Tools', route: { view: 'careers', tab: 'tools' } },
                  { label: '60s Briefing & Battle', route: { view: 'briefing' } },
                  { label: 'Free Online Tools', route: { view: 'tools', toolId: 'word-counter' } },
                  { label: 'Blogger XML Theme', route: { view: 'blogger-hub' } },
                ] as Array<{ label: string; route: AppRoute }>
              ).map((item) => (
                <li key={item.label}>
                  <a
                    href={routeToUrl(item.route)}
                    onClick={(e) => handleNavClick(e, item.route)}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Institutional &amp; Policies
            </h3>
            <ul className="space-y-2.5 text-sm">
              {policyLinks.map((item) => {
                const route: AppRoute = { view: 'policy', pageId: item.id };
                return (
                  <li key={item.id}>
                    <a
                      href={routeToUrl(route)}
                      onClick={(e) => handleNavClick(e, route)}
                      className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
              <li>
                <button
                  type="button"
                  onClick={() => openConsentPreferences()}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
                >
                  Privacy &amp; Cookie Settings
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-8 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} TRENDVERSE. All rights reserved.</p>
          <p>
            English-first international edition ·{' '}
            <a href="/sitemap.xml" className="hover:text-white underline underline-offset-2">
              Sitemap
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};
