/**
 * Fire-and-forget anonymous perf reporting to the FastAPI backend.
 *
 * Never sends video, landmarks, or embeddings — only four numbers (see
 * PingPayload). A short timeout plus try/catch ensures a cold or
 * unreachable backend (free-tier Render services sleep when idle) can never
 * hang or break the demo; the caller gets a status back instead of an
 * exception, used to drive a visible "waking up" badge rather than hiding
 * the slowdown.
 */

export type BackendStatus = "ok" | "waking" | "unreachable";

export interface PingPayload {
  fps: number;
  inferenceMs: number;
  trackingMs: number;
  delegate: "GPU" | "CPU";
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
const TIMEOUT_MS = 4000;
const SLOW_THRESHOLD_MS = 1500;

export async function sendPerfPing(payload: PingPayload): Promise<BackendStatus> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const start = performance.now();

  try {
    const response = await fetch(`${BACKEND_URL}/ping`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fps: payload.fps,
        inference_ms: payload.inferenceMs,
        tracking_ms: payload.trackingMs,
        delegate: payload.delegate,
      }),
      signal: controller.signal,
      keepalive: true,
    });

    if (!response.ok) return "unreachable";
    return performance.now() - start > SLOW_THRESHOLD_MS ? "waking" : "ok";
  } catch {
    return "unreachable";
  } finally {
    clearTimeout(timer);
  }
}
