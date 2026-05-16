"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Check, LogOut, MapPin, Plus, Sparkles, Trash2 } from "lucide-react";
import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import { useUserStore } from "@/stores/useUserStore";
import type { LocationInfo, Unit } from "@/types/weather.types";
import type { BriefingVerbosity } from "@/lib/gemini";

export default function SettingsPage() {
  const { data: session } = useSession();
  const unit = useUserStore((s) => s.unit);
  const setUnit = useUserStore((s) => s.setUnit);
  const saved = useUserStore((s) => s.savedLocations);
  const addSaved = useUserStore((s) => s.addSaved);
  const removeSaved = useUserStore((s) => s.removeSaved);
  const current = useUserStore((s) => s.currentLocation);
  const setCurrentLocation = useUserStore((s) => s.setCurrentLocation);
  const setHasAskedLocation = useUserStore((s) => s.setHasAskedLocation);
  const reducedMotion = useUserStore((s) => s.reducedMotion);
  const setReducedMotion = useUserStore((s) => s.setReducedMotion);
  const suppressedInstall = useUserStore((s) => s.suppressInstallPrompt);
  const setSuppressInstallPrompt = useUserStore((s) => s.setSuppressInstallPrompt);
  const verbosity = useUserStore((s) => s.briefingVerbosity);
  const setVerbosity = useUserStore((s) => s.setBriefingVerbosity);
  const windAlertMps = useUserStore((s) => s.windAlertMps);
  const tempAlertC = useUserStore((s) => s.tempAlertC);
  const popAlertFraction = useUserStore((s) => s.popAlertFraction);
  const setWindAlertMps = useUserStore((s) => s.setWindAlertMps);
  const setTempAlertC = useUserStore((s) => s.setTempAlertC);
  const setPopAlertFraction = useUserStore((s) => s.setPopAlertFraction);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationInfo[]>([]);
  const [searching, setSearching] = useState(false);
  const [persisting, setPersisting] = useState(false);
  const [digestOn, setDigestOn] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch("/api/user/preferences")
      .then((r) => (r.ok ? r.json() : null))
      .then(
        (p: {
          preferredUnit?: Unit;
          savedLocations?: LocationInfo[];
          digestEmailEnabled?: boolean;
        } | null) => {
          if (!p) return;
          if (p.preferredUnit) setUnit(p.preferredUnit);
          setDigestOn(Boolean(p.digestEmailEnabled));
        },
      )
      .catch(() => {});
  }, [session?.user?.id, setUnit]);

  async function persist(updates: { unit?: Unit; savedLocations?: LocationInfo[] }) {
    if (!session?.user?.id) return;
    setPersisting(true);
    await fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }).catch(() => {});
    setPersisting(false);
  }

  async function persistDigest(enabled: boolean) {
    if (!session?.user?.id) return;
    setPersisting(true);
    await fetch("/api/user/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ digestEmailEnabled: enabled }),
    }).catch(() => {});
    setDigestOn(enabled);
    setPersisting(false);
  }

  async function search() {
    if (!query) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/geo/search?q=${encodeURIComponent(query)}`);
      const j = (await res.json()) as { results: LocationInfo[] };
      setResults(j.results);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-[color:var(--color-text-muted)]">
          {session?.user?.email ?? "Local preferences (sign in to sync)"}
        </p>
      </div>

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Units</GlassCardTitle>
        </GlassCardHeader>
        <div className="inline-flex overflow-hidden rounded-xl ring-1 ring-[rgba(180,192,217,0.18)]">
          {(["metric", "imperial"] as Unit[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => {
                setUnit(u);
                void persist({ unit: u });
              }}
              className={`px-4 py-2 text-sm transition ${
                unit === u
                  ? "bg-[color:var(--color-primary)]/40 text-[color:var(--color-text-primary)]"
                  : "text-[color:var(--color-text-muted)] hover:bg-[rgba(180,192,217,0.08)]"
              }`}
            >
              {u === "metric" ? "Metric (°C, km/h)" : "Imperial (°F, mph)"}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Saved locations</GlassCardTitle>
          <span className="text-xs text-[color:var(--color-text-muted)]">
            {saved.length}/5
          </span>
        </GlassCardHeader>
        <ul className="space-y-2">
          {saved.map((l) => {
            const isCurrent =
              current && current.lat === l.lat && current.lon === l.lon;
            return (
              <li
                key={`${l.lat},${l.lon}`}
                className="flex items-center justify-between gap-2 rounded-lg bg-[rgba(30,36,53,0.5)] px-3 py-2"
              >
                <button
                  type="button"
                  onClick={() => {
                    setCurrentLocation(l);
                    setHasAskedLocation(true);
                  }}
                  className="flex flex-1 items-center gap-2 truncate text-left text-sm hover:text-[color:var(--color-light)]"
                >
                  <MapPin
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isCurrent
                        ? "text-[color:var(--color-light)]"
                        : "text-[color:var(--color-text-muted)]"
                    }`}
                  />
                  <span className="truncate">{l.name}</span>
                  {l.country && (
                    <span className="text-xs text-[color:var(--color-text-muted)]">
                      , {l.country}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[color:var(--color-primary)]/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[color:var(--color-light)] ring-1 ring-[color:var(--color-light)]/30">
                      <Check className="h-2.5 w-2.5" /> Current
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    removeSaved(l);
                    void persist({
                      savedLocations: saved.filter(
                        (x) => !(x.lat === l.lat && x.lon === l.lon),
                      ),
                    });
                  }}
                  className="shrink-0 text-[color:var(--color-text-muted)] hover:text-[color:var(--color-danger)]"
                  aria-label="Remove"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            );
          })}
          {saved.length === 0 && (
            <li className="text-xs text-[color:var(--color-text-muted)]">
              No saved locations yet.
            </li>
          )}
        </ul>

        {saved.length < 5 && (
          <div className="mt-4 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="Search city or place…"
                className="flex-1 rounded-lg bg-[rgba(30,36,53,0.6)] px-3 py-2 text-sm ring-1 ring-[rgba(180,192,217,0.15)] focus:outline-none focus:ring-[color:var(--color-light)]/50"
              />
              <button
                type="button"
                onClick={search}
                disabled={searching || !query}
                className="rounded-lg bg-[color:var(--color-primary)]/40 px-4 py-2 text-sm ring-1 ring-[color:var(--color-light)]/30 hover:bg-[color:var(--color-primary)]/60 disabled:opacity-50"
              >
                Search
              </button>
            </div>
            {results.length > 0 && (
              <ul className="space-y-1 rounded-lg bg-[rgba(30,36,53,0.5)] p-2 ring-1 ring-[rgba(180,192,217,0.1)]">
                {results.map((r) => (
                  <li
                    key={`${r.lat},${r.lon}`}
                    className="flex items-center justify-between rounded px-2 py-1 text-sm hover:bg-[rgba(180,192,217,0.06)]"
                  >
                    <span>
                      {r.name}
                      {r.region && <span className="text-[color:var(--color-text-muted)]">, {r.region}</span>}
                      {r.country && <span className="text-[color:var(--color-text-muted)]">, {r.country}</span>}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        addSaved(r);
                        setResults([]);
                        setQuery("");
                        void persist({ savedLocations: [...saved, r] });
                      }}
                      className="text-[color:var(--color-light)] hover:text-[color:var(--color-text-primary)]"
                      aria-label="Add"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {persisting && (
          <p className="mt-2 text-[10px] uppercase tracking-wider text-[color:var(--color-text-muted)]">
            Syncing…
          </p>
        )}
      </GlassCard>

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>AI briefing</GlassCardTitle>
        </GlassCardHeader>
        <p className="mb-3 text-xs text-[color:var(--color-text-muted)]">
          Length affects streaming prompts and cache keys.
        </p>
        <div className="inline-flex flex-wrap gap-1 rounded-xl p-1 ring-1 ring-[rgba(180,192,217,0.15)]">
          {(["short", "standard", "long"] as BriefingVerbosity[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVerbosity(v)}
              className={`rounded-lg px-3 py-1.5 text-xs capitalize transition ${
                verbosity === v
                  ? "bg-[color:var(--color-primary)]/45 text-[color:var(--color-text-primary)]"
                  : "text-[color:var(--color-text-muted)] hover:bg-[rgba(180,192,217,0.06)]"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <label className="mt-4 flex cursor-pointer items-start gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={suppressedInstall}
            onClick={() => setSuppressInstallPrompt(!suppressedInstall)}
            className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${
              suppressedInstall
                ? "bg-[color:var(--color-primary)]/60"
                : "bg-[rgba(180,192,217,0.15)]"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-[color:var(--color-text-primary)] transition-all ${
                suppressedInstall ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
          <span>
            <span className="text-sm">Hide install hints</span>
            <span className="block text-xs text-[color:var(--color-text-muted)]">
              Stops the Safari / Chromium add-to-home-screen toast from returning (local only).
            </span>
          </span>
        </label>
      </GlassCard>

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Local threshold watch</GlassCardTitle>
        </GlassCardHeader>
        <p className="mb-3 text-xs text-[color:var(--color-text-muted)]">
          Dashboard banner when model hourly data crosses these numbers. Not a replacement for
          official warnings.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-xs text-[color:var(--color-text-muted)]">
            Wind (m/s)
            <input
              type="number"
              step="0.5"
              min="0"
              placeholder="15"
              value={windAlertMps ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setWindAlertMps(v === "" ? null : Number(v));
              }}
              className="mt-1 w-full rounded-lg bg-[rgba(30,36,53,0.6)] px-2 py-1.5 text-sm ring-1 ring-[rgba(180,192,217,0.12)]"
            />
          </label>
          <label className="text-xs text-[color:var(--color-text-muted)]">
            Heat (°C min)
            <input
              type="number"
              step="1"
              placeholder="35"
              value={tempAlertC ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                setTempAlertC(v === "" ? null : Number(v));
              }}
              className="mt-1 w-full rounded-lg bg-[rgba(30,36,53,0.6)] px-2 py-1.5 text-sm ring-1 ring-[rgba(180,192,217,0.12)]"
            />
          </label>
          <label className="text-xs text-[color:var(--color-text-muted)]">
            Rain probability (%)
            <input
              type="number"
              min="5"
              max="100"
              step="5"
              placeholder="60"
              value={
                popAlertFraction != null
                  ? Math.round(popAlertFraction * 100)
                  : ""
              }
              onChange={(e) => {
                const v = e.target.value;
                setPopAlertFraction(
                  v === "" ? null : Math.min(1, Math.max(0.05, Number(v) / 100)),
                );
              }}
              className="mt-1 w-full rounded-lg bg-[rgba(30,36,53,0.6)] px-2 py-1.5 text-sm ring-1 ring-[rgba(180,192,217,0.12)]"
            />
          </label>
        </div>
        <button
          type="button"
          className="mt-3 rounded-lg px-3 py-1.5 text-xs text-[color:var(--color-text-muted)] ring-1 ring-[rgba(180,192,217,0.15)] hover:text-[color:var(--color-text-primary)]"
          onClick={() => {
            setWindAlertMps(null);
            setTempAlertC(null);
            setPopAlertFraction(null);
          }}
        >
          Clear thresholds
        </button>
      </GlassCard>

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle>Desktop notifications</GlassCardTitle>
        </GlassCardHeader>
        <p className="text-xs text-[color:var(--color-text-muted)]">
          Asks the browser permission (Chromium/WebKit policy still requires deliberate user taps
          elsewhere for auto prompts).
        </p>
        <button
          type="button"
          onClick={() => {
            void Notification.requestPermission();
          }}
          className="mt-3 rounded-lg bg-[color:var(--color-primary)]/35 px-4 py-2 text-sm ring-1 ring-[color:var(--color-light)]/28"
        >
          Request notification permission
        </button>
      </GlassCard>

      {session?.user?.id && (
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Morning digest email</GlassCardTitle>
          </GlassCardHeader>
          <p className="mb-3 text-xs text-[color:var(--color-text-muted)]">
            Uses your{" "}
            <strong className="text-[color:var(--color-text-primary)]">
              first saved location
            </strong>{" "}
            at send time · requires cron + Resend secrets.
          </p>
          <label className="flex cursor-pointer items-start gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={digestOn}
              onClick={() => void persistDigest(!digestOn)}
              disabled={persisting}
              className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${
                digestOn ? "bg-[color:var(--color-primary)]/60" : "bg-[rgba(180,192,217,0.15)]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-[color:var(--color-text-primary)] transition-all ${
                  digestOn ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
            <span>
              <span className="text-sm">Daily digest emails</span>
              <span className="block text-xs text-[color:var(--color-text-muted)]">
                Unsubscribe link included in each email. Manual escape hatch:{" "}
                <code className="break-all font-mono text-[10px] text-[color:var(--color-light)]">
                  /api/digest/unsubscribe?token=…
                </code>
              </span>
            </span>
          </label>
        </GlassCard>
      )}

      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[color:var(--color-light)]" />
            Animations
          </GlassCardTitle>
        </GlassCardHeader>
        <label className="flex cursor-pointer items-start gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={reducedMotion}
            onClick={() => setReducedMotion(!reducedMotion)}
            className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition ${
              reducedMotion
                ? "bg-[color:var(--color-primary)]/60"
                : "bg-[rgba(180,192,217,0.15)]"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-[color:var(--color-text-primary)] transition-all ${
                reducedMotion ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
          <span>
            <span className="text-sm">Reduce motion</span>
            <span className="block text-xs text-[color:var(--color-text-muted)]">
              Disables background particles, lightning flashes, and other heavy
              animations. Also turned on automatically when your OS requests
              reduced motion.
            </span>
          </span>
        </label>
      </GlassCard>

      {session?.user && (
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Account</GlassCardTitle>
          </GlassCardHeader>
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex items-center gap-2 rounded-lg bg-[color:var(--color-danger)]/20 px-4 py-2 text-sm text-[color:var(--color-danger)] ring-1 ring-[color:var(--color-danger)]/40 hover:bg-[color:var(--color-danger)]/30"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </GlassCard>
      )}
    </div>
  );
}
