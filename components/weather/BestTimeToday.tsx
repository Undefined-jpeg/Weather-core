"use client";

import { Sun, Cloud, CloudRain, CloudSnow } from "lucide-react";
import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import { useUserStore } from "@/stores/useUserStore";
import { formatTime, formatTemp } from "@/lib/formatters";
import type { HourlyEntry } from "@/types/weather.types";

interface Props {
  hours: HourlyEntry[];
  timezone?: string;
}

interface ScoredHour extends HourlyEntry {
  score: number;
}

function scoreHour(h: HourlyEntry): number {
  let s = 100;
  s -= Math.max(0, h.uv - 5) * 8;
  s -= Math.max(0, h.pop - 20) * 0.6;
  const tempPenalty =
    h.temp < 12 ? 12 - h.temp : h.temp > 28 ? h.temp - 28 : 0;
  s -= tempPenalty * 3;
  if (h.windSpeed > 8) s -= (h.windSpeed - 8) * 2;
  if (h.conditionMain === "Thunderstorm") s -= 60;
  if (h.conditionMain === "Snow") s -= 25;
  if (h.conditionMain === "Rain") s -= 30;
  if (h.conditionMain === "Drizzle") s -= 15;
  return s;
}

// First 6 hourly steps (~6 h); best contiguous 2-hour pair by comfort score.
function bestWindow(hours: HourlyEntry[]): {
  start: HourlyEntry;
  end: HourlyEntry;
  avgScore: number;
} | null {
  const scored: ScoredHour[] = hours
    .slice(0, 6)
    .map((h) => ({ ...h, score: scoreHour(h) }));
  if (scored.length < 2) return null;

  let bestIdx = 0;
  let bestSum = -Infinity;
  for (let i = 0; i < scored.length - 1; i++) {
    const sum = scored[i]!.score + scored[i + 1]!.score;
    if (sum > bestSum) {
      bestSum = sum;
      bestIdx = i;
    }
  }
  return {
    start: scored[bestIdx]!,
    end: scored[bestIdx + 1]!,
    avgScore: bestSum / 2,
  };
}

function scoreLabel(score: number): {
  label: string;
  color: string;
  Icon: typeof Sun;
} {
  if (score >= 80)
    return { label: "Excellent", color: "var(--color-safe)", Icon: Sun };
  if (score >= 60)
    return { label: "Good", color: "var(--color-light)", Icon: Sun };
  if (score >= 40)
    return { label: "Fair", color: "var(--color-warning)", Icon: Cloud };
  if (score >= 20)
    return {
      label: "Poor",
      color: "var(--color-warning)",
      Icon: CloudRain,
    };
  return { label: "Stay inside", color: "var(--color-danger)", Icon: CloudSnow };
}

export function BestTimeToday({ hours, timezone }: Props) {
  const unit = useUserStore((s) => s.unit);
  const window = bestWindow(hours);

  if (!window) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Best window (next ~6 h)</GlassCardTitle>
        </GlassCardHeader>
        <p className="text-sm text-[color:var(--color-text-muted)]">
          Not enough forecast data.
        </p>
      </GlassCard>
    );
  }

  const { label, color, Icon } = scoreLabel(window.avgScore);

  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Best window (next ~6 h)</GlassCardTitle>
        <span
          className="text-xs uppercase tracking-wider"
          style={{ color }}
        >
          {label}
        </span>
      </GlassCardHeader>
      <p className="mb-3 text-[11px] text-[color:var(--color-text-muted)]">
        Highest-comfort 2-hour span from the next six hourly forecasts (UV, rain
        chance, temperature, wind).
      </p>
      <div className="flex items-center gap-4">
        <div
          className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl ring-1 ring-[rgba(180,192,217,0.18)]"
          style={{ background: "rgba(180,192,217,0.08)" }}
        >
          <Icon className="h-7 w-7" style={{ color }} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-2xl font-semibold tracking-tight">
            {formatTime(window.start.time, timezone)}
            <span className="mx-1.5 text-[color:var(--color-text-muted)]">–</span>
            {formatTime(window.end.time, timezone)}
          </div>
          <div className="mt-1 text-xs text-[color:var(--color-text-muted)]">
            {formatTemp(window.start.temp, unit)} · {window.start.pop}% rain
            chance · UV {window.start.uv.toFixed(0)}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
