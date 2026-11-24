import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Award,
  Bookmark,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock,
  Compass,
  Filter,
  Globe,
  GraduationCap,
  Landmark,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserCheck,
  Wrench,
} from 'lucide-react';
import {
  CareerCertificationProgram,
  CareerOpportunity,
  CareersOpportunitiesResponse,
} from '../../../server/types';
import { AppRoute, CareersTab, CareerToolId } from '../../types/editorial';
import {
  fetchCareerOpportunities,
  fetchGovernmentJobs,
  fetchScholarships,
  fetchStudentCertifications,
  GovernmentApiResponse,
  ScholarshipsApiResponse,
} from '../../services/careersApi';
import {
  ApplicationTrackerEntry,
  CareerProfilePreferences,
  clearCareersProfile,
  loadCareersProfile,
  saveCareersProfile,
} from '../../utils/careerPreferences';
import { formatRelativeTime } from '../../utils/timeFormat';
import { routeToUrl } from '../../utils/routes';
import { AdSlot } from '../AdSlot';
import { JobListingCard } from './JobListingCard';
import { CareerToolsSuite } from './CareerToolsSuite';

interface CareersPortalProps {
  activeTab: CareersTab;
  initialToolId?: CareerToolId;
  onNavigate: (route: AppRoute) => void;
}

const CAREERS_TABS: Array<{
  id: CareersTab;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'overview', label: 'Careers Home', path: '/careers', icon: Compass },
  { id: 'jobs', label: 'Jobs', path: '/careers/jobs', icon: Briefcase },
  { id: 'internships', label: 'Internships', path: '/careers/internships', icon: GraduationCap },
  { id: 'remote', label: 'Remote', path: '/careers/remote', icon: Globe },
  { id: 'fresher', label: 'Student Center', path: '/careers/fresher', icon: Sparkles },
  { id: 'scholarships', label: 'Scholarships', path: '/careers/scholarships', icon: Award },
  { id: 'government', label: 'Government', path: '/careers/government', icon: Landmark },
  { id: 'tools', label: 'Career Tools', path: '/careers/tools', icon: Wrench },
];

const COUNTRY_OPTIONS = [
  'Worldwide',
  'India',
  'USA',
  'UK',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'Singapore',
  'UAE',
  'Japan',
  'Other countries',
];

const EMPLOYMENT_TYPES = [
  'All',
  'Full-time',
  'Part-time',
  'Contract',
  'Freelance',
  'Internship',
  'Apprenticeship',
  'Temporary',
  'Graduate programme',
];

const WORK_MODES = ['All', 'Remote', 'Work From Home', 'Hybrid', 'On-site'];

const EXPERIENCE_LEVELS = [
  'All',
  'No experience',
  'Fresher',
  'Student',
  'Entry-level',
  '1–3 years',
  'Experienced',
];

const IANA_TIMEZONES = [
  'UTC',
  'Asia/Kolkata',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Berlin',
  'Europe/Paris',
  'Asia/Singapore',
  'Asia/Dubai',
  'Asia/Tokyo',
  'Australia/Sydney',
  'America/Toronto',
];

export const CareersPortal: React.FC<CareersPortalProps> = ({
  activeTab,
  initialToolId = 'resume-builder',
  onNavigate,
}) => {
  const [liveClock, setLiveClock] = useState<Date>(() => new Date());
  const [profile, setProfile] = useState<CareerProfilePreferences>(() => loadCareersProfile());
  const [geoStatusMessage, setGeoStatusMessage] = useState<string | null>(null);
  const [showPersonalize, setShowPersonalize] = useState(false);
  const [activeTool, setActiveTool] = useState<CareerToolId>(initialToolId);

  // Feed Data State
  const [jobsData, setJobsData] = useState<CareersOpportunitiesResponse | null>(null);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);

  const [scholarshipsData, setScholarshipsData] = useState<ScholarshipsApiResponse | null>(null);
  const [govData, setGovData] = useState<GovernmentApiResponse | null>(null);
  const [studentCerts, setStudentCerts] = useState<CareerCertificationProgram[]>([]);

  // Search & Filter State
  const [queryText, setQueryText] = useState('');
  const [countryFilter, setCountryFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('');
  const [employmentFilter, setEmploymentFilter] = useState('All');
  const [workModeFilter, setWorkModeFilter] = useState('All');
  const [experienceFilter, setExperienceFilter] = useState('All');
  const [postedWithin, setPostedWithin] = useState('all');
  const [salaryOnly, setSalaryOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'newest' | 'relevant' | 'salary-desc' | 'salary-asc'>('newest');
  const [visibleLimit, setVisibleLimit] = useState(18);

  // Sync URL sub-tab defaults smoothly
  useEffect(() => {
    setVisibleLimit(18);
    if (activeTab === 'internships') {
      setEmploymentFilter('Internship');
      setWorkModeFilter('All');
    } else if (activeTab === 'remote') {
      setWorkModeFilter('Remote');
      setEmploymentFilter('All');
    } else if (activeTab === 'jobs') {
      setEmploymentFilter('All');
      setWorkModeFilter('All');
    }
  }, [activeTab]);

  useEffect(() => {
    if (initialToolId) setActiveTool(initialToolId);
  }, [initialToolId]);

  useEffect(() => {
    const id = window.setInterval(() => setLiveClock(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const careersAbortRef = useRef<AbortController | null>(null);
  const careersReqIdRef = useRef(0);

  const loadAllCareersData = useCallback(async (forceRefresh = false) => {
    careersAbortRef.current?.abort();
    const controller = new AbortController();
    careersAbortRef.current = controller;
    const reqId = ++careersReqIdRef.current;

    setJobsLoading(true);
    setJobsError(null);
    try {
      const [jobsRes, schRes, govRes, certRes] = await Promise.all([
        fetchCareerOpportunities({ refresh: forceRefresh, signal: controller.signal }),
        fetchScholarships('All', forceRefresh, controller.signal),
        fetchGovernmentJobs('All', forceRefresh, controller.signal),
        fetchStudentCertifications(controller.signal),
      ]);
      if (controller.signal.aborted || reqId !== careersReqIdRef.current) return;
      setJobsData(jobsRes);
      setScholarshipsData(schRes);
      setGovData(govRes);
      setStudentCerts(certRes.programs);
    } catch (err) {
      if (controller.signal.aborted || reqId !== careersReqIdRef.current) return;
      setJobsError(
        err instanceof Error ? err.message : 'Unable to fetch free career provider feeds.'
      );
    } finally {
      if (reqId === careersReqIdRef.current) {
        setJobsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadAllCareersData(false);
    return () => {
      careersAbortRef.current?.abort();
    };
  }, [loadAllCareersData]);

  const updateProfile = useCallback((updater: (prev: CareerProfilePreferences) => CareerProfilePreferences) => {
    setProfile((prev) => {
      const next = updater(prev);
      saveCareersProfile(next);
      return next;
    });
  }, []);

  // Explicit-permission browser geolocation helper
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatusMessage('Browser geolocation is unavailable; select country/city manually below.');
      return;
    }
    setGeoStatusMessage('Requesting explicit browser location permission…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
        let inferredCountry = profile.country;
        if (tz.startsWith('Asia/Kolkata') || tz.startsWith('Asia/Calcutta')) inferredCountry = 'India';
        else if (tz.startsWith('America/Toronto') || tz.startsWith('America/Vancouver')) inferredCountry = 'Canada';
        else if (tz.startsWith('America/')) inferredCountry = 'USA';
        else if (tz.startsWith('Europe/London')) inferredCountry = 'UK';
        else if (tz.startsWith('Europe/Berlin')) inferredCountry = 'Germany';
        else if (tz.startsWith('Europe/Paris')) inferredCountry = 'France';
        else if (tz.startsWith('Asia/Singapore')) inferredCountry = 'Singapore';
        else if (tz.startsWith('Asia/Dubai')) inferredCountry = 'UAE';
        else if (tz.startsWith('Asia/Tokyo')) inferredCountry = 'Japan';
        else if (tz.startsWith('Australia/')) inferredCountry = 'Australia';

        updateProfile((prev) => ({
          ...prev,
          timezone: tz,
          country: inferredCountry,
        }));
        setGeoStatusMessage(
          `Location permission granted (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(
            2
          )}) · Timezone set to ${tz} (${inferredCountry}).`
        );
      },
      () => {
        setGeoStatusMessage('Location permission declined. Using manual timezone & country preferences.');
      },
      { timeout: 6000 }
    );
  };

  // Interactive card handlers
  const handleToggleSaveJob = (job: CareerOpportunity) => {
    updateProfile((prev) => {
      const exists = prev.savedOpportunities.some((s) => s.id === job.id);
      return {
        ...prev,
        savedOpportunities: exists
          ? prev.savedOpportunities.filter((s) => s.id !== job.id)
          : [job, ...prev.savedOpportunities].slice(0, 50),
      };
    });
  };

  const handleViewJob = (job: CareerOpportunity) => {
    updateProfile((prev) => ({
      ...prev,
      recentlyViewed: [job, ...prev.recentlyViewed.filter((r) => r.id !== job.id)].slice(0, 16),
    }));
  };

  const handleReportListing = (job: CareerOpportunity, reason: string) => {
    updateProfile((prev) => ({
      ...prev,
      reportedListings: [
        {
          opportunityId: job.id,
          title: job.title,
          sourceName: job.sourceName,
          reason,
          reportedAt: new Date().toISOString(),
        },
        ...prev.reportedListings.filter((r) => r.opportunityId !== job.id),
      ].slice(0, 30),
    }));
  };

  const handleAddToTracker = (job: CareerOpportunity) => {
    const kind: 'job' | 'internship' =
      job.employmentType === 'Internship' ? 'internship' : 'job';
    const entry: ApplicationTrackerEntry = {
      id: `trk-${job.id}`,
      kind,
      title: job.title,
      organization: job.company,
      location: `${job.city}, ${job.country}`,
      url: job.applicationUrl,
      stipendOrSalary: job.salaryText,
      deadline: job.applicationDeadline?.slice(0, 10),
      status: 'Saved',
      notes: `Added from ${job.sourceName}`,
      updatedAt: new Date().toISOString(),
    };
    updateProfile((prev) => {
      if (prev.applications.some((a) => a.id === entry.id)) return prev;
      return { ...prev, applications: [entry, ...prev.applications] };
    });
    setActiveTool(kind === 'internship' ? 'internship-tracker' : 'job-tracker');
    onNavigate({
      view: 'careers',
      tab: 'tools',
      toolId: kind === 'internship' ? 'internship-tracker' : 'job-tracker',
    });
  };

  const allJobs = jobsData?.items ?? [];

  // Client-side instant filtering + sorting over live aggregated items
  const filteredJobs = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    const cityQ = cityFilter.trim().toLowerCase();
    let list = [...allJobs];

    if (q) {
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.summary.toLowerCase().includes(q) ||
          j.skills.some((s) => s.toLowerCase().includes(q)) ||
          j.location.toLowerCase().includes(q)
      );
    }

    if (countryFilter !== 'All') {
      if (countryFilter === 'Worldwide') {
        list = list.filter(
          (j) =>
            j.country === 'Worldwide' ||
            j.remoteScope.toLowerCase().includes('worldwide')
        );
      } else {
        list = list.filter(
          (j) =>
            j.country.toLowerCase() === countryFilter.toLowerCase() ||
            j.location.toLowerCase().includes(countryFilter.toLowerCase()) ||
            j.remoteScope.toLowerCase().includes(countryFilter.toLowerCase()) ||
            j.remoteScope.toLowerCase().includes('worldwide')
        );
      }
    }

    if (cityQ) {
      list = list.filter(
        (j) =>
          j.city.toLowerCase().includes(cityQ) ||
          j.location.toLowerCase().includes(cityQ)
      );
    }

    if (employmentFilter !== 'All') {
      list = list.filter((j) => j.employmentType === employmentFilter);
    }

    if (workModeFilter !== 'All') {
      list = list.filter((j) => j.workMode === workModeFilter);
    }

    if (experienceFilter !== 'All') {
      list = list.filter((j) => j.experienceLevel === experienceFilter);
    }

    if (postedWithin !== 'all') {
      const hrs = postedWithin === '24h' ? 24 : postedWithin === '3d' ? 72 : postedWithin === '7d' ? 168 : 720;
      const cutoff = Date.now() - hrs * 60 * 60 * 1000;
      list = list.filter((j) => Date.parse(j.postedAt) >= cutoff);
    }

    if (salaryOnly) {
      list = list.filter((j) => Boolean(j.salaryText));
    }

    if (sortBy === 'salary-desc') {
      list.sort((a, b) => (b.salaryMinAnnualUsd ?? -1) - (a.salaryMinAnnualUsd ?? -1));
    } else if (sortBy === 'salary-asc') {
      list.sort(
        (a, b) =>
          (a.salaryMinAnnualUsd ?? Number.MAX_SAFE_INTEGER) -
          (b.salaryMinAnnualUsd ?? Number.MAX_SAFE_INTEGER)
      );
    } else if (sortBy === 'relevant' && q) {
      list.sort((a, b) => {
        const aScore =
          (a.title.toLowerCase().includes(q) ? 3 : 0) +
          (a.skills.some((s) => s.toLowerCase().includes(q)) ? 2 : 0);
        const bScore =
          (b.title.toLowerCase().includes(q) ? 3 : 0) +
          (b.skills.some((s) => s.toLowerCase().includes(q)) ? 2 : 0);
        if (bScore !== aScore) return bScore - aScore;
        return Date.parse(b.postedAt) - Date.parse(a.postedAt);
      });
    } else {
      list.sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt));
    }

    return list;
  }, [
    allJobs,
    queryText,
    countryFilter,
    cityFilter,
    employmentFilter,
    workModeFilter,
    experienceFilter,
    postedWithin,
    salaryOnly,
    sortBy,
  ]);

  // Derived student & personalized subsets
  const internshipsAll = useMemo(
    () => allJobs.filter((j) => j.employmentType === 'Internship' || /\bintern\b|\bwerkstudent\b/i.test(j.title)),
    [allJobs]
  );
  const fresherAndEntryJobs = useMemo(
    () =>
      allJobs.filter(
        (j) =>
          j.experienceLevel === 'No experience' ||
          j.experienceLevel === 'Fresher' ||
          j.experienceLevel === 'Student' ||
          j.experienceLevel === 'Entry-level' ||
          j.employmentType === 'Graduate programme' ||
          j.employmentType === 'Apprenticeship'
      ),
    [allJobs]
  );
  const remoteAll = useMemo(() => allJobs.filter((j) => j.remoteEligible), [allJobs]);

  const personalizedMatches = useMemo(() => {
    const userSkillsLower = profile.skills.map((s) => s.toLowerCase());
    const scored = allJobs.map((job) => {
      let score = 0;
      if (
        profile.country === 'Worldwide' ||
        job.country.toLowerCase() === profile.country.toLowerCase() ||
        job.remoteScope.toLowerCase().includes('worldwide')
      ) {
        score += 2;
      }
      if (profile.remotePreference === 'Remote Only' && job.remoteEligible) score += 2;
      if (
        profile.employmentType !== 'All' &&
        job.employmentType === profile.employmentType
      ) {
        score += 2;
      }
      for (const s of job.skills) {
        if (userSkillsLower.some((u) => s.toLowerCase().includes(u) || u.includes(s.toLowerCase()))) {
          score += 2;
        }
      }
      return { job, score };
    });
    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((s) => s.job)
      .slice(0, 6);
  }, [allJobs, profile]);

  const formattedClock = useMemo(() => {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: profile.timezone,
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      }).format(liveClock);
    } catch {
      return liveClock.toUTCString();
    }
  }, [liveClock, profile.timezone]);

  const savedIdSet = useMemo(
    () => new Set(profile.savedOpportunities.map((s) => s.id)),
    [profile.savedOpportunities]
  );
  const reportedIdSet = useMemo(
    () => new Set(profile.reportedListings.map((r) => r.opportunityId)),
    [profile.reportedListings]
  );

  const resetSearchFilters = () => {
    setQueryText('');
    setCountryFilter('All');
    setCityFilter('');
    setEmploymentFilter('All');
    setWorkModeFilter('All');
    setExperienceFilter('All');
    setPostedWithin('all');
    setSalaryOnly(false);
    setSortBy('newest');
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Dark Navy Careers Command Header */}
      <section className="bg-[#060b16] text-white border-b border-white/10">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-xs text-slate-400 mb-3 flex items-center gap-2">
            <a
              href="/"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                onNavigate({ view: 'home' });
              }}
              className="hover:text-white cursor-pointer"
            >
              TRENDVERSE Home
            </a>
            <span>/</span>
            <a
              href="/careers"
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                onNavigate({ view: 'careers', tab: 'overview' });
              }}
              className="hover:text-white cursor-pointer"
            >
              Careers
            </a>
            {activeTab !== 'overview' && (
              <>
                <span>/</span>
                <span className="text-blue-400 font-semibold">
                  {CAREERS_TABS.find((t) => t.id === activeTab)?.label}
                </span>
              </>
            )}
          </nav>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400">
                <span>TRENDVERSE CAREERS 1.0</span>
                <span className="text-slate-500">·</span>
                <span className="text-emerald-400">100% Free Public Feeds &amp; Browser Tools</span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Discover Opportunities. Build Your Future.
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300 leading-relaxed">
                International jobs, paid &amp; remote internships, fresher pathways, verified university
                scholarships, official government portals, and 10 free career utilities.
              </p>
            </div>

            {/* Live Clock, IANA Timezone & Explicit Location Consent Controls */}
            <div className="rounded-xl border border-white/15 bg-[#0b1324] p-4 text-xs space-y-2 lg:min-w-[360px]">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 font-mono-tabular font-semibold text-white">
                  <Clock className="h-3.5 w-3.5 text-blue-400" aria-hidden="true" />
                  <span>{formattedClock}</span>
                </span>
                <button
                  type="button"
                  onClick={() => void loadAllCareersData(true)}
                  disabled={jobsLoading}
                  className="inline-flex items-center gap-1 rounded border border-white/20 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`h-3 w-3 ${jobsLoading ? 'animate-spin' : ''}`} />
                  <span>Sync Feeds</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Select display timezone"
                  value={profile.timezone}
                  onChange={(e) =>
                    updateProfile((prev) => ({ ...prev, timezone: e.target.value }))
                  }
                  className="rounded border border-white/20 bg-[#060b16] px-2 py-1 text-[11px] text-slate-200"
                >
                  {!IANA_TIMEZONES.includes(profile.timezone) && (
                    <option value={profile.timezone}>{profile.timezone}</option>
                  )}
                  {IANA_TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleUseMyLocation}
                  className="inline-flex items-center gap-1 rounded border border-blue-500/40 bg-blue-600/20 px-2.5 py-1 text-[11px] font-medium text-blue-200 hover:bg-blue-600/30 cursor-pointer"
                >
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  <span>Use My Location</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPersonalize((v) => !v)}
                  className="inline-flex items-center gap-1 rounded border border-white/20 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-white/10 cursor-pointer"
                >
                  <SlidersHorizontal className="h-3 w-3" aria-hidden="true" />
                  <span>Personalize</span>
                </button>
              </div>
              {geoStatusMessage && <p className="text-[11px] text-blue-300">{geoStatusMessage}</p>}
            </div>
          </div>

          {/* Careers 8-Route Sub-Navigation Tabs */}
          <div
            role="tablist"
            aria-label="TRENDVERSE Careers Sections"
            className="mt-7 flex items-center gap-2 overflow-x-auto pb-1"
          >
            {CAREERS_TABS.map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <a
                  key={t.id}
                  href={t.path}
                  role="tab"
                  aria-selected={isActive}
                  onClick={(e) => {
                    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                    e.preventDefault();
                    onNavigate({ view: 'careers', tab: t.id });
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{t.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8 space-y-8">
        {/* Personalized Preferences Drawer (localStorage, anonymous) */}
        {showPersonalize && (
          <section
            aria-label="Personalize career preferences"
            className="rounded-xl border border-blue-200 bg-white p-5 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <h2 className="font-display text-base font-bold text-slate-900">
                  Anonymous Personalized Career Preferences (Stored Locally in Your Browser)
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setProfile(clearCareersProfile())}
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:underline cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear Local Profile</span>
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Country</label>
                <select
                  value={profile.country}
                  onChange={(e) => updateProfile((p) => ({ ...p, country: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2"
                >
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Education Level</label>
                <select
                  value={profile.educationLevel}
                  onChange={(e) =>
                    updateProfile((p) => ({
                      ...p,
                      educationLevel: e.target.value as CareerProfilePreferences['educationLevel'],
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2"
                >
                  <option value="High School">High School</option>
                  <option value="Undergraduate">Undergraduate</option>
                  <option value="Postgraduate / Masters">Postgraduate / Masters</option>
                  <option value="PhD / Research">PhD / Research</option>
                  <option value="Graduate / Working">Graduate / Working</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Track</label>
                <input
                  type="text"
                  value={profile.preferredCareer}
                  onChange={(e) =>
                    updateProfile((p) => ({ ...p, preferredCareer: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Remote Preference</label>
                <select
                  value={profile.remotePreference}
                  onChange={(e) =>
                    updateProfile((p) => ({
                      ...p,
                      remotePreference: e.target.value as CareerProfilePreferences['remotePreference'],
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2"
                >
                  <option value="Any">Any</option>
                  <option value="Remote Only">Remote Only</option>
                  <option value="Hybrid / Remote">Hybrid / Remote</option>
                  <option value="On-site">On-site</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={profile.skills.join(', ')}
                  onChange={(e) =>
                    updateProfile((p) => ({
                      ...p,
                      skills: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-2"
                />
              </div>
            </div>
          </section>
        )}

        {/* Error notice if feeds completely failed */}
        {jobsError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 flex items-center justify-between gap-4">
            <span>Unable to sync live job providers: {jobsError}</span>
            <button
              type="button"
              onClick={() => void loadAllCareersData(true)}
              className="rounded-lg bg-red-800 px-3 py-1.5 text-xs font-semibold text-white cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* ============================================================
            TAB 1: MAIN CAREERS OVERVIEW DASHBOARD (/careers)
           ============================================================ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Live Dashboard Stats Grid */}
            <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              <a
                href={routeToUrl({ view: 'careers', tab: 'jobs' })}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  onNavigate({ view: 'careers', tab: 'jobs' });
                }}
                className="block rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-blue-400 cursor-pointer"
              >
                <p className="text-xs text-slate-500">Live Job Updates</p>
                <p className="mt-1 font-mono-tabular text-2xl font-bold text-slate-900">
                  {jobsLoading ? '…' : allJobs.length}
                </p>
                <p className="mt-1 text-[11px] font-medium text-blue-700">Search all jobs →</p>
              </a>

              <a
                href={routeToUrl({ view: 'careers', tab: 'internships' })}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  onNavigate({ view: 'careers', tab: 'internships' });
                }}
                className="block rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-blue-400 cursor-pointer"
              >
                <p className="text-xs text-slate-500">Internships &amp; Student</p>
                <p className="mt-1 font-mono-tabular text-2xl font-bold text-slate-900">
                  {jobsLoading ? '…' : internshipsAll.length}
                </p>
                <p className="mt-1 text-[11px] font-medium text-blue-700">Student internships →</p>
              </a>

              <a
                href={routeToUrl({ view: 'careers', tab: 'remote' })}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  onNavigate({ view: 'careers', tab: 'remote' });
                }}
                className="block rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-blue-400 cursor-pointer"
              >
                <p className="text-xs text-slate-500">Remote Eligible</p>
                <p className="mt-1 font-mono-tabular text-2xl font-bold text-slate-900">
                  {jobsLoading ? '…' : remoteAll.length}
                </p>
                <p className="mt-1 text-[11px] font-medium text-blue-700">Explore remote →</p>
              </a>

              <a
                href={routeToUrl({ view: 'careers', tab: 'fresher' })}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  onNavigate({ view: 'careers', tab: 'fresher' });
                }}
                className="block rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-blue-400 cursor-pointer"
              >
                <p className="text-xs text-slate-500">Fresher / Entry Roles</p>
                <p className="mt-1 font-mono-tabular text-2xl font-bold text-slate-900">
                  {jobsLoading ? '…' : fresherAndEntryJobs.length}
                </p>
                <p className="mt-1 text-[11px] font-medium text-blue-700">Student Center →</p>
              </a>

              <a
                href={routeToUrl({ view: 'careers', tab: 'scholarships' })}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  onNavigate({ view: 'careers', tab: 'scholarships' });
                }}
                className="block rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-blue-400 cursor-pointer"
              >
                <p className="text-xs text-slate-500">Scholarships &amp; Grants</p>
                <p className="mt-1 font-mono-tabular text-2xl font-bold text-slate-900">
                  {(scholarshipsData?.items.length ?? 0) + (scholarshipsData?.directory.length ?? 0)}
                </p>
                <p className="mt-1 text-[11px] font-medium text-blue-700">View scholarships →</p>
              </a>

              <a
                href={routeToUrl({ view: 'careers', tab: 'government' })}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  onNavigate({ view: 'careers', tab: 'government' });
                }}
                className="block rounded-xl border border-slate-200 bg-white p-4 text-left hover:border-blue-400 cursor-pointer"
              >
                <p className="text-xs text-slate-500">Gov Portals &amp; Notices</p>
                <p className="mt-1 font-mono-tabular text-2xl font-bold text-slate-900">
                  {(govData?.items.length ?? 0) + (govData?.portals.length ?? 0)}
                </p>
                <p className="mt-1 text-[11px] font-medium text-blue-700">India &amp; Global Gov →</p>
              </a>
            </section>

            {/* Trending Career Skills Extracted Live */}
            {jobsData && jobsData.trendingSkills.length > 0 && (
              <section className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Trending Career Skills Across Active Listings
                  </h2>
                  <span className="text-xs text-slate-500">
                    Click any skill to filter jobs immediately
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {jobsData.trendingSkills.map((item) => (
                    <button
                      key={item.skill}
                      type="button"
                      onClick={() => {
                        setQueryText(item.skill);
                        onNavigate({ view: 'careers', tab: 'jobs' });
                      }}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-800 cursor-pointer"
                    >
                      {item.skill} <span className="text-slate-400 font-normal">({item.count})</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Personalized Career Dashboard Highlights */}
            <section className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    Personalized For You ({profile.country} · {profile.educationLevel})
                  </h2>
                  <p className="text-xs text-slate-600">
                    Matched anonymously from your local profile skills ({profile.skills.join(', ') || 'None selected'}).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPersonalize(true)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-blue-400 cursor-pointer"
                >
                  Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 text-xs">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider">
                    Recommended Roles ({personalizedMatches.length})
                  </h3>
                  {personalizedMatches.slice(0, 3).map((m) => (
                    <div key={m.id} className="border-b border-slate-200 pb-2 last:border-none">
                      <a
                        href={m.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleViewJob(m)}
                        className="font-semibold text-slate-900 hover:text-blue-700 block"
                      >
                        {m.title}
                      </a>
                      <span className="text-slate-500">
                        {m.company} · {m.remoteScope}
                      </span>
                    </div>
                  ))}
                  {personalizedMatches.length === 0 && (
                    <p className="text-slate-500">Loading matching opportunities…</p>
                  )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider">
                    Saved Listings ({profile.savedOpportunities.length}) &amp; Tracked ({profile.applications.length})
                  </h3>
                  {profile.savedOpportunities.slice(0, 3).map((s) => (
                    <div key={s.id} className="border-b border-slate-200 pb-2 last:border-none flex items-center justify-between gap-2">
                      <a
                        href={s.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-slate-900 hover:text-blue-700 truncate"
                      >
                        {s.title}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleToggleSaveJob(s)}
                        className="text-slate-400 hover:text-red-600 shrink-0 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {profile.savedOpportunities.length === 0 && (
                    <p className="text-slate-500">
                      Use &ldquo;Save&rdquo; on any job, internship, or scholarship card to bookmark it locally.
                    </p>
                  )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <h3 className="font-bold text-slate-900 uppercase tracking-wider">
                    Recently Viewed ({profile.recentlyViewed.length})
                  </h3>
                  {profile.recentlyViewed.slice(0, 3).map((r) => (
                    <div key={r.id} className="border-b border-slate-200 pb-2 last:border-none">
                      <a
                        href={r.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-slate-900 hover:text-blue-700 block truncate"
                      >
                        {r.title}
                      </a>
                      <span className="text-slate-500">{r.company}</span>
                    </div>
                  ))}
                  {profile.recentlyViewed.length === 0 && (
                    <p className="text-slate-500">Opened listings will appear here privately.</p>
                  )}
                </div>
              </div>
            </section>

            {/* Latest Jobs + Recent Internships + Scholarship Deadlines + Gov Snapshots */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-slate-900">
                    Latest Verified Job &amp; Internship Updates
                  </h2>
                  <button
                    type="button"
                    onClick={() => onNavigate({ view: 'careers', tab: 'jobs' })}
                    className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                  >
                    Open Advanced Search →
                  </button>
                </div>

                {jobsLoading ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                    Syncing verified public job boards (Himalayas, Remotive, Arbeitnow, Jobicy, Official Greenhouse &amp; Lever)…
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allJobs.slice(0, 6).map((job) => (
                      <JobListingCard
                        key={job.id}
                        job={job}
                        visitorTimezone={profile.timezone}
                        isSaved={savedIdSet.has(job.id)}
                        isReported={reportedIdSet.has(job.id)}
                        onToggleSave={handleToggleSaveJob}
                        onViewOpportunity={handleViewJob}
                        onAddToTracker={handleAddToTracker}
                        onReportListing={handleReportListing}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Scholarship Snapshots, Gov Portals & Safety Box */}
              <aside className="lg:col-span-4 space-y-5">
                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-bold text-slate-900">
                      Recently Added Internships
                    </h3>
                    <button
                      type="button"
                      onClick={() => onNavigate({ view: 'careers', tab: 'internships' })}
                      className="text-xs font-semibold text-blue-700 cursor-pointer"
                    >
                      All →
                    </button>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    {internshipsAll.slice(0, 4).map((intern) => (
                      <a
                        key={intern.id}
                        href={intern.applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleViewJob(intern)}
                        className="block rounded-lg border border-slate-100 p-2.5 hover:border-blue-300"
                      >
                        <p className="font-semibold text-slate-900">{intern.title}</p>
                        <p className="text-slate-500 mt-0.5">
                          {intern.company} · {intern.remoteScope}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-bold text-slate-900">
                      International Scholarships
                    </h3>
                    <button
                      type="button"
                      onClick={() => onNavigate({ view: 'careers', tab: 'scholarships' })}
                      className="text-xs font-semibold text-blue-700 cursor-pointer"
                    >
                      Directory →
                    </button>
                  </div>
                  <div className="space-y-2.5 text-xs">
                    {(scholarshipsData?.directory ?? []).slice(0, 4).map((s) => (
                      <a
                        key={s.id}
                        href={s.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-lg border border-slate-100 p-2.5 hover:border-blue-300"
                      >
                        <p className="font-semibold text-slate-900">{s.name}</p>
                        <p className="text-emerald-700 font-medium mt-0.5">{s.fundingType}</p>
                      </a>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-base font-bold text-slate-900">
                      Government Portals (India &amp; Global)
                    </h3>
                    <button
                      type="button"
                      onClick={() => onNavigate({ view: 'careers', tab: 'government' })}
                      className="text-xs font-semibold text-blue-700 cursor-pointer"
                    >
                      All →
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    {(govData?.portals ?? []).slice(0, 4).map((g) => (
                      <a
                        key={g.id}
                        href={g.officialNotificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5 hover:border-blue-300"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">{g.portalName}</p>
                          <p className="text-slate-500">{g.country}</p>
                        </div>
                        <ArrowUpRight className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>

                <AdSlot variant="rectangle" slotName="TRENDVERSE Careers Sidebar" />
              </aside>
            </div>
          </div>
        )}

        {/* ============================================================
            TABS 2, 3, 4: ADVANCED SEARCH / JOBS / INTERNSHIPS / REMOTE
           ============================================================ */}
        {(activeTab === 'jobs' || activeTab === 'internships' || activeTab === 'remote') && (
          <div className="space-y-6">
            {/* Search & Multi-Facet Filter Bar */}
            <section
              aria-label="Advanced Job Search Filters"
              className="rounded-xl border border-slate-200 bg-white p-5 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-blue-600" aria-hidden="true" />
                  <h2 className="font-display text-lg font-bold text-slate-900">
                    {activeTab === 'internships'
                      ? 'Internships & Paid Student Opportunities'
                      : activeTab === 'remote'
                      ? 'Remote & Work From Home Roles (With Explicit Country Scope)'
                      : 'Advanced Global Opportunity Search'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={resetSearchFilters}
                  className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div className="md:col-span-2 relative">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3 top-3" aria-hidden="true" />
                  <input
                    type="text"
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    placeholder="Search job title, skill (Python, React), or company…"
                    className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm"
                  />
                </div>

                <select
                  aria-label="Filter by Country"
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="All">All Countries</option>
                  {COUNTRY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  aria-label="Filter by City"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  placeholder="City (e.g., London, Bengaluru, Berlin)"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 text-xs">
                <select
                  aria-label="Employment Type"
                  value={employmentFilter}
                  onChange={(e) => setEmploymentFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2.5 py-2"
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t === 'All' ? 'All Employment Types' : t}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Work Mode"
                  value={workModeFilter}
                  onChange={(e) => setWorkModeFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2.5 py-2"
                >
                  {WORK_MODES.map((m) => (
                    <option key={m} value={m}>
                      {m === 'All' ? 'All Work Modes' : m}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Experience Level"
                  value={experienceFilter}
                  onChange={(e) => setExperienceFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2.5 py-2"
                >
                  {EXPERIENCE_LEVELS.map((e) => (
                    <option key={e} value={e}>
                      {e === 'All' ? 'All Experience Levels' : e}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Date Posted"
                  value={postedWithin}
                  onChange={(e) => setPostedWithin(e.target.value)}
                  className="rounded-lg border border-slate-300 px-2.5 py-2"
                >
                  <option value="all">Any Date Posted</option>
                  <option value="24h">Last 24 hours</option>
                  <option value="3d">Last 3 days</option>
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                </select>

                <select
                  aria-label="Sort Opportunities"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as 'newest' | 'relevant' | 'salary-desc' | 'salary-asc')
                  }
                  className="rounded-lg border border-slate-300 px-2.5 py-2"
                >
                  <option value="newest">Sort: Newest first</option>
                  <option value="relevant">Sort: Relevant</option>
                  <option value="salary-desc">Sort: Salary highest</option>
                  <option value="salary-asc">Sort: Salary lowest</option>
                </select>

                <label className="flex items-center gap-2 rounded-lg border border-slate-300 px-2.5 py-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={salaryOnly}
                    onChange={(e) => setSalaryOnly(e.target.checked)}
                    className="h-3.5 w-3.5 accent-blue-600"
                  />
                  <span className="font-medium text-slate-700">Disclosed Salary Only</span>
                </label>
              </div>
            </section>

            {/* Results Counter */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
              <span>
                Showing <strong className="text-slate-900">{Math.min(visibleLimit, filteredJobs.length)}</strong>{' '}
                of <strong className="text-slate-900">{filteredJobs.length}</strong> verified matching opportunities
              </span>
              <span>Times shown in {profile.timezone}</span>
            </div>

            {/* Listing Feed */}
            {jobsLoading ? (
              <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
                Fetching verified listings across free providers…
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-2">
                <p className="font-semibold text-slate-900">
                  No verified listings match the active filters.
                </p>
                <p className="text-xs text-slate-600">
                  We never fabricate sample vacancies when a specific filter combination has zero live matches.
                </p>
                <button
                  type="button"
                  onClick={resetSearchFilters}
                  className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredJobs.slice(0, visibleLimit).map((job) => (
                  <JobListingCard
                    key={job.id}
                    job={job}
                    visitorTimezone={profile.timezone}
                    isSaved={savedIdSet.has(job.id)}
                    isReported={reportedIdSet.has(job.id)}
                    onToggleSave={handleToggleSaveJob}
                    onViewOpportunity={handleViewJob}
                    onAddToTracker={handleAddToTracker}
                    onReportListing={handleReportListing}
                  />
                ))}
                {visibleLimit < filteredJobs.length && (
                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setVisibleLimit((v) => v + 18)}
                      className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-800 hover:border-blue-500 cursor-pointer"
                    >
                      Load More ({filteredJobs.length - visibleLimit} remaining)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 5: STUDENT OPPORTUNITY CENTER (A–L) (/careers/fresher)
           ============================================================ */}
        {activeTab === 'fresher' && (
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Student Opportunity Center (No Prior Experience Required / Entry Pathways)
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Twelve curated pathways prioritizing zero-experience, student, apprentice, graduate, scholarship,
                fellowship, research, certification, competition, and entry-level public sector tracks.
              </p>

              {/* A–L 12-Section Quick Jump Grid */}
              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                {[
                  {
                    code: 'A. Fresher Jobs',
                    count: allJobs.filter((j) => j.experienceLevel === 'Fresher' || j.experienceLevel === 'No experience' || j.experienceLevel === 'Entry-level').length,
                    action: () => {
                      setExperienceFilter('Entry-level');
                      onNavigate({ view: 'careers', tab: 'jobs' });
                    },
                  },
                  {
                    code: 'B. Student Internships',
                    count: internshipsAll.length,
                    action: () => onNavigate({ view: 'careers', tab: 'internships' }),
                  },
                  {
                    code: 'C. Paid Internships',
                    count: internshipsAll.filter((j) => j.isPaidInternship).length,
                    action: () => {
                      setEmploymentFilter('Internship');
                      setSalaryOnly(true);
                      onNavigate({ view: 'careers', tab: 'jobs' });
                    },
                  },
                  {
                    code: 'D. Remote Internships',
                    count: internshipsAll.filter((j) => j.remoteEligible).length,
                    action: () => {
                      setEmploymentFilter('Internship');
                      setWorkModeFilter('Remote');
                      onNavigate({ view: 'careers', tab: 'jobs' });
                    },
                  },
                  {
                    code: 'E. Graduate Programmes',
                    count: allJobs.filter((j) => j.employmentType === 'Graduate programme').length,
                    action: () => {
                      setEmploymentFilter('Graduate programme');
                      onNavigate({ view: 'careers', tab: 'jobs' });
                    },
                  },
                  {
                    code: 'F. Apprenticeships',
                    count: allJobs.filter((j) => j.employmentType === 'Apprenticeship').length,
                    action: () => {
                      setEmploymentFilter('Apprenticeship');
                      onNavigate({ view: 'careers', tab: 'jobs' });
                    },
                  },
                  {
                    code: 'G. Scholarships',
                    count: scholarshipsData?.directory.length ?? 0,
                    action: () => onNavigate({ view: 'careers', tab: 'scholarships' }),
                  },
                  {
                    code: 'H. Fellowships',
                    count: (scholarshipsData?.items.length ?? 0) + studentCerts.filter((c) => c.kind === 'Fellowship & Open Learning').length,
                    action: () => onNavigate({ view: 'careers', tab: 'scholarships' }),
                  },
                  {
                    code: 'I. Research Opportunities',
                    count: scholarshipsData?.items.filter((s) => s.sourceName.includes('NSF') || s.sourceName.includes('UKRI')).length ?? 0,
                    action: () => onNavigate({ view: 'careers', tab: 'scholarships' }),
                  },
                  {
                    code: 'J. Free Certifications',
                    count: studentCerts.filter((c) => c.kind === 'Free Certification').length,
                    action: () => document.getElementById('student-certs-anchor')?.scrollIntoView({ behavior: 'smooth' }),
                  },
                  {
                    code: 'K. Student Competitions',
                    count: studentCerts.filter((c) => c.kind === 'Student Competition').length,
                    action: () => document.getElementById('student-certs-anchor')?.scrollIntoView({ behavior: 'smooth' }),
                  },
                  {
                    code: 'L. Entry-Level Government Jobs',
                    count: (govData?.items.length ?? 0) + (govData?.portals.length ?? 0),
                    action: () => onNavigate({ view: 'careers', tab: 'government' }),
                  },
                ].map((box) => (
                  <button
                    key={box.code}
                    type="button"
                    onClick={box.action}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-left hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer"
                  >
                    <p className="font-bold text-slate-900">{box.code}</p>
                    <p className="mt-1 font-mono-tabular text-blue-700 font-semibold">
                      {box.count} active / verified →
                    </p>
                  </button>
                ))}
              </div>
            </section>

            {/* Live Entry-Level, Internships & Graduate Roles */}
            <section className="space-y-4">
              <h3 className="font-display text-xl font-bold text-slate-900">
                Live Student, Fresher, Internship &amp; Graduate Openings ({fresherAndEntryJobs.length})
              </h3>
              {fresherAndEntryJobs.slice(0, 12).map((job) => (
                <JobListingCard
                  key={job.id}
                  job={job}
                  visitorTimezone={profile.timezone}
                  isSaved={savedIdSet.has(job.id)}
                  isReported={reportedIdSet.has(job.id)}
                  onToggleSave={handleToggleSaveJob}
                  onViewOpportunity={handleViewJob}
                  onAddToTracker={handleAddToTracker}
                  onReportListing={handleReportListing}
                />
              ))}
            </section>

            {/* J & K: Verified Free Certifications, Fellowships & Competitions */}
            <section
              id="student-certs-anchor"
              className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
            >
              <h3 className="font-display text-xl font-bold text-slate-900">
                Free Certifications, Student Competitions &amp; Open Fellowships
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {studentCerts.map((prog) => (
                  <div key={prog.id} className="rounded-xl border border-slate-200 p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-semibold text-blue-800">
                        {prog.kind}
                      </span>
                      <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800">
                        {prog.cost}
                      </span>
                    </div>
                    <h4 className="font-display text-base font-bold text-slate-900">{prog.title}</h4>
                    <p className="text-xs text-slate-600">
                      {prog.provider} · Eligible: {prog.eligibleAudience}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {prog.skills.map((s) => (
                        <span
                          key={s}
                          className="rounded border border-slate-200 px-2 py-0.5 text-[11px] text-slate-700"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <a
                      href={prog.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline pt-1"
                    >
                      <span>Visit Official Programme</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* ============================================================
            TAB 6: SCHOLARSHIP DISCOVERY (/careers/scholarships)
           ============================================================ */}
        {activeTab === 'scholarships' && (
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-display text-2xl font-bold text-slate-900">
                International Scholarship &amp; Research Funding Discovery
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Verified government &amp; university scholarship programmes paired with live funding feeds
                from U.S. NSF, UKRI, and Scholars4Dev. Deadlines and amounts are never invented.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(scholarshipsData?.directory ?? []).map((sch) => (
                  <article
                    key={sch.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="rounded border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800">
                          {sch.fundingType}
                        </span>
                        <span className="rounded border border-slate-200 px-2 py-0.5 text-slate-700">
                          {sch.educationLevel} · {sch.country}
                        </span>
                      </div>
                      <h3 className="font-display text-lg font-bold text-slate-900">{sch.name}</h3>
                      <p className="text-xs font-semibold text-blue-700">{sch.institution}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{sch.fundingDetails}</p>
                      <dl className="text-xs space-y-1 pt-1 border-t border-slate-100">
                        <div>
                          <dt className="font-semibold text-slate-700 inline">Eligible Countries: </dt>
                          <dd className="inline text-slate-600">{sch.eligibleCountries}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-700 inline">Eligibility: </dt>
                          <dd className="inline text-slate-600">{sch.eligibilitySummary}</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-slate-700 inline">Deadline Cycle: </dt>
                          <dd className="inline text-slate-600">{sch.deadlineNote}</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-500">
                        Verified {sch.lastVerifiedAt.slice(0, 10)}
                      </span>
                      <a
                        href={sch.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-[#0b1324] px-3 py-1.5 font-semibold text-white hover:bg-blue-600"
                      >
                        <span>Official Application</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Live Scholarship & Research RSS Feed */}
            <section className="space-y-4">
              <h3 className="font-display text-xl font-bold text-slate-900">
                Live Research Grants &amp; Scholarship Announcements ({scholarshipsData?.items.length ?? 0})
              </h3>
              {(scholarshipsData?.items ?? []).map((item) => (
                <JobListingCard
                  key={item.id}
                  job={item}
                  visitorTimezone={profile.timezone}
                  isSaved={savedIdSet.has(item.id)}
                  isReported={reportedIdSet.has(item.id)}
                  onToggleSave={handleToggleSaveJob}
                  onViewOpportunity={handleViewJob}
                  onReportListing={handleReportListing}
                />
              ))}
            </section>
          </div>
        )}

        {/* ============================================================
            TAB 7: GOVERNMENT JOBS HUB (/careers/government)
           ============================================================ */}
        {activeTab === 'government' && (
          <div className="space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-display text-2xl font-bold text-slate-900">
                Country-Specific Official Government Recruitment Portals
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Direct verified links to official civil service, defence, banking, and public sector
                commissions across India, USA, UK, Canada, Australia, Germany, Singapore, UAE, and Japan.
                We never scrape protected government sites or fabricate exam dates.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                {(govData?.portals ?? []).map((portal) => (
                  <article
                    key={portal.id}
                    className="rounded-xl border border-slate-200 p-5 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="inline-flex items-center gap-1 rounded border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800">
                        <Building2 className="h-3.5 w-3.5" />
                        <span>Official source · {portal.country}</span>
                      </span>
                      <span className="text-slate-500">
                        Verified {portal.lastVerifiedAt.slice(0, 10)}
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-slate-900">
                      {portal.portalName}
                    </h3>
                    <p className="text-xs font-medium text-blue-700">{portal.department}</p>
                    <p className="text-xs text-slate-700">{portal.focus}</p>
                    <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 space-y-1">
                      <p>
                        <strong>Qualification:</strong> {portal.qualificationNote}
                      </p>
                      <p>
                        <strong>Age Criteria:</strong> {portal.ageNote}
                      </p>
                      <p className="text-[11px] text-slate-500">{portal.feedNote}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href={portal.officialNotificationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-[#0b1324] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-600"
                      >
                        <span>Official Notifications</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                      <a
                        href={portal.officialPortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:border-blue-400"
                      >
                        <span>Application Portal</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="font-display text-xl font-bold text-slate-900">
                Live Public Sector &amp; Government Notices ({govData?.items.length ?? 0})
              </h3>
              {(govData?.items ?? []).map((item) => (
                <JobListingCard
                  key={item.id}
                  job={item}
                  visitorTimezone={profile.timezone}
                  isSaved={savedIdSet.has(item.id)}
                  isReported={reportedIdSet.has(item.id)}
                  onToggleSave={handleToggleSaveJob}
                  onViewOpportunity={handleViewJob}
                  onReportListing={handleReportListing}
                />
              ))}
            </section>
          </div>
        )}

        {/* ============================================================
            TAB 8: 10 CAREER TOOLS FOR STUDENTS (/careers/tools)
           ============================================================ */}
        {activeTab === 'tools' && (
          <CareerToolsSuite
            activeTool={activeTool}
            onSelectTool={(t) => {
              setActiveTool(t);
              onNavigate({ view: 'careers', tab: 'tools', toolId: t });
            }}
            applications={profile.applications}
            onSaveApplications={(nextApps) =>
              updateProfile((p) => ({ ...p, applications: nextApps }))
            }
          />
        )}

        {/* ============================================================
            SHARED FOOTER PANELS: FRESHNESS TELEMETRY & STUDENT SAFETY
           ============================================================ */}
        <section
          aria-label="Provider Data Freshness and Student Safety Monitor"
          className="rounded-xl border border-slate-200 bg-white p-6 space-y-6"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Data Freshness & Provider Audit */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Provider Data Freshness &amp; Quality Integrity Monitor
                </h2>
                <p className="text-xs text-slate-600">
                  Scheduled caches respect each provider&apos;s rate limit (hourly or 6-hour syncs are never
                  labeled real-time). Automated checks remove duplicates, broken links, and expired deadlines.
                </p>
              </div>

              {jobsData && (
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 text-xs">
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                    <span className="text-slate-500 block">Raw Fetched</span>
                    <span className="font-mono-tabular font-bold text-slate-900">
                      {jobsData.metrics.totalRawFetched}
                    </span>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                    <span className="text-slate-500 block">Duplicates Removed</span>
                    <span className="font-mono-tabular font-bold text-slate-900">
                      {jobsData.metrics.duplicatesRemoved}
                    </span>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                    <span className="text-slate-500 block">Expired / Broken Filtered</span>
                    <span className="font-mono-tabular font-bold text-slate-900">
                      {jobsData.metrics.expiredFiltered + jobsData.metrics.brokenLinksFiltered}
                    </span>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                    <span className="text-slate-500 block">Suspicious Flagged</span>
                    <span className="font-mono-tabular font-bold text-red-700">
                      {jobsData.metrics.suspiciousFlagged}
                    </span>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                    <span className="text-slate-500 block">Salary Not Disclosed</span>
                    <span className="font-mono-tabular font-bold text-slate-700">
                      {jobsData.metrics.missingSalaryCount}
                    </span>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                    <span className="text-slate-500 block">User Reported Locally</span>
                    <span className="font-mono-tabular font-bold text-amber-800">
                      {profile.reportedListings.length}
                    </span>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2 pr-3 font-semibold">Provider</th>
                      <th className="py-2 pr-3 font-semibold">Cadence</th>
                      <th className="py-2 pr-3 font-semibold">Last Sync</th>
                      <th className="py-2 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(jobsData?.providers ?? []).map((p) => (
                      <tr key={p.id}>
                        <td className="py-2 pr-3 font-medium text-slate-900">
                          <a
                            href={p.documentationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {p.name}
                          </a>
                        </td>
                        <td className="py-2 pr-3 text-slate-600">{p.cadenceLabel}</td>
                        <td className="py-2 pr-3 font-mono-tabular text-slate-600">
                          {p.lastSyncAt ? formatRelativeTime(p.lastSyncAt) : '—'}
                        </td>
                        <td className="py-2">
                          <span
                            className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[11px] font-semibold ${
                              p.status === 'live'
                                ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                : p.status === 'cached'
                                ? 'border-blue-300 bg-blue-50 text-blue-800'
                                : 'border-red-300 bg-red-50 text-red-800'
                            }`}
                          >
                            {p.status} ({p.itemCount})
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Student Safety & Anti-Scam Shield */}
            <div className="lg:col-span-5 rounded-xl border border-amber-200 bg-amber-50/60 p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-950">
                <ShieldCheck className="h-5 w-5 text-amber-700" aria-hidden="true" />
                <h2 className="font-display text-base font-bold">
                  Student Safety &amp; Anti-Scam Protection
                </h2>
              </div>
              <ul className="space-y-2 text-xs text-amber-950/90 leading-relaxed">
                <li className="flex items-start gap-2">
                  <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-700" />
                  <span>
                    <strong>Zero Registration or Training Fees:</strong> Legitimate employers, internships,
                    and government portals (except nominal statutory govt exam fees) never demand deposits
                    or paid training before hiring.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700" />
                  <span>
                    <strong>Never Share Sensitive IDs:</strong> TRENDVERSE never asks for Aadhaar, passport
                    numbers, bank account details, OTPs, or passwords.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700" />
                  <span>
                    <strong>Transparent Source Labels:</strong> Every listing clearly states whether it comes
                    from an <em>Official source</em> or <em>Third-party listing</em>. Use the{' '}
                    <strong>Report</strong> button on any card to flag broken links or suspicious terms.
                  </span>
                </li>
              </ul>

              {profile.reportedListings.length > 0 && (
                <div className="pt-2 border-t border-amber-200 text-xs">
                  <p className="font-semibold text-amber-950">Your Flagged Reports:</p>
                  <ul className="mt-1 space-y-1 text-amber-900">
                    {profile.reportedListings.slice(0, 3).map((rep) => (
                      <li key={rep.opportunityId}>
                        • {rep.title} ({rep.reason})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
