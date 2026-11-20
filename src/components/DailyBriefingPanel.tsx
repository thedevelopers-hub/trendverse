import React from 'react';
import { ArrowUpRight, FileCheck2, RefreshCw, Sparkles } from 'lucide-react';
import { DailyBriefingResponse } from '../../server/types';
import { EditorialDraft } from '../types/editorial';
import { formatPublicationTimestamp } from '../utils/timeFormat';

interface DailyBriefingPanelProps {
  briefing: DailyBriefingResponse | null;
  loading: boolean;
  useUtc: boolean;
  onGenerate: () => void;
  onSaveDraft: (draft: EditorialDraft) => void;
  savedDraftUrls: string[];
}

export const DailyBriefingPanel: React.FC<DailyBriefingPanelProps> = ({
  briefing,
  loading,
  useUtc,
  onGenerate,
  onSaveDraft,
  savedDraftUrls,
}) => {
  return (
    <section
      id="ai-daily-briefing"
      aria-label="AI Daily Global Briefing"
      className="mx-auto max-w-[1200px] px-4 sm:px-6 py-12"
    >
      <div className="rounded-2xl border border-slate-200 bg-[#0b1324] text-white p-6 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between border-b border-white/10 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>AI Daily Global Briefing</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white">
              Source-Grounded Executive Digest
            </h2>
            <p className="mt-1.5 text-sm text-slate-300 max-w-2xl">
              Synthesizes currently fetched, deduplicated RSS stories using server-side Gemini. All
              summaries are explicitly labeled as AI-generated and require human editor sign-off
              before Blogger publication.
            </p>
          </div>

          <button
            type="button"
            onClick={onGenerate}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>{loading ? 'Generating Briefing...' : 'Generate Daily Briefing'}</span>
          </button>
        </div>

        {!briefing && !loading && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
            Click <strong>Generate Daily Briefing</strong> to summarize the latest verified RSS
            headlines with source attribution, context, and human-review draft export.
          </div>
        )}

        {loading && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
            Analyzing deduplicated stories from live newsroom feeds via Gemini...
          </div>
        )}

        {briefing && !loading && (!briefing.aiAvailable || briefing.errorMessage) && (
          <div className="rounded-xl border border-amber-400/30 bg-amber-950/30 p-5 text-sm text-amber-100">
            <p className="font-semibold">AI Briefing Unavailable</p>
            <p className="mt-1 text-xs text-amber-200/90">
              {briefing.errorMessage ||
                'Unable to generate AI summary at this moment. Verified headlines remain accessible in the Live News Center.'}
            </p>
          </div>
        )}

        {briefing && !loading && briefing.aiAvailable && briefing.stories.length > 0 && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-400/25 bg-blue-950/40 px-4 py-3 text-xs text-slate-200">
              <span className="font-semibold text-blue-300">{briefing.label}</span>
              <span className="text-slate-300">
                Date: {briefing.briefingDate} · Generated:{' '}
                {formatPublicationTimestamp(briefing.generatedAt, useUtc)}
              </span>
            </div>

            <p className="text-base leading-relaxed text-slate-200">{briefing.overview}</p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {briefing.stories.map((story) => {
                const alreadySaved = savedDraftUrls.includes(story.sourceUrl);
                return (
                  <div
                    key={story.sourceUrl + story.headline}
                    className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#13203b]/80 p-5"
                  >
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="font-semibold text-blue-400">{story.category}</span>
                        <span aria-hidden="true">·</span>
                        <span>{story.sourceName}</span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={story.publishedAt}>
                          {formatPublicationTimestamp(story.publishedAt, useUtc)}
                        </time>
                      </div>

                      <h3 className="font-display text-lg font-semibold text-white leading-snug">
                        {story.headline}
                      </h3>

                      <p className="text-xs leading-relaxed text-slate-300">
                        <strong className="text-white">AI Summary:</strong> {story.summary}
                      </p>

                      <p className="text-xs leading-relaxed text-slate-300">
                        <strong className="text-white">Why it matters:</strong> {story.whyItMatters}
                      </p>

                      <p className="text-xs leading-relaxed text-slate-400">
                        <strong className="text-slate-200">What happens next:</strong>{' '}
                        {story.whatHappensNext}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <a
                        href={story.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-blue-400 hover:underline"
                      >
                        <span>Original Reporting</span>
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>

                      <button
                        type="button"
                        disabled={alreadySaved}
                        onClick={() =>
                          onSaveDraft({
                            id: `draft-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                            headline: story.headline,
                            category: story.category,
                            summary: story.summary,
                            whyItMatters: story.whyItMatters,
                            sourceName: story.sourceName,
                            sourceUrl: story.sourceUrl,
                            createdAt: new Date().toISOString(),
                            status: 'pending-human-review',
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-md border border-white/20 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-white/10 disabled:opacity-50 cursor-pointer"
                      >
                        <FileCheck2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>{alreadySaved ? 'In Editorial Drafts' : 'Queue for Human Review'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
