import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

export async function syncStripe(productId: string, apiKey: string): Promise<number> {
  const stripe = new Stripe(apiKey, { apiVersion: '2026-02-25.clover' });
  let syncedRecords = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let activeSubscriptions = 0;
  let mrr = 0;

  // Retrieve active subscriptions
  const subscriptions = await stripe.subscriptions.list({ status: 'active', limit: 100 });
  
  for (const sub of subscriptions.data) {
    activeSubscriptions++;
    
    // Naive MRR Calculation based on standard models
    const item = sub.items.data[0];
    if (item && item.price.recurring?.interval === 'month') {
      mrr += (item.price.unit_amount || 0) * (item.quantity ?? 1) / 100;
    } else if (item && item.price.recurring?.interval === 'year') {
      mrr += ((item.price.unit_amount || 0) * (item.quantity ?? 1) / 100) / 12;
    }
  }

  // Understand recent churn 
  const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
  const canceledSubs = await stripe.subscriptions.list({
    status: 'canceled',
    created: { gte: thirtyDaysAgo },
    limit: 100
  });

  const churnedUsers = canceledSubs.data.length;

  await prisma.metric.upsert({
    where: {
      productId_date: {
        productId,
        date: today
      }
    },
    create: {
      productId,
      date: today,
      mrr,
      activeSubscriptions,
      churnedUsers,
      source: 'INTEGRATION'
    },
    update: {
      mrr,
      activeSubscriptions,
      churnedUsers,
      source: 'INTEGRATION'
    }
  });

  syncedRecords++;
  return syncedRecords;
}
