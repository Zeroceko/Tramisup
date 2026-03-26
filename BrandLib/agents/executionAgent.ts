import { generateTextFallback } from '../ai-client';
import { EXECUTION_AGENT_PROMPT } from '../prompts';
import { createTaskTool, getTasksTool } from '../tools';

/**
 * Runs the Execution Agent to handle tasks, execution steps, and checklist items.
 */
export async function runExecutionAgent(userRequest: string, productId: string) {
  return await generateTextFallback(
    EXECUTION_AGENT_PROMPT,
    `Context Product ID: ${productId}\nUser intent: ${userRequest}`,
    'execution-agent'
  );
}
