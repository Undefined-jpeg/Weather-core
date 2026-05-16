"use client";

import { MapPin } from "lucide-react";
import { useMapEvents } from "@/hooks/useDisasters";
import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { Skeleton } from "@/components/ui/Skeleton";

export function LocalEventHighlight({
  lat,
  lon,
  radiusKm = 200,
}: {
  lat: number;
  lon: number;
  radiusKm?: number;
}) {
  const { data, isLoading } = useMapEvents(lat, lon, radiusKm);
  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-[color:var(--color-light)]" />
          Near you ({radiusKm} km)
        </GlassCardTitle>
        <span className="text-xs text-[color:var(--color-text-muted)]">
          {data?.length ?? 0} events
        </span>
      </GlassCardHeader>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
      ) : data && data.length > 0 ? (
        <ul className="space-y-2">
          {data.slice(0, 5).map((e) => (
            <li
              key={e.id}
              className="flex items-start justify-between gap-2 rounded-lg bg-[rgba(30,36,53,0.4)] p-2 ring-1 ring-[rgba(180,192,217,0.06)]"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={e.severity} />
                  <span className="truncate text-sm font-medium">{e.name}</span>
                </div>
                <p className="truncate text-[11px] text-[color:var(--color-text-muted)]">
                  {e.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[color:var(--color-text-muted)]">
          No events within {radiusKm} km.
        </p>
      )}
    </GlassCard>
  );
}
