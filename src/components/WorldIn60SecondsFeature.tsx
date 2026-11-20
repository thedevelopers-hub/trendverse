import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  FileCheck2,
  History,
  Pause,
  Play,
  RefreshCw,
  Sparkles,
  Square,
  Volume2,
} from 'lucide-react';
import { DailyBriefingResponse } from '../../server/types';
import { AppRoute, EditorialDraft } from '../types/editorial';
import { formatPublicationTimestamp } from '../utils/timeFormat';

interface WorldIn60SecondsFeatureProps {
  mode: 'section' | 'page';
  briefing: DailyBriefingResponse | null;
  history: DailyBriefingResponse[];
  loading: boolean;
  useUtc: boolean;
  countryPref: string;
  categoryPref: string;
  countPref: number;
  onChangeCountry: (country: string) => void;
  onChangeCategory: (category: string) => void;
  onChangeCount: (count: number) => void;
  onGenerate: () => void;
  onSelectHistoryItem: (item: DailyBriefingResponse) => void;
  onClearHistory: () => void;
  onSaveDraft: (draft: EditorialDraft) => void;
  savedDraftUrls: string[];
  onNavigate: (route: AppRoute) => void;
}

const COUNTRY_PREFS = [
  'All Countries',
  'India',
  'United States',
  'United Kingdom',
  'Global',
  'Australia',
  'Japan',
  'Germany',
  'France',
  'Canada',
];

const CATEGORY_PREFS = [
  'All Categories',
  'World',
  'India',
  'Technology',
  'Artificial Intelligence',
  'Business',
  'Science',
  'Space',
  'Entertainment',
  'Climate',
];

export const WorldIn60SecondsFeature: React.FC<WorldIn60SecondsFeatureProps> = ({
  mode,
  briefing,
  history,
  loading,
  useUtc,
  countryPref,
  categoryPref,
  countPref,
  onChangeCountry,
  onChangeCategory,
  onChangeCount,
  onGenerate,
  onSelectHistoryItem,
  onClearHistory,
  onSaveDraft,
  savedDraftUrls,
  onNavigate,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState('');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [audioStatus, setAudioStatus] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [activeSpokenIndex, setActiveSpokenIndex] = useState<number | null>(null);
  const [speechSupported] = useState(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window
  );
  const [showHistory, setShowHistory] = useState(mode === 'page');

  const queueCancelledRef = useRef(false);

  useEffect(() => {
    if (!speechSupported) return;
    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      const englishOrAll = available.filter((v) => v.lang.startsWith('en'));
      const list = englishOrAll.length > 0 ? englishOrAll : available;
      setVoices(list);
      if (!selectedVoiceUri && list[0]) {
        setSelectedVoiceUri(list[0].voiceURI);
      }
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [speechSupported, selectedVoiceUri]);

  const stopAudio = () => {
    queueCancelledRef.current = true;
    if (speechSupported) {
      window.speechSynthesis.cancel();
    }
    setAudioStatus('idle');
    setActiveSpokenIndex(null);
  };

  useEffect(() => {
    return () => {
      if (speechSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [speechSupported]);

  // Reset audio if briefing changes
  useEffect(() => {
    stopAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [briefing?.id]);

  const speakSegments = useMemo(() => {
    if (!briefing || !briefing.aiAvailable || briefing.stories.length === 0) return [];
    const segments: Array<{ index: number; text: string }> = [
      {
        index: -1,
        text: `Your World in 60 Seconds for ${briefing.briefingDate}. ${briefing.overview}`,
      },
      ...briefing.stories.map((s, idx) => ({
        index: idx,
        text: `Story ${idx + 1}: ${s.headline}. ${s.summary} Why this matters: ${s.whyItMatters}`,
      })),
    ];
    return segments;
  }, [briefing]);

  const handlePlay = () => {
    if (!speechSupported || speakSegments.length === 0) return;

    if (audioStatus === 'paused') {
      window.speechSynthesis.resume();
      setAudioStatus('playing');
      return;
    }

    window.speechSynthesis.cancel();
    queueCancelledRef.current = false;
    setAudioStatus('playing');

    const chosenVoice = voices.find((v) => v.voiceURI === selectedVoiceUri) || null;

    const speakNext = (pos: number) => {
      if (queueCancelledRef.current || pos >= speakSegments.length) {
        setAudioStatus('idle');
        setActiveSpokenIndex(null);
        return;
      }

      const seg = speakSegments[pos];
      setActiveSpokenIndex(seg.index);
      const utter = new SpeechSynthesisUtterance(seg.text);
      if (chosenVoice) utter.voice = chosenVoice;
      utter.rate = playbackRate;
      utter.onend = () => {
        if (!queueCancelledRef.current) {
          speakNext(pos + 1);
        }
      };
      utter.onerror = () => {
        setAudioStatus('idle');
        setActiveSpokenIndex(null);
      };
      window.speechSynthesis.speak(utter);
    };

    speakNext(0);
  };

  const handlePause = () => {
    if (!speechSupported || audioStatus !== 'playing') return;
    window.speechSynthesis.pause();
    setAudioStatus('paused');
  };

  const visibleStories =
    mode === 'section' ? (briefing?.stories ?? []).slice(0, 6) : briefing?.stories ?? [];

  return (
    <section
      id="world-in-60-seconds"
      aria-label="Your World in 60 Seconds"
      className={mode === 'page' ? 'mx-auto max-w-[1200px] px-4 sm:px-6 py-10' : 'mx-auto max-w-[1200px] px-4 sm:px-6 py-12'}
    >
      <div className="rounded-2xl border border-slate-200 bg-[#0b1324] text-white p-6 sm:p-8">
        {/* Header Row */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between border-b border-white/10 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-2">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>Your World in 60 Seconds</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-white">
              Daily Global News Briefing &amp; Audio Digest
            </h2>
            <p className="mt-1.5 text-sm text-slate-300 max-w-2xl">
              5 to 10 verified developments synthesized strictly from live RSS feeds with source
              links, actual publication timestamps, and browser text-to-speech playback.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowHistory((s) => !s)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-slate-200 hover:bg-white/10 cursor-pointer"
            >
              <History className="h-4 w-4" aria-hidden="true" />
              <span>History ({history.length})</span>
            </button>

            {mode === 'section' && (
              <button
                type="button"
                onClick={() => onNavigate({ view: 'briefing' })}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-slate-200 hover:bg-white/10 cursor-pointer"
              >
                <span>Dedicated Page</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              onClick={onGenerate}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
              <span>{loading ? 'Synthesizing...' : 'Generate 60s Briefing'}</span>
            </button>
          </div>
        </div>

        {/* Country, Category & Story Count Preferences */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 mb-6 rounded-xl border border-white/10 bg-[#13203b]/60 p-4">
          <label className="text-xs text-slate-300">
            <span className="block text-[11px] text-slate-400 mb-1">Country / Region Focus</span>
            <select
              value={countryPref}
              onChange={(e) => onChangeCountry(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-[#0b1324] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              {COUNTRY_PREFS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-slate-300">
            <span className="block text-[11px] text-slate-400 mb-1">Category Focus</span>
            <select
              value={categoryPref}
              onChange={(e) => onChangeCategory(e.target.value)}
              className="w-full rounded-lg border border-white/15 bg-[#0b1324] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              {CATEGORY_PREFS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="text-xs text-slate-300">
            <span className="block text-[11px] text-slate-400 mb-1">Briefing Length</span>
            <select
              value={countPref}
              onChange={(e) => onChangeCount(Number(e.target.value))}
              className="w-full rounded-lg border border-white/15 bg-[#0b1324] px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
            >
              <option value={5}>5 Key Developments</option>
              <option value={7}>7 Key Developments</option>
              <option value={10}>10 Key Developments</option>
            </select>
          </label>
        </div>

        {/* Daily Briefing History Panel */}
        {showHistory && (
          <div className="mb-6 rounded-xl border border-white/10 bg-[#060b16] p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Daily Briefing History (Saved Locally)
              </h3>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Clear History
                </button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-xs text-slate-400">
                No past briefings stored yet. Generated briefings are saved here automatically.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectHistoryItem(item)}
                    className={`rounded-lg border px-3 py-2 text-left text-xs transition-colors cursor-pointer ${
                      briefing?.id === item.id
                        ? 'border-blue-500 bg-blue-600/20 text-white'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-semibold">
                      {item.briefingDate} · {item.stories.length} stories
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {item.countryPreference} / {item.categoryPreference}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-4">
            <div className="h-16 rounded-xl bg-white/5 animate-pulse" />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-44 rounded-xl bg-white/5 animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {/* Empty / Prompt State */}
        {!briefing && !loading && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300">
            Select your country or category preferences above and click{' '}
            <strong>Generate 60s Briefing</strong> to build today&apos;s verified global digest with
            browser audio playback.
          </div>
        )}

        {/* Error / Unavailable AI State */}
        {briefing && !loading && (!briefing.aiAvailable || briefing.errorMessage) && (
          <div role="alert" className="rounded-xl border border-amber-400/30 bg-amber-950/30 p-5 text-sm text-amber-100">
            <p className="font-semibold">60-Second Briefing Unavailable</p>
            <p className="mt-1 text-xs text-amber-200/90">
              {briefing.errorMessage ||
                'Unable to generate AI summary right now. Verified raw headlines remain available in the Live News Center.'}
            </p>
          </div>
        )}

        {/* Active Briefing + Audio Player */}
        {briefing && !loading && briefing.aiAvailable && briefing.stories.length > 0 && (
          <div className="space-y-6">
            {/* Metadata & AI Label */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-400/25 bg-blue-950/40 px-4 py-3 text-xs text-slate-200">
              <span className="font-semibold text-blue-300">{briefing.label}</span>
              <span className="text-slate-300">
                Date: {briefing.briefingDate} · Generated:{' '}
                {formatPublicationTimestamp(briefing.generatedAt, useUtc)}
              </span>
            </div>

            {briefing.note && (
              <p className="text-xs text-slate-400">{briefing.note}</p>
            )}

            {/* Browser Text-to-Speech Audio Controls */}
            <div className="rounded-xl border border-white/15 bg-[#13203b] p-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2.5">
                <Volume2 className="h-4 w-4 text-blue-400 shrink-0" aria-hidden="true" />
                <span className="text-xs font-semibold text-white mr-1">Audio Briefing:</span>

                {!speechSupported ? (
                  <span className="text-xs text-slate-400">
                    Text-to-speech is not supported by this browser environment.
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handlePlay}
                      disabled={audioStatus === 'playing'}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
                    >
                      <Play className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>{audioStatus === 'paused' ? 'Resume' : 'Play'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handlePause}
                      disabled={audioStatus !== 'playing'}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/10 disabled:opacity-40 cursor-pointer"
                    >
                      <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>Pause</span>
                    </button>

                    <button
                      type="button"
                      onClick={stopAudio}
                      disabled={audioStatus === 'idle'}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10 disabled:opacity-40 cursor-pointer"
                    >
                      <Square className="h-3 w-3" aria-hidden="true" />
                      <span>Stop</span>
                    </button>
                  </>
                )}
              </div>

              {speechSupported && (
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 text-slate-300">
                    <span>Voice:</span>
                    <select
                      aria-label="Select text-to-speech voice"
                      value={selectedVoiceUri}
                      onChange={(e) => setSelectedVoiceUri(e.target.value)}
                      className="max-w-[180px] rounded border border-white/15 bg-[#0b1324] px-2 py-1 text-xs text-white focus:outline-none"
                    >
                      {voices.length === 0 ? (
                        <option value="">Default System Voice</option>
                      ) : (
                        voices.map((v) => (
                          <option key={v.voiceURI} value={v.voiceURI}>
                            {v.name} ({v.lang})
                          </option>
                        ))
                      )}
                    </select>
                  </label>

                  <label className="flex items-center gap-1.5 text-slate-300">
                    <span>Speed:</span>
                    <select
                      aria-label="Select audio playback speed"
                      value={playbackRate}
                      onChange={(e) => setPlaybackRate(Number(e.target.value))}
                      className="rounded border border-white/15 bg-[#0b1324] px-2 py-1 text-xs text-white focus:outline-none"
                    >
                      <option value={0.85}>0.85x</option>
                      <option value={1}>1.0x</option>
                      <option value={1.25}>1.25x</option>
                      <option value={1.5}>1.5x</option>
                    </select>
                  </label>
                </div>
              )}
            </div>

            {/* Spoken / Reading Overview */}
            <div
              className={`rounded-xl border p-4 transition-colors ${
                activeSpokenIndex === -1
                  ? 'border-blue-400 bg-blue-950/50'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <p className="text-base leading-relaxed text-slate-100">{briefing.overview}</p>
            </div>

            {/* 5-10 Story Cards */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {visibleStories.map((story, idx) => {
                const alreadySaved = savedDraftUrls.includes(story.sourceUrl);
                const isSpeakingThis = activeSpokenIndex === idx;
                return (
                  <article
                    key={story.sourceUrl + idx}
                    className={`flex flex-col justify-between rounded-xl border p-5 transition-colors ${
                      isSpeakingThis
                        ? 'border-blue-400 bg-blue-950/40'
                        : 'border-white/10 bg-[#13203b]/80'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                        <span>
                          <span className="font-mono-tabular font-semibold text-blue-400">
                            0{idx + 1}
                          </span>{' '}
                          · {story.category} · {story.countryTag}
                        </span>
                        <time dateTime={story.publishedAt}>
                          {formatPublicationTimestamp(story.publishedAt, useUtc)}
                        </time>
                      </div>

                      <h3 className="font-display text-lg font-semibold text-white leading-snug">
                        {story.headline}
                      </h3>

                      <p className="text-xs leading-relaxed text-slate-200">{story.summary}</p>

                      <p className="text-xs leading-relaxed text-slate-300">
                        <strong className="text-white">Why this matters:</strong>{' '}
                        {story.whyItMatters}
                      </p>

                      <p className="text-[11px] leading-relaxed text-slate-400">
                        <strong className="text-slate-300">What happens next:</strong>{' '}
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
                        <span>{story.sourceName}</span>
                        <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>

                      <button
                        type="button"
                        disabled={alreadySaved}
                        onClick={() =>
                          onSaveDraft({
                            id: `draft-${Date.now()}-${idx}`,
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
                  </article>
                );
              })}
            </div>

            {mode === 'section' && briefing.stories.length > 6 && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => onNavigate({ view: 'briefing' })}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 cursor-pointer"
                >
                  <span>View all {briefing.stories.length} stories on the 60-Second Briefing page</span>
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
