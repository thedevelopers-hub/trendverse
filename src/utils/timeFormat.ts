export interface WorldClockCity {
  city: string;
  region: string;
  timeZone: string;
}

export const WORLD_CLOCK_CITIES: WorldClockCity[] = [
  { city: 'Mumbai', region: 'IN', timeZone: 'Asia/Kolkata' },
  { city: 'London', region: 'UK', timeZone: 'Europe/London' },
  { city: 'New York', region: 'US', timeZone: 'America/New_York' },
  { city: 'Los Angeles', region: 'US', timeZone: 'America/Los_Angeles' },
  { city: 'Dubai', region: 'AE', timeZone: 'Asia/Dubai' },
  { city: 'Singapore', region: 'SG', timeZone: 'Asia/Singapore' },
  { city: 'Tokyo', region: 'JP', timeZone: 'Asia/Tokyo' },
  { city: 'Sydney', region: 'AU', timeZone: 'Australia/Sydney' },
];

export function getVisitorTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function formatLiveClock(date: Date, useUtc: boolean): {
  weekday: string;
  dateText: string;
  timeText: string;
  zoneLabel: string;
} {
  const timeZone = useUtc ? 'UTC' : getVisitorTimeZone();

  const weekday = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone,
  }).format(date);

  const dateText = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone,
  }).format(date);

  const timeText = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone,
  }).format(date);

  const zoneParts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'short',
  }).formatToParts(date);
  const shortZone = zoneParts.find((p) => p.type === 'timeZoneName')?.value || timeZone;

  return {
    weekday,
    dateText,
    timeText,
    zoneLabel: useUtc ? 'UTC' : `${timeZone} (${shortZone})`,
  };
}

export function formatCityClock(date: Date, timeZone: string): {
  time: string;
  day: string;
  tzShort: string;
} {
  const time = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
  }).format(date);

  const day = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone,
  }).format(date);

  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'short',
  }).formatToParts(date);
  const tzShort = parts.find((p) => p.type === 'timeZoneName')?.value || '';

  return { time, day, tzShort };
}

export function formatPublicationTimestamp(isoString: string, useUtc: boolean): string {
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return isoString;

  const timeZone = useUtc ? 'UTC' : getVisitorTimeZone();
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone,
    timeZoneName: 'short',
  }).format(parsed);
}

export function formatRelativeTime(isoString: string, nowMs: number = Date.now()): string {
  const target = Date.parse(isoString);
  if (Number.isNaN(target)) return '';
  const diffSec = Math.max(0, Math.floor((nowMs - target) / 1000));
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs} ${diffHrs === 1 ? 'hour' : 'hours'} ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
}

export function getArticleFreshnessLabel(isoString: string, nowMs: number = Date.now()): string {
  const target = Date.parse(isoString);
  if (Number.isNaN(target)) return 'Timestamp unverified';
  const ageMs = nowMs - target;
  if (ageMs < 0) return 'Scheduled';
  const ageHours = ageMs / (60 * 60 * 1000);
  if (ageHours < 6) return 'Fresh (<6h)';
  if (ageHours < 24) return 'Today (<24h)';
  if (ageHours < 48) return 'Recent (1–2d)';
  const ageDays = Math.floor(ageHours / 24);
  return `Older article (${ageDays}d ago)`;
}
