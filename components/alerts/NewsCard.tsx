"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Sparkles, RefreshCw } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDistanceToNow } from "date-fns";
import type { NewsArticle } from "@/types/alert.types";

export function NewsCard({ article }: { article: NewsArticle }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function summarize() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/ai-analysis/summarize-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: article.headline,
          source: article.sourceName ?? "Unknown",
          url: article.sourceUrl,
          excerpt: article.summary,
        }),
      });
      const j = (await res.json()) as { summary?: string; error?: string };
      if (j.summary) setSummary(j.summary);
      else setError(j.error ?? "Failed to summarize");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <GlassCard padded={false} className="overflow-hidden">
      {article.imageUrl && (
        <div className="relative h-40 w-full bg-[rgba(30,36,53,0.5)]">
          <Image
            src={article.imageUrl}
            alt={article.headline}
            fill
            className="object-cover opacity-90"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(30,36,53,0.95)] via-transparent to-transparent" />
        </div>
      )}
      <div className="space-y-2 p-4">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-[color:var(--color-text-muted)]">
          {article.sourceName && <span>{article.sourceName}</span>}
          <span>·</span>
          <span>
            {article.publishedAt
              ? formatDistanceToNow(new Date(article.publishedAt)) + " ago"
              : ""}
          </span>
        </div>
        <h3 className="text-sm font-semibold leading-snug">{article.headline}</h3>
        {article.summary && (
          <p className="line-clamp-2 text-xs text-[color:var(--color-text-muted)]">
            {article.summary}
          </p>
        )}

        {summary && (
          <div className="rounded-lg bg-[color:var(--color-primary)]/20 p-3 text-xs ring-1 ring-[color:var(--color-light)]/15">
            <p className="mb-1 flex items-center gap-1 text-[10px] uppercase tracking-wider text-[color:var(--color-light)]">
              <Sparkles className="h-3 w-3" /> AI summary
            </p>
            <p>{summary}</p>
          </div>
        )}
        {loading && !summary && <Skeleton className="h-12" />}
        {error && <p className="text-xs text-[color:var(--color-warning)]">{error}</p>}

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={summarize}
            disabled={loading}
            className="inline-flex items-center gap-1 text-xs text-[color:var(--color-light)] hover:underline disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            {summary ? "Re-summarize" : "Summarize"}
          </button>
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-primary)]"
          >
            Read more <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </GlassCard>
  );
}
