"use client";

import type { HourlyEntry } from "@/types/weather.types";
import { formatTime } from "@/lib/formatters";

interface PrecipOutlookProps {
  hourly: HourlyEntry[];
  timezone?: string;
}

const WET_MAIN = new Set<
  HourlyEntry["conditionMain"]
>(["Rain", "Drizzle", "Thunderstorm", "Snow"]);

function isWetSlot(h: HourlyEntry): boolean {
  const meaningfulMm = h.precipitation >= 0.1;
  const elevatedPop = h.pop >= 0.35;
  return elevatedPop || meaningfulMm || WET_MAIN.has(h.conditionMain);
}

export function PrecipOutlook({ hourly, timezone }: PrecipOutlookProps) {
  const windowSlice = hourly.slice(0, 6);
  const wetBlocks = windowSlice.filter(isWetSlot);

  if (wetBlocks.length === 0) {
    return (
      <p className="text-center text-xs text-[color:var(--color-text-muted)] sm:text-sm">
        Next few hours look mostly dry.
      </p>
    );
  }

  const spotlight = wetBlocks.reduce((best, cur) =>
    cur.pop >= best.pop ? cur : best,
  );
  const label =
    spotlight.conditionMain === "Snow"
      ? "snow / mixed precip"
      : "elevated rain chance";

  const line = `Next few hours: ${label} (~${Math.round(spotlight.pop * 100)}% around ${formatTime(
    spotlight.time,
    timezone,
  )}).`;

  return (
    <p className="text-center text-xs text-[color:var(--color-text-muted)] sm:text-sm">
      {line}
    </p>
  );
}
