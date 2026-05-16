"use client";

import { WeatherIcon } from "@/components/ui/WeatherIcon";
import { useWeather } from "@/hooks/useWeather";
import { useUserStore } from "@/stores/useUserStore";
import { formatTempRaw } from "@/lib/formatters";

export function CurrentWeatherBadge() {
  const loc = useUserStore((s) => s.currentLocation);
  const unit = useUserStore((s) => s.unit);
  const { data, isLoading } = useWeather(loc?.lat, loc?.lon);

  if (!loc) return null;

  if (isLoading || !data) {
    return (
      <div className="hidden items-center gap-2 rounded-full bg-[rgba(180,192,217,0.06)] px-3 py-1.5 ring-1 ring-[rgba(180,192,217,0.12)] md:inline-flex">
        <span className="h-4 w-4 animate-pulse rounded-full bg-[rgba(180,192,217,0.18)]" />
        <span className="h-3 w-16 animate-pulse rounded bg-[rgba(180,192,217,0.18)]" />
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-2 rounded-full bg-[rgba(180,192,217,0.06)] px-3 py-1.5 ring-1 ring-[rgba(180,192,217,0.12)] md:inline-flex">
      <WeatherIcon
        condition={data.current.conditionMain}
        iconCode={data.current.iconCode}
        size={20}
        animated={false}
      />
      <span className="text-sm tabular-nums">
        {formatTempRaw(data.current.temp, unit)}°
      </span>
      <span className="max-w-[140px] truncate text-xs text-[color:var(--color-text-muted)]">
        {data.location.name}
      </span>
    </div>
  );
}
