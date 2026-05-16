"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import {
  CloudHail,
  CloudRain,
  Flame,
  Snowflake,
  Tornado,
  Waves,
  Wind,
} from "lucide-react";
import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDisasters } from "@/hooks/useDisasters";
import { HurricaneTracker } from "@/components/map/HurricaneTracker";
import { AIDisasterBriefing } from "@/components/ai/AIDisasterBriefing";
import type { DisasterEvent, DisasterType } from "@/types/disaster.types";

const WeatherMap = dynamic(
  () => import("@/components/map/WeatherMap").then((m) => m.WeatherMap),
  { ssr: false, loading: () => <Skeleton className="h-72 rounded-2xl" /> },
);

export default function DisastersPage() {
  const { data, isLoading } = useDisasters();

  const counts = data?.counts ?? {};

  const tornadoEvents = useMemo(
    () =>
      (data?.events ?? []).filter(
        (e) => e.type === "tornado" || e.type === "severe-thunderstorm",
      ),
    [data],
  );

  const recentByType = useMemo(() => {
    const out: Record<string, DisasterEvent[]> = {};
    for (const e of data?.events ?? []) {
      out[e.type] ??= [];
      out[e.type]!.push(e);
    }
    return out;
  }, [data]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Global severe weather
          </h1>
          <p className="text-sm text-[color:var(--color-text-muted)]">
            Live disaster tracker — hurricanes, tornadoes, floods, wildfires & more.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <CountBadge label="Hurricanes" Icon={Wind} count={counts.hurricane ?? 0} tone="danger" />
        <CountBadge label="Tropical" Icon={Wind} count={counts["tropical-storm"] ?? 0} tone="warning" />
        <CountBadge label="Tornadoes" Icon={Tornado} count={counts.tornado ?? 0} tone="danger" />
        <CountBadge label="Floods" Icon={Waves} count={counts.flood ?? 0} tone="info" />
        <CountBadge label="Wildfires" Icon={Flame} count={counts.wildfire ?? 0} tone="warning" />
        <CountBadge label="Winter" Icon={Snowflake} count={(counts.blizzard ?? 0) + (counts["winter-storm"] ?? 0)} tone="info" />
      </div>

      <HurricaneTracker hurricanes={data?.hurricanes ?? []} />

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle className="flex items-center gap-2">
              <Tornado className="h-4 w-4 text-[color:var(--color-danger)]" /> Tornado / Severe Thunderstorm
            </GlassCardTitle>
            <span className="text-xs text-[color:var(--color-text-muted)]">
              {tornadoEvents.length} active
            </span>
          </GlassCardHeader>
          {isLoading ? (
            <Skeleton className="h-44" />
          ) : tornadoEvents.length === 0 ? (
            <p className="text-sm text-[color:var(--color-text-muted)]">No active warnings or watches.</p>
          ) : (
            <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {tornadoEvents.slice(0, 30).map((e) => (
                <li
                  key={e.id}
                  className="flex items-start gap-3 rounded-lg bg-[rgba(30,36,53,0.4)] p-3 ring-1 ring-[rgba(180,192,217,0.08)]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={e.severity} />
                      <span className="truncate text-sm font-medium">{e.name}</span>
                    </div>
                    <p className="mt-1 truncate text-xs text-[color:var(--color-text-muted)]">
                      {e.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </GlassCard>

        <div className="overflow-hidden rounded-2xl border border-[rgba(180,192,217,0.15)]">
          <div className="h-80">
            <WeatherMap center={[0, 20]} events={data?.events ?? []} />
          </div>
        </div>
      </div>

      <AIDisasterBriefing />

      <RecentByTypePanel byType={recentByType} loading={isLoading} />
    </div>
  );
}

function CountBadge({
  label,
  Icon,
  count,
  tone,
}: {
  label: string;
  Icon: typeof CloudRain;
  count: number;
  tone: "danger" | "warning" | "info";
}) {
  const colors = {
    danger: "var(--color-danger)",
    warning: "var(--color-warning)",
    info: "var(--color-info)",
  } as const;
  return (
    <GlassCard className="flex items-center gap-3" padded={false}>
      <div className="p-4">
        <Icon className="h-6 w-6" style={{ color: colors[tone] }} />
      </div>
      <div className="py-3 pr-4">
        <div className="text-2xl font-semibold tabular-nums">{count}</div>
        <div className="text-[11px] uppercase tracking-wider text-[color:var(--color-text-muted)]">
          {label}
        </div>
      </div>
    </GlassCard>
  );
}

function RecentByTypePanel({
  byType,
  loading,
}: {
  byType: Record<string, DisasterEvent[]>;
  loading: boolean;
}) {
  const types: { id: DisasterType; label: string; Icon: typeof CloudRain }[] = [
    { id: "flood", label: "Floods", Icon: Waves },
    { id: "wildfire", label: "Wildfires", Icon: Flame },
    { id: "hurricane", label: "Hurricanes", Icon: Wind },
    { id: "blizzard", label: "Blizzards", Icon: CloudHail },
  ];
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {types.map(({ id, label, Icon }) => (
        <GlassCard key={id}>
          <GlassCardHeader>
            <GlassCardTitle className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-[color:var(--color-light)]" /> {label}
            </GlassCardTitle>
            <span className="text-xs text-[color:var(--color-text-muted)]">
              {byType[id]?.length ?? 0}
            </span>
          </GlassCardHeader>
          {loading ? (
            <Skeleton className="h-24" />
          ) : !byType[id]?.length ? (
            <p className="text-xs text-[color:var(--color-text-muted)]">None active.</p>
          ) : (
            <ul className="space-y-1 text-xs">
              {byType[id]!.slice(0, 5).map((e) => (
                <li key={e.id} className="truncate">
                  <span className="text-[color:var(--color-text-muted)]">·</span> {e.name}
                </li>
              ))}
            </ul>
          )}
        </GlassCard>
      ))}
    </div>
  );
}
