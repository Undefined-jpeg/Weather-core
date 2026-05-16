"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Bell,
  Columns,
  Home,
  Map as MapIcon,
  Search,
  Sparkles,
  Tornado,
} from "lucide-react";
import { useCommandPalette } from "@/components/nav/CommandPalette";

const TABS = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/map", label: "Map", Icon: MapIcon },
  { href: "/compare", label: "Vs", Icon: Columns },
  { href: "/disasters", label: "Disasters", Icon: Tornado },
  { href: "/alerts", label: "Alerts", Icon: Bell },
  { href: "/analysis", label: "AI", Icon: Sparkles },
];

export function BottomTabBar() {
  const pathname = usePathname();
  const openPalette = useCommandPalette((s) => s.open);
  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed bottom-0 left-0 right-0 z-40 flex gap-px justify-around overflow-x-auto border-t border-[rgba(180,192,217,0.12)] bg-[rgba(30,36,53,0.85)] px-1 backdrop-blur-xl md:hidden"
    >
      {TABS.map(({ href, label, Icon }) => {
        const active =
          pathname === href || (href !== "/" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] uppercase tracking-wider transition",
              active
                ? "text-[color:var(--color-light)]"
                : "text-[color:var(--color-text-muted)]",
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
            {label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={openPalette}
        aria-label="Search location"
        className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] uppercase tracking-wider text-[color:var(--color-text-muted)] transition hover:text-[color:var(--color-light)]"
      >
        <Search className="h-5 w-5" strokeWidth={2} />
        Search
      </button>
    </nav>
  );
}
