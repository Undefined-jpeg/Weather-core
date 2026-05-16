"use client";

import { useUserStore } from "@/stores/useUserStore";
import { useWeather } from "@/hooks/useWeather";
import { ExtendedTable } from "@/components/weather/ExtendedTable";
import { TemperatureChart } from "@/components/weather/TemperatureChart";
import { PressureTrend } from "@/components/weather/PressureTrend";
import { HistoricalCompare } from "@/components/weather/HistoricalCompare";
import { WindAnalysis } from "@/components/weather/WindAnalysis";
import { PrecipitationDeepDive } from "@/components/weather/PrecipitationDeepDive";
import { ThermalComfort } from "@/components/weather/ThermalComfort";
import { UVIndex } from "@/components/weather/UVIndex";
import { GeminiAnalysisCard } from "@/components/ai/GeminiAnalysisCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { GlassCard } from "@/components/ui/GlassCard";

export default function AnalysisPage() {
  const loc = useUserStore((s) => s.currentLocation);
  const { data, isLoading } = useWeather(loc?.lat, loc?.lon);

  if (!loc) {
    return (
      <GlassCard>
        <h2 className="text-lg font-medium">Pick a location first</h2>
        <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
          Enable location access from the dashboard to see deep analysis.
        </p>
      </GlassCard>
    );
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-12 w-1/2 rounded-xl" />
        <Skeleton className="h-72 w-full rounded-2xl" />
        <div className="grid gap-5 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Detailed analysis
        </h1>
        <p className="text-sm text-[color:var(--color-text-muted)]">
          {data.location.name}
          {data.location.country && ` · ${data.location.country}`}
        </p>
      </div>

      <GeminiAnalysisCard lat={loc.lat} lon={loc.lon} />

      <TemperatureChart hours={data.hourly} timezone={data.location.timezone} />

      <ExtendedTable days={data.daily} />

      <div className="grid gap-5 lg:grid-cols-2">
        <PressureTrend hours={data.hourly} />
        <WindAnalysis hours={data.hourly} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <PrecipitationDeepDive days={data.daily} />
        <HistoricalCompare data={data.historical} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <ThermalComfort current={data.current} daily={data.daily} />
        <UVIndex uv={data.current.uv} />
      </div>
    </div>
  );
}
