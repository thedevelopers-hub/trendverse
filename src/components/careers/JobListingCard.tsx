import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowUpRight,
  Bookmark,
  Briefcase,
  CheckCircle2,
  Clock,
  Flag,
  Globe,
  MapPin,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { CareerOpportunity } from '../../../server/types';
import { formatRelativeTime } from '../../utils/timeFormat';

interface JobListingCardProps {
  job: CareerOpportunity;
  visitorTimezone: string;
  isSaved: boolean;
  isReported?: boolean;
  onToggleSave: (job: CareerOpportunity) => void;
  onViewOpportunity: (job: CareerOpportunity) => void;
  onAddToTracker?: (job: CareerOpportunity) => void;
  onReportListing: (job: CareerOpportunity, reason: string) => void;
}

function formatInTimezone(iso: string, timeZone: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat('en-GB', {
      timeZone,
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(d);
  } catch {
    return iso.slice(0, 16);
  }
}

export const JobListingCard: React.FC<JobListingCardProps> = ({
  job,
  visitorTimezone,
  isSaved,
  isReported = false,
  onToggleSave,
  onViewOpportunity,
  onAddToTracker,
  onReportListing,
}) => {
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Broken application link');

  const isSuspicious = job.verificationLabel === 'Potentially suspicious' || job.safetyFlags.length > 0;
  const isOfficial = job.verificationLabel === 'Official source';

  const verificationStyle = isSuspicious
    ? 'border-red-300 bg-red-50 text-red-800'
    : isOfficial
    ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
    : job.verificationLabel === 'Verified source link'
    ? 'border-blue-300 bg-blue-50 text-blue-800'
    : 'border-slate-300 bg-slate-50 text-slate-700';

  const handleConfirmReport = (e: React.FormEvent) => {
    e.preventDefault();
    onReportListing(job, reportReason);
    setReportOpen(false);
  };

  return (
    <article
      className={`rounded-xl border bg-white p-5 transition-colors ${
        isSuspicious ? 'border-red-300 bg-red-50/20' : 'border-slate-200 hover:border-blue-300'
      }`}
    >
      {/* Top Meta Strip: Verification Label + Employment Type + Work Mode */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-semibold ${verificationStyle}`}
          >
            {isSuspicious ? (
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
            ) : isOfficial ? (
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{job.verificationLabel}</span>
          </span>

          <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-medium text-slate-800">
            {job.employmentType}
          </span>

          <span className="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-medium text-blue-800">
            {job.workMode}
          </span>

          <span className="rounded border border-slate-200 px-2 py-0.5 text-slate-600">
            {job.experienceLevel}
          </span>

          {job.isSponsored && (
            <span className="rounded border border-amber-300 bg-amber-50 px-2 py-0.5 font-semibold text-amber-800">
              Sponsored
            </span>
          )}
        </div>

        <span className="font-mono-tabular text-xs text-slate-500">
          Posted {formatRelativeTime(job.postedAt)} ({formatInTimezone(job.postedAt, visitorTimezone)})
        </span>
      </div>

      {/* Main Title & Company */}
      <div className="mt-3.5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold leading-snug text-slate-900">
            {job.title}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-700">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
              <Briefcase className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
              <span>{job.company}</span>
            </span>
            {job.companyWebsite && (
              <a
                href={job.companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
              >
                <span>Company site</span>
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              </a>
            )}
            {job.department && (
              <span className="text-xs text-slate-500">Dept: {job.department}</span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleSave(job)}
            aria-pressed={isSaved}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              isSaved
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-slate-300 bg-white text-slate-700 hover:border-blue-400'
            }`}
          >
            <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </button>

          {onAddToTracker && (
            <button
              type="button"
              onClick={() => onAddToTracker(job)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-blue-400 hover:text-blue-700 cursor-pointer"
            >
              <span>+ Track</span>
            </button>
          )}
        </div>
      </div>

      {/* Location, Country, Remote Eligibility & Salary Row */}
      <dl className="mt-3.5 grid grid-cols-1 gap-2 rounded-lg bg-slate-50 p-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-start gap-1.5">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
          <div>
            <dt className="text-slate-500">Location &amp; Country</dt>
            <dd className="font-medium text-slate-900">
              {job.city} · {job.country} ({job.timezone})
            </dd>
          </div>
        </div>

        <div className="flex items-start gap-1.5">
          <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
          <div>
            <dt className="text-slate-500">Remote Eligibility</dt>
            <dd className="font-medium text-slate-900">{job.remoteScope}</dd>
          </div>
        </div>

        <div className="flex items-start gap-1.5">
          <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
          <div>
            <dt className="text-slate-500">Salary / Stipend</dt>
            <dd className="font-medium text-slate-900">
              {job.salaryText ? job.salaryText : 'Not disclosed by employer'}
            </dd>
          </div>
        </div>

        <div className="flex items-start gap-1.5">
          <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
          <div>
            <dt className="text-slate-500">Deadline / Verified</dt>
            <dd className="font-medium text-slate-900">
              {job.applicationDeadline
                ? `Closes ${formatInTimezone(job.applicationDeadline, visitorTimezone)}`
                : `Verified ${formatRelativeTime(job.lastVerifiedAt)}`}
            </dd>
          </div>
        </div>
      </dl>

      {/* Excerpt */}
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{job.summary}</p>

      {/* Safety Warnings when flagged */}
      {job.safetyFlags.length > 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-900">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
          <div>
            <p className="font-semibold">Student Safety Warning:</p>
            <p className="mt-0.5">
              Automated screening detected potential risk signals: {job.safetyFlags.join('; ')}. Never pay
              registration/training fees or share Aadhaar, passport, or bank OTP details.
            </p>
          </div>
        </div>
      )}

      {/* Skills Strip */}
      {job.skills.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {job.skills.map((skill) => (
            <span
              key={skill}
              className="rounded border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Footer: Attribution, Verified Timestamp, Report & Apply Link */}
      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-slate-500 space-y-0.5">
          <p>
            Source:{' '}
            <a
              href={job.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-slate-700 underline hover:text-blue-700"
            >
              {job.sourceName}
            </a>{' '}
            · Last verified {formatInTimezone(job.lastVerifiedAt, visitorTimezone)}
          </p>
          {job.attributionNotice && <p className="text-[11px] text-slate-400">{job.attributionNotice}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setReportOpen((prev) => !prev)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-600 hover:border-amber-400 hover:text-amber-800 cursor-pointer"
          >
            <Flag className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isReported ? 'Reported' : 'Report'}</span>
          </button>

          <a
            href={job.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onViewOpportunity(job)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b1324] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-600 transition-colors"
          >
            <span>Apply on Original Source</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>

      {/* Inline Report Listing Form */}
      {reportOpen && (
        <form
          onSubmit={handleConfirmReport}
          className="mt-3 flex flex-col gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs sm:flex-row sm:items-center"
        >
          <label htmlFor={`report-${job.id}`} className="font-semibold text-amber-950">
            Report issue:
          </label>
          <select
            id={`report-${job.id}`}
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
            className="rounded border border-amber-300 bg-white px-2.5 py-1.5 text-xs text-slate-900"
          >
            <option value="Broken application link">Broken application link</option>
            <option value="Expired or closed position">Expired or closed position</option>
            <option value="Registration or training fee requested">Registration or training fee requested</option>
            <option value="Suspicious domain or scam">Suspicious domain or scam</option>
            <option value="Duplicate listing">Duplicate listing</option>
          </select>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="rounded bg-amber-800 px-3 py-1.5 font-semibold text-white hover:bg-amber-900 cursor-pointer"
            >
              Submit Report
            </button>
            <button
              type="button"
              onClick={() => setReportOpen(false)}
              className="rounded border border-amber-300 px-2.5 py-1.5 text-amber-900 hover:bg-amber-100 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </article>
  );
};
