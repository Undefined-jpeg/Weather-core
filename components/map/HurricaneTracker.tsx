"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Wind } from "lucide-react";
import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import type { HurricaneStorm } from "@/types/disaster.types";

function categoryClass(cat: HurricaneStorm["category"]): string {
  if (cat === 5) return "bg-[color:var(--color-danger)] text-white";
  if (cat === 4) return "bg-[color:var(--color-danger)]/70 text-white";
  if (cat === 3) return "bg-[color:var(--color-warning)] text-white";
  if (cat === 2) return "bg-[color:var(--color-warning)]/70 text-white";
  if (cat === 1) return "bg-[color:var(--color-earth)] text-white";
  return "bg-[color:var(--color-secondary)] text-white";
}

export function HurricaneTracker({
  hurricanes,
}: {
  hurricanes: HurricaneStorm[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-[color:var(--color-warning)]" />
          Active hurricanes & tropical storms
        </GlassCardTitle>
        <span className="text-xs text-[color:var(--color-text-muted)]">
          {hurricanes.length} active
        </span>
      </GlassCardHeader>
      {hurricanes.length === 0 ? (
        <p className="text-sm text-[color:var(--color-text-muted)]">
          No active tropical systems at this time.
        </p>
      ) : (
        <ul className="-mx-2 divide-y divide-[rgba(180,192,217,0.08)]">
          {hurricanes.map((s) => {
            const isOpen = expanded === s.id;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => setExpanded(isOpen ? null : s.id)}
                  className="grid w-full grid-cols-[auto_1fr_auto_auto] items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-[rgba(180,192,217,0.04)]"
                  aria-expanded={isOpen}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold ${categoryClass(s.category)}`}
                  >
                    {typeof s.category === "number" ? `C${s.category}` : s.category}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{s.name}</div>
                    <div className="text-xs text-[color:var(--color-text-muted)]">
                      {s.lat.toFixed(1)}°, {s.lon.toFixed(1)}° · {s.windSpeedKnots} kt ·{" "}
                      {s.pressureMb} hPa
                    </div>
                  </div>
                  <SeverityBadge severity={s.severity} />
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-[color:var(--color-text-muted)]" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-[color:var(--color-text-muted)]" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-12 pb-4 text-sm">
                    <p className="text-[color:var(--color-text-muted)]">
                      {s.description}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <Pair k="Wind speed" v={`${s.windSpeedKnots} kt`} />
                      <Pair k="Pressure" v={`${s.pressureMb} hPa`} />
                      <Pair k="Movement" v={`${s.movementSpeedKnots} kt @ ${s.movementDirection}°`} />
                      <Pair k="Projected landfall" v={s.projectedLandfall ?? "—"} />
                    </div>
                    {s.sourceUrl && (
                      <a
                        href={s.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-block text-xs text-[color:var(--color-light)] hover:underline"
                      >
                        Public advisory →
                      </a>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </GlassCard>
  );
}

function Pair({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-[color:var(--color-text-muted)]">
        {k}
      </div>
      <div className="font-medium">{v}</div>
    </div>
  );
}
