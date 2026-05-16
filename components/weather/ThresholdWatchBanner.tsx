"use client";

import { useMemo } from "react";
import { AlertTriangle } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import type { HourlyEntry } from "@/types/weather.types";

export function ThresholdWatchBanner({ hourly }: { hourly: HourlyEntry[] }) {
  const windMps = useUserStore((s) => s.windAlertMps);
  const tempC = useUserStore((s) => s.tempAlertC);
  const popFrac = useUserStore((s) => s.popAlertFraction);

  const message = useMemo(() => {
    const windowSlice = hourly.slice(0, 12);
    if (windowSlice.length === 0) return null;

    const lines: string[] = [];

    if (windMps != null && windMps > 0) {
      const hit = windowSlice.some((h) => h.windSpeed >= windMps);
      if (hit)
        lines.push(
          `Sustained model winds reach ≥ ${windMps.toFixed(1)} m/s (${(windMps * 3.6).toFixed(0)} km/h) inside the hourly window.`,
        );
    }

    if (tempC != null) {
      const hot = windowSlice.some((h) => h.temp >= tempC);
      if (hot) {
        lines.push(
          `Hourly snapshots reach ≥ ${Math.round(tempC)}°C — verify against local instrumentation.`,
        );
      }
    }

    if (popFrac != null && popFrac > 0) {
      const hit = windowSlice.some((h) => h.pop >= popFrac);
      if (hit)
        lines.push(
          `Precip probability ≥ ${Math.round(popFrac * 100)}% in the next stretch of hours.`,
        );
    }

    if (lines.length === 0) return null;
    return lines.join(" ");
  }, [hourly, windMps, tempC, popFrac]);

  if (!message) return null;

  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-[rgba(230,126,34,0.45)] bg-[rgba(230,126,34,0.12)] px-4 py-3 text-xs text-[color:var(--color-text-primary)]"
      role="status"
    >
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--color-warning)]" />
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[color:var(--color-warning)]">
          Threshold watch · local prefs
        </p>
        <p className="mt-1 leading-relaxed text-[color:var(--color-text-muted)]">{message}</p>
        <p className="mt-2 text-[10px] text-[color:var(--color-text-muted)]">
          Browser banners require explicit permission separately in Settings · not a NOAA warning.
        </p>
      </div>
    </div>
  );
}
