"use client";

import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import { WeatherIcon } from "@/components/ui/WeatherIcon";
import { useUserStore } from "@/stores/useUserStore";
import { formatDayName, formatTempRaw } from "@/lib/formatters";
import type { DailyEntry } from "@/types/weather.types";

export function DailyForecast({ days }: { days: DailyEntry[] }) {
  const unit = useUserStore((s) => s.unit);
  const weeklyMin = Math.min(...days.map((d) => d.tempMin));
  const weeklyMax = Math.max(...days.map((d) => d.tempMax));
  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>7-day outlook</GlassCardTitle>
      </GlassCardHeader>
      <ul className="space-y-2">
        {days.slice(0, 7).map((d) => {
          const startPct = ((d.tempMin - weeklyMin) / (weeklyMax - weeklyMin || 1)) * 100;
          const endPct = ((d.tempMax - weeklyMin) / (weeklyMax - weeklyMin || 1)) * 100;
          return (
            <li
              key={d.date}
              className="grid grid-cols-[1fr_auto_2fr_auto_auto] items-center gap-3 rounded-xl px-2 py-2 hover:bg-[rgba(180,192,217,0.06)]"
            >
              <span className="text-sm">{formatDayName(d.date)}</span>
              <WeatherIcon condition={d.conditionMain} iconCode={d.iconCode} size={26} animated={false} />
              <div className="relative h-2 rounded-full bg-[rgba(180,192,217,0.1)]">
                <div
                  className="absolute h-2 rounded-full"
                  style={{
                    left: `${startPct}%`,
                    width: `${Math.max(endPct - startPct, 3)}%`,
                    background: "linear-gradient(90deg, var(--color-info), var(--color-warning))",
                  }}
                />
              </div>
              <span className="text-xs text-[color:var(--color-text-muted)] tabular-nums">
                {formatTempRaw(d.tempMin, unit)}°
              </span>
              <span className="text-xs font-medium tabular-nums">
                {formatTempRaw(d.tempMax, unit)}°
              </span>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}
