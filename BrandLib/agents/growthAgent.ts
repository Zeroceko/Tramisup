import { generateTextFallback } from '../ai-client';
import { GROWTH_AGENT_PROMPT } from '../prompts';
import { logMetricTool } from '../tools';
import { getMetricContext } from '@/lib/metric-context';

/**
 * Runs the Growth Agent with real metric data injected into the prompt context.
 * This is the Data-Driven AI Mentorship core: the agent sees actual MRR, DAU,
 * churn numbers before giving any advice.
 */
export async function runGrowthAgent(userRequest: string, productId: string) {
  // Fetch real metrics and integration status from DB
  const metricCtx = await getMetricContext(productId);

  const enrichedPrompt = [
    `Context Product ID: ${productId}`,
    '',
    metricCtx.contextString,
    '',
    `Connected Integrations: ${metricCtx.integrations.length > 0 ? metricCtx.integrations.join(', ') : 'NONE'}`,
    '',
    `User intent: ${userRequest}`,
  ].join('\n');

  return await generateTextFallback(
    GROWTH_AGENT_PROMPT,
    enrichedPrompt,
    'growth-agent'
  );
}
