import { generateText, tool } from 'ai';
import { z } from 'zod';
import { defaultModel } from './ai-client';
import { SYSTEM_ARCHITECT_PROMPT } from './prompts';
import { runGrowthAgent } from './agents/growthAgent';
import { runExecutionAgent } from './agents/executionAgent';

/**
 * The main entry point for the Tiramisup AI architecture.
 * Determines the user intent and routes to the correct specialized agent.
 */
export async function runOrchestrator(prompt: string, productId: string) {
  const result = await generateText({
    model: defaultModel,
    system: SYSTEM_ARCHITECT_PROMPT,
    prompt: `Product Context ID: ${productId}\nUser message: ${prompt}`,
  });

  return result.text;
}
