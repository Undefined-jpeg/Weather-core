"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CloudLightning } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { formatTemp } from "@/lib/formatters";
import type { Unit, WidgetWeatherCompact } from "@/types/weather.types";

async function fetchWidgetPayload(
  lat: number,
  lon: number,
): Promise<WidgetWeatherCompact | null> {
  const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}&minimal=1`);
  if (!res.ok) return null;
  return res.json();
}

export default function CompactWidgetPage() {
  const loc = useUserStore((s) => s.currentLocation);
  const unit = useUserStore((s) => s.unit) as Unit;
  const [data, setData] = useState<WidgetWeatherCompact | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      let la = loc?.lat;
      let lo = loc?.lon;
      if (typeof window !== "undefined") {
        const u = new URLSearchParams(window.location.search);
        const ql = Number(u.get("lat"));
        const qo = Number(u.get("lon"));
        if (Number.isFinite(ql) && Number.isFinite(qo)) {
          la = ql;
          lo = qo;
        }
      }
      if (typeof la !== "number" || typeof lo !== "number") {
        setErr("Share ?lat=&lon= or pin a saved location.");
        return;
      }
      const d = await fetchWidgetPayload(la, lo).catch(() => null);
      if (!d) {
        setErr("Forecast unavailable.");
        return;
      }
      setData(d);
      setErr(null);
    }
    void load();
  }, [loc?.lat, loc?.lon, unit]);

  return (
    <div className="flex min-h-dvh flex-col p-5">
      <div className="mb-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[color:var(--color-primary)]/30 ring-1 ring-[color:var(--color-light)]/25">
            <CloudLightning className="h-5 w-5 text-[color:var(--color-light)]" strokeWidth={2} />
          </span>
          <span className="text-sm font-semibold tracking-tight">WeatherCore</span>
        </div>
        <Link
          href="/"
          className="text-[11px] text-[color:var(--color-light)] underline underline-offset-2 hover:text-[color:var(--color-text-primary)]"
        >
          Open app
        </Link>
      </div>

      {err ? (
        <p className="mt-auto text-sm text-[color:var(--color-text-muted)]">{err}</p>
      ) : !data ? (
        <div className="space-y-2">
          <div className="h-8 animate-pulse rounded-lg bg-[rgba(180,192,217,0.08)]" />
          <div className="h-6 w-2/3 animate-pulse rounded-lg bg-[rgba(180,192,217,0.06)]" />
        </div>
      ) : (
        <div className="mt-auto space-y-1">
          {data.cached && (
            <p className="text-[10px] uppercase tracking-wider text-[color:var(--color-warning)]">
              Cached upstream snapshot
            </p>
          )}
          <p className="truncate text-xs text-[color:var(--color-text-muted)]">
            {data.location.name}
            {data.location.country ? ` · ${data.location.country}` : ""}
          </p>
          <p className="text-5xl font-semibold tabular-nums">
            {formatTemp(data.current.temp, unit)}
          </p>
          <p className="text-sm capitalize text-[color:var(--color-text-muted)]">
            {data.current.condition}
          </p>
          {typeof data.nextPopMax === "number" && (
            <p className="pt-2 text-xs text-[color:var(--color-text-muted)]">
              Elevated hourly PoP:&nbsp;
              <span className="text-[color:var(--color-light)]">
                ~{Math.round(data.nextPopMax * 100)}%
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
