"use client";

import { useEffect, useRef, useState } from "react";
import type { MetricsSnapshot } from "@/lib/metrics/perf-metrics";

export interface MetricsHistoryPoint {
  t: number;
  fps: number;
  inferenceMs: number;
}

const SAMPLE_INTERVAL_MS = 200;

/**
 * Rolling chart history sampled on its own timer, decoupled from `metrics`
 * changing identity every tick — the effect's only dependency is `isActive`,
 * and setState happens inside the interval callback rather than the effect
 * body, so this doesn't cascade an extra render on every metrics update.
 */
export function useMetricsHistory(
  metrics: MetricsSnapshot,
  isActive: boolean,
  length = 50,
): MetricsHistoryPoint[] {
  const [history, setHistory] = useState<MetricsHistoryPoint[]>([]);
  const metricsRef = useRef(metrics);

  useEffect(() => {
    metricsRef.current = metrics;
  }, [metrics]);

  useEffect(() => {
    if (!isActive) return;

    const id = setInterval(() => {
      const latest = metricsRef.current;
      setHistory((prev) => {
        const next = [...prev, { t: Date.now(), fps: latest.fps, inferenceMs: latest.avgInferenceLatencyMs }];
        return next.length > length ? next.slice(next.length - length) : next;
      });
    }, SAMPLE_INTERVAL_MS);

    return () => clearInterval(id);
  }, [isActive, length]);

  return history;
}
