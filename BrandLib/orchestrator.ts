import { generateTextFallback } from './ai-client';
import { SYSTEM_ARCHITECT_PROMPT } from './prompts';
import { getMetricContext } from '@/lib/metric-context';

/**
 * The main entry point for the Tiramisup AI architecture.
 * Enriched with real metric data so routing decisions are data-driven.
 * Falls back to Gemini via withFallback, and finally a static Turkish response.
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
    return await generateTextFallback(
      SYSTEM_ARCHITECT_PROMPT,
      enrichedPrompt,
      'orchestrator'
    );
  } catch (err) {
    console.error('[orchestrator] AI generation failed completely:', err);
    return 'Şu an AI servisi geçici olarak yanıt veremiyor. Checklist ve görev ekranlarından devam edebilirsin — Tiramisup kısa süre içinde tekrar aktif olacak.';
  }
}
