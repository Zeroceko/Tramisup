import { z } from 'zod';
import { tool } from 'ai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createTaskTool = tool({
  description: 'Creates a new actionable task for a given product in the database. Use this strictly when the user needs to execute a step.',
  parameters: z.object({
    productId: z.string().describe('The ID of the product for which the task is created.'),
    title: z.string().describe('A concise, action-oriented title.'),
    description: z.string().optional().describe('Optional context or details about how to execute the task.'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM').describe('The urgency of the task.')
  }),
  execute: async ({ productId, title, description, priority }) => {
    try {
      const task = await prisma.task.create({
        data: {
          productId,
          title,
          description,
          priority,
          status: 'TODO'
        }
      });
      return { success: true, task };
    } catch (error) {
      console.error('Error creating task:', error);
      return { success: false, error: String(error) };
    }
  }
});

export const getTasksTool = tool({
  description: 'Retrieves the list of existing tasks for a given product to avoid duplication or to summarize what needs to be done.',
  parameters: z.object({
    productId: z.string().describe('The ID of the product.'),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional().describe('Filter by task status.')
  }),
  execute: async ({ productId, status }) => {
    try {
      const whereClause: any = { productId };
      if (status) {
        whereClause.status = status;
      }
      const tasks = await prisma.task.findMany({ where: whereClause, orderBy: { createdAt: 'desc' } });
      return { success: true, tasks };
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return { success: false, error: String(error) };
    }
  }
});
