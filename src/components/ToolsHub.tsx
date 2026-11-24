import React, { useMemo, useState } from 'react';
import { Check, Copy, RotateCcw } from 'lucide-react';
import { AppRoute, ToolId } from '../types/editorial';
import { routeToUrl } from '../utils/routes';
import { AdSlot } from './AdSlot';

interface ToolsHubProps {
  activeTool: ToolId;
  onSelectTool: (toolId: ToolId) => void;
  onNavigate: (route: AppRoute) => void;
}

const TOOL_TABS: Array<{ id: ToolId; label: string }> = [
  { id: 'word-counter', label: 'Word Counter' },
  { id: 'percentage-calculator', label: 'Percentage Calculator' },
  { id: 'age-calculator', label: 'Age Calculator' },
  { id: 'unit-converter', label: 'Unit Converter' },
  { id: 'text-case-converter', label: 'Text Case Converter' },
  { id: 'character-counter', label: 'Character Counter' },
];

const TOOL_GUIDES: Record<
  ToolId,
  { heading: string; overview: string; points: string[] }
> = {
  'word-counter': {
    heading: 'How Word Count & Reading Time Are Calculated',
    overview:
      'Editorial desks, academic writers, and SEO editors use word density and reading duration estimates to pace articles clearly.',
    points: [
      'Words are tokenized on whitespace boundaries, matching standard word-processor counts.',
      'Estimated reading time uses an international adult average of 210 words per minute.',
      'Keyword frequency ignores short 1-3 character function words so meaningful topics surface naturally.',
    ],
  },
  'percentage-calculator': {
    heading: 'Percentage Formulas Used',
    overview:
      'Designed for quick cross-border business literacy, inflation comparisons, discounts, and academic grading.',
    points: [
      'Percentage of value: (P / 100) × Total.',
      'Percentage share: (Part / Whole) × 100.',
      'Percentage change: ((New − Original) / |Original|) × 100, guarding cleanly against division by zero.',
    ],
  },
  'age-calculator': {
    heading: 'Chronological Calendar Age Rules',
    overview:
      'Computes exact age across varying month lengths and leap years for passport, scholarship, and eligibility checks.',
    points: [
      'Months borrow exact calendar day counts from the preceding month rather than approximating 30-day months.',
      'Displays total elapsed days, full weeks, and exact days remaining until the next anniversary.',
    ],
  },
  'unit-converter': {
    heading: 'International SI & Binary Standards',
    overview:
      'Supports everyday metric-imperial conversions alongside decimal (KB/GB) and IEC binary (MiB/GiB) computing units.',
    points: [
      'Length and mass factors follow international SI standards (1 inch = 2.54 cm, 1 lb = 0.45359237 kg).',
      'Digital storage separates decimal base-1000 units (GB) from binary base-1024 units (GiB).',
    ],
  },
  'text-case-converter': {
    heading: 'Editorial & Developer Case Conventions',
    overview:
      'Switch smoothly between publication headline formats and software identifier naming conventions.',
    points: [
      'Title Case and Sentence case support clean article headlines and editorial formatting.',
      'camelCase, snake_case, and kebab-case normalize punctuation and mixed camel boundaries automatically.',
    ],
  },
  'character-counter': {
    heading: 'SEO Snippet Width & UTF-8 Byte Sizing',
    overview:
      'Useful for preparing search engine titles, meta descriptions, social captions, and database text constraints.',
    points: [
      'Search titles under 60 characters generally avoid truncation in desktop and mobile SERPs.',
      'Meta descriptions between 120 and 160 characters provide concise context without clipping.',
      'UTF-8 byte count helps verify multi-byte international script storage limits.',
    ],
  },
};

type UnitCategory = 'length' | 'mass' | 'temperature' | 'data' | 'speed';

const UNIT_FACTORS: Record<
  Exclude<UnitCategory, 'temperature'>,
  Record<string, { label: string; toBase: number }>
> = {
  length: {
    m: { label: 'Meters (m)', toBase: 1 },
    km: { label: 'Kilometers (km)', toBase: 1000 },
    cm: { label: 'Centimeters (cm)', toBase: 0.01 },
    mm: { label: 'Millimeters (mm)', toBase: 0.001 },
    mi: { label: 'Miles (mi)', toBase: 1609.344 },
    yd: { label: 'Yards (yd)', toBase: 0.9144 },
    ft: { label: 'Feet (ft)', toBase: 0.3048 },
    in: { label: 'Inches (in)', toBase: 0.0254 },
  },
  mass: {
    kg: { label: 'Kilograms (kg)', toBase: 1 },
    g: { label: 'Grams (g)', toBase: 0.001 },
    mg: { label: 'Milligrams (mg)', toBase: 0.000001 },
    lb: { label: 'Pounds (lb)', toBase: 0.45359237 },
    oz: { label: 'Ounces (oz)', toBase: 0.028349523125 },
    t: { label: 'Metric Tons (t)', toBase: 1000 },
  },
  data: {
    b: { label: 'Bytes (B)', toBase: 1 },
    kb: { label: 'Kilobytes (KB)', toBase: 1000 },
    mb: { label: 'Megabytes (MB)', toBase: 1_000_000 },
    gb: { label: 'Gigabytes (GB)', toBase: 1_000_000_000 },
    tb: { label: 'Terabytes (TB)', toBase: 1_000_000_000_000 },
    mib: { label: 'Mebibytes (MiB)', toBase: 1_048_576 },
    gib: { label: 'Gibibytes (GiB)', toBase: 1_073_741_824 },
  },
  speed: {
    mps: { label: 'Meters / second (m/s)', toBase: 1 },
    kph: { label: 'Kilometers / hour (km/h)', toBase: 1 / 3.6 },
    mph: { label: 'Miles / hour (mph)', toBase: 0.44704 },
    kt: { label: 'Knots (kn)', toBase: 0.514444 },
  },
};

export const ToolsHub: React.FC<ToolsHubProps> = ({ activeTool, onSelectTool, onNavigate }) => {
  // 1. Word Counter State
  const [wordText, setWordText] = useState(
    'TRENDVERSE combines international journalism with fast browser-local utilities. Paste or type any draft here to inspect word counts, sentence structure, and estimated reading duration.'
  );

  // 2. Percentage Calculator State
  const [pctA, setPctA] = useState('15');
  const [pctB, setPctB] = useState('240');
  const [partVal, setPartVal] = useState('45');
  const [wholeVal, setWholeVal] = useState('180');
  const [fromVal, setFromVal] = useState('120');
  const [toVal, setToVal] = useState('150');

  // 3. Age Calculator State
  const [birthDate, setBirthDate] = useState('1996-05-14');
  const [targetDate, setTargetDate] = useState(() => new Date().toISOString().slice(0, 10));

  // 4. Unit Converter State
  const [unitCat, setUnitCat] = useState<UnitCategory>('length');
  const [unitFrom, setUnitFrom] = useState('km');
  const [unitTo, setUnitTo] = useState('mi');
  const [unitInput, setUnitInput] = useState('10');

  // 5. Text Case Converter State
  const [caseInput, setCaseInput] = useState('discover whats next with trendverse editorial tools');
  const [caseCopied, setCaseCopied] = useState(false);

  // 6. Character Counter State
  const [charText, setCharText] = useState(
    'TRENDVERSE delivers international explainers on technology, finance, science, and free web utilities.'
  );

  // Word Counter Metrics
  const wordStats = useMemo(() => {
    const trimmed = wordText.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
    const sentences = trimmed ? trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length : 0;
    const paragraphs = trimmed ? trimmed.split(/\n+/).filter((p) => p.trim().length > 0).length : 0;
    const readingSeconds = Math.ceil((words.length / 210) * 60);
    const freq: Record<string, number> = {};
    words.forEach((w) => {
      const clean = w.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (clean.length > 3) freq[clean] = (freq[clean] || 0) + 1;
    });
    const topWords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    return {
      wordCount: words.length,
      charWithSpaces: wordText.length,
      charWithoutSpaces: wordText.replace(/\s/g, '').length,
      sentences,
      paragraphs,
      readingLabel:
        words.length === 0
          ? '0 sec'
          : readingSeconds < 60
          ? `${readingSeconds} sec`
          : `${Math.floor(readingSeconds / 60)}m ${readingSeconds % 60}s`,
      topWords,
    };
  }, [wordText]);

  // Percentage Calculations
  const pctResults = useMemo(() => {
    const a = Number(pctA);
    const b = Number(pctB);
    const part = Number(partVal);
    const whole = Number(wholeVal);
    const start = Number(fromVal);
    const end = Number(toVal);

    return {
      percentOf: Number.isFinite(a) && Number.isFinite(b) ? ((a / 100) * b).toFixed(4).replace(/\.?0+$/, '') : '—',
      whatPercent:
        Number.isFinite(part) && Number.isFinite(whole) && whole !== 0
          ? `${((part / whole) * 100).toFixed(2)}%`
          : whole === 0
          ? 'Cannot divide by 0'
          : '—',
      percentChange:
        Number.isFinite(start) && Number.isFinite(end) && start !== 0
          ? `${(((end - start) / Math.abs(start)) * 100 >= 0 ? '+' : '')}${(((end - start) / Math.abs(start)) * 100).toFixed(2)}%`
          : start === 0
          ? 'Start value cannot be 0'
          : '—',
    };
  }, [pctA, pctB, partVal, wholeVal, fromVal, toVal]);

  // Age Calculation
  const ageResult = useMemo(() => {
    if (!birthDate || !targetDate) return { error: 'Select both birth date and target date.' };
    const dob = new Date(`${birthDate}T00:00:00`);
    const ref = new Date(`${targetDate}T00:00:00`);
    if (Number.isNaN(dob.getTime()) || Number.isNaN(ref.getTime())) {
      return { error: 'Enter valid calendar dates.' };
    }
    if (dob > ref) {
      return { error: 'Birth date cannot be later than the target date.' };
    }

    let years = ref.getFullYear() - dob.getFullYear();
    let months = ref.getMonth() - dob.getMonth();
    let days = ref.getDate() - dob.getDate();

    if (days < 0) {
      const prevMonthDays = new Date(ref.getFullYear(), ref.getMonth(), 0).getDate();
      days += prevMonthDays;
      months -= 1;
    }
    if (months < 0) {
      months += 12;
      years -= 1;
    }

    const totalDays = Math.floor((ref.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);

    const nextBday = new Date(ref.getFullYear(), dob.getMonth(), dob.getDate());
    if (nextBday < ref) {
      nextBday.setFullYear(ref.getFullYear() + 1);
    }
    const daysUntilNext = Math.ceil((nextBday.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24));

    return {
      error: null,
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      daysUntilNext,
    };
  }, [birthDate, targetDate]);

  // Unit Conversion
  const unitOptions = useMemo(() => {
    if (unitCat === 'temperature') {
      return [
        { key: 'c', label: 'Celsius (°C)' },
        { key: 'f', label: 'Fahrenheit (°F)' },
        { key: 'k', label: 'Kelvin (K)' },
      ];
    }
    return Object.entries(UNIT_FACTORS[unitCat]).map(([key, info]) => ({
      key,
      label: info.label,
    }));
  }, [unitCat]);

  const handleCategorySwitch = (nextCat: UnitCategory) => {
    setUnitCat(nextCat);
    if (nextCat === 'temperature') {
      setUnitFrom('c');
      setUnitTo('f');
      setUnitInput('20');
    } else if (nextCat === 'length') {
      setUnitFrom('km');
      setUnitTo('mi');
      setUnitInput('10');
    } else if (nextCat === 'mass') {
      setUnitFrom('kg');
      setUnitTo('lb');
      setUnitInput('5');
    } else if (nextCat === 'data') {
      setUnitFrom('gb');
      setUnitTo('mb');
      setUnitInput('4');
    } else {
      setUnitFrom('kph');
      setUnitTo('mph');
      setUnitInput('100');
    }
  };

  const convertedValue = useMemo(() => {
    const val = Number(unitInput);
    if (!Number.isFinite(val)) return '—';
    if (unitCat === 'temperature') {
      let celsius = val;
      if (unitFrom === 'f') celsius = (val - 32) * (5 / 9);
      if (unitFrom === 'k') celsius = val - 273.15;

      let out = celsius;
      if (unitTo === 'f') out = celsius * (9 / 5) + 32;
      if (unitTo === 'k') out = celsius + 273.15;
      return out.toFixed(4).replace(/\.?0+$/, '');
    }
    const table = UNIT_FACTORS[unitCat];
    const fromFactor = table[unitFrom]?.toBase ?? 1;
    const toFactor = table[unitTo]?.toBase ?? 1;
    const res = (val * fromFactor) / toFactor;
    return res.toPrecision(8).replace(/\.?0+$/, '');
  }, [unitCat, unitFrom, unitTo, unitInput]);

  // Case Conversions
  const transformCase = (mode: 'upper' | 'lower' | 'title' | 'sentence' | 'camel' | 'snake' | 'kebab') => {
    const text = caseInput;
    if (mode === 'upper') setCaseInput(text.toUpperCase());
    else if (mode === 'lower') setCaseInput(text.toLowerCase());
    else if (mode === 'title') {
      setCaseInput(
        text
          .toLowerCase()
          .replace(/\b([a-z])/g, (m) => m.toUpperCase())
      );
    } else if (mode === 'sentence') {
      setCaseInput(
        text
          .toLowerCase()
          .replace(/(^\s*[a-z]|[.!?]\s+[a-z])/g, (m) => m.toUpperCase())
      );
    } else {
      const words = text
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter(Boolean);
      if (mode === 'camel') {
        setCaseInput(
          words.map((w, i) => (i === 0 ? w : w[0].toUpperCase() + w.slice(1))).join('')
        );
      } else if (mode === 'snake') {
        setCaseInput(words.join('_'));
      } else if (mode === 'kebab') {
        setCaseInput(words.join('-'));
      }
    }
  };

  // Character Counter Stats
  const charStats = useMemo(() => {
    const bytes = new TextEncoder().encode(charText).length;
    const len = charText.length;
    return {
      total: len,
      noSpaces: charText.replace(/\s/g, '').length,
      lines: charText ? charText.split(/\r\n|\r|\n/).length : 0,
      bytes,
      titleStatus: len <= 60 ? 'Optimal SEO Title (≤ 60 chars)' : 'Exceeds typical 60-char SERP title width',
      metaStatus:
        len >= 120 && len <= 160
          ? 'Optimal Meta Description (120–160 chars)'
          : len < 120
          ? 'Below 120 chars (room for more context)'
          : 'Exceeds 160 chars (may truncate in SERPs)',
    };
  }, [charText]);

  return (
    <div>
      <section className="bg-[#0b1324] text-white border-b border-white/10 py-10">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-400 mb-3">
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                onNavigate({ view: 'home' });
              }}
              className="hover:text-white cursor-pointer"
            >
              Home
            </a>{' '}
            / <span className="text-slate-200">Free Online Tools</span>
          </nav>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-white">
            Free Online Utilities
          </h1>
          <p className="mt-2.5 max-w-2xl text-sm sm:text-base text-slate-300">
            Client-side calculators and editorial tools engineered for instant results. Every
            calculation runs locally inside your browser.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-10">
        {/* Tool Selector Tabs */}
        <div
          role="tablist"
          aria-label="Select online utility"
          className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1.5 mb-8"
        >
          {TOOL_TABS.map((tab) => (
            <a
              key={tab.id}
              href={routeToUrl({ view: 'tools', toolId: tab.id })}
              role="tab"
              aria-selected={activeTool === tab.id}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                e.preventDefault();
                onSelectTool(tab.id);
              }}
              className={`rounded-lg px-3.5 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeTool === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-6">
            {/* 1. WORD COUNTER */}
            {activeTool === 'word-counter' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl font-semibold text-slate-900">
                    Word Counter
                  </h2>
                  <button
                    type="button"
                    onClick={() => setWordText('')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Clear</span>
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={wordText}
                  onChange={(e) => setWordText(e.target.value)}
                  aria-label="Text input for word counter"
                  placeholder="Paste or type your article draft here..."
                  className="w-full rounded-lg border border-slate-300 p-4 text-sm leading-relaxed text-slate-900 focus:border-blue-600 focus:outline-none"
                />

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {[
                    ['Words', wordStats.wordCount],
                    ['Characters', wordStats.charWithSpaces],
                    ['No Spaces', wordStats.charWithoutSpaces],
                    ['Sentences', wordStats.sentences],
                    ['Paragraphs', wordStats.paragraphs],
                    ['Est. Read Time', wordStats.readingLabel],
                  ].map(([label, val]) => (
                    <div key={String(label)} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs text-slate-500">{label}</div>
                      <div className="mt-1 font-mono-tabular text-2xl font-semibold text-slate-900">
                        {val}
                      </div>
                    </div>
                  ))}
                </div>

                {wordStats.topWords.length > 0 && (
                  <div className="border-t border-slate-200 pt-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Frequent Terms (4+ letters)
                    </h3>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-700">
                      {wordStats.topWords.map(([term, count]) => (
                        <span key={term} className="font-mono-tabular">
                          {term}: <strong>{count}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. PERCENTAGE CALCULATOR */}
            {activeTool === 'percentage-calculator' && (
              <div className="space-y-8">
                <h2 className="font-display text-2xl font-semibold text-slate-900">
                  Percentage Calculator
                </h2>

                <div className="space-y-6 divide-y divide-slate-200">
                  <div className="pt-1">
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">
                      1. What is X% of Y?
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="number"
                        value={pctA}
                        onChange={(e) => setPctA(e.target.value)}
                        aria-label="Percentage value"
                        className="w-28 rounded-lg border border-slate-300 px-3 py-2 font-mono-tabular text-sm focus:border-blue-600 focus:outline-none"
                      />
                      <span className="text-sm text-slate-600">% of</span>
                      <input
                        type="number"
                        value={pctB}
                        onChange={(e) => setPctB(e.target.value)}
                        aria-label="Base number"
                        className="w-32 rounded-lg border border-slate-300 px-3 py-2 font-mono-tabular text-sm focus:border-blue-600 focus:outline-none"
                      />
                      <span className="text-sm text-slate-600">=</span>
                      <span className="font-mono-tabular text-xl font-semibold text-blue-600">
                        {pctResults.percentOf}
                      </span>
                    </div>
                  </div>

                  <div className="pt-6">
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">
                      2. X is what percentage of Y?
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="number"
                        value={partVal}
                        onChange={(e) => setPartVal(e.target.value)}
                        aria-label="Part value"
                        className="w-28 rounded-lg border border-slate-300 px-3 py-2 font-mono-tabular text-sm focus:border-blue-600 focus:outline-none"
                      />
                      <span className="text-sm text-slate-600">out of</span>
                      <input
                        type="number"
                        value={wholeVal}
                        onChange={(e) => setWholeVal(e.target.value)}
                        aria-label="Whole value"
                        className="w-32 rounded-lg border border-slate-300 px-3 py-2 font-mono-tabular text-sm focus:border-blue-600 focus:outline-none"
                      />
                      <span className="text-sm text-slate-600">=</span>
                      <span className="font-mono-tabular text-xl font-semibold text-blue-600">
                        {pctResults.whatPercent}
                      </span>
                    </div>
                  </div>

                  <div className="pt-6">
                    <h3 className="text-sm font-semibold text-slate-800 mb-3">
                      3. Percentage Change (Increase / Decrease)
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm text-slate-600">From</span>
                      <input
                        type="number"
                        value={fromVal}
                        onChange={(e) => setFromVal(e.target.value)}
                        aria-label="Initial value"
                        className="w-28 rounded-lg border border-slate-300 px-3 py-2 font-mono-tabular text-sm focus:border-blue-600 focus:outline-none"
                      />
                      <span className="text-sm text-slate-600">to</span>
                      <input
                        type="number"
                        value={toVal}
                        onChange={(e) => setToVal(e.target.value)}
                        aria-label="New value"
                        className="w-28 rounded-lg border border-slate-300 px-3 py-2 font-mono-tabular text-sm focus:border-blue-600 focus:outline-none"
                      />
                      <span className="text-sm text-slate-600">=</span>
                      <span className="font-mono-tabular text-xl font-semibold text-blue-600">
                        {pctResults.percentChange}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. AGE CALCULATOR */}
            {activeTool === 'age-calculator' && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-semibold text-slate-900">
                  Age Calculator
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="dob-input" className="block text-xs font-medium text-slate-600 mb-1.5">
                      Date of Birth
                    </label>
                    <input
                      id="dob-input"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono-tabular text-sm focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="ref-date-input" className="block text-xs font-medium text-slate-600 mb-1.5">
                      Calculate Age On
                    </label>
                    <input
                      id="ref-date-input"
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono-tabular text-sm focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                {ageResult.error ? (
                  <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    {ageResult.error}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 sm:col-span-3">
                      <div className="text-xs text-slate-500">Exact Chronological Age</div>
                      <div className="mt-1 font-mono-tabular text-2xl font-semibold text-slate-900">
                        {ageResult.years} years, {ageResult.months} months, {ageResult.days} days
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs text-slate-500">Total Days</div>
                      <div className="mt-1 font-mono-tabular text-xl font-semibold text-slate-900">
                        {ageResult.totalDays?.toLocaleString()}
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs text-slate-500">Total Weeks</div>
                      <div className="mt-1 font-mono-tabular text-xl font-semibold text-slate-900">
                        {ageResult.totalWeeks?.toLocaleString()}
                      </div>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs text-slate-500">Next Birthday</div>
                      <div className="mt-1 font-mono-tabular text-xl font-semibold text-blue-600">
                        {ageResult.daysUntilNext} days
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. UNIT CONVERTER */}
            {activeTool === 'unit-converter' && (
              <div className="space-y-6">
                <h2 className="font-display text-2xl font-semibold text-slate-900">
                  International Unit Converter
                </h2>

                <div className="flex flex-wrap gap-1.5 rounded-lg bg-slate-100 p-1">
                  {(
                    [
                      ['length', 'Length'],
                      ['mass', 'Mass / Weight'],
                      ['temperature', 'Temperature'],
                      ['data', 'Digital Storage'],
                      ['speed', 'Speed'],
                    ] as Array<[UnitCategory, string]>
                  ).map(([catKey, label]) => (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => handleCategorySwitch(catKey)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors ${
                        unitCat === catKey
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="unit-value" className="block text-xs font-medium text-slate-600 mb-1.5">
                      Input Value
                    </label>
                    <input
                      id="unit-value"
                      type="number"
                      value={unitInput}
                      onChange={(e) => setUnitInput(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono-tabular text-sm focus:border-blue-600 focus:outline-none"
                    />
                    <select
                      aria-label="From unit"
                      value={unitFrom}
                      onChange={(e) => setUnitFrom(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                    >
                      {unitOptions.map((opt) => (
                        <option key={opt.key} value={opt.key}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="block text-xs font-medium text-slate-600 mb-1.5">
                      Converted Result
                    </div>
                    <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono-tabular text-sm font-semibold text-blue-600">
                      {convertedValue}
                    </div>
                    <select
                      aria-label="To unit"
                      value={unitTo}
                      onChange={(e) => setUnitTo(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
                    >
                      {unitOptions.map((opt) => (
                        <option key={opt.key} value={opt.key}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* 5. TEXT CASE CONVERTER */}
            {activeTool === 'text-case-converter' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl font-semibold text-slate-900">
                    Text Case Converter
                  </h2>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(caseInput);
                      setCaseCopied(true);
                      window.setTimeout(() => setCaseCopied(false), 1800);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    {caseCopied ? <Check className="h-3.5 w-3.5 text-blue-600" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{caseCopied ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={caseInput}
                  onChange={(e) => setCaseInput(e.target.value)}
                  aria-label="Text input for case conversion"
                  className="w-full rounded-lg border border-slate-300 p-4 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />

                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      ['upper', 'UPPERCASE'],
                      ['lower', 'lowercase'],
                      ['title', 'Title Case'],
                      ['sentence', 'Sentence case'],
                      ['camel', 'camelCase'],
                      ['snake', 'snake_case'],
                      ['kebab', 'kebab-case'],
                    ] as const
                  ).map(([mode, label]) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => transformCase(mode)}
                      className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:border-blue-600 hover:text-blue-600 transition-colors cursor-pointer"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 6. CHARACTER COUNTER */}
            {activeTool === 'character-counter' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl font-semibold text-slate-900">
                    Character Counter &amp; SEO Snippet Meter
                  </h2>
                  <button
                    type="button"
                    onClick={() => setCharText('')}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Clear</span>
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={charText}
                  onChange={(e) => setCharText(e.target.value)}
                  aria-label="Text input for character counter"
                  className="w-full rounded-lg border border-slate-300 p-4 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {[
                    ['Characters', charStats.total],
                    ['Without Spaces', charStats.noSpaces],
                    ['UTF-8 Bytes', charStats.bytes],
                    ['Lines', charStats.lines],
                  ].map(([label, val]) => (
                    <div key={String(label)} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="text-xs text-slate-500">{label}</div>
                      <div className="mt-1 font-mono-tabular text-2xl font-semibold text-slate-900">
                        {val}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-700">
                    <span>SEO Title Guidance (≤ 60 chars):</span>
                    <span className="font-medium text-slate-900">{charStats.titleStatus}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700">
                    <span>Meta Description Guidance (120–160 chars):</span>
                    <span className="font-medium text-slate-900">{charStats.metaStatus}</span>
                  </div>
                </div>
              </div>
            )}
            {/* Helpful Tool Methodology & Reference Guide */}
            <section className="mt-8 border-t border-slate-200 pt-6 space-y-2.5">
              <h3 className="font-display text-lg font-semibold text-slate-900">
                {TOOL_GUIDES[activeTool].heading}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {TOOL_GUIDES[activeTool].overview}
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-slate-600">
                {TOOL_GUIDES[activeTool].points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <AdSlot variant="rectangle" slotName="tools-sidebar" />
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <h3 className="font-display text-lg font-semibold text-slate-900 mb-2">
                Privacy Guarantee
              </h3>
              <p className="text-xs leading-relaxed text-slate-600">
                All six TRENDVERSE utilities execute directly inside your device browser using
                vanilla JavaScript math and string APIs. Your inputs are never sent to external
                servers.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
