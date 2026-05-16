"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Link2 } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { useMapStore } from "@/stores/useMapStore";
import { useMapBookmarksStore } from "@/stores/useMapBookmarksStore";
import { useDisasters } from "@/hooks/useDisasters";
import { locationKey } from "@/lib/weather";
import { buildMapDeepLink } from "@/lib/mapDeepLink";
import { LayerToggle } from "@/components/map/LayerToggle";
import { GlobalDisasterSidebar } from "@/components/map/GlobalDisasterSidebar";
import { AINearbyBriefing } from "@/components/ai/AINearbyBriefing";
import { GlassCard } from "@/components/ui/GlassCard";

const WeatherMap = dynamic(
  () => import("@/components/map/WeatherMap").then((m) => m.WeatherMap),
  { ssr: false, loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-[rgba(30,36,53,0.5)]" /> },
);

export default function MapPage() {
  const loc = useUserStore((s) => s.currentLocation);
  const mapViewport = useMapStore((s) => s.mapViewport);
  const setMapViewport = useMapStore((s) => s.setMapViewport);
  const setSelectedEventId = useMapStore((s) => s.setSelectedEventId);
  const bookmarks = useMapBookmarksStore((s) => s.bookmarks);
  const addBookmark = useMapBookmarksStore((s) => s.addBookmark);
  const removeBookmark = useMapBookmarksStore((s) => s.removeBookmark);
  const { data } = useDisasters();
  const [override, setOverride] = useState<[number, number] | null>(null);

  /** Deep-link zoom (from ?z=); falls back to persisted viewport zoom. */
  const [deeplinkZoom, setDeeplinkZoom] = useState<number | undefined>(
    undefined,
  );

  const lastVp = useRef<{ center: [number, number]; zoom: number }>({
    center: [0, 20],
    zoom: 6,
  });

  const urlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const locKey = useMemo(
    () => (loc ? locationKey(loc.lat, loc.lon) : ""),
    [loc],
  );

  useEffect(() => {
    setOverride(null);
    setDeeplinkZoom(undefined);
  }, [locKey]);

  /** Parse /map?lat=&lon=&z=&event= once on mount */
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    const la = Number(p.get("lat"));
    const lo = Number(p.get("lon"));
    if (Number.isFinite(la) && Number.isFinite(lo)) {
      setOverride([lo, la]);
      const zz = Number(p.get("z"));
      if (Number.isFinite(zz)) setDeeplinkZoom(Math.min(18, Math.max(2, zz)));
      const ev = p.get("event");
      if (ev) setSelectedEventId(ev);
    }
  }, [setSelectedEventId]);

  const matchPersisted = Boolean(
    loc && mapViewport && mapViewport.key === locKey,
  );

  const center: [number, number] = useMemo(() => {
    if (!loc) return [0, 20];
    if (override) return override;
    if (matchPersisted) return mapViewport!.center;
    return [loc.lon, loc.lat];
  }, [loc, override, matchPersisted, mapViewport]);

  const targetZoom =
    deeplinkZoom ??
    (matchPersisted && mapViewport ? mapViewport.zoom : undefined);

  useEffect(() => {
    lastVp.current = { center, zoom: targetZoom ?? lastVp.current.zoom };
  }, [center, targetZoom]);

  function scheduleUrlReplace(c: [number, number], z: number) {
    lastVp.current = { center: c, zoom: z };
    if (typeof window === "undefined") return;
    if (urlTimer.current) clearTimeout(urlTimer.current);
    urlTimer.current = setTimeout(() => {
      const absolute = buildMapDeepLink(window.location.origin, {
        center: c,
        zoom: z,
        event: null,
      });
      const relative = absolute.replace(window.location.origin, "");
      window.history.replaceState({}, "", relative || "?");
      urlTimer.current = null;
    }, 420);
  }

  function saveBookmark() {
    const label =
      typeof window !== "undefined"
        ? window.prompt("Bookmark name", `View z${Math.round(lastVp.current.zoom)}`)
        : "";
    if (!label) return;
    addBookmark({
      label,
      center: lastVp.current.center,
      zoom: lastVp.current.zoom,
    });
  }

  function goBookmark(b: (typeof bookmarks)[0]) {
    setOverride(b.center);
    setDeeplinkZoom(b.zoom);
    setMapViewport({ key: locKey, center: b.center, zoom: b.zoom });
  }

  if (!loc) {
    return (
      <GlassCard>
        <h2 className="text-lg font-medium">Locating…</h2>
        <p className="mt-1 text-sm text-[color:var(--color-text-muted)]">
          We need your location to center the map.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="relative -mt-2 h-[calc(100dvh-9rem)] overflow-hidden rounded-2xl border border-[rgba(180,192,217,0.15)]">
      <WeatherMap
        center={center}
        events={data?.events ?? []}
        targetZoom={targetZoom}
        onViewportChange={(c, z) => {
          setMapViewport({ key: locKey, center: c, zoom: z });
          scheduleUrlReplace(c, z);
        }}
      />

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col p-3">
        <div className="pointer-events-auto flex flex-1 items-start justify-between gap-3">
          <div className="pointer-events-auto flex max-w-[16rem] flex-col gap-2">
            <LayerToggle />
            <GlassCard variant="strong" className="p-3 text-xs">
              <div className="mb-2 flex items-center justify-between uppercase tracking-wider text-[color:var(--color-text-muted)]">
                <span>Bookmarks</span>
                <button
                  type="button"
                  onClick={saveBookmark}
                  className="rounded-lg bg-[color:var(--color-primary)]/35 px-2 py-1 text-[10px] font-medium ring-1 ring-[color:var(--color-light)]/25 hover:bg-[color:var(--color-primary)]/50"
                >
                  Save view
                </button>
              </div>
              {bookmarks.length === 0 ? (
                <p className="text-[11px] text-[color:var(--color-text-muted)]">
                  Save map positions separate from autosaved zoom.
                </p>
              ) : (
                <ul className="max-h-32 space-y-1 overflow-y-auto pr-1">
                  {bookmarks.map((b) => (
                    <li
                      key={b.id}
                      className="flex items-center gap-1 rounded-md bg-[rgba(30,36,53,0.45)] px-2 py-1"
                    >
                      <button
                        type="button"
                        title={b.label}
                        onClick={() => goBookmark(b)}
                        className="min-w-0 flex-1 truncate text-left text-[11px] hover:text-[color:var(--color-light)]"
                      >
                        {b.label}
                      </button>
                      <button
                        type="button"
                        aria-label="Remove bookmark"
                        onClick={() => removeBookmark(b.id)}
                        className="shrink-0 text-[10px] text-[color:var(--color-text-muted)] hover:text-[color:var(--color-danger)]"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </GlassCard>
          </div>
          <div className="pointer-events-auto">
            <GlobalDisasterSidebar
              onCopyShareLink={(plat, plon, id) => {
                if (typeof window === "undefined") return;
                const link = buildMapDeepLink(window.location.origin, {
                  center: [plon, plat],
                  zoom: lastVp.current.zoom,
                  event: id,
                });
                void navigator.clipboard.writeText(link);
              }}
              onSelectEvent={(plat, plon, _id) => {
                const pair: [number, number] = [plon, plat];
                setOverride(pair);
                setMapViewport({
                  key: locKey,
                  center: pair,
                  zoom: mapViewport?.key === locKey ? mapViewport.zoom : 6,
                });
              }}
            />
          </div>
        </div>
        <div className="pointer-events-auto mt-2 self-start rounded-xl bg-[rgba(30,36,53,0.76)] px-3 py-1.5 text-[10px] text-[color:var(--color-text-muted)] ring-1 ring-[rgba(180,192,217,0.12)] backdrop-blur-sm">
          <Link2 className="mr-1 inline-block h-3 w-3 translate-y-[1px]" />
          Pan/zoom updates the URL for sharing · Use{" "}
          <span className="text-[color:var(--color-light)]">Copy</span> on an
          event to grab a deeplink with <code className="text-[9px]">event</code>
          .
        </div>
        <div className="pointer-events-auto self-start">
          <AINearbyBriefing lat={loc.lat} lon={loc.lon} />
        </div>
      </div>
    </div>
  );
}
