"use client";

import { useEffect, useRef, useState } from "react";
import { sendPerfPing, type BackendStatus } from "@/lib/metrics/backend-ping";
import type { MetricsSnapshot } from "@/lib/metrics/perf-metrics";
import type { InferenceDelegate } from "@/lib/perception/face-landmarker";

const SYNC_INTERVAL_MS = 6000;

/**
 * Periodically reports anonymous perf numbers to the backend while the demo
 * is active, and surfaces whatever that exchange reveals about backend
 * health (ok / waking / unreachable) — see lib/metrics/backend-ping.ts.
 * setState only ever happens inside the async `sync` callback, not the
 * effect body, so a 6s ping cadence doesn't itself trigger extra renders.
 */
export function useBackendSync(
  metrics: MetricsSnapshot,
  delegate: InferenceDelegate | null,
  isActive: boolean,
): BackendStatus {
  const [status, setStatus] = useState<BackendStatus>("unreachable");
  const latestRef = useRef({ metrics, delegate });

  useEffect(() => {
    latestRef.current = { metrics, delegate };
  }, [metrics, delegate]);

  useEffect(() => {
    if (!isActive) return;

    let cancelled = false;
    const sync = async () => {
      const { metrics: latestMetrics, delegate: latestDelegate } = latestRef.current;
      if (!latestDelegate) return;

      const result = await sendPerfPing({
        fps: latestMetrics.fps,
        inferenceMs: latestMetrics.avgInferenceLatencyMs,
        trackingMs: latestMetrics.avgTrackingLatencyMs,
        delegate: latestDelegate,
      });
      if (!cancelled) setStatus(result);
    };

    void sync();
    const id = setInterval(sync, SYNC_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [isActive]);

  return status;
}
