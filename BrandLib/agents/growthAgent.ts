import { generateText } from 'ai';
import { defaultModel } from '../ai-client';
import { GROWTH_AGENT_PROMPT } from '../prompts';
import { logMetricTool } from '../tools';

/**
 * Runs the Growth Agent to handle metrics, AARRR analysis, and growth strategies.
 */
export async function runGrowthAgent(userRequest: string, productId: string) {
  const result = await generateText({
    model: defaultModel,
    system: GROWTH_AGENT_PROMPT,
    prompt: `Context Product ID: ${productId}\nUser intent: ${userRequest}`,
    tools: {
      logMetric: logMetricTool,
    },
    maxSteps: 5,
  });

  return result.text;
}
