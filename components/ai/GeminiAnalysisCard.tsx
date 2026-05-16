"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, RefreshCw, Sparkles, Check } from "lucide-react";
import { parseAnalysisHttpError, streamErrorBannerText } from "@/lib/analysisErrors";
import { useUserStore } from "@/stores/useUserStore";
import { SpeakBriefingButton } from "@/components/ai/SpeakBriefingButton";
import { GlassCard, GlassCardHeader, GlassCardTitle } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";

export interface GeminiAnalysisCardProps {
  lat: number;
  lon: number;
}

function renderMarkdown(text: string): string {
  return text
    .replace(/^## (.*)$/gm, '<h3 class="mt-4 text-base font-semibold text-[color:var(--color-light)]">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, '<code class="rounded bg-[rgba(180,192,217,0.1)] px-1 py-0.5 text-xs">$1</code>')
    .replace(/\n\n/g, "</p><p class='mt-2'>")
    .replace(/^/, "<p>")
    .concat("</p>");
}

export function GeminiAnalysisCard({ lat, lon }: GeminiAnalysisCardProps) {
  const verbosity = useUserStore((s) => s.briefingVerbosity);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [cacheHit, setCacheHit] = useState<boolean | null>(null);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function load(regenerate = false) {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setLoading(true);
    setText("");
    setError(null);
    setCacheHit(null);
    try {
      const res = await fetch("/api/ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon, regenerate, verbosity }),
        signal: ac.signal,
      });
      if (!res.ok) {
        const parsed = await parseAnalysisHttpError(res);
        setError(parsed ?? `AI unavailable (${res.status})`);
        setLoading(false);
        return;
      }
      setCacheHit(res.headers.get("X-Cache") === "HIT");
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
      setGeneratedAt(new Date());
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load(false);
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lon, verbosity]);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const streamBanner = text && !loading ? streamErrorBannerText(text) : null;
  const hideMarkdownRepeat = Boolean(streamBanner);

  return (
    <GlassCard variant="strong" className="relative">
      <GlassCardHeader>
        <GlassCardTitle className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[color:var(--color-light)]" />
          Gemini analysis
          {cacheHit !== null && (
            <span className="ml-2 rounded-full bg-[rgba(180,192,217,0.1)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[color:var(--color-text-muted)]">
              {cacheHit ? "cached" : "fresh"}
            </span>
          )}
        </GlassCardTitle>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg p-1.5 text-[color:var(--color-text-muted)] hover:bg-[rgba(180,192,217,0.08)] hover:text-[color:var(--color-text-primary)]"
            title="Copy"
            disabled={!text}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <SpeakBriefingButton text={!streamBanner ? text : ""} />
          <button
            type="button"
            onClick={() => load(true)}
            disabled={loading}
            className="rounded-lg p-1.5 text-[color:var(--color-text-muted)] hover:bg-[rgba(180,192,217,0.08)] hover:text-[color:var(--color-text-primary)] disabled:opacity-50"
            title="Regenerate"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </GlassCardHeader>

      {error ? (
        <p className="text-sm text-[color:var(--color-warning)]">{error}</p>
      ) : !text && loading ? (
        <div className="space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="mt-3 h-3 w-1/3" />
          <Skeleton className="h-3 w-full" />
        </div>
      ) : (
        <>
          {streamBanner && (
            <div
              className="mb-3 rounded-xl border border-[color:var(--color-warning)]/45 bg-[color:var(--color-warning)]/10 px-3 py-2 text-sm leading-snug text-[color:var(--color-text-primary)]"
              role="status"
            >
              <span className="font-semibold text-[color:var(--color-warning)]">AI unavailable · </span>
              {streamBanner}
            </div>
          )}
          {!hideMarkdownRepeat && (
            <div
              className={`prose-sm max-w-none text-sm leading-relaxed text-[color:var(--color-text-primary)] [&_p]:my-2 ${loading ? "typewriter-cursor" : ""}`}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }}
            />
          )}
        </>
      )}

      {generatedAt && !streamBanner && !error && (
        <p className="mt-4 text-[10px] uppercase tracking-wider text-[color:var(--color-text-muted)]">
          Generated {generatedAt.toLocaleTimeString()}
        </p>
      )}
    </GlassCard>
  );
}
