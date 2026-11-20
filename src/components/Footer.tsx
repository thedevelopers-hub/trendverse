import React from 'react';
import { AppRoute, PolicyPageId } from '../types/editorial';
import { EDITORIAL_CATEGORIES } from '../data/categories';

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

  return (
    <footer className="bg-[#060b16] text-slate-300 border-t border-white/10">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <button
              type="button"
              onClick={() => onNavigate({ view: 'home' })}
              className="font-display text-2xl font-bold tracking-wider text-white cursor-pointer"
            >
              TRENDVERSE
            </button>
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
              {EDITORIAL_CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <button
                    type="button"
                    onClick={() => onNavigate({ view: 'category', slug: cat.slug })}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Careers &amp; Tools
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate({ view: 'careers', tab: 'overview' })}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
                >
                  Careers Portal
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate({ view: 'careers', tab: 'internships' })}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
                >
                  Student Internships
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate({ view: 'careers', tab: 'scholarships' })}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
                >
                  Scholarships
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate({ view: 'careers', tab: 'government' })}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
                >
                  Government Portals
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate({ view: 'careers', tab: 'tools' })}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
                >
                  Career &amp; Resume Tools
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate({ view: 'briefing' })}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
                >
                  60s Briefing &amp; Battle
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate({ view: 'tools', toolId: 'word-counter' })}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
                >
                  Free Online Tools
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigate({ view: 'blogger-hub' })}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
                >
                  Blogger XML Theme
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white mb-4">
              Institutional &amp; Policies
            </h3>
            <ul className="space-y-2.5 text-sm">
              {policyLinks.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate({ view: 'policy', pageId: item.id })}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-8 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} TRENDVERSE. All rights reserved.</p>
          <p>English-first international edition · Built for fast, accessible reading.</p>
        </div>
      </div>
    </footer>
  );
};
