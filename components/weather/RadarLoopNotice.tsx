"use client";

import { Pause } from "lucide-react";

export function RadarLoopNotice() {
  return (
    <div className="mt-3 flex items-start gap-2 rounded-lg border border-[rgba(180,192,217,0.15)] bg-[rgba(30,36,53,0.72)] px-3 py-2 text-[10px] leading-snug text-[color:var(--color-text-muted)]">
      <Pause className="mt-0.5 h-4 w-4 shrink-0 text-[color:var(--color-info)]" />
      <div>
        <span className="font-semibold text-[color:var(--color-light)]">
          Radar loop unavailable here.
        </span>{" "}
        OpenWeatherMap&apos;s precipitation tiles expose a snapshot composite rather than archived
        frame timestamps suitable for looping. For looping reflectivity consult your national mosaic
        (e.g., NOAA Radar) when safety-critical.
      </div>
    </div>
  );
}
