import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  real,
  boolean,
  integer,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

/* ============================================================ */
/* USERS — extended with NextAuth-required columns                */
/* ============================================================ */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  name: text("name"),
  image: text("image"),
  preferredUnit: text("preferred_unit").default("metric"),
  savedLocations: jsonb("saved_locations").$type<SavedLocation[]>().default([]),
  digestEmailEnabled: boolean("digest_email_enabled").default(false).notNull(),
  digestUnsubscribeToken: text("digest_unsub_token"),
  lastDigestSentAt: timestamp("last_digest_sent_at", { mode: "date" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export interface SavedLocation {
  name: string;
  lat: number;
  lon: number;
  country?: string;
}

/* ============================================================ */
/* NEXTAUTH ADAPTER TABLES                                        */
/* ============================================================ */
export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

/* ============================================================ */
/* WEATHER CACHE                                                  */
/* ============================================================ */
export const weatherCache = pgTable(
  "weather_cache",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    lat: real("lat").notNull(),
    lon: real("lon").notNull(),
    locationName: text("location_name"),
    currentData: jsonb("current_data").notNull(),
    forecastData: jsonb("forecast_data").notNull(),
    fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (t) => [
    index("weather_cache_loc_idx").on(t.lat, t.lon),
    index("weather_cache_expires_idx").on(t.expiresAt),
  ],
);

/* ============================================================ */
/* DISASTER EVENTS                                                */
/* ============================================================ */
export const disasterEvents = pgTable(
  "disaster_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    externalId: text("external_id").unique(),
    type: text("type").notNull(),
    name: text("name"),
    severity: text("severity").notNull(),
    lat: real("lat").notNull(),
    lon: real("lon").notNull(),
    radius: real("radius"),
    description: text("description"),
    sourceUrl: text("source_url"),
    isActive: boolean("is_active").default(true).notNull(),
    startedAt: timestamp("started_at"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    rawData: jsonb("raw_data"),
  },
  (t) => [
    index("disaster_active_idx").on(t.isActive, t.type),
    index("disaster_loc_idx").on(t.lat, t.lon),
  ],
);

/* ============================================================ */
/* ALERTS LOG                                                     */
/* ============================================================ */
export const alertsLog = pgTable("alerts_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  alertType: text("alert_type").notNull(),
  location: text("location"),
  message: text("message").notNull(),
  severity: text("severity"),
  seenAt: timestamp("seen_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* ============================================================ */
/* AI ANALYSIS CACHE                                              */
/* ============================================================ */
export const aiAnalysisCache = pgTable(
  "ai_analysis_cache",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    locationKey: text("location_key").notNull().unique(),
    analysisText: text("analysis_text").notNull(),
    generatedAt: timestamp("generated_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at").notNull(),
  },
  (t) => [index("ai_cache_key_idx").on(t.locationKey)],
);

/* ============================================================ */
/* AI RATE LIMITING                                               */
/* ============================================================ */
export const aiRateLimit = pgTable(
  "ai_rate_limit",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    bucketKey: text("bucket_key").notNull(),
    requestedAt: timestamp("requested_at").defaultNow().notNull(),
  },
  (t) => [
    index("ai_rate_user_idx").on(t.userId, t.requestedAt),
    index("ai_rate_bucket_idx").on(t.bucketKey, t.requestedAt),
  ],
);

/* ============================================================ */
/* WEATHER NEWS                                                   */
/* ============================================================ */
export const weatherNews = pgTable(
  "weather_news",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    externalId: text("external_id").unique(),
    headline: text("headline").notNull(),
    summary: text("summary"),
    imageUrl: text("image_url"),
    sourceUrl: text("source_url").notNull(),
    sourceName: text("source_name"),
    category: text("category"),
    publishedAt: timestamp("published_at"),
    fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
  },
  (t) => [
    index("news_category_idx").on(t.category, t.publishedAt),
    index("news_published_idx").on(t.publishedAt),
  ],
);

export type User = typeof users.$inferSelect;
export type WeatherCacheRow = typeof weatherCache.$inferSelect;
export type DisasterEventRow = typeof disasterEvents.$inferSelect;
export type NewsRow = typeof weatherNews.$inferSelect;
export type AiCacheRow = typeof aiAnalysisCache.$inferSelect;
