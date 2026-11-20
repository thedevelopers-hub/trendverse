import {
  CareerOpportunity,
  CareerProviderHealth,
  CareersOpportunitiesResponse,
} from '../../types.js';
import {
  deduplicateAndAuditOpportunities,
  extractSkills,
  inferCountryAndTimezone,
  inferEmploymentType,
  inferExperienceLevel,
  inferRemoteScope,
  isValidApplicationUrl,
  scanSafetySignals,
  stripHtmlToExcerpt,
} from './safetyScanner.js';

const USER_AGENT = 'TRENDVERSE-Careers/1.0 (https://trendverse.app; careers@trendverse.app)';

interface CachedProviderResult {
  items: CareerOpportunity[];
  health: CareerProviderHealth;
  expiresAt: number;
  lastFetchedAtMs: number;
}

const providerCache = new Map<string, CachedProviderResult>();

function parseSalaryEstimateUsd(salaryText?: string): number | undefined {
  if (!salaryText) return undefined;
  const nums = salaryText.match(/\d[\d,]{3,}/g);
  if (!nums || nums.length === 0) return undefined;
  const parsed = Number(nums[0].replace(/,/g, ''));
  if (Number.isNaN(parsed) || parsed <= 0) return undefined;
  if (/\/\s*(hr|hour)/i.test(salaryText)) return Math.round(parsed * 2080);
  if (/\/\s*(mo|month)/i.test(salaryText)) return Math.round(parsed * 12);
  if (salaryText.includes('€')) return Math.round(parsed * 1.08);
  if (salaryText.includes('£')) return Math.round(parsed * 1.26);
  if (salaryText.includes('₹')) return Math.round(parsed / 84);
  return parsed;
}

function buildWebsiteFromUrl(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}`;
  } catch {
    return undefined;
  }
}

async function fetchWithCache(
  id: string,
  meta: Omit<
    CareerProviderHealth,
    'status' | 'lastSyncAt' | 'lastListingPublishedAt' | 'lastVerifiedAt' | 'itemCount'
  >,
  forceRefresh: boolean,
  minCooldownMs: number,
  fetcher: (verifiedAt: string) => Promise<CareerOpportunity[]>
): Promise<{ items: CareerOpportunity[]; health: CareerProviderHealth }> {
  const now = Date.now();
  const cached = providerCache.get(id);

  // Respect documented provider rate limits even when forceRefresh is requested
  if (cached) {
    const withinCooldown = now - cached.lastFetchedAtMs < minCooldownMs;
    if ((!forceRefresh && cached.expiresAt > now) || withinCooldown) {
      return {
        items: cached.items,
        health: {
          ...cached.health,
          status: cached.health.itemCount > 0 ? 'cached' : cached.health.status,
        },
      };
    }
  }

  const verifiedAt = new Date().toISOString();
  try {
    const items = await fetcher(verifiedAt);
    const newestDate =
      items.length > 0
        ? items
            .map((i) => i.postedAt)
            .sort((a, b) => Date.parse(b) - Date.parse(a))[0]
        : null;

    const health: CareerProviderHealth = {
      ...meta,
      status: items.length > 0 ? 'live' : 'unavailable',
      lastSyncAt: verifiedAt,
      lastListingPublishedAt: newestDate,
      lastVerifiedAt: verifiedAt,
      itemCount: items.length,
    };

    providerCache.set(id, {
      items,
      health,
      expiresAt: now + meta.refreshIntervalMinutes * 60 * 1000,
      lastFetchedAtMs: now,
    });

    return { items, health };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Provider request failed';
    if (cached && cached.items.length > 0) {
      return {
        items: cached.items,
        health: {
          ...cached.health,
          status: 'cached',
          errorMessage: `Serving cached data (${msg})`,
        },
      };
    }
    return {
      items: [],
      health: {
        ...meta,
        status: 'unavailable',
        lastSyncAt: cached?.health.lastSyncAt || null,
        lastListingPublishedAt: cached?.health.lastListingPublishedAt || null,
        lastVerifiedAt: cached?.health.lastVerifiedAt || null,
        itemCount: 0,
        errorMessage: msg,
      },
    };
  }
}

// 1. Himalayas Public Jobs API
async function fetchHimalayas(verifiedAt: string): Promise<CareerOpportunity[]> {
  const res = await fetch('https://himalayas.app/jobs/api?limit=45', {
    signal: AbortSignal.timeout(8000),
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as {
    jobs?: Array<{
      title?: string;
      excerpt?: string;
      companyName?: string;
      companySlug?: string;
      employmentType?: string;
      minSalary?: number | null;
      maxSalary?: number | null;
      salaryPeriod?: string;
      currency?: string | null;
      seniority?: string[];
      locationRestrictions?: string[];
      categories?: string[];
      pubDate?: number;
      expiryDate?: number | null;
      applicationLink?: string;
      guid?: string;
    }>;
  };

  const results: CareerOpportunity[] = [];
  for (const job of data.jobs || []) {
    const title = (job.title || '').trim();
    const company = (job.companyName || '').trim();
    const appUrl = (job.applicationLink || job.guid || '').trim();
    if (!title || !company || !isValidApplicationUrl(appUrl)) continue;

    const pubMs = job.pubDate
      ? job.pubDate > 1e12
        ? job.pubDate
        : job.pubDate * 1000
      : Date.now();
    const expMs = job.expiryDate
      ? job.expiryDate > 1e12
        ? job.expiryDate
        : job.expiryDate * 1000
      : null;

    const locList = job.locationRestrictions || [];
    const locRaw = locList.length > 0 ? locList.join(', ') : 'Worldwide Remote';
    const geo = inferCountryAndTimezone(locRaw);
    const remote = inferRemoteScope(true, locRaw, locList);
    const employmentType = inferEmploymentType(job.employmentType || '', title);
    const experienceLevel = inferExperienceLevel((job.seniority || []).join(' '), title, employmentType);
    const summary = stripHtmlToExcerpt(job.excerpt || title);

    let salaryText: string | undefined;
    let salaryMinAnnualUsd: number | undefined;
    if (job.minSalary || job.maxSalary) {
      const curr = job.currency || 'USD';
      const period = job.salaryPeriod || 'annual';
      const minStr = job.minSalary ? job.minSalary.toLocaleString('en-US') : '';
      const maxStr = job.maxSalary ? job.maxSalary.toLocaleString('en-US') : '';
      salaryText =
        minStr && maxStr
          ? `${curr} ${minStr}–${maxStr} (${period})`
          : `${curr} ${minStr || maxStr} (${period})`;
      if (job.minSalary) {
        salaryMinAnnualUsd =
          period.toLowerCase().includes('hour')
            ? Math.round(job.minSalary * 2080)
            : job.minSalary;
      }
    }

    const safety = scanSafetySignals(title, summary, appUrl, 'Third-party listing');
    const skills = extractSkills(job.categories || [], title, summary);

    results.push({
      id: `him-${encodeURIComponent(job.guid || `${company}-${title}`).slice(0, 80)}`,
      kind: 'job',
      title,
      company,
      companyWebsite: job.companySlug ? `https://himalayas.app/companies/${job.companySlug}` : undefined,
      location: locRaw,
      city: geo.city,
      country: locList.length === 0 ? 'Worldwide' : geo.country,
      timezone: geo.timezone,
      remoteEligible: remote.remoteEligible,
      remoteScope: remote.remoteScope,
      workMode: remote.workMode,
      employmentType,
      experienceLevel,
      salaryText,
      salaryMinAnnualUsd,
      salaryCurrency: job.currency || undefined,
      isPaidInternship: employmentType === 'Internship' ? Boolean(salaryText) : undefined,
      skills,
      summary,
      postedAt: new Date(pubMs).toISOString(),
      lastVerifiedAt: verifiedAt,
      applicationDeadline: expMs ? new Date(expMs).toISOString() : undefined,
      sourceName: 'Himalayas Public API',
      sourceUrl: 'https://himalayas.app/jobs',
      applicationUrl: appUrl,
      verificationLabel: safety.verificationLabel,
      attributionNotice: 'Sourced via Himalayas public jobs feed.',
      isSponsored: false,
      safetyFlags: safety.safetyFlags,
    });
  }
  return results;
}

// 2. Remotive Public API (Strict max 4 fetches/day -> 360m cache, direct URL, attribution)
async function fetchRemotive(verifiedAt: string): Promise<CareerOpportunity[]> {
  const res = await fetch('https://remotive.com/api/remote-jobs?limit=40', {
    signal: AbortSignal.timeout(8000),
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as {
    jobs?: Array<{
      id?: number;
      url?: string;
      title?: string;
      company_name?: string;
      category?: string;
      tags?: string[];
      job_type?: string;
      publication_date?: string;
      candidate_required_location?: string;
      salary?: string;
      description?: string;
    }>;
  };

  const results: CareerOpportunity[] = [];
  for (const job of data.jobs || []) {
    const title = (job.title || '').trim();
    const company = (job.company_name || '').trim();
    const appUrl = (job.url || '').trim();
    if (!title || !company || !isValidApplicationUrl(appUrl)) continue;

    const locRaw = (job.candidate_required_location || 'Remote').trim();
    const geo = inferCountryAndTimezone(locRaw);
    const remote = inferRemoteScope(true, locRaw);
    const employmentType = inferEmploymentType(job.job_type || '', title);
    const experienceLevel = inferExperienceLevel('', title, employmentType);
    const summary = stripHtmlToExcerpt(job.description || `${title} at ${company}`);
    const salaryText = job.salary && job.salary.trim() ? job.salary.trim() : undefined;
    const safety = scanSafetySignals(title, summary, appUrl, 'Third-party listing');
    const skills = extractSkills([...(job.tags || []), job.category || ''], title, summary);

    results.push({
      id: `rem-${job.id || encodeURIComponent(title).slice(0, 40)}`,
      kind: 'job',
      title,
      company,
      location: locRaw,
      city: geo.city,
      country: geo.country,
      timezone: geo.timezone,
      remoteEligible: remote.remoteEligible,
      remoteScope: remote.remoteScope,
      workMode: remote.workMode,
      employmentType,
      experienceLevel,
      salaryText,
      salaryMinAnnualUsd: parseSalaryEstimateUsd(salaryText),
      isPaidInternship: employmentType === 'Internship' ? Boolean(salaryText) : undefined,
      skills,
      summary,
      postedAt: job.publication_date
        ? new Date(job.publication_date).toISOString()
        : verifiedAt,
      lastVerifiedAt: verifiedAt,
      sourceName: 'Remotive',
      sourceUrl: 'https://remotive.com',
      applicationUrl: appUrl,
      verificationLabel: safety.verificationLabel,
      attributionNotice: 'Source: Remotive (delayed 24h public API · direct Remotive listing link).',
      isSponsored: false,
      safetyFlags: safety.safetyFlags,
    });
  }
  return results;
}

// 3. Arbeitnow Public Job Board API
async function fetchArbeitnow(verifiedAt: string): Promise<CareerOpportunity[]> {
  const res = await fetch('https://www.arbeitnow.com/api/job-board-api', {
    signal: AbortSignal.timeout(8000),
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as {
    data?: Array<{
      slug?: string;
      company_name?: string;
      title?: string;
      description?: string;
      remote?: boolean;
      url?: string;
      tags?: string[];
      job_types?: string[];
      location?: string;
      created_at?: number;
    }>;
  };

  const results: CareerOpportunity[] = [];
  for (const job of (data.data || []).slice(0, 60)) {
    const title = (job.title || '').trim();
    const company = (job.company_name || '').trim();
    const appUrl = (job.url || '').trim();
    if (!title || !company || !isValidApplicationUrl(appUrl)) continue;

    const locRaw = (job.location || (job.remote ? 'Remote' : 'Germany')).trim();
    const geo = inferCountryAndTimezone(locRaw);
    const remote = inferRemoteScope(Boolean(job.remote), locRaw);
    const employmentType = inferEmploymentType((job.job_types || []).join(' '), title);
    const experienceLevel = inferExperienceLevel('', title, employmentType);
    const summary = stripHtmlToExcerpt(job.description || title);
    const safety = scanSafetySignals(title, summary, appUrl, 'Third-party listing');
    const skills = extractSkills(job.tags || [], title, summary);
    const createdMs = job.created_at
      ? job.created_at > 1e12
        ? job.created_at
        : job.created_at * 1000
      : Date.now();

    results.push({
      id: `arb-${job.slug || encodeURIComponent(title).slice(0, 40)}`,
      kind: 'job',
      title,
      company,
      location: locRaw,
      city: geo.city,
      country: geo.country,
      timezone: geo.timezone,
      remoteEligible: remote.remoteEligible,
      remoteScope: remote.remoteScope,
      workMode: remote.workMode,
      employmentType,
      experienceLevel,
      skills,
      summary,
      postedAt: new Date(createdMs).toISOString(),
      lastVerifiedAt: verifiedAt,
      sourceName: 'Arbeitnow Public API',
      sourceUrl: 'https://www.arbeitnow.com',
      applicationUrl: appUrl,
      verificationLabel: safety.verificationLabel,
      attributionNotice: 'Sourced via Arbeitnow public job board API.',
      isSponsored: false,
      safetyFlags: safety.safetyFlags,
    });
  }
  return results;
}

// 4. Jobicy Public Remote Jobs API
async function fetchJobicy(verifiedAt: string): Promise<CareerOpportunity[]> {
  const res = await fetch('https://jobicy.com/api/v2/remote-jobs?count=35', {
    signal: AbortSignal.timeout(8000),
    headers: { 'User-Agent': USER_AGENT },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as {
    jobs?: Array<{
      id?: number;
      url?: string;
      jobTitle?: string;
      companyName?: string;
      jobIndustry?: string[];
      jobType?: string[];
      jobGeo?: string;
      jobLevel?: string;
      jobExcerpt?: string;
      pubDate?: string;
    }>;
  };

  const results: CareerOpportunity[] = [];
  for (const job of data.jobs || []) {
    const title = (job.jobTitle || '').trim();
    const company = (job.companyName || '').trim();
    const appUrl = (job.url || '').trim();
    if (!title || !company || !isValidApplicationUrl(appUrl)) continue;

    const locRaw = (job.jobGeo || 'Remote').trim();
    const geo = inferCountryAndTimezone(locRaw);
    const remote = inferRemoteScope(true, locRaw);
    const employmentType = inferEmploymentType((job.jobType || []).join(' '), title);
    const experienceLevel = inferExperienceLevel(job.jobLevel || '', title, employmentType);
    const summary = stripHtmlToExcerpt(job.jobExcerpt || `${title} at ${company}`);
    const safety = scanSafetySignals(title, summary, appUrl, 'Third-party listing');
    const skills = extractSkills(job.jobIndustry || [], title, summary);

    results.push({
      id: `jobicy-${job.id || encodeURIComponent(title).slice(0, 40)}`,
      kind: 'job',
      title,
      company,
      location: locRaw,
      city: geo.city,
      country: geo.country,
      timezone: geo.timezone,
      remoteEligible: remote.remoteEligible,
      remoteScope: remote.remoteScope,
      workMode: remote.workMode,
      employmentType,
      experienceLevel,
      skills,
      summary,
      postedAt: job.pubDate ? new Date(job.pubDate).toISOString() : verifiedAt,
      lastVerifiedAt: verifiedAt,
      sourceName: 'Jobicy',
      sourceUrl: 'https://jobicy.com',
      applicationUrl: appUrl,
      verificationLabel: safety.verificationLabel,
      attributionNotice: 'Credited to Jobicy public remote jobs feed · links directly to Jobicy listing.',
      isSponsored: false,
      safetyFlags: safety.safetyFlags,
    });
  }
  return results;
}

// 5. Official Greenhouse Job Boards (Employer Career Pages)
const GREENHOUSE_BOARDS: Array<{ slug: string; company: string; website: string }> = [
  { slug: 'wikimedia', company: 'Wikimedia Foundation', website: 'https://wikimediafoundation.org' },
  { slug: 'khanacademy', company: 'Khan Academy', website: 'https://www.khanacademy.org' },
  { slug: 'gitlab', company: 'GitLab', website: 'https://about.gitlab.com' },
  { slug: 'cloudflare', company: 'Cloudflare', website: 'https://www.cloudflare.com' },
  { slug: 'mozilla', company: 'Mozilla', website: 'https://www.mozilla.org' },
  { slug: 'canonical', company: 'Canonical', website: 'https://canonical.com' },
];

async function fetchGreenhouseBoards(verifiedAt: string): Promise<CareerOpportunity[]> {
  const perBoard = await Promise.allSettled(
    GREENHOUSE_BOARDS.map(async (board) => {
      const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board.slug}/jobs`, {
        signal: AbortSignal.timeout(7000),
        headers: { 'User-Agent': USER_AGENT },
      });
      if (!res.ok) throw new Error(`${board.company}: HTTP ${res.status}`);
      const json = (await res.json()) as {
        jobs?: Array<{
          id?: number;
          title?: string;
          absolute_url?: string;
          location?: { name?: string };
          updated_at?: string;
          first_published?: string;
          application_deadline?: string | null;
          departments?: Array<{ name?: string }>;
        }>;
      };
      // Prioritize internships, entry-level, graduate, and newest roles (up to 15 per company)
      const rawJobs = json.jobs || [];
      const sorted = [...rawJobs].sort((a, b) => {
        const aIntern = /intern|graduate|entry|junior|fellow|apprentice/i.test(a.title || '') ? 1 : 0;
        const bIntern = /intern|graduate|entry|junior|fellow|apprentice/i.test(b.title || '') ? 1 : 0;
        if (aIntern !== bIntern) return bIntern - aIntern;
        return Date.parse(b.updated_at || '') - Date.parse(a.updated_at || '');
      });

      const items: CareerOpportunity[] = [];
      for (const job of sorted.slice(0, 15)) {
        const title = (job.title || '').trim();
        const appUrl = (job.absolute_url || '').trim();
        if (!title || !isValidApplicationUrl(appUrl)) continue;
        const locRaw = (job.location?.name || 'Remote').trim();
        const geo = inferCountryAndTimezone(locRaw);
        const remote = inferRemoteScope(/\bremote\b/i.test(locRaw), locRaw);
        const dept = (job.departments || []).map((d) => d.name).filter(Boolean).join(', ');
        const employmentType = inferEmploymentType('', title);
        const experienceLevel = inferExperienceLevel('', title, employmentType);
        const summary = `${title} at ${board.company}${dept ? ` (${dept})` : ''} — ${locRaw}. Official employer career board listing.`;
        const safety = scanSafetySignals(title, summary, appUrl, 'Official source');

        items.push({
          id: `gh-${board.slug}-${job.id || encodeURIComponent(title).slice(0, 30)}`,
          kind: 'job',
          title,
          company: board.company,
          companyWebsite: board.website,
          department: dept || undefined,
          location: locRaw,
          city: geo.city,
          country: geo.country,
          timezone: geo.timezone,
          remoteEligible: remote.remoteEligible,
          remoteScope: remote.remoteScope,
          workMode: remote.workMode,
          employmentType,
          experienceLevel,
          skills: extractSkills(dept ? [dept] : [], title, summary),
          summary,
          postedAt: job.first_published || job.updated_at || verifiedAt,
          lastVerifiedAt: verifiedAt,
          applicationDeadline: job.application_deadline || undefined,
          sourceName: `${board.company} (Official Greenhouse Board)`,
          sourceUrl: `https://job-boards.greenhouse.io/${board.slug}`,
          applicationUrl: appUrl,
          verificationLabel: safety.verificationLabel,
          attributionNotice: `Official ${board.company} career portal via Greenhouse public API.`,
          isSponsored: false,
          safetyFlags: safety.safetyFlags,
        });
      }
      return items;
    })
  );

  const collected: CareerOpportunity[] = [];
  for (const r of perBoard) {
    if (r.status === 'fulfilled') collected.push(...r.value);
  }
  if (collected.length === 0) throw new Error('All Greenhouse boards failed to respond');
  return collected;
}

// 6. Official Lever Job Boards (Employer Career Pages)
const LEVER_BOARDS: Array<{ slug: string; company: string; website: string }> = [
  { slug: 'spotify', company: 'Spotify', website: 'https://www.lifeatspotify.com' },
  { slug: 'ro', company: 'Ro', website: 'https://ro.co' },
];

async function fetchLeverBoards(verifiedAt: string): Promise<CareerOpportunity[]> {
  const perBoard = await Promise.allSettled(
    LEVER_BOARDS.map(async (board) => {
      const res = await fetch(`https://api.lever.co/v0/postings/${board.slug}?mode=json`, {
        signal: AbortSignal.timeout(7000),
        headers: { 'User-Agent': USER_AGENT },
      });
      if (!res.ok) throw new Error(`${board.company}: HTTP ${res.status}`);
      const jobs = (await res.json()) as Array<{
        id?: string;
        text?: string;
        hostedUrl?: string;
        applyUrl?: string;
        country?: string;
        workplaceType?: string;
        createdAt?: number;
        descriptionPlain?: string;
        additionalPlain?: string;
        categories?: {
          commitment?: string;
          department?: string;
          location?: string;
          team?: string;
        };
      }>;

      const items: CareerOpportunity[] = [];
      for (const job of (Array.isArray(jobs) ? jobs : []).slice(0, 20)) {
        const title = (job.text || '').trim();
        const appUrl = (job.hostedUrl || job.applyUrl || '').trim();
        if (!title || !isValidApplicationUrl(appUrl)) continue;

        const locRaw = (job.categories?.location || job.country || 'Remote').trim();
        const geo = inferCountryAndTimezone(`${locRaw} ${job.country || ''}`);
        const isRemote = job.workplaceType === 'remote' || /\bremote\b/i.test(locRaw);
        const isHybrid = job.workplaceType === 'hybrid';
        const remote = isHybrid
          ? { remoteEligible: false, remoteScope: `Hybrid · ${locRaw}`, workMode: 'Hybrid' as const }
          : inferRemoteScope(isRemote, locRaw);

        const employmentType = inferEmploymentType(job.categories?.commitment || '', title);
        const experienceLevel = inferExperienceLevel('', title, employmentType);
        const summary = stripHtmlToExcerpt(job.descriptionPlain || `${title} at ${board.company}`);
        const salaryMatch = (job.additionalPlain || '').match(
          /(?:[$€£₹]\s?[\d,]+(?:\s*[-–to]+\s*[$€£₹]\s?[\d,]+)?(?:\s*(?:per\s+)?(?:year|annual|hour|month))?)/i
        );
        const salaryText = salaryMatch ? salaryMatch[0] : undefined;
        const safety = scanSafetySignals(title, summary, appUrl, 'Official source');

        items.push({
          id: `lever-${board.slug}-${job.id || encodeURIComponent(title).slice(0, 30)}`,
          kind: 'job',
          title,
          company: board.company,
          companyWebsite: board.website,
          department: job.categories?.department || job.categories?.team,
          location: locRaw,
          city: geo.city,
          country: geo.country,
          timezone: geo.timezone,
          remoteEligible: remote.remoteEligible,
          remoteScope: remote.remoteScope,
          workMode: remote.workMode,
          employmentType,
          experienceLevel,
          salaryText,
          salaryMinAnnualUsd: parseSalaryEstimateUsd(salaryText),
          isPaidInternship: employmentType === 'Internship' ? Boolean(salaryText) : undefined,
          skills: extractSkills(
            [job.categories?.department || '', job.categories?.team || ''],
            title,
            summary
          ),
          summary,
          postedAt: job.createdAt ? new Date(job.createdAt).toISOString() : verifiedAt,
          lastVerifiedAt: verifiedAt,
          sourceName: `${board.company} (Official Lever Board)`,
          sourceUrl: `https://jobs.lever.co/${board.slug}`,
          applicationUrl: appUrl,
          verificationLabel: safety.verificationLabel,
          attributionNotice: `Official ${board.company} career portal via Lever public API.`,
          isSponsored: false,
          safetyFlags: safety.safetyFlags,
          companyWebsiteFallback: undefined,
        } as CareerOpportunity);
      }
      return items;
    })
  );

  const collected: CareerOpportunity[] = [];
  for (const r of perBoard) {
    if (r.status === 'fulfilled') collected.push(...r.value);
  }
  if (collected.length === 0) throw new Error('All Lever boards failed to respond');
  return collected;
}

export async function getAllCareerJobs(
  forceRefresh = false
): Promise<CareersOpportunitiesResponse> {
  const providerRuns = await Promise.all([
    fetchWithCache(
      'himalayas',
      {
        id: 'himalayas',
        name: 'Himalayas Public Jobs API',
        kind: 'jobs',
        documentationUrl: 'https://himalayas.app/api',
        refreshIntervalMinutes: 60,
        cadenceLabel: 'Hourly sync (60m cache)',
        attributionRequired: true,
        jobPostingSchemaAllowed: false,
        note: 'Global remote and hybrid listings with optional salary & restriction metadata.',
      },
      forceRefresh,
      2 * 60 * 1000,
      fetchHimalayas
    ),
    fetchWithCache(
      'remotive',
      {
        id: 'remotive',
        name: 'Remotive Public API',
        kind: 'jobs',
        documentationUrl: 'https://remotive.com/api-documentation',
        refreshIntervalMinutes: 360,
        cadenceLabel: 'Scheduled 6h sync (max 4x/day per Remotive terms · 24h delayed feed)',
        attributionRequired: true,
        jobPostingSchemaAllowed: false,
        note: 'Strictly respects Remotive 4 requests/day limit, direct link attribution, and third-party schema exclusion.',
      },
      forceRefresh,
      360 * 60 * 1000, // Never poll Remotive more often than every 6h
      fetchRemotive
    ),
    fetchWithCache(
      'arbeitnow',
      {
        id: 'arbeitnow',
        name: 'Arbeitnow Public Job Board',
        kind: 'jobs',
        documentationUrl: 'https://www.arbeitnow.com/api/job-board-api',
        refreshIntervalMinutes: 60,
        cadenceLabel: 'Hourly sync (60m cache)',
        attributionRequired: true,
        jobPostingSchemaAllowed: false,
        note: 'Strong European, German Werkstudent/Internship, and remote technical roles.',
      },
      forceRefresh,
      2 * 60 * 1000,
      fetchArbeitnow
    ),
    fetchWithCache(
      'jobicy',
      {
        id: 'jobicy',
        name: 'Jobicy Public Remote API',
        kind: 'jobs',
        documentationUrl: 'https://jobicy.com/jobs-rss-feed',
        refreshIntervalMinutes: 360,
        cadenceLabel: 'Scheduled 6h sync',
        attributionRequired: true,
        jobPostingSchemaAllowed: false,
        note: 'Remote listings linking directly to original Jobicy posting URLs.',
      },
      forceRefresh,
      60 * 60 * 1000,
      fetchJobicy
    ),
    fetchWithCache(
      'greenhouse-official',
      {
        id: 'greenhouse-official',
        name: 'Official Employer Boards (Greenhouse)',
        kind: 'jobs',
        documentationUrl: 'https://developers.greenhouse.io/job-board.html',
        refreshIntervalMinutes: 60,
        cadenceLabel: 'Hourly sync (60m cache)',
        attributionRequired: true,
        jobPostingSchemaAllowed: false,
        note: 'Direct career portals: Wikimedia Foundation, Khan Academy, GitLab, Cloudflare, Mozilla, Canonical.',
      },
      forceRefresh,
      2 * 60 * 1000,
      fetchGreenhouseBoards
    ),
    fetchWithCache(
      'lever-official',
      {
        id: 'lever-official',
        name: 'Official Employer Boards (Lever)',
        kind: 'jobs',
        documentationUrl: 'https://github.com/lever/postings-api',
        refreshIntervalMinutes: 60,
        cadenceLabel: 'Hourly sync (60m cache)',
        attributionRequired: true,
        jobPostingSchemaAllowed: false,
        note: 'Direct career portals: Spotify, Ro (includes verified compensation notes where disclosed).',
      },
      forceRefresh,
      2 * 60 * 1000,
      fetchLeverBoards
    ),
  ]);

  const rawItems: CareerOpportunity[] = [];
  const providers: CareerProviderHealth[] = [];
  for (const run of providerRuns) {
    rawItems.push(...run.items);
    providers.push(run.health);
  }

  const audited = deduplicateAndAuditOpportunities(rawItems, rawItems.length);
  const liveCount = providers.filter((p) => p.status !== 'unavailable').length;

  return {
    items: audited.items,
    totalMatched: audited.items.length,
    providers,
    trendingSkills: audited.trendingSkills,
    metrics: audited.metrics,
    lastUpdated: new Date().toISOString(),
    status:
      liveCount === providers.length
        ? 'live'
        : liveCount > 0
        ? 'partial'
        : 'unavailable',
  };
}

export { buildWebsiteFromUrl };
