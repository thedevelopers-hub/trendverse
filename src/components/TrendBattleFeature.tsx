import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Check, Scale, Share2 } from 'lucide-react';
import {
  TrendBattleRange,
  TrendBattleResponse,
  TrendGeoCode,
} from '../../server/types';
import { AppRoute } from '../types/editorial';
import { fetchTrendBattle } from '../services/newsroomApi';
import { formatPublicationTimestamp } from '../utils/timeFormat';

interface TrendBattleFeatureProps {
  mode: 'section' | 'page';
  useUtc: boolean;
  onNavigate: (route: AppRoute) => void;
}

const BATTLE_PRESETS: Array<{ label: string; a: string; b: string }> = [
  { label: 'ChatGPT vs Gemini', a: 'ChatGPT', b: 'Google Gemini' },
  { label: 'iPhone vs Samsung', a: 'iPhone', b: 'Samsung' },
  { label: 'AI vs Robotics', a: 'Artificial intelligence', b: 'Robotics' },
  { label: 'Netflix vs Amazon Prime', a: 'Netflix', b: 'Amazon Prime' },
];

const GEO_CHOICES: Array<{ code: TrendGeoCode; label: string }> = [
  { code: 'WORLD', label: 'Worldwide' },
  { code: 'IN', label: 'India' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'CA', label: 'Canada' },
  { code: 'AU', label: 'Australia' },
  { code: 'JP', label: 'Japan' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'BR', label: 'Brazil' },
];

export const TrendBattleFeature: React.FC<TrendBattleFeatureProps> = ({
  mode,
  useUtc,
  onNavigate,
}) => {
  const [topicA, setTopicA] = useState('ChatGPT');
  const [topicB, setTopicB] = useState('Google Gemini');
  const [geo, setGeo] = useState<TrendGeoCode>('WORLD');
  const [range, setRange] = useState<TrendBattleRange>('30d');

  const [result, setResult] = useState<TrendBattleResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  const runComparison = async (
    a: string,
    b: string,
    g: TrendGeoCode,
    r: TrendBattleRange
  ) => {
    if (!a.trim() || !b.trim()) {
      setError('Enter both Topic A and Topic B to compare.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTrendBattle(a, b, g, r);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch comparison data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void runComparison(topicA, topicB, geo, range);
    // Run initial comparison once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void runComparison(topicA, topicB, geo, range);
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/#trend-battle`;
    const summaryText = result
      ? `TRENDVERSE Trend Battle (${result.geoName}, ${result.range}): ${result.topicA.inputTopic} (Avg ${result.topicA.averageScore}/100) vs ${result.topicB.inputTopic} (Avg ${result.topicB.averageScore}/100) — ${shareUrl}`
      : shareUrl;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopiedShare(true);
      window.setTimeout(() => setCopiedShare(false), 2000);
    } catch {
      setCopiedShare(false);
    }
  };

  // Interactive SVG Line Chart geometry
  const width = 760;
  const height = 240;
  const padX = 42;
  const padY = 20;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;

  const series = result?.series ?? [];
  const stepX = series.length > 1 ? plotW / (series.length - 1) : plotW;

  const buildPath = (key: 'topicAScore' | 'topicBScore') => {
    const segments: string[] = [];
    series.forEach((pt, idx) => {
      const val = pt[key];
      if (val === null) return;
      const x = padX + idx * stepX;
      const y = padY + plotH - (val / 100) * plotH;
      segments.push(`${segments.length === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`);
    });
    return segments.join(' ');
  };

  const hoveredPoint = hoverIdx !== null && series[hoverIdx] ? series[hoverIdx] : null;

  return (
    <section
      id="trend-battle"
      aria-label="Trend Battle Topic Comparison"
      className="mx-auto max-w-[1200px] px-4 sm:px-6 py-12"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between border-b border-slate-200 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1.5">
              <Scale className="h-4 w-4" aria-hidden="true" />
              <span>Trend Battle</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900">
              Compare Relative Topic Interest
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">
              Compare public attention trajectories, peak interest dates, and related search
              queries using verified Wikimedia Pageviews &amp; Google Suggest data.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              {copiedShare ? (
                <Check className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />
              ) : (
                <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{copiedShare ? 'Summary Copied' : 'Share Comparison'}</span>
            </button>

            {mode === 'section' && (
              <button
                type="button"
                onClick={() => onNavigate({ view: 'trend-battle' })}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0b1324] px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
              >
                <span>Open Trend Battle Page</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Preset Battles */}
        <div className="mb-5 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Examples:</span>
          {BATTLE_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setTopicA(preset.a);
                setTopicB(preset.b);
                void runComparison(preset.a, preset.b, geo, range);
              }}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium text-slate-700 hover:border-blue-500 hover:text-blue-600 transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Comparison Controls Form */}
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-12 mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="lg:col-span-3">
            <label htmlFor="battle-topic-a" className="block text-[11px] font-medium text-slate-600 mb-1">
              Topic A (Blue)
            </label>
            <input
              id="battle-topic-a"
              type="text"
              value={topicA}
              onChange={(e) => setTopicA(e.target.value)}
              placeholder="e.g. ChatGPT"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="lg:col-span-3">
            <label htmlFor="battle-topic-b" className="block text-[11px] font-medium text-slate-600 mb-1">
              Topic B (Amber)
            </label>
            <input
              id="battle-topic-b"
              type="text"
              value={topicB}
              onChange={(e) => setTopicB(e.target.value)}
              placeholder="e.g. Google Gemini"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="lg:col-span-2">
            <label htmlFor="battle-geo" className="block text-[11px] font-medium text-slate-600 mb-1">
              Country / Edition
            </label>
            <select
              id="battle-geo"
              value={geo}
              onChange={(e) => setGeo(e.target.value as TrendGeoCode)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            >
              {GEO_CHOICES.map((g) => (
                <option key={g.code} value={g.code}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label htmlFor="battle-range" className="block text-[11px] font-medium text-slate-600 mb-1">
              Date Range
            </label>
            <select
              id="battle-range"
              value={range}
              onChange={(e) => setRange(e.target.value as TrendBattleRange)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          <div className="lg:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Comparing...' : 'Compare'}
            </button>
          </div>
        </form>

        {error && (
          <div role="alert" className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            {error}
          </div>
        )}

        {loading && !result && (
          <div className="h-64 rounded-xl bg-slate-100 animate-pulse" />
        )}

        {result && (
          <div className="space-y-6">
            {/* Relative Interest Transparency Banner */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
              <span>{result.isRelativeScoreNotice}</span>
              <a
                href={result.googleTrendsCompareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline shrink-0"
              >
                <span>Open on Google Trends</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>

            {result.status === 'unavailable' ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Comparison Data Unavailable</p>
                <p className="mt-1 text-xs text-slate-600">{result.errorMessage}</p>
              </div>
            ) : (
              <>
                {/* Summary Score Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[
                    {
                      label: 'Topic A',
                      data: result.topicA,
                      accent: 'bg-blue-600',
                      textAccent: 'text-blue-600',
                    },
                    {
                      label: 'Topic B',
                      data: result.topicB,
                      accent: 'bg-amber-500',
                      textAccent: 'text-amber-700',
                    },
                  ].map((side) => (
                    <div
                      key={side.label}
                      className="rounded-xl border border-slate-200 bg-white p-4 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                          <span className={`inline-block h-2.5 w-2.5 rounded-sm ${side.accent}`} />
                          <span>{side.label}</span>
                          {side.data.resolvedEntity && (
                            <>
                              <span>·</span>
                              <a
                                href={side.data.wikipediaUrl || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline text-slate-700"
                              >
                                Entity: {side.data.resolvedEntity}
                              </a>
                            </>
                          )}
                        </div>
                        <div className="font-display text-xl font-semibold text-slate-900">
                          {side.data.inputTopic}
                        </div>
                        {side.data.errorReason && (
                          <p className="mt-1 text-xs text-rose-700">{side.data.errorReason}</p>
                        )}
                        {side.data.trendingTodayTraffic && (
                          <p className="mt-1 text-xs font-medium text-blue-600">
                            Google Trends RSS today: {side.data.trendingTodayTraffic}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-[11px] text-slate-500">Avg Relative Index</div>
                        <div className={`font-mono-tabular text-2xl font-bold ${side.textAccent}`}>
                          {side.data.available ? `${side.data.averageScore}/100` : 'N/A'}
                        </div>
                        {side.data.peakDate && (
                          <div className="text-[11px] text-slate-500 font-mono-tabular">
                            Peak {side.data.peakScore} on {side.data.peakDate}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Interactive SVG Line Chart */}
                <div className="rounded-xl border border-slate-200 bg-[#0b1324] p-4 sm:p-6 text-white">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-xs">
                    <span className="font-semibold text-slate-200">
                      Relative Interest Over Time ({result.range.toUpperCase()} · {result.geoName})
                    </span>
                    <div className="font-mono-tabular text-slate-300">
                      {hoveredPoint
                        ? `${hoveredPoint.date} — ${result.topicA.inputTopic}: ${
                            hoveredPoint.topicAScore ?? 'N/A'
                          } | ${result.topicB.inputTopic}: ${hoveredPoint.topicBScore ?? 'N/A'}`
                        : 'Hover or focus data points to inspect daily relative scores'}
                    </div>
                  </div>

                  <svg
                    viewBox={`0 0 ${width} ${height}`}
                    className="w-full h-auto overflow-visible"
                    role="img"
                    aria-label={`Line chart comparing ${result.topicA.inputTopic} and ${result.topicB.inputTopic}`}
                    onMouseLeave={() => setHoverIdx(null)}
                  >
                    {/* Horizontal Y Gridlines (0, 25, 50, 75, 100) */}
                    {[0, 25, 50, 75, 100].map((val) => {
                      const y = padY + plotH - (val / 100) * plotH;
                      return (
                        <g key={val}>
                          <line
                            x1={padX}
                            y1={y}
                            x2={width - padX}
                            y2={y}
                            stroke="rgba(148,163,184,0.16)"
                            strokeDasharray="3 3"
                          />
                          <text
                            x={padX - 8}
                            y={y + 4}
                            textAnchor="end"
                            fill="#94a3b8"
                            fontSize="10"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* Lines */}
                    <path
                      d={buildPath('topicAScore')}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                    <path
                      d={buildPath('topicBScore')}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />

                    {/* Hover crosshair & hit targets */}
                    {hoverIdx !== null && series[hoverIdx] && (
                      <line
                        x1={padX + hoverIdx * stepX}
                        y1={padY}
                        x2={padX + hoverIdx * stepX}
                        y2={padY + plotH}
                        stroke="rgba(255,255,255,0.35)"
                        strokeWidth="1"
                      />
                    )}

                    {series.map((pt, idx) => {
                      const x = padX + idx * stepX;
                      return (
                        <g key={pt.date}>
                          {pt.topicAScore !== null && hoverIdx === idx && (
                            <circle
                              cx={x}
                              cy={padY + plotH - (pt.topicAScore / 100) * plotH}
                              r="5"
                              fill="#3b82f6"
                              stroke="#ffffff"
                              strokeWidth="1.5"
                            />
                          )}
                          {pt.topicBScore !== null && hoverIdx === idx && (
                            <circle
                              cx={x}
                              cy={padY + plotH - (pt.topicBScore / 100) * plotH}
                              r="5"
                              fill="#f59e0b"
                              stroke="#ffffff"
                              strokeWidth="1.5"
                            />
                          )}
                          <rect
                            x={x - Math.max(4, stepX / 2)}
                            y={padY}
                            width={Math.max(8, stepX)}
                            height={plotH}
                            fill="transparent"
                            onMouseEnter={() => setHoverIdx(idx)}
                          />
                        </g>
                      );
                    })}

                    {/* X Axis Start / Mid / End labels */}
                    {series.length > 0 && (
                      <>
                        <text x={padX} y={height - 2} fill="#94a3b8" fontSize="10">
                          {series[0].date}
                        </text>
                        <text
                          x={width / 2}
                          y={height - 2}
                          textAnchor="middle"
                          fill="#94a3b8"
                          fontSize="10"
                        >
                          {series[Math.floor(series.length / 2)].date}
                        </text>
                        <text
                          x={width - padX}
                          y={height - 2}
                          textAnchor="end"
                          fill="#94a3b8"
                          fontSize="10"
                        >
                          {series[series.length - 1].date}
                        </text>
                      </>
                    )}
                  </svg>
                </div>

                {/* Related Queries & Rising Queries */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {[result.topicA, result.topicB].map((entity) => (
                    <div
                      key={entity.inputTopic}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4"
                    >
                      <h3 className="font-display text-lg font-semibold text-slate-900">
                        {entity.inputTopic} — Related &amp; Comparison Queries
                      </h3>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-xs">
                        <div>
                          <div className="font-semibold text-slate-700 mb-2">Related Queries</div>
                          {entity.relatedQueries.length === 0 ? (
                            <p className="text-slate-500">No suggestions returned.</p>
                          ) : (
                            <ul className="space-y-1.5 text-slate-600">
                              {entity.relatedQueries.map((q) => (
                                <li key={q}>· {q}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-700 mb-2">Rising Comparisons</div>
                          {entity.risingQueries.length === 0 ? (
                            <p className="text-slate-500">No comparison queries returned.</p>
                          ) : (
                            <ul className="space-y-1.5 text-slate-600">
                              {entity.risingQueries.map((q) => (
                                <li key={q}>· {q}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Source Transparency Footer */}
                <div className="text-xs text-slate-500 space-y-1 border-t border-slate-200 pt-4">
                  <p>
                    <strong>Data Sources:</strong> {result.sourceName} · Updated{' '}
                    {formatPublicationTimestamp(result.lastUpdated, useUtc)}
                  </p>
                  <p>{result.googleTrendsApiNote}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
