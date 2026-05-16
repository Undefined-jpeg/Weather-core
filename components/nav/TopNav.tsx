"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CloudLightning, Search } from "lucide-react";
import { CurrentWeatherBadge } from "@/components/nav/CurrentWeatherBadge";
import { useCommandPalette } from "@/components/nav/CommandPalette";

const LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/compare", label: "Compare" },
  { href: "/analysis", label: "Analysis" },
  { href: "/map", label: "Map" },
  { href: "/disasters", label: "Disasters" },
  { href: "/alerts", label: "Alerts" },
  { href: "/changelog", label: "Changelog" },
  { href: "/settings", label: "Settings" },
];

export function TopNav() {
  const pathname = usePathname();
  const openPalette = useCommandPalette((s) => s.open);
  return (
    <header className="sticky top-0 z-40 hidden border-b border-[rgba(180,192,217,0.12)] bg-[rgba(30,36,53,0.6)] backdrop-blur-xl md:block">
      <nav className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[color:var(--color-primary)]/30 ring-1 ring-[color:var(--color-light)]/20">
            <CloudLightning className="h-5 w-5 text-[color:var(--color-light)]" strokeWidth={2} />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Weather<span className="text-[color:var(--color-light)]">Core</span>
          </span>
        </Link>
        <ul className="flex flex-1 items-center justify-center gap-1">
          {LINKS.map((l) => {
            const active = pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm transition",
                    active
                      ? "bg-[color:var(--color-primary)]/40 text-[color:var(--color-text-primary)]"
                      : "text-[color:var(--color-text-muted)] hover:bg-[rgba(180,192,217,0.08)] hover:text-[color:var(--color-text-primary)]",
                  )}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="flex items-center gap-3">
          <CurrentWeatherBadge />
          <button
            type="button"
            onClick={openPalette}
            className="inline-flex items-center gap-2 rounded-lg bg-[rgba(180,192,217,0.06)] px-3 py-1.5 text-xs text-[color:var(--color-text-muted)] ring-1 ring-[rgba(180,192,217,0.15)] transition hover:bg-[rgba(180,192,217,0.12)] hover:text-[color:var(--color-text-primary)]"
            aria-label="Search location"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search</span>
            <kbd className="ml-1 rounded bg-[rgba(180,192,217,0.1)] px-1.5 py-0.5 text-[10px] font-medium">
              ⌘K
            </kbd>
          </button>
        </div>
      </nav>
    </header>
  );
}
