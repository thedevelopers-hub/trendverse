import {
  CareerEmploymentType,
  CareerExperienceLevel,
  CareerFreshnessMetrics,
  CareerOpportunity,
  CareerVerificationLabel,
  CareerWorkMode,
} from '../../types.js';

const SCAM_PHRASES: Array<{ regex: RegExp; reason: string }> = [
  { regex: /registration\s+fee|application\s+fee|processing\s+fee/i, reason: 'Mentions registration or application fee' },
  { regex: /training\s+fee|pay\s+for\s+training|paid\s+training\s+bond/i, reason: 'Mentions training fee requirement' },
  { regex: /security\s+deposit|refundable\s+deposit/i, reason: 'Mentions security deposit' },
  { regex: /aadhaar|aadhar|passport\s+number|bank\s+account\s+details|upi\s+pin|cvv|send\s+otp/i, reason: 'Requests sensitive personal or banking documents' },
  { regex: /whatsapp\s+only|telegram\s+only|dm\s+on\s+telegram|message\s+on\s+whatsapp/i, reason: 'Uses unverified messaging-only application channel' },
  { regex: /guaranteed\s+income|easy\s+money|\$\s*500\s*\/?\s*hour\s+no\s+experience/i, reason: 'Unrealistic guaranteed earnings claim' },
];

const SUSPICIOUS_DOMAINS = ['t.me', 'wa.me', 'chat.whatsapp.com', 'bit.ly', 'tinyurl.com', 'forms.gle'];

const SKILL_VOCAB = [
  'Python', 'TypeScript', 'JavaScript', 'React', 'Node.js', 'SQL', 'PostgreSQL', 'Java', 'Go',
  'Rust', 'C++', 'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'Terraform',
  'Machine Learning', 'AI', 'LLM', 'Data Science', 'Analytics', 'Excel', 'Figma',
  'UI/UX', 'Product Management', 'SEO', 'Content Writing', 'Marketing', 'Sales',
  'Cybersecurity', 'Linux', 'Git', 'GraphQL', 'Next.js', 'Flutter', 'Swift', 'Kotlin',
  'Research', 'Finance', 'Accounting', 'Supply Chain', 'Operations', 'Customer Success',
];

const COUNTRY_TZ_MAP: Array<{ match: RegExp; country: string; timezone: string }> = [
  { match: /\b(india|bengaluru|bangalore|mumbai|delhi|hyderabad|pune|chennai|noida|gurgaon)\b/i, country: 'India', timezone: 'Asia/Kolkata' },
  { match: /\b(usa|united states|u\.s\.|new york|san francisco|seattle|austin|boston|chicago|california|texas|remotive us|us only)\b/i, country: 'USA', timezone: 'America/New_York' },
  { match: /\b(uk|united kingdom|london|manchester|edinburgh|britain|england)\b/i, country: 'UK', timezone: 'Europe/London' },
  { match: /\b(canada|toronto|vancouver|montreal|ottawa)\b/i, country: 'Canada', timezone: 'America/Toronto' },
  { match: /\b(australia|sydney|melbourne|brisbane|perth)\b/i, country: 'Australia', timezone: 'Australia/Sydney' },
  { match: /\b(germany|deutschland|berlin|munich|münchen|hamburg|frankfurt|köln|cologne)\b/i, country: 'Germany', timezone: 'Europe/Berlin' },
  { match: /\b(france|paris|lyon|marseille)\b/i, country: 'France', timezone: 'Europe/Paris' },
  { match: /\b(singapore)\b/i, country: 'Singapore', timezone: 'Asia/Singapore' },
  { match: /\b(uae|united arab emirates|dubai|abu dhabi)\b/i, country: 'UAE', timezone: 'Asia/Dubai' },
  { match: /\b(japan|tokyo|osaka|kyoto)\b/i, country: 'Japan', timezone: 'Asia/Tokyo' },
];

export function stripHtmlToExcerpt(html: string, maxLen = 220): string {
  const clean = html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
  if (clean.length <= maxLen) return clean;
  return `${clean.slice(0, maxLen - 1).trim()}…`;
}

export function isValidApplicationUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function scanSafetySignals(
  title: string,
  summary: string,
  applicationUrl: string,
  defaultLabel: CareerVerificationLabel
): { verificationLabel: CareerVerificationLabel; safetyFlags: string[] } {
  const flags: string[] = [];
  const combined = `${title} ${summary}`;

  for (const rule of SCAM_PHRASES) {
    if (rule.regex.test(combined)) {
      flags.push(rule.reason);
    }
  }

  try {
    const host = new URL(applicationUrl).hostname.toLowerCase();
    if (SUSPICIOUS_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`))) {
      flags.push(`Unverified redirect or messaging host (${host})`);
    }
  } catch {
    flags.push('Invalid application URL');
  }

  if (flags.length > 0) {
    return { verificationLabel: 'Potentially suspicious', safetyFlags: flags };
  }
  return { verificationLabel: defaultLabel, safetyFlags: [] };
}

export function inferCountryAndTimezone(locationRaw: string): {
  country: string;
  city: string;
  timezone: string;
} {
  const loc = (locationRaw || '').trim();
  if (!loc) {
    return { country: 'Other countries', city: 'Unspecified', timezone: 'UTC' };
  }

  if (/^(worldwide|anywhere|global|remote\s*\(global\)|anywhere in the world)$/i.test(loc)) {
    return { country: 'Worldwide', city: 'Worldwide Remote', timezone: 'UTC' };
  }

  for (const entry of COUNTRY_TZ_MAP) {
    if (entry.match.test(loc)) {
      const cityCandidate = loc.split(',')[0].trim();
      return {
        country: entry.country,
        city: cityCandidate && cityCandidate.length <= 42 ? cityCandidate : entry.country,
        timezone: entry.timezone,
      };
    }
  }

  if (/remote/i.test(loc) && !/\b(europe|emea|americas|apac|latam)\b/i.test(loc)) {
    return { country: 'Other countries', city: loc, timezone: 'UTC' };
  }

  return {
    country: 'Other countries',
    city: loc.split(',')[0].trim().slice(0, 42) || loc,
    timezone: 'UTC',
  };
}

export function inferRemoteScope(
  isRemote: boolean,
  locationRaw: string,
  locationRestrictions?: string[]
): { remoteEligible: boolean; remoteScope: string; workMode: CareerWorkMode } {
  const loc = (locationRaw || '').trim();
  const restrictions = (locationRestrictions || []).filter(Boolean);

  if (restrictions.length > 0) {
    const joined = restrictions.slice(0, 3).join(', ') + (restrictions.length > 3 ? ` +${restrictions.length - 3}` : '');
    return {
      remoteEligible: true,
      remoteScope: `Remote (${joined})`,
      workMode: 'Remote',
    };
  }

  if (/hybrid/i.test(loc)) {
    return {
      remoteEligible: false,
      remoteScope: `Hybrid · ${loc}`,
      workMode: 'Hybrid',
    };
  }

  if (/work from home|wfh/i.test(loc)) {
    return {
      remoteEligible: true,
      remoteScope: loc,
      workMode: 'Work From Home',
    };
  }

  if (isRemote || /\bremote\b/i.test(loc)) {
    if (/worldwide|anywhere|global/i.test(loc)) {
      return { remoteEligible: true, remoteScope: 'Worldwide Remote', workMode: 'Remote' };
    }
    if (!loc || /^remote$/i.test(loc)) {
      return {
        remoteEligible: true,
        remoteScope: 'Remote (Verify country eligibility on employer page)',
        workMode: 'Remote',
      };
    }
    return {
      remoteEligible: true,
      remoteScope: `Remote (${loc})`,
      workMode: 'Remote',
    };
  }

  return {
    remoteEligible: false,
    remoteScope: loc ? `On-site (${loc})` : 'On-site',
    workMode: 'On-site',
  };
}

export function inferEmploymentType(rawType: string, title: string): CareerEmploymentType {
  const text = `${rawType} ${title}`.toLowerCase();
  if (/\b(intern|internship|werkstudent|working student|co-op|summer analyst)\b/.test(text)) {
    return 'Internship';
  }
  if (/\b(apprentice|apprenticeship|ausbildung|traineeship)\b/.test(text)) {
    return 'Apprenticeship';
  }
  if (/\b(graduate program|graduate programme|grad scheme|new grad|campus)\b/.test(text)) {
    return 'Graduate programme';
  }
  if (/\b(freelance|independent contractor)\b/.test(text)) {
    return 'Freelance';
  }
  if (/\b(contract|contractor|fixed term|fixed-term)\b/.test(text)) {
    return 'Contract';
  }
  if (/\b(part-time|part time)\b/.test(text)) {
    return 'Part-time';
  }
  if (/\b(temporary|seasonal|temp)\b/.test(text)) {
    return 'Temporary';
  }
  return 'Full-time';
}

export function inferExperienceLevel(
  rawSeniority: string,
  title: string,
  employmentType: CareerEmploymentType
): CareerExperienceLevel {
  const text = `${rawSeniority} ${title}`.toLowerCase();
  if (employmentType === 'Internship' || /\b(student|werkstudent|intern)\b/.test(text)) {
    return 'Student';
  }
  if (/\b(no experience|no prior experience|fresher|freshers)\b/.test(text)) {
    return /\bfresher\b/.test(text) ? 'Fresher' : 'No experience';
  }
  if (
    employmentType === 'Apprenticeship' ||
    employmentType === 'Graduate programme' ||
    /\b(entry|junior|jr\.?|associate|graduate|new grad|trainee|level 1|i\b)\b/.test(text)
  ) {
    return 'Entry-level';
  }
  if (/\b(1[-–]3\s*years?|2\s*years?|mid[- ]?level|mid)\b/.test(text)) {
    return '1–3 years';
  }
  if (/\b(senior|sr\.?|staff|principal|lead|manager|director|vp|head of|architect)\b/.test(text)) {
    return 'Experienced';
  }
  return '1–3 years';
}

export function extractSkills(tags: string[], title: string, summary: string): string[] {
  const found = new Set<string>();
  for (const tag of tags) {
    const clean = tag.trim();
    if (clean && clean.length >= 2 && clean.length <= 28) {
      found.add(clean);
    }
    if (found.size >= 6) break;
  }

  const text = `${title} ${summary}`;
  for (const vocab of SKILL_VOCAB) {
    if (found.size >= 7) break;
    const escaped = vocab.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp(`\\b${escaped}\\b`, 'i').test(text)) {
      found.add(vocab);
    }
  }
  return Array.from(found).slice(0, 7);
}

export function deduplicateAndAuditOpportunities(
  rawItems: CareerOpportunity[],
  totalRawFetched: number
): {
  items: CareerOpportunity[];
  metrics: CareerFreshnessMetrics;
  trendingSkills: Array<{ skill: string; count: number }>;
} {
  const now = Date.now();
  const seenKeys = new Set<string>();
  const cleanItems: CareerOpportunity[] = [];

  let duplicatesRemoved = 0;
  let expiredFiltered = 0;
  let brokenLinksFiltered = 0;
  let suspiciousFlagged = 0;
  let missingSalaryCount = 0;

  for (const item of rawItems) {
    if (!isValidApplicationUrl(item.applicationUrl)) {
      brokenLinksFiltered++;
      continue;
    }

    if (item.applicationDeadline) {
      const deadlineMs = Date.parse(item.applicationDeadline);
      if (!Number.isNaN(deadlineMs) && deadlineMs < now - 24 * 60 * 60 * 1000) {
        expiredFiltered++;
        continue;
      }
    }

    const dedupeKey = `${item.title.toLowerCase().replace(/[^a-z0-9]/g, '')}::${item.company
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')}`;
    if (seenKeys.has(dedupeKey)) {
      duplicatesRemoved++;
      continue;
    }
    seenKeys.add(dedupeKey);

    if (item.verificationLabel === 'Potentially suspicious') {
      suspiciousFlagged++;
    }
    if (!item.salaryText) {
      missingSalaryCount++;
    }

    cleanItems.push(item);
  }

  cleanItems.sort((a, b) => Date.parse(b.postedAt) - Date.parse(a.postedAt));

  const skillFreq = new Map<string, number>();
  for (const item of cleanItems) {
    for (const s of item.skills) {
      const key = s.trim();
      if (key) {
        skillFreq.set(key, (skillFreq.get(key) || 0) + 1);
      }
    }
  }

  const trendingSkills = Array.from(skillFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14)
    .map(([skill, count]) => ({ skill, count }));

  return {
    items: cleanItems,
    metrics: {
      totalRawFetched,
      duplicatesRemoved,
      expiredFiltered,
      brokenLinksFiltered,
      suspiciousFlagged,
      missingSalaryCount,
    },
    trendingSkills,
  };
}
