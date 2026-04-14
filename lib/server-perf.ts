type PerfMeta = Record<string, unknown>;

const SLOW_RENDER_THRESHOLD_MS = 400;

export function startServerTiming(label: string, meta: PerfMeta = {}) {
  const startedAt = Date.now();

  return {
    end(extraMeta: PerfMeta = {}) {
      const durationMs = Date.now() - startedAt;

      if (durationMs >= SLOW_RENDER_THRESHOLD_MS) {
        console.warn(`[perf] ${label} ${durationMs}ms`, {
          ...meta,
          ...extraMeta,
        });
      }

      return durationMs;
    },
  };
}
