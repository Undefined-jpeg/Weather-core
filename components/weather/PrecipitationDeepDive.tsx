"use client";

import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useUserStore } from "@/stores/useUserStore";
import type { DailyEntry } from "@/types/weather.types";

export function PrecipitationDeepDive({ days }: { days: DailyEntry[] }) {
  const unit = useUserStore((s) => s.unit);
  const data = days.slice(0, 14).map((d) => ({
    date: d.date.slice(5),
    rain: +d.precipitationSum.toFixed(1),
    snow: +d.snowfallSum.toFixed(1),
  }));
  const total = data.reduce((s, d) => s + d.rain + d.snow, 0);
  const floodRisk =
    total > 100 ? "High" : total > 40 ? "Moderate" : total > 10 ? "Low" : "Minimal";
  const floodColor =
    floodRisk === "High"
      ? "var(--color-danger)"
      : floodRisk === "Moderate"
        ? "var(--color-warning)"
        : "var(--color-safe)";
  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Precipitation deep dive</GlassCardTitle>
        <span className="text-xs" style={{ color: floodColor }}>
          Flood risk: {floodRisk}
        </span>
      </GlassCardHeader>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--color-text-muted)", fontSize: 9 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(180,192,217,0.15)" }}
            />
            <YAxis
              tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={28}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(30,36,53,0.95)",
                border: "1px solid rgba(180,192,217,0.18)",
                borderRadius: 12,
                color: "var(--color-text-primary)",
                fontSize: 12,
              }}
            />
            <Bar dataKey="rain" stackId="p" fill="var(--color-info)" radius={[2, 2, 0, 0]} />
            <Bar dataKey="snow" stackId="p" fill="var(--color-light)" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-xs text-[color:var(--color-text-muted)]">
        14-day total: <strong className="text-[color:var(--color-text-primary)]">{total.toFixed(1)} {unit === "imperial" ? "in" : "mm"}</strong>
      </p>
    </GlassCard>
  );
}
