"use client";

import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import { aqiLevel } from "@/lib/formatters";
import type { AirQuality as AirQualityType } from "@/types/weather.types";

export function AirQuality({ data }: { data: AirQualityType | null | undefined }) {
  if (!data) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Air quality</GlassCardTitle>
        </GlassCardHeader>
        <p className="text-sm text-[color:var(--color-text-muted)]">No data available.</p>
      </GlassCard>
    );
  }
  const level = aqiLevel(data.aqi);
  const pct = (data.aqi / 5) * 100;
  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Air quality</GlassCardTitle>
      </GlassCardHeader>
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24">
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="rgba(180,192,217,0.15)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={level.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(pct * 2.513).toFixed(0)} 251.3`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold">{data.aqi}</span>
            <span className="text-[10px] uppercase tracking-wider text-[color:var(--color-text-muted)]">
              AQI
            </span>
          </div>
        </div>
        <div className="grid flex-1 grid-cols-2 gap-1 text-[11px]">
          <div className="text-[color:var(--color-text-muted)]">PM2.5</div>
          <div className="text-right tabular-nums">{data.pm25.toFixed(1)}</div>
          <div className="text-[color:var(--color-text-muted)]">PM10</div>
          <div className="text-right tabular-nums">{data.pm10.toFixed(1)}</div>
          <div className="text-[color:var(--color-text-muted)]">O₃</div>
          <div className="text-right tabular-nums">{data.o3.toFixed(0)}</div>
          <div className="text-[color:var(--color-text-muted)]">NO₂</div>
          <div className="text-right tabular-nums">{data.no2.toFixed(0)}</div>
        </div>
      </div>
      <p
        className="mt-3 text-xs font-medium"
        style={{ color: level.color }}
      >
        {level.label}
      </p>
    </GlassCard>
  );
}
