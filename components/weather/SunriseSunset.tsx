"use client";

import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import { Sunrise, Sunset } from "lucide-react";
import { clamp } from "@/lib/utils";

export function SunriseSunset({
  sunrise,
  sunset,
}: {
  sunrise: number;
  sunset: number;
}) {
  const now = Date.now() / 1000;
  const progress = clamp((now - sunrise) / Math.max(sunset - sunrise, 1), 0, 1);
  const x = 10 + progress * 180;
  const y = 90 - Math.sin(progress * Math.PI) * 75;
  const sunriseStr = new Date(sunrise * 1000).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const sunsetStr = new Date(sunset * 1000).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return (
    <GlassCard>
      <GlassCardHeader>
        <GlassCardTitle>Sun cycle</GlassCardTitle>
      </GlassCardHeader>
      <div className="relative">
        <svg viewBox="0 0 200 100" className="h-24 w-full">
          <defs>
            <linearGradient id="arc" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#e67e22" />
              <stop offset="50%" stopColor="#f3c969" />
              <stop offset="100%" stopColor="#344973" />
            </linearGradient>
          </defs>
          <path
            d="M 10 90 Q 100 -10 190 90"
            fill="none"
            stroke="url(#arc)"
            strokeWidth="2"
            strokeDasharray="2 3"
            opacity="0.7"
          />
          <circle cx={x} cy={y} r="6" fill="#f3c969" />
          <line x1="10" y1="90" x2="190" y2="90" stroke="rgba(180,192,217,0.2)" />
        </svg>
      </div>
      <div className="mt-2 flex justify-between text-xs text-[color:var(--color-text-muted)]">
        <span className="flex items-center gap-1.5">
          <Sunrise className="h-3.5 w-3.5" /> {sunriseStr}
        </span>
        <span className="flex items-center gap-1.5">
          <Sunset className="h-3.5 w-3.5" /> {sunsetStr}
        </span>
      </div>
    </GlassCard>
  );
}
