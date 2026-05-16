"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Sparkles } from "lucide-react";

export function AINearbyBriefing({ lat, lon }: { lat: number; lon: number }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const ac = new AbortController();
    (async () => {
      setLoading(true);
      setText("");
      try {
        const res = await fetch("/api/ai-analysis/map", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lat, lon }),
          signal: ac.signal,
        });
        if (!res.ok) return;
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) return;
        while (!cancelled) {
          const { value, done } = await reader.read();
          if (done) break;
          setText((t) => t + decoder.decode(value, { stream: true }));
        }
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [lat, lon]);

  return (
    <GlassCard variant="strong" className="max-w-sm">
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-[color:var(--color-text-muted)]">
        <Sparkles className="h-3.5 w-3.5 text-[color:var(--color-light)]" /> Near you
      </div>
      {!text && loading ? (
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ) : (
        <p
          className={`text-sm leading-relaxed ${loading ? "typewriter-cursor" : ""}`}
        >
          {text || "All quiet in your area."}
        </p>
      )}
    </GlassCard>
  );
}
