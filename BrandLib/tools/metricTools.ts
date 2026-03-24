import { z } from 'zod';
import { tool } from 'ai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const logMetricTool = tool({
  description: 'Logs or updates daily metric entries (DAU, MAU, MRR, etc.) for a specific product.',
  parameters: z.object({
    productId: z.string().describe('The ID of the product.'),
    date: z.string().describe('ISO-8601 date string representing the record date, e.g., 2026-03-24'),
    dau: z.number().int().optional().describe('Daily Active Users'),
    mau: z.number().int().optional().describe('Monthly Active Users'),
    mrr: z.number().optional().describe('Monthly Recurring Revenue'),
    newSignups: z.number().int().optional().describe('Number of new signups on this date')
  }),
  // @ts-expect-error Bypass ai-sdk version typing error
  execute: async ({ productId, date, dau, mau, mrr, newSignups }) => {
    try {
      const parsedDate = new Date(date);
      const metric = await prisma.metric.upsert({
        where: {
          productId_date: {
            productId,
            date: parsedDate
          }
        },
        update: { dau, mau, mrr, newSignups },
        create: { productId, date: parsedDate, dau, mau, mrr, newSignups }
      });
      return { success: true, metric };
    } catch (error) {
      console.error('Error logging metric:', error);
      return { success: false, error: String(error) };
    }
  }
});
