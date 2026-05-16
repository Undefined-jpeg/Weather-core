"use client";

import { useEffect, useState } from "react";
import { useUserStore } from "@/stores/useUserStore";
import type { LocationInfo } from "@/types/weather.types";

async function reverseLookup(
  lat: number,
  lon: number,
): Promise<LocationInfo | null> {
  try {
    const res = await fetch(`/api/geo/reverse?lat=${lat}&lon=${lon}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function ipLookup(): Promise<LocationInfo | null> {
  try {
    const res = await fetch("/api/geo/ip");
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function useLocation() {
  const current = useUserStore((s) => s.currentLocation);
  const setCurrent = useUserStore((s) => s.setCurrentLocation);
  const hasAsked = useUserStore((s) => s.hasAskedLocation);
  const setHasAsked = useUserStore((s) => s.setHasAskedLocation);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (current || hasAsked) return;
    let cancelled = false;
    setBusy(true);
    (async () => {
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            if (cancelled) return;
            const loc = await reverseLookup(pos.coords.latitude, pos.coords.longitude);
            const fallback: LocationInfo = {
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
              name: loc?.name ?? "Current Location",
              country: loc?.country,
              region: loc?.region,
            };
            setCurrent(loc ?? fallback);
            setHasAsked(true);
            setBusy(false);
          },
          async () => {
            if (cancelled) return;
            const ip = await ipLookup();
            if (ip) setCurrent(ip);
            setHasAsked(true);
            setBusy(false);
          },
          { timeout: 8000, maximumAge: 30 * 60 * 1000 },
        );
      } else {
        const ip = await ipLookup();
        if (ip) setCurrent(ip);
        setHasAsked(true);
        setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [current, hasAsked, setCurrent, setHasAsked]);

  return { location: current, loading: busy };
}
