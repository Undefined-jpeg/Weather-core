"use client";

import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import { uvLevel } from "@/lib/formatters";

export function UVIndex({ uv }: { uv: number }) {
  const level = uvLevel(uv);
  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Humidity & UV</GlassCardTitle>
      </GlassCardHeader>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-semibold">{uv.toFixed(1)}</span>
          <span className="text-xs uppercase tracking-wider text-[color:var(--color-text-muted)]">
            UV Index
          </span>
        </div>
        <p className="mt-1 text-xs font-medium" style={{ color: level.color }}>
          {level.label}
        </p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[rgba(180,192,217,0.1)]">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(uv * 9, 100)}%`,
              background: "linear-gradient(90deg, #70735a, #f3c969, #e67e22, #c0392b)",
            }}
          />
        </div>
      </div>
    </GlassCard>
  );
}
