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
    tools: {
      callGrowthAgent: tool({
        description: 'Call the Growth Agent if the user needs help with metrics, Tracking, AARRR analysis, or product growth strategies.',
        parameters: z.object({
          request: z.string().describe('The synthesized request or goal to pass down to the Growth Agent.')
        }),
        // @ts-expect-error Typescript error causing next build fail due to SDK typing
        execute: async ({ request }: { request: string }) => {
          return await runGrowthAgent(request, productId);
        }
      }),
      callExecutionAgent: tool({
        description: 'Call the Execution Agent if the user needs to create executable Tasks, Checklists, or manage their to-do list.',
        parameters: z.object({
          request: z.string().describe('The synthesized request or action plan to pass down to the Execution Agent.')
        }),
        // @ts-expect-error Typescript error causing next build fail due to SDK typing
        execute: async ({ request }: { request: string }) => {
          return await runExecutionAgent(request, productId);
        }
      })
    }
  });

  return result.text;
}
