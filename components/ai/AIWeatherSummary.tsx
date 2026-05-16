"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import { parseAnalysisHttpError, streamErrorBannerText } from "@/lib/analysisErrors";
import { useUserStore } from "@/stores/useUserStore";
import { SpeakBriefingButton } from "@/components/ai/SpeakBriefingButton";
import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";

export function AIWeatherSummary({ lat, lon }: { lat?: number; lon?: number }) {
  const verbosity = useUserStore((s) => s.briefingVerbosity);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(regenerate = false) {
    if (typeof lat !== "number" || typeof lon !== "number") return;
    setLoading(true);
    setText("");
    setError(null);
    try {
      const res = await fetch("/api/ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon, regenerate, verbosity }),
      });
      if (!res.ok) {
        const parsed = await parseAnalysisHttpError(res);
        setError(parsed ?? `AI unavailable (${res.status})`);
        setLoading(false);
        return;
      }
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) {
        setLoading(false);
        return;
      }
      let acc = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setText(acc);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (typeof lat === "number" && typeof lon === "number") {
      void load(false);
    }
  }, [lat, lon, verbosity]);

  const streamBanner = text && !loading ? streamErrorBannerText(text) : null;
  const excerpt = streamBanner ?? text.split(/\n+/).filter(Boolean).slice(0, 5).join(" ");

  return (
    <GlassCard variant="strong">
      <GlassCardHeader>
        <GlassCardTitle className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-[color:var(--color-light)]" />
          AI briefing
        </GlassCardTitle>
        <div className="flex items-center gap-2">
          <SpeakBriefingButton text={!streamBanner ? text : ""} />
          <button
            type="button"
            onClick={() => load(true)}
            disabled={loading}
            className="text-xs text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)] disabled:opacity-50"
            aria-label="Regenerate"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </GlassCardHeader>
      {error ? (
        <p className="text-sm text-[color:var(--color-warning)]">{error}</p>
      ) : !text && loading ? (
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      ) : streamBanner ? (
        <p className="text-sm leading-relaxed text-[color:var(--color-warning)]">
          {streamBanner}
        </p>
      ) : (
        <p
          className={`text-sm leading-relaxed text-[color:var(--color-text-primary)] ${loading ? "typewriter-cursor" : ""}`}
        >
          {excerpt || "—"}
        </p>
      )}
      <div className="mt-3 flex justify-end">
        <Link
          href="/analysis"
          className="inline-flex items-center gap-1 text-xs text-[color:var(--color-light)] hover:underline"
        >
          Read full analysis <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </GlassCard>
  );
}
