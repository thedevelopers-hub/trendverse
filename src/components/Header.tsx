import React, { useState } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { AppRoute } from '../types/editorial';

interface HeaderProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRoute, onNavigate, onOpenSearch }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{ label: string; route: AppRoute; isActive: boolean }> = [
    {
      label: 'Newsroom',
      route: { view: 'home' },
      isActive:
        currentRoute.view === 'home' ||
        currentRoute.view === 'article' ||
        currentRoute.view === 'news-center' ||
        currentRoute.view === 'category' ||
        currentRoute.view === 'ai-center' ||
        currentRoute.view === 'blogger-hub',
    },
    {
      label: '60s Briefing',
      route: { view: 'briefing' },
      isActive: currentRoute.view === 'briefing',
    },
    {
      label: 'Trend Battle',
      route: { view: 'trend-battle' },
      isActive: currentRoute.view === 'trend-battle',
    },
    {
      label: "What's New",
      route: { view: 'whats-new' },
      isActive: currentRoute.view === 'whats-new',
    },
    {
      label: 'Careers',
      route: { view: 'careers', tab: 'overview' },
      isActive: currentRoute.view === 'careers',
    },
    {
      label: 'Free Tools',
      route: { view: 'tools', toolId: 'word-counter' },
      isActive: currentRoute.view === 'tools',
    },
  ];

  const handleLinkClick = (route: AppRoute) => {
    setMobileMenuOpen(false);
    onNavigate(route);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1324]/95 text-white backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-4 sm:px-6">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleLinkClick({ view: 'home' })}
          className="font-display text-xl font-bold tracking-wider text-white whitespace-nowrap shrink-0 cursor-pointer hover:text-blue-400 transition-colors"
        >
          TRENDVERSE
        </button>

        {/* Zone 2: Concise single-line navigation links */}
        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-5">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleLinkClick(item.route)}
              className={`text-sm font-medium whitespace-nowrap shrink-0 cursor-pointer transition-colors underline-offset-8 ${
                item.isActive
                  ? 'text-white underline decoration-blue-500 decoration-2'
                  : 'text-slate-300 hover:text-white hover:underline'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: 1 Primary Action (Search) + Mobile Menu Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Search className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Search</span>
          </button>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex md:hidden items-center justify-center rounded-lg border border-white/20 p-2 text-slate-200 hover:bg-white/10 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="border-t border-white/10 bg-[#0b1324] px-4 py-3 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleLinkClick(item.route)}
                className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors cursor-pointer ${
                  item.isActive
                    ? 'bg-blue-600/20 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};
