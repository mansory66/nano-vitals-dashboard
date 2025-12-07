import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { recordMetric, getLatestMetrics, createReport, getLatestReport } from "../db";
import { InsertCoreWebVital, InsertPerformanceReport } from "../../drizzle/schema";
import { invokeLLM } from "../_core/llm";

export const metricsRouter = router({
  record: protectedProcedure
    .input(z.object({
      websiteId: z.number(),
      lcp: z.number().optional(),
      fid: z.number().optional(),
      cls: z.string().optional(),
      lighthouseScore: z.number().optional(),
      performanceScore: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const metric: InsertCoreWebVital = {
        websiteId: input.websiteId,
        lcp: input.lcp,
        fid: input.fid,
        cls: input.cls,
        lighthouseScore: input.lighthouseScore,
        performanceScore: input.performanceScore,
      };
      return recordMetric(metric);
    }),

  getHistory: protectedProcedure
    .input(z.object({
      websiteId: z.number(),
      limit: z.number().default(50),
    }))
    .query(async ({ input }) => {
      return getLatestMetrics(input.websiteId, input.limit);
    }),

  generateAnalysis: protectedProcedure
    .input(z.object({
      websiteId: z.number(),
      metrics: z.array(z.object({
        lcp: z.number().optional(),
        fid: z.number().optional(),
        cls: z.string().optional(),
        lighthouseScore: z.number().optional(),
        performanceScore: z.number().optional(),
      })),
    }))
    .mutation(async ({ input }) => {
      const metricsData = input.metrics;
      const avgLcp = metricsData
        .filter(m => m.lcp !== undefined)
        .reduce((sum, m) => sum + (m.lcp || 0), 0) / Math.max(metricsData.filter(m => m.lcp !== undefined).length, 1);
      const avgLighthouse = metricsData
        .filter(m => m.lighthouseScore !== undefined)
        .reduce((sum, m) => sum + (m.lighthouseScore || 0), 0) / Math.max(metricsData.filter(m => m.lighthouseScore !== undefined).length, 1);

      const analysisPrompt = `Analyze these Core Web Vitals metrics and provide optimization recommendations:

Average LCP: ${avgLcp.toFixed(0)}ms
Average Lighthouse Score: ${avgLighthouse.toFixed(0)}/100

Provide specific, actionable recommendations to improve these metrics.`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "You are an expert web performance analyst. Provide concise, actionable recommendations for improving Core Web Vitals metrics.",
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
      });

      const recommendationsContent = response.choices[0]?.message.content;
      const recommendations = typeof recommendationsContent === 'string' ? recommendationsContent : "Unable to generate recommendations";

      const report: InsertPerformanceReport = {
        websiteId: input.websiteId,
        reportType: "analysis",
        summary: `Analysis of ${metricsData.length} metric samples`,
        metrics: JSON.stringify({
          avgLcp,
          avgLighthouse,
          sampleCount: metricsData.length,
        }),
        recommendations: recommendations || null,
      };

      return createReport(report);
    }),

  getLatestAnalysis: protectedProcedure
    .input(z.object({
      websiteId: z.number(),
    }))
    .query(async ({ input }) => {
      return getLatestReport(input.websiteId, "analysis");
    }),
});
