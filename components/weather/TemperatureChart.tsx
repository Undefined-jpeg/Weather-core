"use client";

import {
  Area,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import { useUserStore } from "@/stores/useUserStore";
import { formatTempRaw } from "@/lib/formatters";
import type { HourlyEntry } from "@/types/weather.types";

export function TemperatureChart({
  hours,
  timezone,
}: {
  hours: HourlyEntry[];
  timezone?: string;
}) {
  const unit = useUserStore((s) => s.unit);

  const data = hours.slice(0, 48).map((h) => {
    const label = new Date(h.time * 1000).toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
      timeZone: timezone,
    });
    return {
      label,
      temp: formatTempRaw(h.temp, unit),
      feels: formatTempRaw(h.feelsLike, unit),
    };
  });

  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Temperature (48h)</GlassCardTitle>
        <span className="text-xs text-[color:var(--color-text-muted)]">
          Solid = actual · Dashed = feels like
        </span>
      </GlassCardHeader>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-light)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--color-light)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(180,192,217,0.15)" }}
              interval={5}
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
              formatter={(v: number, name: string) => [
                `${v}°${unit === "imperial" ? "F" : "C"}`,
                name === "temp" ? "Temperature" : "Feels like",
              ]}
            />
            <Area
              type="monotone"
              dataKey="temp"
              stroke="var(--color-light)"
              strokeWidth={2.5}
              fill="url(#tempFill)"
              isAnimationActive
            />
            <Line
              type="monotone"
              dataKey="feels"
              stroke="var(--color-warning)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
