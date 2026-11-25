import React, { useMemo, useState } from 'react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { LiveNewsItem } from '../../server/types';
import { formatPublicationTimestamp } from '../utils/timeFormat';

interface GlobalNewsMapProps {
  items: LiveNewsItem[];
  useUtc: boolean;
}

interface CountryPin {
  country: string;
  lat: number;
  lon: number;
}

/**
 * Verified geographical centroids (latitude, longitude) projected onto
 * an 800x400 equirectangular SVG map: x = (lon + 180) * (800/360), y = (90 - lat) * (400/180).
 */
const COUNTRY_PINS: CountryPin[] = [
  { country: 'United States', lat: 39.8, lon: -98.5 },
  { country: 'Canada', lat: 56.1, lon: -106.3 },
  { country: 'Brazil', lat: -14.2, lon: -51.9 },
  { country: 'United Kingdom', lat: 55.3, lon: -3.4 },
  { country: 'France', lat: 46.2, lon: 2.2 },
  { country: 'Germany', lat: 51.1, lon: 10.4 },
  { country: 'Middle East / UAE', lat: 24.4, lon: 54.3 },
  { country: 'India', lat: 20.5, lon: 78.9 },
  { country: 'Singapore', lat: 1.35, lon: 103.8 },
  { country: 'Japan', lat: 36.2, lon: 138.2 },
  { country: 'Australia', lat: -25.2, lon: 133.7 },
  { country: 'Global', lat: 6.0, lon: 20.0 },
];

function projectCoords(lat: number, lon: number): { x: number; y: number } {
  return {
    x: ((lon + 180) / 360) * 800,
    y: ((90 - lat) / 180) * 400,
  };
}

export const GlobalNewsMap: React.FC<GlobalNewsMapProps> = ({ items, useUtc }) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('India');

  const countsByCountry = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      counts[item.countryTag] = (counts[item.countryTag] || 0) + 1;
    }
    return counts;
  }, [items]);

  const countryStories = useMemo(() => {
    return items.filter((item) => item.countryTag === selectedCountry).slice(0, 5);
  }, [items, selectedCountry]);

  return (
    <section
      id="global-news-map"
      aria-label="Global News Map"
      className="mx-auto max-w-[1200px] px-4 sm:px-6 py-12"
    >
      <div className="border-b border-slate-200 pb-4 mb-7">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1.5">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          <span>Global News Map</span>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900">
          Explore Dispatches by Country &amp; Region
        </h2>
        <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">
          Select a country pin using verified publisher region tags and country centroids to view
          regional headlines, sources, and timestamps.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Interactive Equirectangular World Map */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-[#0b1324] p-4">
          <svg
            viewBox="0 0 800 400"
            className="w-full h-auto"
            role="img"
            aria-label="Interactive world map of regional news coverage"
          >
            {/* Latitude / Longitude Graticule */}
            <g stroke="rgba(148,163,184,0.12)" strokeWidth="0.75">
              {[80, 140, 200, 260, 320].map((y) => (
                <line key={y} x1="0" y1={y} x2="800" y2={y} />
              ))}
              {[100, 200, 300, 400, 500, 600, 700].map((x) => (
                <line key={x} x1={x} y1="0" x2={x} y2="400" />
              ))}
            </g>

            {/* Simplified Continental Silhouettes */}
            <g fill="#162748" stroke="#284273" strokeWidth="1">
              {/* North America */}
              <path d="M85,55 L190,45 L255,95 L235,155 L175,185 L145,175 L105,125 Z" />
              {/* South America */}
              <path d="M225,205 L285,220 L300,275 L265,345 L240,330 L218,260 Z" />
              {/* Europe */}
              <path d="M365,65 L455,55 L465,115 L395,130 L368,105 Z" />
              {/* Africa */}
              <path d="M375,145 L465,145 L490,210 L455,305 L415,300 L378,220 Z" />
              {/* Asia */}
              <path d="M465,60 L665,65 L705,135 L635,205 L545,215 L485,155 Z" />
              {/* Australia */}
              <path d="M625,255 L715,255 L730,315 L650,325 L615,290 Z" />
            </g>

            {/* Interactive Country Pins */}
            {COUNTRY_PINS.map((pin) => {
              const { x, y } = projectCoords(pin.lat, pin.lon);
              const count = countsByCountry[pin.country] || 0;
              const isSelected = selectedCountry === pin.country;

              return (
                <g
                  key={pin.country}
                  onClick={() => setSelectedCountry(pin.country)}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`${pin.country}: ${count} verified stories`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedCountry(pin.country);
                    }
                  }}
                >
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 13 : 9}
                    fill={isSelected ? 'rgba(37,99,235,0.35)' : 'rgba(59,130,246,0.18)'}
                  />
                  <circle
                    cx={x}
                    cy={y}
                    r={isSelected ? 6 : 4.5}
                    fill={isSelected ? '#3b82f6' : count > 0 ? '#ffffff' : '#64748b'}
                    stroke="#0b1324"
                    strokeWidth="1.5"
                  />
                  <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : '#94a3b8'}
                    fontSize="10"
                    fontWeight={isSelected ? '700' : '500'}
                  >
                    {pin.country === 'United States'
                      ? 'USA'
                      : pin.country === 'United Kingdom'
                      ? 'UK'
                      : pin.country === 'Middle East / UAE'
                      ? 'UAE'
                      : pin.country}
                  </text>
                </g>
              );
            })}
          </svg>

          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-white/10 pt-3">
            {COUNTRY_PINS.map((pin) => {
              const count = countsByCountry[pin.country] || 0;
              return (
                <button
                  key={pin.country}
                  type="button"
                  onClick={() => setSelectedCountry(pin.country)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium cursor-pointer transition-colors ${
                    selectedCountry === pin.country
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {pin.country} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Country Headlines Panel */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-baseline justify-between border-b border-slate-200 pb-3 mb-4">
            <h3 className="font-display text-xl font-semibold text-slate-900">
              {selectedCountry}
            </h3>
            <span className="font-mono-tabular text-xs font-semibold text-blue-600">
              {countsByCountry[selectedCountry] || 0} available stories
            </span>
          </div>

          {countryStories.length === 0 ? (
            <p className="text-sm text-slate-600 py-4">
              No recent dispatches in the active RSS cache explicitly tagged for {selectedCountry}.
              Select India, United Kingdom, United States, or Global to inspect live feed items.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {countryStories.map((story) => (
                <div key={story.id} className="py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2 text-xs text-slate-600 mb-1">
                    <span className="font-semibold text-blue-600">{story.publisher}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={story.publishedAt}>
                      {formatPublicationTimestamp(story.publishedAt, useUtc)}
                    </time>
                  </div>
                  <a
                    href={story.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-start justify-between gap-2 text-sm font-semibold text-slate-900 hover:text-blue-600"
                  >
                    <span>{story.title}</span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-blue-600 mt-0.5" aria-hidden="true" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
