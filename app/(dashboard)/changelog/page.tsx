import { CHANGELOG } from "@/lib/changelogData";

export default function ChangelogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Changelog</h1>
        <p className="text-sm text-[color:var(--color-text-muted)]">
          High-level release notes synced with in-repo roadmap work.
        </p>
      </div>
      <ul className="space-y-5">
        {CHANGELOG.map((c) => (
          <li
            key={c.version}
            className="rounded-2xl border border-[rgba(180,192,217,0.12)] bg-[rgba(42,52,72,0.35)] px-5 py-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-medium">{c.version}</h2>
              <span className="text-xs uppercase tracking-wide text-[color:var(--color-text-muted)]">
                {c.date}
              </span>
            </div>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[color:var(--color-text-muted)]">
              {c.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
