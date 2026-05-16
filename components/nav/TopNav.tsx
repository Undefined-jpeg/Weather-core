"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
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
    <>
      <header className="sticky top-0 z-40 border-b border-[rgba(180,192,217,0.12)] bg-[rgba(30,36,53,0.6)] backdrop-blur-xl md:hidden">
        <div className="mx-auto flex max-w-[1400px] items-center px-4 py-3">
          <Link href="/" className="inline-flex items-center">
            <Image
              src="/branding/weathercore-nav.png"
              alt="WeatherCore"
              width={200}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
        </div>
      </header>
      <header className="sticky top-0 z-40 hidden border-b border-[rgba(180,192,217,0.12)] bg-[rgba(30,36,53,0.6)] backdrop-blur-xl md:block">
        <nav className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 py-4">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/branding/weathercore-nav.png"
              alt="WeatherCore"
              width={200}
              height={40}
              className="h-9 w-auto"
              priority
            />
          </Link>
          <ul className="flex flex-1 items-center justify-center gap-1">
            {LINKS.map((l) => {
              const active =
                pathname === l.href || (l.href !== "/" && pathname.startsWith(l.href));
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
    </>
  );
}
