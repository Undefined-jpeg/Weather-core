"use client";

import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { WeekYearOverYearCompare } from "@/types/weather.types";

export function WeekYearCompareChart({
  data,
}: {
  data: WeekYearOverYearCompare | null | undefined;
}) {
  if (!data?.days?.length) {
    return (
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>This week vs last year · daily temperature</GlassCardTitle>
        </GlassCardHeader>
        <p className="text-sm text-[color:var(--color-text-muted)]">
          Rolling 7-day archive comparison is unavailable for this location.
        </p>
      </GlassCard>
    );
  }

  const rows = data.days.map((d) => ({
    day: d.date.slice(8),
    thisY: d.tempMeanThisC != null ? +d.tempMeanThisC.toFixed(1) : null,
    lastY: d.tempMeanLastC != null ? +d.tempMeanLastC.toFixed(1) : null,
  }));

  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>This week vs last year · °C daily mean</GlassCardTitle>
        <span className="text-xs text-[color:var(--color-text-muted)]">
          {data.startDate} … {data.endDate}
        </span>
      </GlassCardHeader>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="rgba(180,192,217,0.08)" strokeDasharray="3 6" />
            <XAxis
              dataKey="day"
              tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(180,192,217,0.12)" }}
            />
            <YAxis
              width={38}
              tick={{ fill: "var(--color-text-muted)", fontSize: 10 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(52,73,115,0.15)" }}
              contentStyle={{
                background: "rgba(30,36,53,0.94)",
                border: "1px solid rgba(180,192,217,0.14)",
                borderRadius: 10,
              }}
              labelStyle={{ color: "var(--color-text-muted)", fontSize: 11 }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar name="This year" dataKey="thisY" radius={[4, 4, 0, 0]} fill="#5b9bd5" />
            <Bar
              name="Same dates last yr"
              dataKey="lastY"
              radius={[4, 4, 0, 0]}
              fill="#818da6"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
