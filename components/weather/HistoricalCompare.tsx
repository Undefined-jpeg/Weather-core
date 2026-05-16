"use client";

import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HistoricalDelta } from "@/types/weather.types";

export function HistoricalCompare({
  data,
}: {
  data: HistoricalDelta | null | undefined;
}) {
  if (!data) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Historical comparison</GlassCardTitle>
        </GlassCardHeader>
        <p className="text-sm text-[color:var(--color-text-muted)]">
          No historical data available for this location.
        </p>
      </GlassCard>
    );
  }
  const rows = data.daily.slice(-30).map((d) => ({
    date: d.date.slice(5),
    delta: +d.delta.toFixed(2),
  }));
  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Historical comparison · last 30 days vs 10-yr avg</GlassCardTitle>
      </GlassCardHeader>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--color-text-muted)", fontSize: 9 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(180,192,217,0.15)" }}
              interval={4}
            />
            <YAxis
              tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={32}
              tickFormatter={(v: number) => `${v}°`}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(30,36,53,0.95)",
                border: "1px solid rgba(180,192,217,0.18)",
                borderRadius: 12,
                color: "var(--color-text-primary)",
                fontSize: 12,
              }}
              formatter={(v: number) => [`${v > 0 ? "+" : ""}${v}°C`, "Delta"]}
            />
            <Bar dataKey="delta" radius={[3, 3, 0, 0]}>
              {rows.map((r, i) => (
                <Cell
                  key={i}
                  fill={r.delta >= 0 ? "var(--color-warning)" : "var(--color-info)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
