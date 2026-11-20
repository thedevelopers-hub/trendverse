import React, { useEffect, useState } from 'react';
import { Clock, Globe } from 'lucide-react';
import {
  formatCityClock,
  formatLiveClock,
  WORLD_CLOCK_CITIES,
} from '../utils/timeFormat';

interface LiveWorldClockProps {
  useUtc: boolean;
  onToggleUtc: (next: boolean) => void;
}

export const LiveWorldClock: React.FC<LiveWorldClockProps> = ({ useUtc, onToggleUtc }) => {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const primary = formatLiveClock(now, useUtc);

  return (
    <section
      aria-label="Live date, time, and world clock"
      className="bg-[#060b16] text-slate-200 border-b border-white/10"
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Primary Local / UTC Live Digital Clock */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
            <div className="flex items-center gap-2 text-white">
              <Clock className="h-4 w-4 text-blue-400 shrink-0" aria-hidden="true" />
              <span className="font-mono-tabular text-base font-semibold tracking-tight text-white">
                {primary.timeText}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
              <span className="font-medium text-white">{primary.weekday}</span>
              <span aria-hidden="true">·</span>
              <span>{primary.dateText}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-400">{primary.zoneLabel}</span>
            </div>

            <div
              role="group"
              aria-label="Display timezone preference"
              className="inline-flex items-center rounded-md bg-white/5 p-0.5 border border-white/10"
            >
              <button
                type="button"
                onClick={() => onToggleUtc(false)}
                className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                  !useUtc ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Local
              </button>
              <button
                type="button"
                onClick={() => onToggleUtc(true)}
                className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors cursor-pointer ${
                  useUtc ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                UTC
              </button>
            </div>
          </div>

          {/* 8 World Clock Cities (Automatic DST via IANA time zones) */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 lg:pb-0">
            <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0 hidden sm:block" aria-hidden="true" />
            <div className="flex items-center gap-4 text-xs whitespace-nowrap">
              {WORLD_CLOCK_CITIES.map((item) => {
                const cityClock = formatCityClock(now, item.timeZone);
                return (
                  <div key={item.city} className="flex items-baseline gap-1.5">
                    <span className="text-slate-400">{item.city}</span>
                    <span className="font-mono-tabular font-medium text-white">
                      {cityClock.time}
                    </span>
                    <span className="text-[10px] text-slate-500">{cityClock.tzShort}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
