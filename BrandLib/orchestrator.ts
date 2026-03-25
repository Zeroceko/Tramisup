import { generateText } from 'ai';
import { defaultModel } from './ai-client';
import { SYSTEM_ARCHITECT_PROMPT } from './prompts';
import { runGrowthAgent } from './agents/growthAgent';
import { runExecutionAgent } from './agents/executionAgent';
import { getMetricContext } from '@/lib/metric-context';

/**
 * The main entry point for the Tiramisup AI architecture.
 * Now enriched with real metric data so routing decisions are data-driven.
 */
export async function runOrchestrator(prompt: string, productId: string) {
  // Inject real metric context so the architect can make informed routing decisions
  const metricCtx = await getMetricContext(productId);

  const enrichedPrompt = [
    `Product Context ID: ${productId}`,
    '',
    metricCtx.contextString,
    '',
    `Connected Integrations: ${metricCtx.integrations.length > 0 ? metricCtx.integrations.join(', ') : 'NONE'}`,
    '',
    `User message: ${prompt}`,
  ].join('\n');

  const result = await generateText({
    model: defaultModel,
    system: SYSTEM_ARCHITECT_PROMPT,
    prompt: enrichedPrompt,
  });

  return result.text;
}
