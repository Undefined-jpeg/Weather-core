"use client";

import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import type { NwsAlert } from "@/types/alert.types";
import { SeverityBadge } from "@/components/ui/SeverityBadge";

export function AlertBanner({ alerts }: { alerts: NwsAlert[] }) {
  const [dismissed, setDismissed] = useState(false);
  if (!alerts.length || dismissed) return null;
  const top = alerts.find((a) => a.severity === "emergency") ?? alerts[0]!;
  const pulse = top.severity === "emergency" || top.severity === "warning";
  const bg =
    top.severity === "emergency"
      ? "rgba(192,57,43,0.2)"
      : top.severity === "warning"
        ? "rgba(230,126,34,0.18)"
        : "rgba(180,192,217,0.12)";
  const border =
    top.severity === "emergency"
      ? "rgba(192,57,43,0.55)"
      : top.severity === "warning"
        ? "rgba(230,126,34,0.5)"
        : "rgba(180,192,217,0.3)";
  return (
    <div
      role="alert"
      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${pulse ? "pulse-danger" : ""}`}
      style={{ background: bg, borderColor: border }}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <AlertTriangle className="h-5 w-5 shrink-0 text-[color:var(--color-warning)]" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <SeverityBadge severity={top.severity} />
            <span className="truncate text-sm font-medium">{top.event}</span>
          </div>
          <p className="truncate text-xs text-[color:var(--color-text-muted)]">
            {top.areaDesc}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
