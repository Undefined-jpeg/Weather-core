"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, MapPin, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { create } from "zustand";
import { useUserStore } from "@/stores/useUserStore";
import type { LocationInfo } from "@/types/weather.types";

interface PaletteState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

export const useCommandPalette = create<PaletteState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}));

export function CommandPalette() {
  const isOpen = useCommandPalette((s) => s.isOpen);
  const close = useCommandPalette((s) => s.close);
  const toggle = useCommandPalette((s) => s.toggle);
  const saved = useUserStore((s) => s.savedLocations);
  const current = useUserStore((s) => s.currentLocation);
  const setCurrentLocation = useUserStore((s) => s.setCurrentLocation);
  const setHasAskedLocation = useUserStore((s) => s.setHasAskedLocation);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      } else if (e.key === "Escape" && isOpen) {
        close();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, toggle, close]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/geo/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const json = (await res.json()) as { results: LocationInfo[] };
          setResults(json.results);
        }
      } finally {
        setIsSearching(false);
      }
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  function selectLocation(loc: LocationInfo) {
    setCurrentLocation(loc);
    setHasAskedLocation(true);
    close();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <button
            type="button"
            aria-label="Close search"
            className="absolute inset-0 bg-[rgba(15,18,28,0.7)] backdrop-blur-sm"
            onClick={close}
          />
          <motion.div
            role="dialog"
            aria-label="Search locations"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl bg-[rgba(30,36,53,0.95)] shadow-2xl ring-1 ring-[rgba(180,192,217,0.18)] backdrop-blur-xl"
          >
            <div className="flex items-center gap-3 border-b border-[rgba(180,192,217,0.1)] px-4 py-3">
              <Search className="h-4 w-4 text-[color:var(--color-text-muted)]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search any city, region, or coordinate…"
                className="flex-1 bg-transparent text-sm placeholder:text-[color:var(--color-text-muted)] focus:outline-none"
                aria-label="Search query"
              />
              <kbd className="rounded bg-[rgba(180,192,217,0.1)] px-1.5 py-0.5 text-[10px] text-[color:var(--color-text-muted)]">
                Esc
              </kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {!query && saved.length > 0 && (
                <Section title="Saved locations">
                  {saved.map((l) => (
                    <ResultItem
                      key={`saved-${l.lat},${l.lon}`}
                      loc={l}
                      isCurrent={
                        !!current &&
                        current.lat === l.lat &&
                        current.lon === l.lon
                      }
                      icon={<Bookmark className="h-3.5 w-3.5" />}
                      onSelect={selectLocation}
                    />
                  ))}
                </Section>
              )}

              {query.length >= 2 && (
                <Section
                  title={isSearching ? "Searching…" : `Results for “${query}”`}
                >
                  {results.length === 0 && !isSearching && (
                    <p className="px-4 py-3 text-sm text-[color:var(--color-text-muted)]">
                      No matches found.
                    </p>
                  )}
                  {results.map((l) => (
                    <ResultItem
                      key={`r-${l.lat},${l.lon}`}
                      loc={l}
                      isCurrent={
                        !!current &&
                        current.lat === l.lat &&
                        current.lon === l.lon
                      }
                      icon={<MapPin className="h-3.5 w-3.5" />}
                      onSelect={selectLocation}
                    />
                  ))}
                </Section>
              )}

              {!query && saved.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-[color:var(--color-text-muted)]">
                  Start typing to search for a city.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[rgba(180,192,217,0.1)] bg-[rgba(20,25,38,0.6)] px-4 py-2 text-[10px] uppercase tracking-wider text-[color:var(--color-text-muted)]">
              <span>Powered by OpenWeatherMap geocoding</span>
              <span>↵ to select</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-wider text-[color:var(--color-text-muted)]">
        {title}
      </div>
      <ul>{children}</ul>
    </div>
  );
}

function ResultItem({
  loc,
  isCurrent,
  icon,
  onSelect,
}: {
  loc: LocationInfo;
  isCurrent: boolean;
  icon: React.ReactNode;
  onSelect: (l: LocationInfo) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(loc)}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-[rgba(180,192,217,0.06)]"
      >
        <span className="text-[color:var(--color-text-muted)]">{icon}</span>
        <span className="flex-1 truncate">
          <span className="text-[color:var(--color-text-primary)]">{loc.name}</span>
          {loc.region && (
            <span className="text-[color:var(--color-text-muted)]">
              , {loc.region}
            </span>
          )}
          {loc.country && (
            <span className="text-[color:var(--color-text-muted)]">
              , {loc.country}
            </span>
          )}
        </span>
        {isCurrent && (
          <span className="rounded-full bg-[color:var(--color-primary)]/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-[color:var(--color-light)] ring-1 ring-[color:var(--color-light)]/30">
            Current
          </span>
        )}
      </button>
    </li>
  );
}
