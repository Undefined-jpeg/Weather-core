import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { weatherNews } from "@/db/schema";
import { desc, gt, eq, and } from "drizzle-orm";
import type { NewsArticle, NewsCategory } from "@/types/alert.types";

export const runtime = "nodejs";

const NEWS_TTL_MS = 60 * 60 * 1000;

const schema = z.object({
  category: z
    .enum([
      "all",
      "hurricane",
      "tornado",
      "flood",
      "wildfire",
      "climate",
      "forecast",
      "alert",
      "local",
    ])
    .default("all"),
});

function categoryQuery(c: NewsCategory): string {
  const map: Record<NewsCategory, string> = {
    all: "(weather OR storm OR hurricane OR tornado OR flood OR wildfire OR climate)",
    hurricane: "(hurricane OR \"tropical storm\" OR cyclone)",
    tornado: "(tornado OR \"severe thunderstorm\")",
    flood: "(flood OR flooding OR \"flash flood\")",
    wildfire: "(wildfire OR \"forest fire\" OR \"brush fire\")",
    climate: "(climate OR \"global warming\" OR \"climate change\")",
    forecast: "(forecast OR \"weather forecast\" OR meteorologist)",
    alert: "(\"weather alert\" OR \"weather warning\" OR \"weather advisory\")",
    local: "weather",
  };
  return map[c];
}

interface NewsApiResponse {
  status: string;
  articles: Array<{
    source: { id: string | null; name: string };
    author: string | null;
    title: string;
    description: string | null;
    url: string;
    urlToImage: string | null;
    publishedAt: string;
    content: string | null;
  }>;
}

async function fetchFromNewsApi(category: NewsCategory): Promise<NewsArticle[]> {
  const key = process.env.NEWSAPI_KEY;
  if (!key) return [];
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(categoryQuery(category))}&language=en&sortBy=publishedAt&pageSize=30&apiKey=${key}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "WeatherCore/1.0" },
    next: { revalidate: 1800 },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as NewsApiResponse;
  return data.articles.map<NewsArticle>((a) => ({
    id: a.url,
    headline: a.title,
    summary: a.description,
    imageUrl: a.urlToImage,
    sourceUrl: a.url,
    sourceName: a.source.name,
    category,
    publishedAt: a.publishedAt,
  }));
}

export async function GET(req: NextRequest) {
  const parsed = schema.safeParse({
    category: req.nextUrl.searchParams.get("category") || "all",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { category } = parsed.data;

  const since = new Date(Date.now() - NEWS_TTL_MS);
  const cachedRows = await db
    .select()
    .from(weatherNews)
    .where(
      and(
        category === "all" ? gt(weatherNews.fetchedAt, since) : and(eq(weatherNews.category, category), gt(weatherNews.fetchedAt, since)),
      ),
    )
    .orderBy(desc(weatherNews.publishedAt))
    .limit(30)
    .catch(() => []);

  if (cachedRows.length > 0) {
    return NextResponse.json({
      articles: cachedRows.map<NewsArticle>((r) => ({
        id: r.id,
        headline: r.headline,
        summary: r.summary,
        imageUrl: r.imageUrl,
        sourceUrl: r.sourceUrl,
        sourceName: r.sourceName,
        category: (r.category as NewsCategory) ?? "all",
        publishedAt: r.publishedAt?.toISOString() ?? new Date().toISOString(),
      })),
      cached: true,
    });
  }

  const fresh = await fetchFromNewsApi(category);
  for (const a of fresh) {
    await db
      .insert(weatherNews)
      .values({
        externalId: a.id,
        headline: a.headline,
        summary: a.summary,
        imageUrl: a.imageUrl,
        sourceUrl: a.sourceUrl,
        sourceName: a.sourceName,
        category: a.category,
        publishedAt: new Date(a.publishedAt),
      })
      .onConflictDoNothing()
      .catch(() => {});
  }
  return NextResponse.json({ articles: fresh, cached: false });
}
