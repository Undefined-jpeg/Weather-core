"use client";

import { useMemo, useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import { useUserStore } from "@/stores/useUserStore";
import {
  degreesToCardinal,
  formatDayName,
  formatPrecip,
  formatTempRaw,
  formatWindKmh,
} from "@/lib/formatters";
import { WeatherIcon } from "@/components/ui/WeatherIcon";
import type { DailyEntry } from "@/types/weather.types";

type SortKey = keyof Pick<
  DailyEntry,
  | "date"
  | "tempMax"
  | "tempMin"
  | "humidity"
  | "windSpeed"
  | "uvMax"
  | "precipitationSum"
  | "cloudCover"
>;

export function ExtendedTable({ days }: { days: DailyEntry[] }) {
  const unit = useUserStore((s) => s.unit);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "date",
    dir: "asc",
  });

  const sorted = useMemo(() => {
    const arr = [...days];
    arr.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv));
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [days, sort]);

  function toggle(key: SortKey) {
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
  }

  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>14-day extended forecast</GlassCardTitle>
      </GlassCardHeader>
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs">
          <thead>
            <tr className="text-left text-[color:var(--color-text-muted)]">
              {[
                ["date", "Day"],
                ["tempMax", "High"],
                ["tempMin", "Low"],
                ["precipitationSum", "Precip"],
                ["humidity", "Hum."],
                ["windSpeed", "Wind"],
                ["uvMax", "UV"],
                ["cloudCover", "Clouds"],
              ].map(([k, label]) => (
                <th
                  key={k}
                  scope="col"
                  className="cursor-pointer select-none whitespace-nowrap px-2 py-2 font-medium uppercase tracking-wide hover:text-[color:var(--color-text-primary)]"
                  onClick={() => toggle(k as SortKey)}
                >
                  <span className="inline-flex items-center gap-1">
                    {label} <ArrowUpDown className="h-3 w-3 opacity-50" />
                  </span>
                </th>
              ))}
              <th scope="col" className="px-2 py-2 font-medium uppercase tracking-wide">
                Cond.
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((d) => (
              <tr
                key={d.date}
                className="border-t border-[rgba(180,192,217,0.08)] hover:bg-[rgba(180,192,217,0.04)]"
              >
                <td className="whitespace-nowrap px-2 py-2 font-medium">
                  {formatDayName(d.date)}{" "}
                  <span className="text-[color:var(--color-text-muted)]">
                    {d.date.slice(5)}
                  </span>
                </td>
                <td className="px-2 py-2 tabular-nums">{formatTempRaw(d.tempMax, unit)}°</td>
                <td className="px-2 py-2 tabular-nums text-[color:var(--color-text-muted)]">
                  {formatTempRaw(d.tempMin, unit)}°
                </td>
                <td className="px-2 py-2 tabular-nums">
                  {formatPrecip(d.precipitationSum, unit)}{" "}
                  <span className="text-[10px] text-[color:var(--color-text-muted)]">
                    ({d.precipitationProbabilityMax}%)
                  </span>
                </td>
                <td className="px-2 py-2 tabular-nums">{Math.round(d.humidity)}%</td>
                <td className="px-2 py-2 tabular-nums">
                  {formatWindKmh(d.windSpeed, unit)}{" "}
                  <span className="text-[10px] text-[color:var(--color-text-muted)]">
                    {degreesToCardinal(d.windDeg)}
                  </span>
                </td>
                <td className="px-2 py-2 tabular-nums">{d.uvMax.toFixed(1)}</td>
                <td className="px-2 py-2 tabular-nums">{Math.round(d.cloudCover)}%</td>
                <td className="px-2 py-2">
                  <WeatherIcon
                    condition={d.conditionMain}
                    iconCode={d.iconCode}
                    size={22}
                    animated={false}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
