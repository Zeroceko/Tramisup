import { NextResponse } from 'next/server';
import { runOrchestrator } from '../../../BrandLib/orchestrator';
import { prisma } from '@/lib/prisma';
import type { FunnelMetricSelection } from '@/lib/metric-setup';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, productId } = body;

    if (!prompt || !productId) {
      return NextResponse.json(
        { error: 'Missing prompt or productId' },
        { status: 400 }
      );
    }

    // 1. Context Injection: Yesterday's metrics check
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayStart = new Date(yesterday.setHours(0, 0, 0, 0));
    const yesterdayEnd = new Date(yesterday.setHours(23, 59, 59, 999));

    const yesterdayMetric = await prisma.metric.findFirst({
      where: {
        productId,
        date: {
          gte: yesterdayStart,
          lt: yesterdayEnd
        }
      }
    });

    // 2. Product + MetricSetup context
    const [product, metricSetup] = await Promise.all([
      prisma.product.findUnique({
        where: { id: productId },
        include: { integrations: true },
      }),
      prisma.metricSetup.findUnique({
        where: { productId },
      }),
    ]);

    const isYesterdayMissing = !yesterdayMetric;
    const dateContext = `[SYSTEM CONTEXT: Today is ${new Date().toISOString().split('T')[0]}]`;
    const missingContext = isYesterdayMissing
      ? `\n[CRITICAL INSTRUCTION: The user has NOT logged their metrics for yesterday. Before executing any tasks or discussing deep strategy, gently remind and encourage them to log yesterday's metrics first.]`
      : '';

    let stageContext = '';
    if (product) {
      const hasIntegrations = product.integrations && product.integrations.length > 0;
      const connectedTools = hasIntegrations ? product.integrations.map(i => i.provider).join(', ') : 'NONE';
      const selections = (metricSetup?.selections as FunnelMetricSelection[] | null) ?? [];
      const hasMetricSetupDone = selections.some(s => s.selectedMetricKeys.length > 0);

      stageContext = `
[CRITICAL PRODUCT & STATE CONTEXT]
Product Name: ${product.name}
Current Stage: ${product.launchStatus || product.status}
Business Model: ${product.businessModel || 'N/A'}
Connected Integrations (Analytics/Revenue): ${connectedTools}
AARRR Metric Categories Setup Completed: ${hasMetricSetupDone ? 'YES' : 'NO'}

RULES BASED ON STATE:
- If Stage is "Pre-Launch/Geliştirme": DO NOT talk about heavy growth, CAC, or LTV. Focus on building the MVP, landing page waitlists, and getting the first 10 user feedback interviews.
- If Connected Integrations is "NONE": Warn the user that manual entry is dangerous. Urge them to set up at least GA4/PostHog for traffic, or Stripe for revenue.
- If AARRR Metric Categories Setup is "NO": Do NOT ask for random metrics. Ask them to define their "North Star" metric first. Help them map out Awareness, Acquisition, Activation, Retention, Referral, and Revenue metrics before any daily logging.
`;
    }

    const enrichedPrompt = `${dateContext}${missingContext}\n${stageContext}\n\nUser Message: ${prompt}`;

    // 3. Call orchestrator with enriched prompt
    const aiResponse = await runOrchestrator(enrichedPrompt, productId);

    return NextResponse.json({ success: true, text: aiResponse });
  } catch (error) {
    console.error('Advisor API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while processing the AI request.' },
      { status: 500 }
    );
  }
}
