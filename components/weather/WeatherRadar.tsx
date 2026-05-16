"use client";

import dynamic from "next/dynamic";
import { CloudRain } from "lucide-react";
import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { RadarLoopNotice } from "@/components/weather/RadarLoopNotice";

const WeatherMap = dynamic(
  () => import("@/components/map/WeatherMap").then((m) => m.WeatherMap),
  { ssr: false, loading: () => <Skeleton className="h-72 rounded-2xl" /> },
);

export function WeatherRadar({ lat, lon }: { lat: number; lon: number }) {
  const hasKey = Boolean(process.env.NEXT_PUBLIC_OPENWEATHERMAP_API_KEY);
  return (
    <GlassCard padded={false}>
      <div className="p-5">
        <GlassCardHeader>
          <GlassCardTitle className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-[color:var(--color-info)]" />
            Precipitation radar
          </GlassCardTitle>
          {hasKey && (
            <span className="text-xs text-[color:var(--color-text-muted)]">
              Live · OpenWeatherMap tiles
            </span>
          )}
        </GlassCardHeader>
      </div>
      <div className="relative h-64 overflow-hidden">
        <WeatherMap
          center={[lon, lat]}
          events={[]}
          mode="radar"
          forcedLayers={{ precipitation: true }}
        />
        {!hasKey && (
          <div className="absolute inset-0 grid place-items-center bg-[rgba(30,36,53,0.7)] text-center text-xs text-[color:var(--color-text-muted)]">
            Radar overlay requires NEXT_PUBLIC_OPENWEATHERMAP_API_KEY.
          </div>
        )}
        <Legend />
      </div>
      <div className="px-5 pb-4">
        <RadarLoopNotice />
      </div>
    </GlassCard>
  );
}

function Legend() {
  return (
    <div className="absolute bottom-2 left-2 right-2 z-10 max-w-md rounded-lg bg-[rgba(30,36,53,0.92)] px-2.5 py-2 text-[10px] leading-snug text-[color:var(--color-text-muted)] ring-1 ring-[rgba(180,192,217,0.15)] backdrop-blur-sm">
      <div
        aria-hidden
        className="mb-2 h-2 w-full max-w-[16rem] rounded-full"
        style={{
          background:
            "linear-gradient(90deg, rgba(91,155,213,0.15) 0%, rgba(91,155,213,0.55) 25%, rgba(155,109,212,0.85) 60%, rgba(192,57,43,0.85) 100%)",
          border: "1px solid rgba(180,192,217,0.2)",
        }}
      />
      <p className="text-[color:var(--color-text-muted)]">
        Relative precipitation composite from OpenWeatherMap — shows where the tile
        service draws stronger echoes. Not calibrated mm/h at your pin; compare with
        local stations for exact intensity.
      </p>
    </div>
  );
}
