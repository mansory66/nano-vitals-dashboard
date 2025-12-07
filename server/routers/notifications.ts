import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { createEmailSubscription, getUserSubscriptions } from "../db";
import { InsertEmailSubscription } from "../../drizzle/schema";

export const notificationsRouter = router({
  subscribe: protectedProcedure
    .input(z.object({
      websiteId: z.number(),
      frequency: z.enum(["weekly", "monthly"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const subscription: InsertEmailSubscription = {
        userId: ctx.user.id,
        websiteId: input.websiteId,
        frequency: input.frequency,
        isActive: 1,
      };
      return createEmailSubscription(subscription);
    }),

  getSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    return getUserSubscriptions(ctx.user.id);
  }),
});
