import { drizzle } from "drizzle-orm/mysql2";
import { desc, and, eq } from "drizzle-orm";
import { InsertUser, users, websites, coreWebVitals, performanceAlerts, alertEvents, emailSubscriptions, performanceReports } from "../drizzle/schema";
import type { InsertWebsite, InsertCoreWebVital, InsertPerformanceAlert, InsertAlertEvent, InsertEmailSubscription, InsertPerformanceReport } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Website queries
 */
export async function getUserWebsites(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).where(eq(users.id, userId));
}

export async function getWebsiteById(websiteId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(websites).where(eq(websites.id, websiteId)).limit(1);
  return result[0];
}

export async function createWebsite(data: InsertWebsite) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(websites).values(data);
  return result;
}

/**
 * Core Web Vitals queries
 */
export async function getLatestMetrics(websiteId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(coreWebVitals).where(eq(coreWebVitals.websiteId, websiteId)).orderBy(desc(coreWebVitals.recordedAt)).limit(limit);
}

export async function recordMetric(data: InsertCoreWebVital) {
  const db = await getDb();
  if (!db) return undefined;
  return db.insert(coreWebVitals).values(data);
}

/**
 * Alert queries
 */
export async function getWebsiteAlerts(websiteId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(performanceAlerts).where(eq(performanceAlerts.websiteId, websiteId));
}

export async function createAlert(data: InsertPerformanceAlert) {
  const db = await getDb();
  if (!db) return undefined;
  return db.insert(performanceAlerts).values(data);
}

export async function getRecentAlertEvents(websiteId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(alertEvents).where(eq(alertEvents.websiteId, websiteId)).orderBy(desc(alertEvents.createdAt)).limit(limit);
}

/**
 * Email subscription queries
 */
export async function getUserSubscriptions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(emailSubscriptions).where(eq(emailSubscriptions.userId, userId));
}

export async function createEmailSubscription(data: InsertEmailSubscription) {
  const db = await getDb();
  if (!db) return undefined;
  return db.insert(emailSubscriptions).values(data);
}

/**
 * Performance report queries
 */
export async function getLatestReport(websiteId: number, reportType: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(performanceReports).where(
    and(eq(performanceReports.websiteId, websiteId), eq(performanceReports.reportType, reportType))
  ).orderBy(desc(performanceReports.createdAt)).limit(1);
  return result[0];
}

export async function createReport(data: InsertPerformanceReport) {
  const db = await getDb();
  if (!db) return undefined;
  return db.insert(performanceReports).values(data);
}


