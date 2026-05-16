"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Clock, MapPin } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { formatDistanceToNow } from "date-fns";
import type { NwsAlert } from "@/types/alert.types";

export function SevereWeatherAlert({ alert }: { alert: NwsAlert }) {
  const [open, setOpen] = useState(false);
  return (
    <GlassCard padded={false}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={alert.severity} />
            <span className="text-sm font-semibold">{alert.event}</span>
          </div>
          <p className="mt-1 truncate text-xs text-[color:var(--color-text-muted)]">
            {alert.headline}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-wider text-[color:var(--color-text-muted)]">
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {alert.areaDesc.slice(0, 80)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />{" "}
              {alert.effective ? `${formatDistanceToNow(new Date(alert.effective))} ago` : ""}
            </span>
          </div>
        </div>
        {open ? (
          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-text-muted)]" />
        ) : (
          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-text-muted)]" />
        )}
      </button>
      {open && (
        <div className="space-y-3 border-t border-[rgba(180,192,217,0.08)] p-4 text-sm">
          <p className="whitespace-pre-line text-[color:var(--color-text-primary)]">
            {alert.description}
          </p>
          {alert.instruction && (
            <div className="rounded-lg bg-[color:var(--color-warning)]/10 p-3 ring-1 ring-[color:var(--color-warning)]/30">
              <p className="text-[10px] uppercase tracking-wider text-[color:var(--color-warning)]">
                Instructions
              </p>
              <p className="mt-1 whitespace-pre-line text-sm">{alert.instruction}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 text-xs text-[color:var(--color-text-muted)]">
            <span>Issued by {alert.senderName}</span>
            <span>Expires {alert.expires ? new Date(alert.expires).toLocaleString() : "—"}</span>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
