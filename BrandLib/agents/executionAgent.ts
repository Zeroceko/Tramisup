import { generateText } from 'ai';
import { defaultModel } from '../ai-client';
import { EXECUTION_AGENT_PROMPT } from '../prompts';
import { createTaskTool, getTasksTool } from '../tools';

/**
 * Runs the Execution Agent to handle tasks, execution steps, and checklist items.
 */
export async function runExecutionAgent(userRequest: string, productId: string) {
  const result = await generateText({
    model: defaultModel,
    system: EXECUTION_AGENT_PROMPT,
    prompt: `Context Product ID: ${productId}\nUser intent: ${userRequest}`,
    tools: {
      createTask: createTaskTool,
      getTasks: getTasksTool,
    }
  });

  return result.text;
}
