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
import type { HourlyEntry } from "@/types/weather.types";

export function PrecipitationChart({ hours }: { hours: HourlyEntry[] }) {
  const data = hours.slice(0, 48).map((h) => ({
    t: new Date(h.time * 1000).getHours(),
    pop: h.pop,
    precip: h.precipitation,
  }));
  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Precipitation (48h)</GlassCardTitle>
      </GlassCardHeader>
      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="precipFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-info)" stopOpacity={0.7} />
                <stop offset="100%" stopColor="var(--color-info)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="t"
              tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(180,192,217,0.15)" }}
              interval={5}
              tickFormatter={(v: number) => `${v}h`}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `${v}%`}
              width={30}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(30,36,53,0.95)",
                border: "1px solid rgba(180,192,217,0.18)",
                borderRadius: 12,
                color: "var(--color-text-primary)",
                fontSize: 12,
              }}
              formatter={(v: number) => [`${v}%`, "Probability"]}
              labelFormatter={(v: number) => `${v}:00`}
            />
            <Area
              type="monotone"
              dataKey="pop"
              stroke="var(--color-info)"
              fill="url(#precipFill)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
