"use client";

import { useMemo, useState } from "react";
import { useUserStore } from "@/stores/useUserStore";
import { useWeather } from "@/hooks/useWeather";
import { useWeekYearCompare } from "@/hooks/useWeekYearCompare";
import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import { formatTemp } from "@/lib/formatters";
import { WeekYearCompareChart } from "@/components/compare/WeekYearCompareChart";
import type { LocationInfo, CurrentWeather } from "@/types/weather.types";

function CityCard({
  label,
  current,
}: {
  label: string;
  current: CurrentWeather | undefined;
}) {
  if (!current) {
    return (
      <GlassCard variant="strong">
        <GlassCardHeader>
          <GlassCardTitle>{label}</GlassCardTitle>
        </GlassCardHeader>
        <p className="text-xs text-[color:var(--color-text-muted)]">No data.</p>
      </GlassCard>
    );
  }
  return (
    <GlassCard variant="strong">
      <GlassCardHeader>
        <GlassCardTitle>{label}</GlassCardTitle>
      </GlassCardHeader>
      <p className="text-4xl font-semibold">{formatTemp(current.temp)}</p>
      <p className="mt-2 text-sm text-[color:var(--color-text-muted)]">{current.condition}</p>
      <dl className="mt-4 grid gap-2 text-xs text-[color:var(--color-text-muted)]">
        <div className="flex justify-between gap-3">
          <dt>Humidity</dt>
          <dd>{current.humidity}%</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt>Wind</dt>
          <dd>{(current.windSpeed * 3.6).toFixed(1)} km/h</dd>
        </div>
      </dl>
    </GlassCard>
  );
}

export default function ComparePage() {
  const loc = useUserStore((s) => s.currentLocation);
  const saved = useUserStore((s) => s.savedLocations);

  const [b, setB] = useState<LocationInfo | null>(saved[1] ?? saved[0] ?? null);

  const primaryWeather = useWeather(loc?.lat, loc?.lon);
  const secondaryWeather = useWeather(b?.lat, b?.lon);

  const yoy = useWeekYearCompare(loc?.lat, loc?.lon);

  const deltas = useMemo(() => {
    const a = primaryWeather.data?.current;
    const c = secondaryWeather.data?.current;
    if (!a || !c) return null;
    return {
      temp: a.temp - c.temp,
      hum: a.humidity - c.humidity,
      wind: a.windSpeed - c.windSpeed,
    };
  }, [primaryWeather.data, secondaryWeather.data]);

  if (!loc) {
    return (
      <GlassCard>
        <p className="text-sm text-[color:var(--color-text-muted)]">
          Locate yourself first to unlock comparisons.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Compare</h1>
        <p className="text-sm text-[color:var(--color-text-muted)]">
          Two-city snapshot ({loc.name}) and rolling week vs calendar week last year.
        </p>
      </div>

      <GlassCard variant="strong">
        <GlassCardHeader>
          <GlassCardTitle className="text-sm uppercase tracking-wider text-[color:var(--color-text-muted)]">
            City B · pick from saved
          </GlassCardTitle>
        </GlassCardHeader>
        <div className="flex flex-wrap gap-2">
          {saved.filter((x) => !(x.lat === loc.lat && x.lon === loc.lon)).length === 0 ? (
            <p className="text-xs text-[color:var(--color-text-muted)]">
              Save a second location in Settings to compare cities.
            </p>
          ) : (
            saved
              .filter((x) => !(x.lat === loc.lat && x.lon === loc.lon))
              .map((s) => (
                <button
                  key={`${s.lat},${s.lon}`}
                  type="button"
                  onClick={() => setB(s)}
                  className={`rounded-xl px-3 py-2 text-xs ring-1 ring-[rgba(180,192,217,0.15)] transition ${
                    b?.lat === s.lat && b?.lon === s.lon
                      ? "bg-[color:var(--color-primary)]/35 text-[color:var(--color-text-primary)]"
                      : "text-[color:var(--color-text-muted)] hover:bg-[rgba(180,192,217,0.06)]"
                  }`}
                >
                  {s.name}
                </button>
              ))
          )}
        </div>
      </GlassCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <CityCard label={`A · ${loc.name}`} current={primaryWeather.data?.current} />
        <CityCard label={`B · ${b?.name ?? "—"}`} current={secondaryWeather.data?.current} />
      </div>

      {deltas && b && secondaryWeather.data && primaryWeather.data && (
        <GlassCard variant="strong">
          <GlassCardHeader>
            <GlassCardTitle className="text-sm">Δ A − B · now</GlassCardTitle>
          </GlassCardHeader>
          <ul className="space-y-1 text-sm text-[color:var(--color-text-muted)]">
            <li>
              Temperature:{" "}
              <span className="text-[color:var(--color-text-primary)]">
                {deltas.temp > 0 ? "+" : ""}
                {deltas.temp.toFixed(1)}°C
              </span>
            </li>
            <li>
              Humidity:{" "}
              <span className="text-[color:var(--color-text-primary)]">
                {deltas.hum > 0 ? "+" : ""}
                {deltas.hum}%
              </span>
            </li>
            <li>
              Surface wind Δ:{" "}
              <span className="text-[color:var(--color-text-primary)]">
                {deltas.wind > 0 ? "+" : ""}
                {(deltas.wind * 3.6).toFixed(1)} km/h
              </span>
            </li>
          </ul>
        </GlassCard>
      )}

      <WeekYearCompareChart data={yoy.data ?? undefined} />
    </div>
  );
}
