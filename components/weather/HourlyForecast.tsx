"use client";

import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import { WeatherIcon } from "@/components/ui/WeatherIcon";
import { useUserStore } from "@/stores/useUserStore";
import { formatTime, formatTempRaw } from "@/lib/formatters";
import type { HourlyEntry } from "@/types/weather.types";

export function HourlyForecast({
  hours,
  timezone,
}: {
  hours: HourlyEntry[];
  timezone?: string;
}) {
  const unit = useUserStore((s) => s.unit);
  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Next 24 hours</GlassCardTitle>
      </GlassCardHeader>
      <div className="-mx-1 flex gap-2 overflow-x-auto pb-2">
        {hours.slice(0, 24).map((h) => (
          <div
            key={h.time}
            className="flex min-w-[80px] flex-col items-center rounded-xl bg-[rgba(30,36,53,0.4)] px-3 py-3 ring-1 ring-[rgba(180,192,217,0.08)]"
          >
            <p className="text-xs text-[color:var(--color-text-muted)]">
              {formatTime(h.time, timezone)}
            </p>
            <WeatherIcon
              condition={h.conditionMain}
              iconCode={h.iconCode}
              size={36}
              animated={false}
            />
            <p className="mt-1 text-base font-medium">
              {formatTempRaw(h.temp, unit)}°
            </p>
            <p
              className="mt-1 text-[10px]"
              style={{
                color:
                  h.pop > 50
                    ? "var(--color-info)"
                    : h.pop > 20
                      ? "var(--color-text-muted)"
                      : "transparent",
              }}
            >
              {h.pop}%
            </p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
