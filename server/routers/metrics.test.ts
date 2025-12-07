import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

const mockUser = {
  id: 1,
  openId: "test-user",
  email: "test@example.com",
  name: "Test User",
  loginMethod: "manus",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createMockContext(): TrpcContext {
  return {
    user: mockUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("metrics router", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("record", () => {
    it("should record metrics with all fields", async () => {
      const result = await caller.metrics.record({
        websiteId: 1,
        lcp: 2000,
        fid: 50,
        cls: "0.05",
        lighthouseScore: 95,
        performanceScore: 92,
      });

      expect(result).toBeDefined();
    });

    it("should record metrics with partial fields", async () => {
      const result = await caller.metrics.record({
        websiteId: 1,
        lcp: 2000,
      });

      expect(result).toBeDefined();
    });

    it("should accept valid metric values", async () => {
      const testCases = [
        { lcp: 1000 },
        { lcp: 2500 },
        { lcp: 4000 },
        { fid: 50 },
        { fid: 100 },
        { fid: 300 },
        { cls: "0.05" },
        { cls: "0.1" },
        { cls: "0.25" },
        { lighthouseScore: 0 },
        { lighthouseScore: 50 },
        { lighthouseScore: 100 },
      ];

      for (const testCase of testCases) {
        const result = await caller.metrics.record({
          websiteId: 1,
          ...testCase,
        });
        expect(result).toBeDefined();
      }
    });
  });

  describe("getHistory", () => {
    it("should return metrics history with default limit", async () => {
      const result = await caller.metrics.getHistory({
        websiteId: 1,
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("should return metrics history with custom limit", async () => {
      const result = await caller.metrics.getHistory({
        websiteId: 1,
        limit: 10,
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it("should support different limit values", async () => {
      const limits = [1, 10, 50, 100];

      for (const limit of limits) {
        const result = await caller.metrics.getHistory({
          websiteId: 1,
          limit,
        });
        expect(Array.isArray(result)).toBe(true);
      }
    });
  });

  describe("generateAnalysis", () => {
    const longTimeout = { timeout: 15000 };
    it("should generate analysis with metrics data", async () => {
      const metrics = [
        { lcp: 2000, lighthouseScore: 95, performanceScore: 92 },
        { lcp: 2100, lighthouseScore: 94, performanceScore: 91 },
        { lcp: 1900, lighthouseScore: 96, performanceScore: 93 },
      ];

      const result = await caller.metrics.generateAnalysis({
        websiteId: 1,
        metrics,
      });

      expect(result).toBeDefined();
    }, longTimeout);

    it("should handle empty metrics array", async () => {
      const result = await caller.metrics.generateAnalysis({
        websiteId: 1,
        metrics: [],
      });

      expect(result).toBeDefined();
    }, longTimeout);

    it("should handle metrics with missing fields", async () => {
      const metrics = [
        { lcp: 2000 },
        { lighthouseScore: 95 },
        { performanceScore: 92 },
      ];

      const result = await caller.metrics.generateAnalysis({
        websiteId: 1,
        metrics,
      });

      expect(result).toBeDefined();
    }, longTimeout);
  });

  describe("getLatestAnalysis", () => {
    it("should return latest analysis for website", async () => {
      const result = await caller.metrics.getLatestAnalysis({
        websiteId: 1,
      });

      // Result can be undefined if no analysis exists
      expect(result === undefined || typeof result === "object").toBe(true);
    });
  });
});
