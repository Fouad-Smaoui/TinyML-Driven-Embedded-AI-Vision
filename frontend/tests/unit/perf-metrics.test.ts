import { describe, expect, it } from "vitest";
import { PerfMetricsRecorder } from "@/lib/metrics/perf-metrics";

/** Deterministic clock so FPS/uptime assertions don't depend on real time. */
function fakeClock(startMs = 0) {
  let current = startMs;
  return {
    now: () => current,
    advance: (ms: number) => {
      current += ms;
    },
  };
}

describe("PerfMetricsRecorder", () => {
  it("is zeroed with no recorded frames", () => {
    const recorder = new PerfMetricsRecorder(10);
    const snapshot = recorder.snapshot();

    expect(snapshot.fps).toBe(0);
    expect(snapshot.avgInferenceLatencyMs).toBe(0);
    expect(snapshot.avgTrackingLatencyMs).toBe(0);
    expect(snapshot.facesDetected).toBe(0);
    expect(snapshot.sampleSize).toBe(0);
  });

  it("tracks rolling latency averages", () => {
    const clock = fakeClock();
    const recorder = new PerfMetricsRecorder(10, clock.now);

    clock.advance(16);
    recorder.recordFrame(10.0, 2.0, 1);
    clock.advance(16);
    recorder.recordFrame(30.0, 4.0, 1);

    const snapshot = recorder.snapshot();
    expect(snapshot.avgInferenceLatencyMs).toBe(20.0);
    expect(snapshot.avgTrackingLatencyMs).toBe(3.0);
    expect(snapshot.sampleSize).toBe(2);
  });

  it("computes FPS from the timestamp span, not a hardcoded frame rate", () => {
    const clock = fakeClock();
    const recorder = new PerfMetricsRecorder(60, clock.now);

    // 10 frames spaced exactly 100ms apart => 10fps over the window.
    for (let i = 0; i < 10; i++) {
      clock.advance(100);
      recorder.recordFrame(5, 1, 1);
    }

    expect(recorder.snapshot().fps).toBeCloseTo(10, 1);
  });

  it("reports the most recent face count, not a cumulative total", () => {
    const recorder = new PerfMetricsRecorder(10);
    recorder.recordFrame(5, 1, 2);
    recorder.recordFrame(5, 1, 0);
    recorder.recordFrame(5, 1, 3);

    expect(recorder.snapshot().facesDetected).toBe(3);
  });

  it("bounds memory to the configured window size", () => {
    const clock = fakeClock();
    const recorder = new PerfMetricsRecorder(3, clock.now);

    for (let i = 0; i < 10; i++) {
      clock.advance(10);
      recorder.recordFrame(i, i, 1);
    }

    expect(recorder.snapshot().sampleSize).toBe(3);
  });

  it("tracks uptime from construction time", () => {
    const clock = fakeClock(1000);
    const recorder = new PerfMetricsRecorder(10, clock.now);

    clock.advance(5000);
    expect(recorder.snapshot().uptimeSeconds).toBeCloseTo(5, 1);
  });
});
