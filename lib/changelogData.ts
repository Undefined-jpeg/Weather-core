/** Hand-curated in-repo changelog for /changelog UI. Keep newest first. */
export interface ChangelogEntry {
  version: string;
  date: string;
  bullets: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "0.3.0 roadmap batch",
    date: "May 2026",
    bullets: [
      "PWA shortcuts, richer offline ribbon, compact /widget mirror for Dock installs.",
      "Map presets, persisted bookmarks, shareable deeplinks, disaster copy-links.",
      "Compare page (dual city + YoY rolling week chart), radar loop caveat card.",
      "AI verbosity + speak-to-text summaries, analytics consent + Plausible hook.",
      "Email digest scaffolding (cron + unsubscribe) respecting saved locations.",
    ],
  },
  {
    version: "0.1.0",
    date: "Initial",
    bullets: ["Weather dashboard, AI analysis streaming, disasters map core."],
  },
];
