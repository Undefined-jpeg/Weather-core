import type { Severity } from "./disaster.types";

export interface NwsAlert {
  id: string;
  event: string;
  headline: string;
  description: string;
  instruction: string | null;
  severity: Severity;
  certainty: string;
  urgency: string;
  areaDesc: string;
  effective: string;
  expires: string;
  senderName: string;
  status: string;
  messageType: string;
  category: string;
}

export interface NewsArticle {
  id: string;
  headline: string;
  summary: string | null;
  imageUrl: string | null;
  sourceUrl: string;
  sourceName: string | null;
  category: NewsCategory;
  publishedAt: string;
}

export type NewsCategory =
  | "all"
  | "hurricane"
  | "tornado"
  | "flood"
  | "wildfire"
  | "climate"
  | "forecast"
  | "alert"
  | "local";
