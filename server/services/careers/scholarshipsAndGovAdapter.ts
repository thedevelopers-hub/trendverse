import { XMLParser } from 'fast-xml-parser';
import {
  CareerCertificationProgram,
  CareerOpportunity,
  CareerProviderHealth,
  GovernmentPortalDirectoryItem,
  OfficialScholarshipDirectoryItem,
} from '../../types.js';
import { isValidApplicationUrl, scanSafetySignals, stripHtmlToExcerpt } from './safetyScanner.js';

const USER_AGENT = 'TRENDVERSE-Careers/1.0 (https://trendverse.app; careers@trendverse.app)';
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  trimValues: true,
});

interface CachedFeed<T> {
  items: T[];
  health: CareerProviderHealth;
  expiresAt: number;
}

const feedCache = new Map<string, CachedFeed<CareerOpportunity>>();

function toArray<T>(val: T | T[] | undefined): T[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

function extractLink(linkField: unknown): string {
  if (typeof linkField === 'string') return linkField.trim();
  if (Array.isArray(linkField)) {
    for (const entry of linkField) {
      const candidate = extractLink(entry);
      if (candidate) return candidate;
    }
  }
  if (linkField && typeof linkField === 'object') {
    const obj = linkField as Record<string, unknown>;
    if (typeof obj['@_href'] === 'string') return obj['@_href'].trim();
    if (typeof obj['#text'] === 'string') return obj['#text'].trim();
  }
  return '';
}

function parseIsoSafe(raw?: string): string {
  if (!raw) return new Date().toISOString();
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

async function fetchRssOpportunities(
  cacheKey: string,
  meta: Omit<
    CareerProviderHealth,
    'status' | 'lastSyncAt' | 'lastListingPublishedAt' | 'lastVerifiedAt' | 'itemCount'
  >,
  forceRefresh: boolean,
  fetcher: (verifiedAt: string) => Promise<CareerOpportunity[]>
): Promise<{ items: CareerOpportunity[]; health: CareerProviderHealth }> {
  const now = Date.now();
  const cached = feedCache.get(cacheKey);
  if (!forceRefresh && cached && cached.expiresAt > now) {
    return { items: cached.items, health: { ...cached.health, status: 'cached' } };
  }

  const verifiedAt = new Date().toISOString();
  try {
    const items = await fetcher(verifiedAt);
    const newest =
      items.length > 0
        ? items.map((i) => i.postedAt).sort((a, b) => Date.parse(b) - Date.parse(a))[0]
        : null;
    const health: CareerProviderHealth = {
      ...meta,
      status: items.length > 0 ? 'live' : 'unavailable',
      lastSyncAt: verifiedAt,
      lastListingPublishedAt: newest,
      lastVerifiedAt: verifiedAt,
      itemCount: items.length,
    };
    feedCache.set(cacheKey, {
      items,
      health,
      expiresAt: now + meta.refreshIntervalMinutes * 60 * 1000,
    });
    return { items, health };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Feed fetch failed';
    if (cached && cached.items.length > 0) {
      return {
        items: cached.items,
        health: { ...cached.health, status: 'cached', errorMessage: `Cached (${msg})` },
      };
    }
    return {
      items: [],
      health: {
        ...meta,
        status: 'unavailable',
        lastSyncAt: null,
        lastListingPublishedAt: null,
        lastVerifiedAt: null,
        itemCount: 0,
        errorMessage: msg,
      },
    };
  }
}

// Live Scholarships & Research Funding Feeds
export async function getLiveScholarshipFeeds(forceRefresh = false): Promise<{
  items: CareerOpportunity[];
  providers: CareerProviderHealth[];
  directory: OfficialScholarshipDirectoryItem[];
}> {
  const [nsfRun, ukriRun, s4dRun] = await Promise.all([
    fetchRssOpportunities(
      'nsf-funding',
      {
        id: 'nsf-funding',
        name: 'US National Science Foundation (NSF) Funding RSS',
        kind: 'scholarships',
        documentationUrl: 'https://www.nsf.gov/rss/',
        refreshIntervalMinutes: 120,
        cadenceLabel: 'Every 2h sync',
        attributionRequired: true,
        jobPostingSchemaAllowed: false,
        note: 'Official US federal research & graduate fellowship opportunities.',
      },
      forceRefresh,
      async (verifiedAt) => {
        const res = await fetch('https://www.nsf.gov/rss/rss_www_funding.xml', {
          signal: AbortSignal.timeout(4800),
          headers: { 'User-Agent': USER_AGENT },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const parsed = xmlParser.parse(await res.text()) as {
          rss?: { channel?: { item?: Array<Record<string, unknown>> } };
        };
        const items = toArray(parsed.rss?.channel?.item).slice(0, 12);
        return items
          .map((it, idx): CareerOpportunity | null => {
            const title = String(it.title || '').trim();
            const link = extractLink(it.link);
            if (!title || !isValidApplicationUrl(link)) return null;
            const summary = stripHtmlToExcerpt(String(it.description || title));
            const safety = scanSafetySignals(title, summary, link, 'Official source');
            return {
              id: `nsf-${idx}-${encodeURIComponent(title).slice(0, 30)}`,
              kind: 'scholarship',
              title,
              company: 'U.S. National Science Foundation (NSF)',
              companyWebsite: 'https://www.nsf.gov',
              location: 'United States / Eligible Institutions',
              city: 'Alexandria, VA',
              country: 'USA',
              timezone: 'America/New_York',
              remoteEligible: false,
              remoteScope: 'Per official NSF program solicitation',
              workMode: 'On-site',
              employmentType: 'Graduate programme',
              experienceLevel: 'Student',
              skills: ['Research', 'STEM', 'Fellowship'],
              summary,
              postedAt: parseIsoSafe(String(it.pubDate || it['dc:date'] || verifiedAt)),
              lastVerifiedAt: verifiedAt,
              sourceName: 'NSF Official Funding RSS',
              sourceUrl: 'https://www.nsf.gov/funding/',
              applicationUrl: link,
              verificationLabel: safety.verificationLabel,
              isSponsored: false,
              safetyFlags: safety.safetyFlags,
            };
          })
          .filter((x): x is CareerOpportunity => x !== null);
      }
    ),
    fetchRssOpportunities(
      'ukri-funding',
      {
        id: 'ukri-funding',
        name: 'UK Research & Innovation (UKRI) Opportunities RSS',
        kind: 'scholarships',
        documentationUrl: 'https://www.ukri.org/opportunity/',
        refreshIntervalMinutes: 120,
        cadenceLabel: 'Every 2h sync',
        attributionRequired: true,
        jobPostingSchemaAllowed: false,
        note: 'Official UK government research fellowships, grants & doctoral studentships.',
      },
      forceRefresh,
      async (verifiedAt) => {
        const res = await fetch('https://www.ukri.org/opportunity/feed/', {
          signal: AbortSignal.timeout(4800),
          headers: { 'User-Agent': USER_AGENT },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const parsed = xmlParser.parse(await res.text()) as {
          rss?: { channel?: { item?: Array<Record<string, unknown>> } };
        };
        const items = toArray(parsed.rss?.channel?.item).slice(0, 12);
        return items
          .map((it, idx): CareerOpportunity | null => {
            const title = String(it.title || '').trim();
            const link = extractLink(it.link);
            if (!title || !isValidApplicationUrl(link)) return null;
            const summary = stripHtmlToExcerpt(String(it.description || title));
            const safety = scanSafetySignals(title, summary, link, 'Official source');
            return {
              id: `ukri-${idx}-${encodeURIComponent(title).slice(0, 30)}`,
              kind: 'scholarship',
              title,
              company: 'UK Research and Innovation (UKRI)',
              companyWebsite: 'https://www.ukri.org',
              location: 'United Kingdom',
              city: 'London / Swindon',
              country: 'UK',
              timezone: 'Europe/London',
              remoteEligible: false,
              remoteScope: 'Per UKRI institutional eligibility rules',
              workMode: 'On-site',
              employmentType: 'Graduate programme',
              experienceLevel: 'Student',
              skills: ['Research', 'Fellowship', 'Innovation'],
              summary,
              postedAt: parseIsoSafe(String(it.pubDate || verifiedAt)),
              lastVerifiedAt: verifiedAt,
              sourceName: 'UKRI Official RSS',
              sourceUrl: 'https://www.ukri.org/opportunity/',
              applicationUrl: link,
              verificationLabel: safety.verificationLabel,
              isSponsored: false,
              safetyFlags: safety.safetyFlags,
            };
          })
          .filter((x): x is CareerOpportunity => x !== null);
      }
    ),
    fetchRssOpportunities(
      'scholars4dev',
      {
        id: 'scholars4dev',
        name: 'Scholars4Dev International Scholarships RSS',
        kind: 'scholarships',
        documentationUrl: 'https://www.scholars4dev.com/',
        refreshIntervalMinutes: 180,
        cadenceLabel: 'Every 3h sync',
        attributionRequired: true,
        jobPostingSchemaAllowed: false,
        note: 'Aggregates international university & government scholarship announcements; always verify final details on the university site.',
      },
      forceRefresh,
      async (verifiedAt) => {
        const res = await fetch('https://www.scholars4dev.com/feed/', {
          signal: AbortSignal.timeout(4800),
          headers: { 'User-Agent': USER_AGENT },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const parsed = xmlParser.parse(await res.text()) as {
          rss?: { channel?: { item?: Array<Record<string, unknown>> } };
        };
        const items = toArray(parsed.rss?.channel?.item).slice(0, 12);
        return items
          .map((it, idx): CareerOpportunity | null => {
            const title = String(it.title || '').trim();
            const link = extractLink(it.link);
            if (!title || !isValidApplicationUrl(link)) return null;
            const summary = stripHtmlToExcerpt(String(it.description || title));
            const safety = scanSafetySignals(title, summary, link, 'Third-party listing');
            return {
              id: `s4d-${idx}-${encodeURIComponent(title).slice(0, 30)}`,
              kind: 'scholarship',
              title,
              company: 'International University / Government Award',
              location: 'International',
              city: 'Multiple Destinations',
              country: 'Worldwide',
              timezone: 'UTC',
              remoteEligible: false,
              remoteScope: 'Refer to official scholarship eligibility criteria',
              workMode: 'On-site',
              employmentType: 'Graduate programme',
              experienceLevel: 'Student',
              skills: ['Higher Education', 'Scholarship', 'Academic Merit'],
              summary,
              postedAt: parseIsoSafe(String(it.pubDate || verifiedAt)),
              lastVerifiedAt: verifiedAt,
              sourceName: 'Scholars4Dev RSS',
              sourceUrl: 'https://www.scholars4dev.com/',
              applicationUrl: link,
              verificationLabel: safety.verificationLabel,
              attributionNotice: 'Third-party scholarship digest — confirm deadlines on university portal.',
              isSponsored: false,
              safetyFlags: safety.safetyFlags,
            };
          })
          .filter((x): x is CareerOpportunity => x !== null);
      }
    ),
  ]);

  const items = [...nsfRun.items, ...ukriRun.items, ...s4dRun.items].sort(
    (a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt)
  );

  return {
    items,
    providers: [nsfRun.health, ukriRun.health, s4dRun.health],
    directory: OFFICIAL_SCHOLARSHIP_DIRECTORY,
  };
}

// Live Official Government Feeds + Official Portals Directory
export async function getGovernmentRecruitmentData(forceRefresh = false): Promise<{
  items: CareerOpportunity[];
  providers: CareerProviderHealth[];
  portals: GovernmentPortalDirectoryItem[];
}> {
  const [fedRegRun, govUkRun] = await Promise.all([
    fetchRssOpportunities(
      'us-federal-register',
      {
        id: 'us-federal-register',
        name: 'US Federal Register Open API (Fellowships & Internships)',
        kind: 'government',
        documentationUrl: 'https://www.federalregister.gov/developers/documentation/api/v1',
        refreshIntervalMinutes: 180,
        cadenceLabel: 'Every 3h sync',
        attributionRequired: true,
        jobPostingSchemaAllowed: false,
        note: 'Official US government public notices mentioning fellowships, scholarships, and student internships.',
      },
      forceRefresh,
      async (verifiedAt) => {
        const url =
          'https://www.federalregister.gov/api/v1/documents.json?per_page=10&conditions%5Bterm%5D=fellowship+OR+internship+OR+scholarship';
        const res = await fetch(url, {
          signal: AbortSignal.timeout(4800),
          headers: { 'User-Agent': USER_AGENT },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as {
          results?: Array<{
            title?: string;
            abstract?: string | null;
            document_number?: string;
            html_url?: string;
            publication_date?: string;
            agencies?: Array<{ name?: string }>;
          }>;
        };

        return (json.results || [])
          .map((doc): CareerOpportunity | null => {
            const title = (doc.title || '').trim();
            const link = (doc.html_url || '').trim();
            if (!title || !isValidApplicationUrl(link)) return null;
            const agency =
              (doc.agencies || []).map((a) => a.name).filter(Boolean).join(', ') ||
              'U.S. Federal Agency';
            const summary = stripHtmlToExcerpt(
              doc.abstract || `${title} — Official U.S. Federal Register public notice.`
            );
            const safety = scanSafetySignals(title, summary, link, 'Official source');

            return {
              id: `fedreg-${doc.document_number || encodeURIComponent(title).slice(0, 30)}`,
              kind: 'government',
              title,
              company: agency,
              companyWebsite: 'https://www.federalregister.gov',
              department: agency,
              location: 'United States',
              city: 'Washington, D.C. / Agencies',
              country: 'USA',
              timezone: 'America/New_York',
              remoteEligible: false,
              remoteScope: 'Official Federal Notice — Check USAJOBS / Agency instructions',
              workMode: 'On-site',
              employmentType: 'Internship',
              experienceLevel: 'Entry-level',
              skills: ['Public Service', 'Government', 'Policy / Research'],
              summary,
              postedAt: parseIsoSafe(doc.publication_date || verifiedAt),
              lastVerifiedAt: verifiedAt,
              sourceName: 'US Federal Register Official API',
              sourceUrl: 'https://www.federalregister.gov',
              applicationUrl: link,
              verificationLabel: safety.verificationLabel,
              isSponsored: false,
              safetyFlags: safety.safetyFlags,
            };
          })
          .filter((x): x is CareerOpportunity => x !== null);
      }
    ),
    fetchRssOpportunities(
      'uk-govuk-atom',
      {
        id: 'uk-govuk-atom',
        name: 'UK GOV.UK Official Feed (Apprenticeships & Recruitment)',
        kind: 'government',
        documentationUrl: 'https://www.gov.uk/help/about-govuk',
        refreshIntervalMinutes: 180,
        cadenceLabel: 'Every 3h sync',
        attributionRequired: true,
        jobPostingSchemaAllowed: false,
        note: 'Official UK Government announcements related to apprenticeships, skills, and public sector programmes.',
      },
      forceRefresh,
      async (verifiedAt) => {
        const url =
          'https://www.gov.uk/search/news-and-communications.atom?keywords=apprenticeship+OR+recruitment+OR+scholarship';
        const res = await fetch(url, {
          signal: AbortSignal.timeout(4800),
          headers: { 'User-Agent': USER_AGENT },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const parsed = xmlParser.parse(await res.text()) as {
          feed?: { entry?: Array<Record<string, unknown>> };
        };
        const entries = toArray(parsed.feed?.entry).slice(0, 10);
        return entries
          .map((entry, idx): CareerOpportunity | null => {
            const title =
              typeof entry.title === 'object' && entry.title !== null
                ? String((entry.title as Record<string, unknown>)['#text'] || '')
                : String(entry.title || '');
            const link = extractLink(entry.link);
            if (!title.trim() || !isValidApplicationUrl(link)) return null;
            const summaryRaw =
              typeof entry.summary === 'object' && entry.summary !== null
                ? String((entry.summary as Record<string, unknown>)['#text'] || '')
                : String(entry.summary || title);
            const summary = stripHtmlToExcerpt(summaryRaw);
            const safety = scanSafetySignals(title, summary, link, 'Official source');

            return {
              id: `govuk-${idx}-${encodeURIComponent(title).slice(0, 30)}`,
              kind: 'government',
              title: title.trim(),
              company: 'UK Government (GOV.UK)',
              companyWebsite: 'https://www.gov.uk',
              department: 'HM Government',
              location: 'United Kingdom',
              city: 'London / Nationwide',
              country: 'UK',
              timezone: 'Europe/London',
              remoteEligible: false,
              remoteScope: 'UK Public Sector / Apprenticeships',
              workMode: 'On-site',
              employmentType: 'Apprenticeship',
              experienceLevel: 'Entry-level',
              skills: ['Civil Service', 'Apprenticeship', 'Public Sector'],
              summary,
              postedAt: parseIsoSafe(String(entry.updated || verifiedAt)),
              lastVerifiedAt: verifiedAt,
              sourceName: 'GOV.UK Official Atom Feed',
              sourceUrl: 'https://www.gov.uk',
              applicationUrl: link,
              verificationLabel: safety.verificationLabel,
              isSponsored: false,
              safetyFlags: safety.safetyFlags,
            };
          })
          .filter((x): x is CareerOpportunity => x !== null);
      }
    ),
  ]);

  const items = [...fedRegRun.items, ...govUkRun.items].sort(
    (a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt)
  );

  return {
    items,
    providers: [fedRegRun.health, govUkRun.health],
    portals: GOVERNMENT_PORTALS_DIRECTORY,
  };
}

// Curated Official International Scholarship Portals (Strictly Verified Primary URLs — Never fabricated deadlines/amounts)
export const OFFICIAL_SCHOLARSHIP_DIRECTORY: OfficialScholarshipDirectoryItem[] = [
  {
    id: 'sch-chevening',
    name: 'Chevening Scholarships (UK Government)',
    institution: 'UK Foreign, Commonwealth & Development Office & UK Universities',
    country: 'UK',
    eligibleCountries: '160+ Chevening-eligible countries & territories worldwide',
    educationLevel: 'Masters',
    fundingType: 'Fully funded',
    fundingDetails: 'Covers tuition fees, monthly living stipend, return flights, and visa costs per official Chevening terms.',
    deadlineNote: 'Annual cycle (typically opens Aug–Nov). Verify exact closing timestamp on chevening.org.',
    eligibilitySummary: 'Undergraduate degree, 2+ years work/internship experience equivalent, and Chevening country citizenship.',
    officialUrl: 'https://www.chevening.org/scholarships/',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
    verificationLabel: 'Official source',
  },
  {
    id: 'sch-daad',
    name: 'DAAD Scholarships & Study Grants',
    institution: 'German Academic Exchange Service (DAAD)',
    country: 'Germany',
    eligibleCountries: 'International students worldwide (country-specific programmes)',
    educationLevel: 'Masters',
    fundingType: 'Fully funded',
    fundingDetails: 'Monthly stipend, travel allowance, and health insurance per specific DAAD programme database.',
    deadlineNote: 'Varies by programme and home country — check the official DAAD scholarship database.',
    eligibilitySummary: 'Academic excellence and degree eligibility aligned with chosen German host university.',
    officialUrl: 'https://www.daad.de/en/studying-in-germany/scholarships/daad-scholarships/',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
    verificationLabel: 'Official source',
  },
  {
    id: 'sch-fulbright',
    name: 'Fulbright Foreign Student & Visiting Scholar Program',
    institution: 'U.S. Department of State & Binational Commissions',
    country: 'USA',
    eligibleCountries: '160+ participating countries worldwide',
    educationLevel: 'Masters',
    fundingType: 'Varies by award',
    fundingDetails: 'Administered by country-specific Fulbright Commissions (often includes tuition, stipend & airfare).',
    deadlineNote: 'Set by each country’s Fulbright Commission or U.S. Embassy.',
    eligibilitySummary: 'Bachelor’s degree, strong academic record, and English proficiency per home-country commission rules.',
    officialUrl: 'https://foreign.fulbrightonline.org/',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
    verificationLabel: 'Official source',
  },
  {
    id: 'sch-erasmus',
    name: 'Erasmus Mundus Joint Masters (EMJM)',
    institution: 'European Commission (EACEA)',
    country: 'Worldwide',
    eligibleCountries: 'Students worldwide (EU & Non-EU)',
    educationLevel: 'Masters',
    fundingType: 'Fully funded',
    fundingDetails: 'EU-funded scholarship covering participation costs, travel, and monthly subsistence allowance across study countries.',
    deadlineNote: 'Typically October–January per specific Master consortium.',
    eligibilitySummary: 'First higher-education degree (Bachelor’s) and admission to an official Erasmus Mundus catalogue programme.',
    officialUrl: 'https://www.eacea.ec.europa.eu/scholarships/erasmus-mundus-catalogue_en',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
    verificationLabel: 'Official source',
  },
  {
    id: 'sch-mext',
    name: 'MEXT Scholarship (Japanese Government)',
    institution: 'Ministry of Education, Culture, Sports, Science and Technology (Japan)',
    country: 'Japan',
    eligibleCountries: 'Countries maintaining diplomatic relations with Japan',
    educationLevel: 'All Levels',
    fundingType: 'Fully funded',
    fundingDetails: 'Tuition waiver, monthly allowance, and round-trip airfare via Embassy or University Recommendation.',
    deadlineNote: 'Announced by Japanese Embassies abroad and participating Japanese universities.',
    eligibilitySummary: 'Age, academic, and nationality criteria specified in the annual MEXT guidelines.',
    officialUrl: 'https://www.studyinjapan.go.jp/en/planning/scholarships/mext-scholarships/',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
    verificationLabel: 'Official source',
  },
  {
    id: 'sch-australia-awards',
    name: 'Australia Awards Scholarships',
    institution: 'Australian Department of Foreign Affairs and Trade (DFAT)',
    country: 'Australia',
    eligibleCountries: 'Eligible Indo-Pacific & partner developing countries',
    educationLevel: 'All Levels',
    fundingType: 'Fully funded',
    fundingDetails: 'Full tuition, return air travel, establishment allowance, and contribution to living expenses.',
    deadlineNote: 'Country-specific annual windows listed on DFAT portal.',
    eligibilitySummary: 'Citizen of participating country meeting DFAT academic and return-home commitment requirements.',
    officialUrl: 'https://www.dfat.gov.au/people-to-people/australia-awards/australia-awards-scholarships',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
    verificationLabel: 'Official source',
  },
  {
    id: 'sch-nsp-india',
    name: 'National Scholarship Portal (NSP India)',
    institution: 'Ministry of Electronics & IT / Government of India',
    country: 'India',
    eligibleCountries: 'Indian citizens & domiciled students per Central/State schemes',
    educationLevel: 'All Levels',
    fundingType: 'Varies by award',
    fundingDetails: 'Central Sector, Merit-cum-Means, AICTE Pragati/Saksham, and State schemes disbursed via DBT.',
    deadlineNote: 'Scheme-specific academic year cycles published directly on scholarships.gov.in.',
    eligibilitySummary: 'Enrolled students meeting income, merit, and institutional verification criteria.',
    officialUrl: 'https://scholarships.gov.in/',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
    verificationLabel: 'Official source',
  },
  {
    id: 'sch-gates-cambridge',
    name: 'Gates Cambridge Scholarship',
    institution: 'University of Cambridge & Gates Cambridge Trust',
    country: 'UK',
    eligibleCountries: 'Citizens of any country outside the United Kingdom',
    educationLevel: 'PhD / Postdoc',
    fundingType: 'Fully funded',
    fundingDetails: 'Covers full cost of studying at Cambridge (university composition fee, maintenance allowance, airfare).',
    deadlineNote: 'US & International funding deadlines aligned with Cambridge Postgraduate admissions.',
    eligibilitySummary: 'Outstanding intellectual ability, leadership potential, and commitment to improving others’ lives.',
    officialUrl: 'https://www.gatescambridge.org/',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
    verificationLabel: 'Official source',
  },
  {
    id: 'sch-knight-hennessy',
    name: 'Knight-Hennessy Scholars at Stanford University',
    institution: 'Stanford University',
    country: 'USA',
    eligibleCountries: 'All nationalities worldwide',
    educationLevel: 'Graduate programme' as unknown as OfficialScholarshipDirectoryItem['educationLevel'],
    fundingType: 'Fully funded',
    fundingDetails: 'Fellowship covering tuition, stipend for living/academic expenses, and travel stipend up to 3 years.',
    deadlineNote: 'Annual Autumn intake cycle — verify exact date on knight-hennessy.stanford.edu.',
    eligibilitySummary: 'Applying concurrently to a full-time Stanford graduate programme within eligibility window of first bachelor’s degree.',
    officialUrl: 'https://knight-hennessy.stanford.edu/',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
    verificationLabel: 'Official source',
  },
];

// Fix type value for Knight-Hennessy cleanly
OFFICIAL_SCHOLARSHIP_DIRECTORY[8].educationLevel = 'Masters';

export const GOVERNMENT_PORTALS_DIRECTORY: GovernmentPortalDirectoryItem[] = [
  {
    id: 'gov-in-upsc',
    country: 'India',
    portalName: 'UPSC — Union Public Service Commission',
    department: 'Government of India Constitutional Recruiting Body',
    focus: 'Civil Services (IAS/IPS/IFS), Engineering Services, CDS, NDA, Combined Medical & Central Recruitment',
    qualificationNote: 'Bachelor’s degree / programme-specific qualifications stated in official UPSC notifications.',
    ageNote: 'Stated per examination notice (typically 21–32 years for CSE with statutory relaxations).',
    officialNotificationUrl: 'https://upsc.gov.in/examinations/active-exams',
    officialPortalUrl: 'https://upsconline.nic.in/',
    feedNote: 'UPSC publishes official PDFs/HTML calendars without public unauthenticated JSON feeds; always confirm dates on upsc.gov.in.',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
  },
  {
    id: 'gov-in-ssc',
    country: 'India',
    portalName: 'SSC — Staff Selection Commission',
    department: 'Department of Personnel & Training, Government of India',
    focus: 'CGL, CHSL, MTS, GD, Junior Engineer (JE) & Stenographer Central Ministry Recruitment',
    qualificationNote: '10th / 12th / Graduation depending on exact post notice.',
    ageNote: 'Varies by post group (18–27 / 20–30 / 18–32) per official SSC Gazette notification.',
    officialNotificationUrl: 'https://ssc.gov.in/home/notice-board',
    officialPortalUrl: 'https://ssc.gov.in/',
    feedNote: 'Direct link to official ssc.gov.in notice board; zero third-party middlemen.',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
  },
  {
    id: 'gov-in-ncs',
    country: 'India',
    portalName: 'NCS — National Career Service India',
    department: 'Ministry of Labour & Employment, Government of India',
    focus: 'Central/State Government vacancies, PSU apprenticeships, fresher employment & career counseling',
    qualificationNote: 'All educational levels (ITI, Diploma, Graduate, Postgraduate).',
    ageNote: 'Per individual employer/department listing on ncs.gov.in.',
    officialNotificationUrl: 'https://www.ncs.gov.in/Pages/Search.aspx?Filter=Government',
    officialPortalUrl: 'https://www.ncs.gov.in/',
    feedNote: 'Official Government of India employment portal requiring direct portal browsing.',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
  },
  {
    id: 'gov-in-isro-drdo',
    country: 'India',
    portalName: 'ISRO & DRDO Recruitment Portals',
    department: 'Department of Space & Ministry of Defence R&D',
    focus: 'Scientist/Engineer SC, JRF/SRF Research Fellowships, Student Internships & Graduate Apprenticeships',
    qualificationNote: 'B.E./B.Tech, M.Sc., or Diploma as specified in centre-wise advertisements.',
    ageNote: 'Maximum age limits explicitly declared in each ICRB / RAC notification.',
    officialNotificationUrl: 'https://www.isro.gov.in/Careers.html',
    officialPortalUrl: 'https://rac.gov.in/',
    feedNote: 'Verify centre advertisements only on isro.gov.in and rac.gov.in.',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
  },
  {
    id: 'gov-in-ibps-state',
    country: 'India',
    portalName: 'IBPS Public Sector Banking & State PSC Hub',
    department: 'Institute of Banking Personnel Selection & State Commissions',
    focus: 'PO, Clerk, Specialist Officer (SO), RRB & State Public Service Commissions',
    qualificationNote: 'Recognised university graduation & local language proficiency where applicable.',
    ageNote: 'Declared in annual IBPS CRP calendars.',
    officialNotificationUrl: 'https://www.ibps.in/',
    officialPortalUrl: 'https://www.india.gov.in/topics/labour-employment/employment',
    feedNote: 'Official India.gov.in employment & IBPS reference portals.',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
  },
  {
    id: 'gov-us-usajobs',
    country: 'USA',
    portalName: 'USAJOBS (U.S. Federal Government)',
    department: 'U.S. Office of Personnel Management (OPM)',
    focus: 'Federal Civil Service, Pathways Student Internships & Recent Graduate Programmes',
    qualificationNote: 'Student, Recent Graduate, GS-grade academic/experience substitution rules.',
    ageNote: 'Generally open to eligible U.S. citizens/nationals (specific law enforcement caps apply).',
    officialNotificationUrl: 'https://www.usajobs.gov/Help/working-in-government/unique-hiring-paths/students/',
    officialPortalUrl: 'https://www.usajobs.gov/',
    feedNote: 'Live federal notices appear in our Federal Register feed above; full vacancy search requires direct USAJOBS portal.',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
  },
  {
    id: 'gov-uk-civilservice',
    country: 'UK',
    portalName: 'UK Civil Service Jobs & Find an Apprenticeship',
    department: 'Cabinet Office & Department for Education (UK)',
    focus: 'Civil Service Fast Stream, Apprenticeships & Departmental Vacancies',
    qualificationNote: 'GCSEs/A-Levels for apprenticeships; Bachelor’s for Fast Stream.',
    ageNote: '16+ for apprenticeships per UK statutory rules.',
    officialNotificationUrl: 'https://www.civilservicejobs.service.gov.uk/',
    officialPortalUrl: 'https://www.findapprenticeship.service.gov.uk/',
    feedNote: 'Combined with live GOV.UK announcements feed.',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
  },
  {
    id: 'gov-ca-gcjobs',
    country: 'Canada',
    portalName: 'GC Jobs & FSWEP Student Employment',
    department: 'Government of Canada',
    focus: 'Federal Student Work Experience Program (FSWEP), Post-Secondary Co-op & Public Service',
    qualificationNote: 'Full-time post-secondary students for FSWEP; degree/experience per job poster.',
    ageNote: 'Per Canadian public service eligibility.',
    officialNotificationUrl: 'https://www.canada.ca/en/services/jobs/opportunities/government.html',
    officialPortalUrl: 'https://emploisfp-psjobs.cfp-psc.gc.ca/',
    feedNote: 'Direct official Government of Canada portal.',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
  },
  {
    id: 'gov-au-apsjobs',
    country: 'Australia',
    portalName: 'APSJobs — Australian Public Service',
    department: 'Australian Public Service Commission',
    focus: 'APS Graduate Programmes, Internships & Federal Agency Roles',
    qualificationNote: 'Australian citizenship & relevant degree/skill requirements.',
    ageNote: 'Per APS employment legislation.',
    officialNotificationUrl: 'https://www.apsjobs.gov.au/s/graduate-programs',
    officialPortalUrl: 'https://www.apsjobs.gov.au/',
    feedNote: 'Direct official Australian Public Service portal.',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
  },
  {
    id: 'gov-de-arbeitsagentur',
    country: 'Germany',
    portalName: 'Bundesagentur für Arbeit & Make it in Germany',
    department: 'Federal Employment Agency (Germany)',
    focus: 'Ausbildung, Duales Studium, Skilled Migration & Public Sector Roles',
    qualificationNote: 'Recognised school/vocational or university credentials.',
    ageNote: 'Per German statutory rules.',
    officialNotificationUrl: 'https://www.make-it-in-germany.com/en/working-in-germany/job-listings',
    officialPortalUrl: 'https://www.arbeitsagentur.de/',
    feedNote: 'Paired with live German & European Arbeitnow listings in the Jobs tab.',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
  },
  {
    id: 'gov-sg-careersgov',
    country: 'Singapore',
    portalName: 'Careers@Gov & MyCareersFuture',
    department: 'Singapore Public Service Division & Workforce Singapore',
    focus: 'Public Service Internships, Management Associate Programmes & Tech Agencies (GovTech)',
    qualificationNote: 'Polytechnic diploma, Bachelor’s or postgraduate qualifications.',
    ageNote: 'Per agency announcement.',
    officialNotificationUrl: 'https://www.careers.gov.sg/',
    officialPortalUrl: 'https://www.mycareersfuture.gov.sg/',
    feedNote: 'Official Singapore public sector portals.',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
  },
  {
    id: 'gov-ae-jp',
    country: 'UAE',
    portalName: 'UAE Government Official Careers & Nafis',
    department: 'Federal Authority for Government Human Resources (UAE)',
    focus: 'UAE Federal Entities, Emiratisation & Graduate Programmes',
    qualificationNote: 'Verified degree & security clearance where applicable.',
    ageNote: 'Per UAE Labour Law.',
    officialNotificationUrl: 'https://u.ae/en/information-and-services/jobs',
    officialPortalUrl: 'https://nafis.gov.ae/',
    feedNote: 'Official UAE government portal directory.',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
  },
  {
    id: 'gov-jp-jrecin',
    country: 'Japan',
    portalName: 'JREC-IN Portal & Hello Work Japan',
    department: 'Japan Science and Technology Agency (JST) & MHLW',
    focus: 'Researcher, Postdoctoral, Academic & Government Public Employment',
    qualificationNote: 'Researcher / PhD / institutional criteria on JREC-IN.',
    ageNote: 'Per institutional guidelines.',
    officialNotificationUrl: 'https://jrecin.jst.go.jp/seek/SeekTop?ln=1',
    officialPortalUrl: 'https://www.hellowork.mhlw.go.jp/',
    feedNote: 'Official Japanese national research & public employment portals.',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
  },
];

export const STUDENT_CERTIFICATIONS_AND_COMPETITIONS: CareerCertificationProgram[] = [
  {
    id: 'cert-fcc',
    title: 'freeCodeCamp Verified Developer Certifications',
    provider: 'freeCodeCamp.org',
    kind: 'Free Certification',
    cost: 'Free',
    eligibleAudience: 'Students, freshers & self-learners worldwide',
    skills: ['HTML/CSS', 'JavaScript', 'React', 'Python', 'SQL'],
    officialUrl: 'https://www.freecodecamp.org/learn/',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
  },
  {
    id: 'cert-cs50',
    title: 'Harvard CS50x & CS50 AI (Free Audit + Free CS50 Certificate)',
    provider: 'Harvard University (cs50.harvard.edu)',
    kind: 'Free Certification',
    cost: 'Free',
    eligibleAudience: 'High school, university students & beginners',
    skills: ['C', 'Python', 'SQL', 'Algorithms', 'AI'],
    officialUrl: 'https://cs50.harvard.edu/x/',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
  },
  {
    id: 'cert-kaggle',
    title: 'Kaggle Learn Micro-Courses & Free Certificates',
    provider: 'Kaggle',
    kind: 'Free Certification',
    cost: 'Free',
    eligibleAudience: 'Aspiring Data Scientists & ML engineers',
    skills: ['Python', 'Pandas', 'Machine Learning', 'SQL', 'Data Visualization'],
    officialUrl: 'https://www.kaggle.com/learn',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
  },
  {
    id: 'cert-nptel',
    title: 'SWAYAM / NPTEL IIT Free Courses (Audit Free)',
    provider: 'Ministry of Education, Govt. of India & IITs/IISc',
    kind: 'Free Certification',
    cost: 'Free',
    eligibleAudience: 'University students & Indian learners (exam fee optional)',
    skills: ['Computer Science', 'Engineering', 'Management', 'Data Science'],
    officialUrl: 'https://swayam.gov.in/',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
  },
  {
    id: 'comp-nasa-spaceapps',
    title: 'NASA International Space Apps Challenge',
    provider: 'NASA & Global Space Agencies',
    kind: 'Student Competition',
    cost: 'Free',
    eligibleAudience: 'Students, coders, designers & scientists globally',
    skills: ['Space Data', 'Open Science', 'Problem Solving', 'Prototyping'],
    officialUrl: 'https://www.spaceappschallenge.org/',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
  },
  {
    id: 'comp-icpc',
    title: 'ICPC — International Collegiate Programming Contest',
    provider: 'ICPC Foundation',
    kind: 'Student Competition',
    cost: 'Free',
    eligibleAudience: 'University undergraduate & postgraduate teams',
    skills: ['Algorithms', 'C++', 'Competitive Programming'],
    officialUrl: 'https://icpc.global/',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
  },
  {
    id: 'comp-sih',
    title: 'Smart India Hackathon (SIH)',
    provider: 'Ministry of Education’s Innovation Cell (India)',
    kind: 'Student Competition',
    cost: 'Free',
    eligibleAudience: 'Recognised Indian higher-education student teams',
    skills: ['Software Engineering', 'Hardware IoT', 'Public Problem Solving'],
    officialUrl: 'https://www.sih.gov.in/',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
  },
  {
    id: 'fell-gsoc',
    title: 'Google Summer of Code (GSoC) Open-Source Stipend Fellowship',
    provider: 'Google Open Source',
    kind: 'Fellowship & Open Learning',
    cost: 'Free',
    eligibleAudience: 'Students & new open-source contributors (18+)',
    skills: ['Open Source', 'Git', 'Python / C++ / JS / Rust'],
    officialUrl: 'https://summerofcode.withgoogle.com/',
    lastVerifiedAt: '2026-11-19T00:00:00Z',
  },
];
