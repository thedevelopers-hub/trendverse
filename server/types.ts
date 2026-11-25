export type NewsCategory =
  | 'Breaking Developments'
  | 'World'
  | 'India'
  | 'Technology'
  | 'Artificial Intelligence'
  | 'Business'
  | 'Science'
  | 'Space'
  | 'Entertainment'
  | 'Climate';

export interface LiveNewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  publisher: string;
  sourceId: string;
  category: NewsCategory;
  countryTag: string;
  publishedAt: string; // ISO 8601
  thumbnailUrl?: string;
  isBreakingEligible: boolean; // True only when published within last 6 hours
}

export interface FeedSourceHealth {
  id: string;
  name: string;
  category: NewsCategory;
  url: string;
  status: 'ok' | 'cached' | 'error';
  lastCheckedAt: string;
  lastSuccessAt: string | null;
  itemCount: number;
  errorMessage?: string;
}

export interface LiveNewsResponse {
  items: LiveNewsItem[];
  sources: FeedSourceHealth[];
  lastSuccessfulRefresh: string | null;
  duplicatesRemoved: number;
  status: 'live' | 'partial' | 'cached' | 'unavailable';
}

export type TrendGeoCode =
  | 'WORLD'
  | 'IN'
  | 'US'
  | 'GB'
  | 'CA'
  | 'AU'
  | 'JP'
  | 'DE'
  | 'FR'
  | 'BR';

export interface TrendRelatedArticle {
  title: string;
  source: string;
  url: string;
}

export interface TrendItem {
  id: string;
  query: string;
  approxTraffic: string; // Official Google Trends ht:approx_traffic indicator (not exact volume)
  trafficNumeric: number;
  interestLabel: string;
  direction: 'Rising' | 'Steady';
  category: string;
  geo: TrendGeoCode;
  geoName: string;
  publishedAt: string;
  trendsExploreUrl: string;
  relatedQueries: string[];
  relatedArticles: TrendRelatedArticle[];
}

export interface TrendsResponse {
  geo: TrendGeoCode;
  geoName: string;
  sourceName: string;
  sourceUrl: string;
  lastUpdated: string | null;
  status: 'live' | 'cached' | 'unavailable';
  note: string;
  errorMessage?: string;
  trends: TrendItem[];
}

export interface BriefingStoryDigest {
  headline: string;
  category: string;
  countryTag: string;
  summary: string;
  whyItMatters: string;
  whatHappensNext: string;
  sourceName: string;
  sourceUrl: string;
  publishedAt: string;
}

export interface DailyBriefingResponse {
  id: string;
  aiAvailable: boolean;
  fallbackMode?: boolean;
  label: string;
  briefingDate: string;
  generatedAt: string;
  modelName: string;
  countryPreference: string;
  categoryPreference: string;
  overview: string;
  stories: BriefingStoryDigest[];
  fallbackArticles?: LiveNewsItem[];
  note?: string;
  errorMessage?: string;
}

export type TrendBattleRange = '7d' | '30d' | '90d';

export interface TrendBattlePoint {
  date: string; // YYYY-MM-DD
  topicAScore: number | null; // 0-100 relative interest score
  topicBScore: number | null; // 0-100 relative interest score
}

export interface TrendBattleEntitySummary {
  inputTopic: string;
  resolvedEntity: string | null;
  wikipediaUrl: string | null;
  averageScore: number;
  peakScore: number;
  peakDate: string | null;
  trendingTodayTraffic: string | null;
  relatedQueries: string[];
  risingQueries: string[];
  available: boolean;
  errorReason?: string;
}

export interface TrendBattleResponse {
  topicA: TrendBattleEntitySummary;
  topicB: TrendBattleEntitySummary;
  geo: TrendGeoCode;
  geoName: string;
  range: TrendBattleRange;
  series: TrendBattlePoint[];
  sourceName: string;
  sourceUrl: string;
  googleTrendsCompareUrl: string;
  googleTrendsApiNote: string;
  isRelativeScoreNotice: string;
  lastUpdated: string;
  status: 'live' | 'partial' | 'unavailable';
  errorMessage?: string;
}

// ============================================================
// TRENDVERSE CAREERS 1.0 TYPES
// ============================================================

export type CareerEmploymentType =
  | 'Full-time'
  | 'Part-time'
  | 'Contract'
  | 'Freelance'
  | 'Internship'
  | 'Apprenticeship'
  | 'Temporary'
  | 'Graduate programme';

export type CareerWorkMode = 'Remote' | 'Work From Home' | 'Hybrid' | 'On-site';

export type CareerExperienceLevel =
  | 'No experience'
  | 'Fresher'
  | 'Student'
  | 'Entry-level'
  | '1–3 years'
  | 'Experienced';

export type CareerVerificationLabel =
  | 'Official source'
  | 'Verified source link'
  | 'Third-party listing'
  | 'Verification unavailable'
  | 'Potentially suspicious';

export type CareerCategoryKind = 'job' | 'scholarship' | 'government';

export interface CareerOpportunity {
  id: string;
  kind: CareerCategoryKind;
  title: string;
  company: string;
  companyWebsite?: string;
  location: string;
  city: string;
  country: string;
  timezone: string;
  remoteEligible: boolean;
  remoteScope: string; // e.g., "Worldwide", "India Only", "US & Canada", "EMEA", "On-site / Local"
  workMode: CareerWorkMode;
  employmentType: CareerEmploymentType;
  experienceLevel: CareerExperienceLevel;
  salaryText?: string;
  salaryMinAnnualUsd?: number;
  salaryCurrency?: string;
  isPaidInternship?: boolean;
  skills: string[];
  summary: string;
  postedAt: string; // ISO 8601
  lastVerifiedAt: string; // ISO 8601
  applicationDeadline?: string; // ISO 8601 or official date string
  sourceName: string;
  sourceUrl: string;
  applicationUrl: string;
  verificationLabel: CareerVerificationLabel;
  attributionNotice?: string;
  isSponsored: boolean;
  safetyFlags: string[];
  department?: string;
}

export interface CareerProviderHealth {
  id: string;
  name: string;
  kind: 'jobs' | 'scholarships' | 'government';
  documentationUrl: string;
  refreshIntervalMinutes: number;
  cadenceLabel: string; // Never calls daily-cached data "real-time"
  status: 'live' | 'cached' | 'unavailable';
  lastSyncAt: string | null;
  lastListingPublishedAt: string | null;
  lastVerifiedAt: string | null;
  itemCount: number;
  attributionRequired: boolean;
  jobPostingSchemaAllowed: boolean;
  note?: string;
  errorMessage?: string;
}

export interface CareerFreshnessMetrics {
  totalRawFetched: number;
  duplicatesRemoved: number;
  expiredFiltered: number;
  brokenLinksFiltered: number;
  suspiciousFlagged: number;
  missingSalaryCount: number;
}

export interface CareersOpportunitiesResponse {
  items: CareerOpportunity[];
  totalMatched: number;
  providers: CareerProviderHealth[];
  trendingSkills: Array<{ skill: string; count: number }>;
  metrics: CareerFreshnessMetrics;
  lastUpdated: string;
  status: 'live' | 'partial' | 'cached' | 'unavailable';
}

export interface OfficialScholarshipDirectoryItem {
  id: string;
  name: string;
  institution: string;
  country: string;
  eligibleCountries: string;
  educationLevel: 'Undergraduate' | 'Masters' | 'PhD / Postdoc' | 'All Levels' | 'Fellowship / Research';
  fundingType: 'Fully funded' | 'Partially funded' | 'Varies by award';
  fundingDetails: string;
  deadlineNote: string;
  eligibilitySummary: string;
  officialUrl: string;
  lastVerifiedAt: string;
  verificationLabel: CareerVerificationLabel;
}

export interface GovernmentPortalDirectoryItem {
  id: string;
  country: string;
  portalName: string;
  department: string;
  focus: string;
  qualificationNote: string;
  ageNote: string;
  officialNotificationUrl: string;
  officialPortalUrl: string;
  feedNote: string;
  lastVerifiedAt: string;
}

export interface CareerCertificationProgram {
  id: string;
  title: string;
  provider: string;
  kind: 'Free Certification' | 'Student Competition' | 'Fellowship & Open Learning';
  cost: 'Free';
  eligibleAudience: string;
  skills: string[];
  officialUrl: string;
  lastVerifiedAt: string;
}

export interface CareerAiAssistRequest {
  mode: 'resume-review' | 'cover-letter' | 'interview-feedback';
  targetRole: string;
  company?: string;
  experienceLevel?: string;
  text: string;
}

export interface CareerAiAssistResponse {
  aiAvailable: boolean;
  mode: CareerAiAssistRequest['mode'];
  modelName: string;
  generatedAt: string;
  suggestions: string[];
  polishedText?: string;
  disclaimer: string;
  errorMessage?: string;
}

