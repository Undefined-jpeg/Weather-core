"use client";

import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import { degreesToCardinal, formatWind } from "@/lib/formatters";
import { useUserStore } from "@/stores/useUserStore";

export function WindRose({
  windDeg,
  windSpeed,
  windGust,
}: {
  windDeg: number;
  windSpeed: number;
  windGust?: number;
}) {
  const unit = useUserStore((s) => s.unit);
  const dir = degreesToCardinal(windDeg);
  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Wind</GlassCardTitle>
        <span className="text-xs text-[color:var(--color-text-muted)]">{dir}</span>
      </GlassCardHeader>
      <div className="flex items-center gap-4">
        <div className="relative h-24 w-24">
          <svg viewBox="-50 -50 100 100" className="h-full w-full">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
              <g key={a} transform={`rotate(${a})`}>
                <line x1="0" y1="-42" x2="0" y2="-36" stroke="rgba(180,192,217,0.35)" strokeWidth="1" />
              </g>
            ))}
            {["N", "E", "S", "W"].map((c, i) => (
              <text
                key={c}
                x={[0, 38, 0, -38][i]}
                y={[-38, 4, 42, 4][i]}
                fill="var(--color-text-muted)"
                fontSize="9"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {c}
              </text>
            ))}
            <circle r="32" fill="none" stroke="rgba(180,192,217,0.15)" />
            <g transform={`rotate(${windDeg})`}>
              <path
                d="M 0 -28 L 5 0 L 0 -8 L -5 0 Z"
                fill="var(--color-info)"
              />
            </g>
          </svg>
        </div>
        <div>
          <div className="text-2xl font-semibold tabular-nums">
            {formatWind(windSpeed, unit)}
          </div>
          {typeof windGust === "number" && (
            <div className="text-xs text-[color:var(--color-text-muted)]">
              Gusts {formatWind(windGust, unit)}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
