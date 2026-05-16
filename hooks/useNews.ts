"use client";

import { useQuery } from "@tanstack/react-query";
import type { NewsArticle, NewsCategory } from "@/types/alert.types";

async function fetchNews(category: NewsCategory): Promise<NewsArticle[]> {
  const res = await fetch(`/api/news?category=${category}`);
  if (!res.ok) throw new Error("news fetch failed");
  const j = (await res.json()) as { articles: NewsArticle[] };
  return j.articles;
}

export function useNews(category: NewsCategory = "all") {
  return useQuery<NewsArticle[]>({
    queryKey: ["news", category],
    queryFn: () => fetchNews(category),
    refetchInterval: 30 * 60 * 1000,
    staleTime: 25 * 60 * 1000,
  });
}
