"use client";

import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { HourlyEntry } from "@/types/weather.types";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

export function PressureTrend({ hours }: { hours: HourlyEntry[] }) {
  const data = hours.slice(0, 72).map((h) => ({
    t: new Date(h.time * 1000).toLocaleTimeString("en-US", {
      hour: "2-digit",
      hour12: false,
    }),
    p: h.pressure,
  }));
  const start = data[0]?.p ?? 1013;
  const end = data[data.length - 1]?.p ?? 1013;
  const delta = end - start;
  const trend = delta > 1 ? "Rising" : delta < -1 ? "Falling" : "Steady";
  const TrendIcon = delta > 1 ? TrendingUp : delta < -1 ? TrendingDown : Minus;
  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Pressure (72h)</GlassCardTitle>
        <span className="inline-flex items-center gap-1 text-xs text-[color:var(--color-text-muted)]">
          <TrendIcon className="h-3.5 w-3.5" /> {trend} ({delta.toFixed(1)} hPa)
        </span>
      </GlassCardHeader>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(180,192,217,0.08)" strokeDasharray="3 3" />
            <XAxis
              dataKey="t"
              tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(180,192,217,0.15)" }}
              interval={8}
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(30,36,53,0.95)",
                border: "1px solid rgba(180,192,217,0.18)",
                borderRadius: 12,
                color: "var(--color-text-primary)",
                fontSize: 12,
              }}
              formatter={(v: number) => [`${v.toFixed(1)} hPa`, "Pressure"]}
            />
            <Line
              type="monotone"
              dataKey="p"
              stroke="var(--color-light)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
