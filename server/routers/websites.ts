import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { createWebsite, getUserWebsites, getWebsiteById, getLatestMetrics, getWebsiteAlerts, getRecentAlertEvents, createAlert } from "../db";
import { InsertWebsite, InsertPerformanceAlert } from "../../drizzle/schema";

export const websitesRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getUserWebsites(ctx.user.id);
  }),

  create: protectedProcedure
    .input(z.object({
      url: z.string().url(),
      name: z.string().min(1).max(255),
    }))
    .mutation(async ({ ctx, input }) => {
      const website: InsertWebsite = {
        userId: ctx.user.id,
        url: input.url,
        name: input.name,
        isActive: 1,
      };
      return createWebsite(website);
    }),

  getMetrics: protectedProcedure
    .input(z.object({
      websiteId: z.number(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      return getLatestMetrics(input.websiteId, input.limit);
    }),

  getAlerts: protectedProcedure
    .input(z.object({
      websiteId: z.number(),
    }))
    .query(async ({ input }) => {
      return getWebsiteAlerts(input.websiteId);
    }),

  getAlertEvents: protectedProcedure
    .input(z.object({
      websiteId: z.number(),
      limit: z.number().default(20),
    }))
    .query(async ({ input }) => {
      return getRecentAlertEvents(input.websiteId, input.limit);
    }),

  createAlert: protectedProcedure
    .input(z.object({
      websiteId: z.number(),
      metricType: z.enum(["lcp", "fid", "cls", "lighthouseScore"]),
      thresholdValue: z.string(),
    }))
    .mutation(async ({ input }) => {
      const alert: InsertPerformanceAlert = {
        websiteId: input.websiteId,
        metricType: input.metricType,
        thresholdValue: input.thresholdValue,
        isActive: 1,
      };
      return createAlert(alert);
    }),
});
