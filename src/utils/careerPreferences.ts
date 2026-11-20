import { CareerOpportunity } from '../../server/types';

const CAREERS_PREFS_KEY = 'trendverse_careers_profile_v1';

export interface ApplicationTrackerEntry {
  id: string;
  kind: 'job' | 'internship';
  title: string;
  organization: string;
  location: string;
  url?: string;
  stipendOrSalary?: string;
  deadline?: string;
  status: 'Saved' | 'Applied' | 'Interview' | 'Offer' | 'Closed';
  notes: string;
  updatedAt: string;
}

export interface ReportedListingEntry {
  opportunityId: string;
  title: string;
  sourceName: string;
  reason: string;
  reportedAt: string;
}

export interface CareerProfilePreferences {
  country: string;
  city: string;
  timezone: string;
  educationLevel: 'High School' | 'Undergraduate' | 'Postgraduate / Masters' | 'PhD / Research' | 'Graduate / Working';
  skills: string[];
  preferredCareer: string;
  remotePreference: 'Any' | 'Remote Only' | 'Hybrid / Remote' | 'On-site';
  employmentType: string;
  savedOpportunities: CareerOpportunity[];
  recentlyViewed: CareerOpportunity[];
  reportedListings: ReportedListingEntry[];
  applications: ApplicationTrackerEntry[];
}

export function getDefaultCareersProfile(): CareerProfilePreferences {
  let detectedTz = 'UTC';
  try {
    detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    detectedTz = 'UTC';
  }

  return {
    country: 'Worldwide',
    city: '',
    timezone: detectedTz,
    educationLevel: 'Undergraduate',
    skills: ['Python', 'JavaScript', 'SQL'],
    preferredCareer: 'Software & AI',
    remotePreference: 'Any',
    employmentType: 'All',
    savedOpportunities: [],
    recentlyViewed: [],
    reportedListings: [],
    applications: [],
  };
}

export function loadCareersProfile(): CareerProfilePreferences {
  const defaults = getDefaultCareersProfile();
  try {
    const raw = localStorage.getItem(CAREERS_PREFS_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<CareerProfilePreferences>;
    return {
      ...defaults,
      ...parsed,
      skills: Array.isArray(parsed.skills) ? parsed.skills : defaults.skills,
      savedOpportunities: Array.isArray(parsed.savedOpportunities) ? parsed.savedOpportunities : [],
      recentlyViewed: Array.isArray(parsed.recentlyViewed) ? parsed.recentlyViewed : [],
      reportedListings: Array.isArray(parsed.reportedListings) ? parsed.reportedListings : [],
      applications: Array.isArray(parsed.applications) ? parsed.applications : [],
    };
  } catch {
    return defaults;
  }
}

export function saveCareersProfile(profile: CareerProfilePreferences): void {
  try {
    localStorage.setItem(CAREERS_PREFS_KEY, JSON.stringify(profile));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function clearCareersProfile(): CareerProfilePreferences {
  try {
    localStorage.removeItem(CAREERS_PREFS_KEY);
  } catch {
    // Ignore
  }
  return getDefaultCareersProfile();
}
