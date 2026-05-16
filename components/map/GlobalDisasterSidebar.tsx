"use client";

import { ChevronRight, AlertTriangle, Link2 } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { useDisasters } from "@/hooks/useDisasters";
import { useMapStore } from "@/stores/useMapStore";
import { formatDistanceToNow } from "date-fns";

export function GlobalDisasterSidebar({
  onSelectEvent,
  onCopyShareLink,
}: {
  onSelectEvent: (lat: number, lon: number, id: string) => void;
  onCopyShareLink?: (lat: number, lon: number, id: string) => void;
}) {
  const { data, isLoading } = useDisasters();
  const sidebarOpen = useMapStore((s) => s.sidebarOpen);

  if (!sidebarOpen) return null;

  return (
    <GlassCard variant="strong" className="min-w-[20rem] max-w-sm">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-[color:var(--color-warning)]" />
        <h3 className="text-sm font-semibold">Global events</h3>
        <span className="ml-auto text-xs text-[color:var(--color-text-muted)]">
          {data?.events.length ?? 0}
        </span>
      </div>
      <ul className="-mx-1 max-h-[60vh] space-y-1 overflow-y-auto pr-1">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <li key={i}>
              <Skeleton className="h-12 rounded-lg" />
            </li>
          ))}
        {data?.events.slice(0, 50).map((e) => (
          <li key={e.id}>
            <div className="flex w-full items-start gap-1">
              <button
                type="button"
                onClick={() => onSelectEvent(e.lat, e.lon, e.id)}
                className="flex min-w-0 flex-1 items-start gap-2 rounded-lg p-2 text-left transition hover:bg-[rgba(180,192,217,0.06)]"
              >
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={e.severity} />
                  <span className="truncate text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                    {e.type.replace(/-/g, " ")}
                  </span>
                </div>
                <div className="mt-1 truncate text-sm font-medium">
                  {e.name ?? "Event"}
                </div>
                <div className="truncate text-[11px] text-[color:var(--color-text-muted)]">
                  {e.updatedAt ? `Updated ${formatDistanceToNow(new Date(e.updatedAt))} ago` : ""}
                </div>
              </div>
              </button>
              {onCopyShareLink && (
                <button
                  type="button"
                  title="Copy map link"
                  aria-label="Copy map link"
                  onClick={(ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    onCopyShareLink(e.lat, e.lon, e.id);
                  }}
                  className="mt-1 shrink-0 rounded-lg p-1.5 text-[color:var(--color-text-muted)] hover:bg-[rgba(180,192,217,0.08)] hover:text-[color:var(--color-light)]"
                >
                  <Link2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </li>
        ))}
        {data && data.events.length === 0 && (
          <li className="px-2 py-4 text-center text-xs text-[color:var(--color-text-muted)]">
            No active global events.
          </li>
        )}
      </ul>
    </GlassCard>
  );
}
