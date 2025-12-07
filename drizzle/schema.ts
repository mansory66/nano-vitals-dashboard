import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Websites table - stores monitored URLs
 */
export const websites = mysqlTable("websites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  url: varchar("url", { length: 512 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Website = typeof websites.$inferSelect;
export type InsertWebsite = typeof websites.$inferInsert;

/**
 * Core Web Vitals metrics - stores LCP, FID, CLS measurements
 */
export const coreWebVitals = mysqlTable("coreWebVitals", {
  id: int("id").autoincrement().primaryKey(),
  websiteId: int("websiteId").notNull(),
  lcp: int("lcp"), // Largest Contentful Paint in milliseconds
  fid: int("fid"), // First Input Delay in milliseconds
  cls: varchar("cls", { length: 50 }), // Cumulative Layout Shift (decimal as string)
  lighthouseScore: int("lighthouseScore"), // 0-100
  performanceScore: int("performanceScore"), // 0-100
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

export type CoreWebVital = typeof coreWebVitals.$inferSelect;
export type InsertCoreWebVital = typeof coreWebVitals.$inferInsert;

/**
 * Performance alerts - configurable thresholds for each website
 */
export const performanceAlerts = mysqlTable("performanceAlerts", {
  id: int("id").autoincrement().primaryKey(),
  websiteId: int("websiteId").notNull(),
  metricType: varchar("metricType", { length: 50 }).notNull(), // 'lcp', 'fid', 'cls', 'lighthouseScore'
  thresholdValue: varchar("thresholdValue", { length: 50 }).notNull(),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PerformanceAlert = typeof performanceAlerts.$inferSelect;
export type InsertPerformanceAlert = typeof performanceAlerts.$inferInsert;

/**
 * Alert events - triggered when metrics exceed thresholds
 */
export const alertEvents = mysqlTable("alertEvents", {
  id: int("id").autoincrement().primaryKey(),
  alertId: int("alertId").notNull(),
  websiteId: int("websiteId").notNull(),
  metricValue: varchar("metricValue", { length: 100 }).notNull(),
  severity: varchar("severity", { length: 20 }).notNull(), // 'red', 'yellow', 'green'
  isResolved: int("isResolved").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  resolvedAt: timestamp("resolvedAt"),
});

export type AlertEvent = typeof alertEvents.$inferSelect;
export type InsertAlertEvent = typeof alertEvents.$inferInsert;

/**
 * Email subscriptions - for weekly/monthly reports
 */
export const emailSubscriptions = mysqlTable("emailSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  websiteId: int("websiteId").notNull(),
  frequency: varchar("frequency", { length: 50 }).notNull(), // 'weekly', 'monthly'
  isActive: int("isActive").default(1).notNull(),
  lastSentAt: timestamp("lastSentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailSubscription = typeof emailSubscriptions.$inferSelect;
export type InsertEmailSubscription = typeof emailSubscriptions.$inferInsert;

/**
 * Performance reports - cached analysis results
 */
export const performanceReports = mysqlTable("performanceReports", {
  id: int("id").autoincrement().primaryKey(),
  websiteId: int("websiteId").notNull(),
  reportType: varchar("reportType", { length: 50 }).notNull(), // 'daily', 'weekly', 'monthly'
  summary: text("summary"), // LLM-generated analysis
  metrics: text("metrics"), // JSON with aggregated metrics
  recommendations: text("recommendations"), // LLM-generated optimization tips
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PerformanceReport = typeof performanceReports.$inferSelect;
export type InsertPerformanceReport = typeof performanceReports.$inferInsert;