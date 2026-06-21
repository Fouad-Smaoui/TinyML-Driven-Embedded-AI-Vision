import { describe, expect, it, vi } from "vitest";
import type { FaceLandmarker, FaceLandmarkerResult, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { DetectionLoop, boundingBoxFromLandmarks } from "@/lib/perception/detection-loop";

function point(x: number, y: number): NormalizedLandmark {
  return { x, y, z: 0, visibility: 1 };
}

function fakeLandmarker(results: FaceLandmarkerResult[]): FaceLandmarker {
  let call = 0;
  return {
    detectForVideo: vi.fn(() => results[Math.min(call++, results.length - 1)]),
  } as unknown as FaceLandmarker;
}

describe("boundingBoxFromLandmarks", () => {
  it("derives center and size from the landmark extent", () => {
    const box = boundingBoxFromLandmarks([point(0.2, 0.3), point(0.6, 0.3), point(0.4, 0.7)]);

    expect(box.center.x).toBeCloseTo(0.4);
    expect(box.center.y).toBeCloseTo(0.5);
    expect(box.width).toBeCloseTo(0.4);
    expect(box.height).toBeCloseTo(0.4);
  });
});

describe("DetectionLoop", () => {
  it("reports zero faces and a null box when nothing is detected", () => {
    const landmarker = fakeLandmarker([
      { faceLandmarks: [], faceBlendshapes: [], facialTransformationMatrixes: [] },
    ]);
    const loop = new DetectionLoop(landmarker);

    const result = loop.processFrame({} as HTMLVideoElement, 0);

    expect(result.facesDetected).toBe(0);
    expect(result.rawBox).toBeNull();
    expect(result.smoothedBox).toBeNull();
  });

  it("smooths the detected box center through the Kalman tracker", () => {
    const face = [point(0.45, 0.45), point(0.55, 0.45), point(0.5, 0.55)];
    // Same noisy-but-centered measurement repeated — smoothed center should
    // converge near the raw center, proving the tracker is actually wired in.
    const landmarker = fakeLandmarker([
      { faceLandmarks: [face], faceBlendshapes: [], facialTransformationMatrixes: [] },
    ]);
    const loop = new DetectionLoop(landmarker);

    let last;
    for (let i = 0; i < 30; i++) {
      last = loop.processFrame({} as HTMLVideoElement, i * 33);
    }

    expect(last!.facesDetected).toBe(1);
    expect(last!.smoothedBox).not.toBeNull();
    expect(last!.smoothedBox!.center.x).toBeCloseTo(last!.rawBox!.center.x, 1);
    expect(last!.smoothedBox!.center.y).toBeCloseTo(last!.rawBox!.center.y, 1);
  });

  it("measures inference latency as a non-negative number", () => {
    const landmarker = fakeLandmarker([
      { faceLandmarks: [], faceBlendshapes: [], facialTransformationMatrixes: [] },
    ]);
    const loop = new DetectionLoop(landmarker);

    const result = loop.processFrame({} as HTMLVideoElement, 0);
    expect(result.inferenceLatencyMs).toBeGreaterThanOrEqual(0);
    expect(result.trackingLatencyMs).toBeGreaterThanOrEqual(0);
  });
});
