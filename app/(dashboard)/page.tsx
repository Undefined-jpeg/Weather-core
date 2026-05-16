"use client";

import { useUserStore } from "@/stores/useUserStore";
import { useWeather } from "@/hooks/useWeather";
import { useAlerts } from "@/hooks/useAlerts";
import { CurrentWeather } from "@/components/weather/CurrentWeather";
import { PrecipOutlook } from "@/components/weather/PrecipOutlook";
import { HourlyForecast } from "@/components/weather/HourlyForecast";
import { DailyForecast } from "@/components/weather/DailyForecast";
import { SunriseSunset } from "@/components/weather/SunriseSunset";
import { WindRose } from "@/components/weather/WindRose";
import { AirQuality } from "@/components/weather/AirQuality";
import { UVIndex } from "@/components/weather/UVIndex";
import { HumidityGauge } from "@/components/weather/HumidityGauge";
import { PrecipitationChart } from "@/components/weather/PrecipitationChart";
import { BestTimeToday } from "@/components/weather/BestTimeToday";
import { AlertBanner } from "@/components/alerts/AlertBanner";
import { ThresholdWatchBanner } from "@/components/weather/ThresholdWatchBanner";
import { AIWeatherSummary } from "@/components/ai/AIWeatherSummary";
import { Skeleton } from "@/components/ui/Skeleton";
import { GlassCard } from "@/components/ui/GlassCard";

export default function DashboardPage() {
  const loc = useUserStore((s) => s.currentLocation);
  const weather = useWeather(loc?.lat, loc?.lon);
  const alerts = useAlerts(loc?.lat, loc?.lon);

  if (!loc) {
    return (
      <div className="space-y-4">
        <GlassCard>
          <h2 className="text-lg font-medium">Locating you…</h2>
          <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
            Allow location access for the best experience. We&apos;ll fall back
            to IP-based geolocation if denied.
          </p>
        </GlassCard>
      </div>
    );
  }

  if (weather.isLoading || !weather.data) {
    return <DashboardSkeleton />;
  }

  const data = weather.data;

  return (
    <div className="space-y-5">
      {(alerts.data?.length ?? 0) > 0 && <AlertBanner alerts={alerts.data!} />}
      {data.cached && (
        <p className="rounded-xl border border-[rgba(230,126,34,0.35)] bg-[rgba(230,126,34,0.08)] px-4 py-2 text-center text-xs text-[color:var(--color-text-muted)]">
          Showing the last synced forecast from WeatherCore servers (tiered freshness).
          Reconnect online for newest model output.
        </p>
      )}
      <ThresholdWatchBanner hourly={data.hourly} />
      <PrecipOutlook hourly={data.hourly} timezone={data.location.timezone} />
      <CurrentWeather current={data.current} location={data.location} />
      <HourlyForecast hours={data.hourly} timezone={data.location.timezone} />
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DailyForecast days={data.daily} />
        </div>
        <div className="space-y-5">
          <BestTimeToday hours={data.hourly} timezone={data.location.timezone} />
          <AIWeatherSummary lat={loc.lat} lon={loc.lon} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <SunriseSunset sunrise={data.current.sunrise} sunset={data.current.sunset} />
        <WindRose
          windDeg={data.current.windDeg}
          windSpeed={data.current.windSpeed}
          windGust={data.current.windGust}
        />
        <AirQuality data={data.airQuality} />
        <HumidityGauge humidity={data.current.humidity} dewPoint={data.current.dewPoint} />
      </div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PrecipitationChart hours={data.hourly} />
        </div>
        <UVIndex uv={data.current.uv} />
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <Skeleton className="h-72 w-full rounded-3xl" />
      <Skeleton className="h-36 w-full rounded-2xl" />
      <div className="grid gap-5 lg:grid-cols-3">
        <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
    </div>
  );
}
