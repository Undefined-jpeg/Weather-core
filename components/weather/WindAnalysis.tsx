"use client";

import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { degreesToCardinal, formatWindKmh } from "@/lib/formatters";
import { useUserStore } from "@/stores/useUserStore";
import type { HourlyEntry } from "@/types/weather.types";

export function WindAnalysis({ hours }: { hours: HourlyEntry[] }) {
  const unit = useUserStore((s) => s.unit);
  const data = hours.slice(0, 72).map((h) => ({
    t: new Date(h.time * 1000).getHours(),
    speed: formatWindKmh(h.windSpeed, unit),
    deg: h.windDeg,
  }));
  const peak = data.reduce((m, d) => (d.speed > m.speed ? d : m), data[0] ?? { speed: 0, deg: 0, t: 0 });
  const dominantBucket = data.reduce<Record<string, number>>((acc, d) => {
    const c = degreesToCardinal(d.deg);
    acc[c] = (acc[c] ?? 0) + 1;
    return acc;
  }, {});
  const dominant = Object.entries(dominantBucket).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Wind analysis (72h)</GlassCardTitle>
        <span className="text-xs text-[color:var(--color-text-muted)]">
          Dominant: <strong className="text-[color:var(--color-text-primary)]">{dominant}</strong> · Peak{" "}
          <strong className="text-[color:var(--color-text-primary)]">{peak.speed}</strong>
        </span>
      </GlassCardHeader>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="windFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-light)" stopOpacity={0.6} />
                <stop offset="100%" stopColor="var(--color-light)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="t"
              tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(180,192,217,0.15)" }}
              interval={7}
              tickFormatter={(v: number) => `${v}h`}
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
            <Area
              type="monotone"
              dataKey="speed"
              stroke="var(--color-light)"
              fill="url(#windFill)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
