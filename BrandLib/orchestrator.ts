import { generateText } from 'ai';
import { defaultModel } from './ai-client';
import { SYSTEM_ARCHITECT_PROMPT } from './prompts';
import { getMetricContext } from '@/lib/metric-context';

/**
 * The main entry point for the Tiramisup AI architecture.
 * Enriched with real metric data so routing decisions are data-driven.
 * Falls back to a static Turkish response if Gemini is unavailable.
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

  try {
    const result = await generateText({
      model: defaultModel,
      system: SYSTEM_ARCHITECT_PROMPT,
      prompt: enrichedPrompt,
    });

    return result.text;
  } catch (err) {
    console.error('[orchestrator] Gemini call failed, using fallback:', err);
    return 'Şu an AI servisi geçici olarak yanıt veremiyor. Checklist ve görev ekranlarından devam edebilirsin — Tiramisup kısa süre içinde tekrar aktif olacak.';
  }
}
