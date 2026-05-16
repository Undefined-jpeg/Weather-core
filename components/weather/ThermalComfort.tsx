"use client";

import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import { useUserStore } from "@/stores/useUserStore";
import { formatTempRaw } from "@/lib/formatters";
import type { CurrentWeather, DailyEntry } from "@/types/weather.types";

export function ThermalComfort({
  current,
  daily,
}: {
  current: CurrentWeather;
  daily: DailyEntry[];
}) {
  const unit = useUserStore((s) => s.unit);
  const heatIndex = current.temp >= 27 ? current.feelsLike : null;
  const windChill = current.temp <= 10 ? current.feelsLike : null;
  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Thermal comfort</GlassCardTitle>
      </GlassCardHeader>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <Cell label="Actual temp" value={`${formatTempRaw(current.temp, unit)}°`} />
        <Cell label="Feels like" value={`${formatTempRaw(current.feelsLike, unit)}°`} />
        <Cell
          label="Heat index"
          value={heatIndex !== null ? `${formatTempRaw(heatIndex, unit)}°` : "—"}
          tone={heatIndex !== null && heatIndex > 32 ? "warn" : undefined}
        />
        <Cell
          label="Wind chill"
          value={windChill !== null ? `${formatTempRaw(windChill, unit)}°` : "—"}
          tone={windChill !== null && windChill < 0 ? "warn" : undefined}
        />
      </div>
      <div className="mt-4">
        <p className="mb-1 text-[10px] uppercase tracking-wider text-[color:var(--color-text-muted)]">
          14-day comfort range
        </p>
        <div className="flex h-3 overflow-hidden rounded-full bg-[rgba(180,192,217,0.1)]">
          {daily.slice(0, 14).map((d) => {
            const v = (d.feelsLikeMax + d.feelsLikeMin) / 2;
            const hue =
              v < 5
                ? 220
                : v < 15
                  ? 200
                  : v < 25
                    ? 50
                    : v < 35
                      ? 25
                      : 0;
            return (
              <div
                key={d.date}
                className="flex-1"
                style={{ background: `hsl(${hue}, 60%, 55%)` }}
                title={`${d.date}: ${formatTempRaw(v, unit)}°`}
              />
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}

function Cell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warn";
}) {
  return (
    <div className="rounded-xl bg-[rgba(30,36,53,0.5)] p-3 ring-1 ring-[rgba(180,192,217,0.08)]">
      <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-text-muted)]">
        {label}
      </div>
      <div
        className="mt-0.5 text-xl font-semibold tabular-nums"
        style={{ color: tone === "warn" ? "var(--color-warning)" : undefined }}
      >
        {value}
      </div>
    </div>
  );
}
