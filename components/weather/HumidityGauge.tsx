"use client";

import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";

export function HumidityGauge({
  humidity,
  dewPoint,
}: {
  humidity: number;
  dewPoint?: number;
}) {
  const pct = Math.min(Math.max(humidity, 0), 100);
  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Humidity</GlassCardTitle>
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
              stroke="var(--color-info)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(pct * 2.513).toFixed(0)} 251.3`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold">
            {Math.round(pct)}%
          </div>
        </div>
        <div className="text-sm">
          {typeof dewPoint === "number" && (
            <p className="text-[color:var(--color-text-muted)]">
              Dew point <span className="text-[color:var(--color-text-primary)]">{Math.round(dewPoint)}°C</span>
            </p>
          )}
          <p className="text-[color:var(--color-text-muted)]">
            {humidity > 75 ? "Muggy" : humidity > 40 ? "Comfortable" : "Dry"}
          </p>
        </div>
      </div>
    </GlassCard>
  );
}
