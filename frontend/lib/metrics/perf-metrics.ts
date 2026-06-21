/**
 * Rolling client-side perception metrics for the live browser demo.
 *
 * Mirrors the windowing/averaging behavior of `perception/metrics.py`'s
 * MetricsRecorder (bounded history, rolling FPS from timestamp span, rolling
 * latency averages) adapted to what the in-browser MediaPipe + Kalman
 * pipeline actually measures per frame.
 *
 * CPU/memory usage are deliberately not reported here: there is no honest,
 * standard browser API for system-wide CPU/RAM usage, so faking those
 * numbers client-side would be exactly the "metrics theater" this project
 * avoids. Process-level CPU/memory for the FastAPI backend (a real metric)
 * is reported separately by the backend's own /status endpoint.
 */

export interface MetricsSnapshot {
  fps: number;
  avgInferenceLatencyMs: number;
  avgTrackingLatencyMs: number;
  facesDetected: number;
  sampleSize: number;
  uptimeSeconds: number;
}

export class PerfMetricsRecorder {
  private readonly windowSize: number;
  private readonly startedAtMs: number;

  private frameTimestampsMs: number[] = [];
  private inferenceLatencyMs: number[] = [];
  private trackingLatencyMs: number[] = [];
  private lastFacesDetected = 0;

  constructor(windowSize = 120, now: () => number = () => performance.now()) {
    this.windowSize = windowSize;
    this.now = now;
    this.startedAtMs = now();
  }

  private now: () => number;

  recordFrame(inferenceLatencyMs: number, trackingLatencyMs: number, facesDetected: number): void {
    this.pushBounded(this.frameTimestampsMs, this.now());
    this.pushBounded(this.inferenceLatencyMs, inferenceLatencyMs);
    this.pushBounded(this.trackingLatencyMs, trackingLatencyMs);
    this.lastFacesDetected = facesDetected;
  }

  snapshot(): MetricsSnapshot {
    const fps = this.computeFps();

    return {
      fps: round2(fps),
      avgInferenceLatencyMs: round2(average(this.inferenceLatencyMs)),
      avgTrackingLatencyMs: round2(average(this.trackingLatencyMs)),
      facesDetected: this.lastFacesDetected,
      sampleSize: this.frameTimestampsMs.length,
      uptimeSeconds: round2((this.now() - this.startedAtMs) / 1000),
    };
  }

  private computeFps(): number {
    const timestamps = this.frameTimestampsMs;
    if (timestamps.length < 2) return 0;

    const spanMs = timestamps[timestamps.length - 1] - timestamps[0];
    if (spanMs <= 0) return 0;

    return (timestamps.length - 1) / (spanMs / 1000);
  }

  private pushBounded(buffer: number[], value: number): void {
    buffer.push(value);
    if (buffer.length > this.windowSize) {
      buffer.shift();
    }
  }
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
