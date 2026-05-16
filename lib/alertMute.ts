const KEY = "wc-muted-nws-event-types";

/** Lowercased substring matches against alert.event — lightweight client mute rail. */

export function readMutedPatterns(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function writeMutedPatterns(pat: string[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(pat.slice(0, 48)));
}

export function isAlertMuted(headlineLike: string, muted: string[]): boolean {
  const h = headlineLike.toLowerCase();
  return muted.some((m) => {
    const needle = m.trim().toLowerCase();
    return needle.length > 0 && h.includes(needle);
  });
}
