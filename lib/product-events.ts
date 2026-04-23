import { prisma } from "@/lib/prisma";

export type ProductEventType =
  | "PRODUCT_CREATED"
  | "ONBOARDING_COMPLETED"
  | "APP_SESSION"
  | "GROWTH_CHECKIN_COMPLETED"
  | "METRIC_SETUP_COMPLETED"
  | "FIRST_METRIC_ENTRY_CREATED"
  | "GROWTH_DIAGNOSIS_READY"
  | "PRODUCT_FEEDBACK_SUBMITTED"
  | "AI_SUGGESTIONS_SHOWN"
  | "AI_SUGGESTION_TASK_ACTIVATED";

type RecordProductEventArgs = {
  userId: string;
  productId: string;
  eventType: ProductEventType;
  metadata?: Record<string, unknown>;
};

export async function recordProductEvent(args: RecordProductEventArgs) {
  try {
    await prisma.productEvent.create({
      data: {
        userId: args.userId,
        productId: args.productId,
        eventType: args.eventType,
        metadata: args.metadata ? JSON.stringify(args.metadata) : null,
      },
    });
  } catch (error) {
    console.error("[product-events] Failed to record", args.eventType, error);
  }
}
