import { describe, it, expect, beforeEach, vi } from "vitest";
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

describe("websites router", () => {
  let ctx: TrpcContext;
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeEach(() => {
    ctx = createMockContext();
    caller = appRouter.createCaller(ctx);
  });

  describe("create", () => {
    it("should create a website with valid input", async () => {
      const result = await caller.websites.create({
        url: "https://example.com",
        name: "Example Website",
      });

      expect(result).toBeDefined();
    });

    it("should reject invalid URL", async () => {
      await expect(
        caller.websites.create({
          url: "not-a-url",
          name: "Invalid URL",
        })
      ).rejects.toThrow();
    });

    it("should reject empty name", async () => {
      await expect(
        caller.websites.create({
          url: "https://example.com",
          name: "",
        })
      ).rejects.toThrow();
    });
  });

  describe("list", () => {
    it("should return websites for authenticated user", async () => {
      const result = await caller.websites.list();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("getAlerts", () => {
    it("should return alerts for a website", async () => {
      const result = await caller.websites.getAlerts({
        websiteId: 1,
      });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("createAlert", () => {
    it("should create an alert with valid metric type", async () => {
      const result = await caller.websites.createAlert({
        websiteId: 1,
        metricType: "lcp",
        thresholdValue: "2500",
      });

      expect(result).toBeDefined();
    });

    it("should reject invalid metric type", async () => {
      await expect(
        caller.websites.createAlert({
          websiteId: 1,
          metricType: "invalid" as any,
          thresholdValue: "2500",
        })
      ).rejects.toThrow();
    });

    it("should support all metric types", async () => {
      const metricTypes = ["lcp", "fid", "cls", "lighthouseScore"] as const;

      for (const metricType of metricTypes) {
        const result = await caller.websites.createAlert({
          websiteId: 1,
          metricType,
          thresholdValue: "100",
        });
        expect(result).toBeDefined();
      }
    });
  });
});
