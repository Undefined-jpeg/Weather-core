"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertOctagon, Newspaper, RefreshCw } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { useAlerts } from "@/hooks/useAlerts";
import { useNews } from "@/hooks/useNews";
import { isAlertMuted, readMutedPatterns, writeMutedPatterns } from "@/lib/alertMute";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { SevereWeatherAlert } from "@/components/alerts/SevereWeatherAlert";
import { NewsCard } from "@/components/alerts/NewsCard";
import type { NewsCategory } from "@/types/alert.types";

const CATEGORIES: { id: NewsCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "hurricane", label: "Hurricanes" },
  { id: "tornado", label: "Tornadoes" },
  { id: "flood", label: "Floods" },
  { id: "wildfire", label: "Wildfires" },
  { id: "climate", label: "Climate" },
  { id: "forecast", label: "Forecasts" },
  { id: "local", label: "Local" },
];

const EXTREME_EVENTS = ["tornado warning", "hurricane warning", "flash flood emergency"];

export default function AlertsPage() {
  const loc = useUserStore((s) => s.currentLocation);
  const alerts = useAlerts(loc?.lat, loc?.lon);
  const [category, setCategory] = useState<NewsCategory>("all");
  const news = useNews(category);

  const [muted, setMuted] = useState<string[]>([]);
  const [muteDraft, setMuteDraft] = useState("");

  useEffect(() => {
    setMuted(readMutedPatterns());
  }, []);

  useEffect(() => {
    writeMutedPatterns(muted);
  }, [muted]);

  const visibleAlerts = useMemo(() => {
    const list = alerts.data ?? [];
    return list.filter(
      (a) => !isAlertMuted(`${a.event} ${a.headline}`, muted),
    );
  }, [alerts.data, muted]);

  const extreme = useMemo(
    () =>
      (alerts.data ?? []).find((a) =>
        EXTREME_EVENTS.some((kw) => a.event.toLowerCase().includes(kw)),
      ),
    [alerts.data],
  );

  return (
    <div className="space-y-5">
      {extreme && (
        <div
          role="alert"
          className="pulse-danger flex items-center gap-3 rounded-xl border px-4 py-3"
          style={{
            background: "rgba(192,57,43,0.2)",
            borderColor: "rgba(192,57,43,0.6)",
          }}
        >
          <AlertOctagon className="h-6 w-6 shrink-0 text-[color:var(--color-danger)]" />
          <div className="min-w-0 flex-1">
            <p className="font-bold uppercase tracking-wide text-[color:var(--color-danger)]">
              EXTREME WARNING — {extreme.event}
            </p>
            <p className="truncate text-sm">{extreme.headline}</p>
          </div>
        </div>
      )}

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">News & alerts</h1>
        <p className="text-sm text-[color:var(--color-text-muted)]">
          NWS/NOAA alerts for your area · Real-time weather news
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Left column: alerts */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[color:var(--color-text-muted)]">
              Breaking alerts
            </h2>
            <button
              type="button"
              onClick={() => alerts.refetch()}
              disabled={alerts.isFetching}
              className="text-xs text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]"
              aria-label="Refresh alerts"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${alerts.isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>
          <div className="mb-3 space-y-2 rounded-xl bg-[rgba(30,36,53,0.45)] px-3 py-2 ring-1 ring-[rgba(180,192,217,0.1)]">
            <p className="text-[10px] uppercase tracking-wide text-[color:var(--color-text-muted)]">
              Hide headline rows containing substring (client-only)
            </p>
            <div className="flex gap-2">
              <input
                value={muteDraft}
                onChange={(e) => setMuteDraft(e.target.value)}
                placeholder="e.g. special weather statement"
                className="flex-1 rounded-lg bg-[rgba(30,36,53,0.6)] px-2 py-1.5 text-xs ring-1 ring-[rgba(180,192,217,0.12)] focus:outline-none focus:ring-[color:var(--color-light)]/40"
              />
              <button
                type="button"
                onClick={() => {
                  const t = muteDraft.trim();
                  if (t)
                    setMuted((m) =>
                      m.includes(t) ? m : [...m, t].slice(0, 48),
                    );
                  setMuteDraft("");
                }}
                className="rounded-lg bg-[color:var(--color-primary)]/35 px-2 py-1 text-[11px] ring-1 ring-[color:var(--color-light)]/25"
              >
                Mute
              </button>
            </div>
            {muted.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {muted.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMuted((x) => x.filter((y) => y !== m))}
                    className="rounded-full bg-[rgba(180,192,217,0.1)] px-2 py-0.5 text-[10px] text-[color:var(--color-text-muted)] hover:bg-[rgba(192,57,43,0.2)] hover:text-[color:var(--color-danger)]"
                  >
                    {m} ✕
                  </button>
                ))}
              </div>
            )}
          </div>
          {!loc ? (
            <GlassCard>
              <p className="text-sm text-[color:var(--color-text-muted)]">
                Locate yourself first to see local NWS alerts.
              </p>
            </GlassCard>
          ) : alerts.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </div>
          ) : (alerts.data?.length ?? 0) === 0 ? (
            <GlassCard>
              <p className="text-sm text-[color:var(--color-text-muted)]">
                No active alerts for your area. Stay safe.
              </p>
            </GlassCard>
          ) : visibleAlerts.length === 0 ? (
            <GlassCard>
              <p className="text-sm text-[color:var(--color-text-muted)]">
                Alerts exist but everything matches your mute list. Trim phrases
                above if that was unintentional.
              </p>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {visibleAlerts.map((a) => (
                <SevereWeatherAlert key={a.id} alert={a} />
              ))}
            </div>
          )}
        </section>

        {/* Right column: news */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[color:var(--color-text-muted)]">
              <Newspaper className="h-3.5 w-3.5" /> Weather news
            </h2>
          </div>
          <div className="-mx-1 mb-3 flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                className={`rounded-full px-3 py-1 text-xs transition ${
                  category === c.id
                    ? "bg-[color:var(--color-primary)]/40 text-[color:var(--color-text-primary)] ring-1 ring-[color:var(--color-light)]/30"
                    : "text-[color:var(--color-text-muted)] hover:bg-[rgba(180,192,217,0.08)]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          {news.isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-64 rounded-2xl" />
              <Skeleton className="h-64 rounded-2xl" />
            </div>
          ) : (
            <div className="space-y-3">
              {(news.data ?? []).map((a) => (
                <NewsCard key={a.id} article={a} />
              ))}
              {(news.data ?? []).length === 0 && (
                <GlassCard>
                  <p className="text-sm text-[color:var(--color-text-muted)]">
                    No articles found for this category.
                  </p>
                </GlassCard>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
