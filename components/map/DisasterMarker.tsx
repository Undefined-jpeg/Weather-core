"use client";

import { cn } from "@/lib/utils";
import type { DisasterType, Severity } from "@/types/disaster.types";

const COLORS: Record<DisasterType, string> = {
  hurricane: "var(--color-danger)",
  "tropical-storm": "var(--color-warning)",
  tornado: "var(--color-danger)",
  flood: "var(--color-info)",
  blizzard: "var(--color-light)",
  "winter-storm": "var(--color-light)",
  wildfire: "var(--color-warning)",
  earthquake: "var(--color-earth)",
  tsunami: "var(--color-info)",
  drought: "var(--color-neutral)",
  volcano: "var(--color-danger)",
  "severe-thunderstorm": "var(--color-warning)",
};

export function DisasterMarker({
  type,
  severity,
  size = 16,
  className,
}: {
  type: DisasterType;
  severity: Severity;
  size?: number;
  className?: string;
}) {
  const color = COLORS[type];
  const isUrgent = severity === "emergency" || severity === "warning";
  return (
    <span
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      {isUrgent && (
        <span
          className="absolute inset-0 rounded-full pulse-ring"
          style={{ background: color, opacity: 0.35 }}
        />
      )}
      <span
        className="absolute inset-0 rounded-full"
        style={{ background: color }}
      />
      <span
        className="absolute inset-[3px] rounded-full"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(0,0,0,0.2))",
          mixBlendMode: "overlay",
        }}
      />
    </span>
  );
}
