import React from 'react';
import {
  ArrowRight,
  Award,
  Briefcase,
  Globe,
  GraduationCap,
  Landmark,
  Wrench,
} from 'lucide-react';
import { AppRoute } from '../types/editorial';

interface CareersHomeHighlightProps {
  onNavigate: (route: AppRoute) => void;
}

export const CareersHomeHighlight: React.FC<CareersHomeHighlightProps> = ({ onNavigate }) => {
  const quickTracks: Array<{
    title: string;
    subtitle: string;
    tab: 'jobs' | 'internships' | 'remote' | 'fresher' | 'scholarships' | 'government' | 'tools';
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      title: 'Global Job Search',
      subtitle: 'Live public boards & official Greenhouse/Lever employer feeds',
      tab: 'jobs',
      icon: Briefcase,
    },
    {
      title: 'Internships & Student Center',
      subtitle: 'Paid internships, fresher jobs, apprenticeships & free certs',
      tab: 'fresher',
      icon: GraduationCap,
    },
    {
      title: 'Remote Work Radar',
      subtitle: 'Country-verified remote & work-from-home openings',
      tab: 'remote',
      icon: Globe,
    },
    {
      title: 'International Scholarships',
      subtitle: 'Chevening, DAAD, Fulbright, Erasmus+, NSF & UKRI funding',
      tab: 'scholarships',
      icon: Award,
    },
    {
      title: 'Government Portals',
      subtitle: 'India (UPSC, SSC, NCS) + USA, UK, Canada, EU & APAC',
      tab: 'government',
      icon: Landmark,
    },
    {
      title: '10 Free Career Tools',
      subtitle: 'Resume Builder, ATS Checker, Salary Converter & Trackers',
      tab: 'tools',
      icon: Wrench,
    },
  ];

  return (
    <section
      aria-labelledby="trendverse-careers-heading"
      className="bg-[#0b1324] text-white border-y border-white/10"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              TRENDVERSE CAREERS 1.0 · Free Public Opportunity Portal
            </p>
            <h2
              id="trendverse-careers-heading"
              className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl"
            >
              Discover Opportunities. Build Your Future.
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm text-slate-300">
              Explore live verified jobs, student internships, international scholarships, official
              government recruitment portals, and 10 browser-local career utilities—zero paid accounts.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate({ view: 'careers', tab: 'overview' })}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors self-start cursor-pointer shrink-0"
          >
            <span>Open Careers Portal</span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-7 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {quickTracks.map((track) => {
            const Icon = track.icon;
            return (
              <button
                key={track.tab}
                type="button"
                onClick={() => onNavigate({ view: 'careers', tab: track.tab })}
                className="group rounded-xl border border-white/15 bg-white/5 p-4 text-left hover:border-blue-400 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-blue-400" aria-hidden="true" />
                  <ArrowRight
                    className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-3 font-display text-base font-bold text-white">
                  {track.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">{track.subtitle}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
