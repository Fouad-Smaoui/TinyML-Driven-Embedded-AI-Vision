import type { FaceLandmarker, NormalizedLandmark } from "@mediapipe/tasks-vision";
import { FaceTracker, type Point2D } from "@/lib/perception/kalman";

export interface BoundingBox {
  center: Point2D;
  width: number;
  height: number;
}

export interface FrameResult {
  /** Raw per-face landmark sets, normalized [0,1] image coordinates. */
  landmarks: NormalizedLandmark[][];
  /** Bounding box derived from the primary face's landmark extent, pre-smoothing. */
  rawBox: BoundingBox | null;
  /** Same box with its center run through the Kalman tracker. */
  smoothedBox: BoundingBox | null;
  inferenceLatencyMs: number;
  trackingLatencyMs: number;
  facesDetected: number;
}

/**
 * Wires MediaPipe FaceLandmarker output to the ported Kalman tracker.
 * Framework-free on purpose: testable without React, and the part of this
 * codebase most likely to be scrutinized for "is this real or decorative."
 */
export class DetectionLoop {
  constructor(
    private readonly landmarker: FaceLandmarker,
    private readonly tracker: FaceTracker = new FaceTracker(),
  ) {}

  processFrame(video: HTMLVideoElement, timestampMs: number): FrameResult {
    const inferenceStart = performance.now();
    const result = this.landmarker.detectForVideo(video, timestampMs);
    const inferenceLatencyMs = performance.now() - inferenceStart;

    const trackingStart = performance.now();
    const primaryFace = result.faceLandmarks[0] ?? null;

    let rawBox: BoundingBox | null = null;
    let smoothedBox: BoundingBox | null = null;

    if (primaryFace) {
      rawBox = boundingBoxFromLandmarks(primaryFace);
      this.tracker.predict();
      const smoothedCenter = this.tracker.correct(rawBox.center.x, rawBox.center.y);
      smoothedBox = { center: smoothedCenter, width: rawBox.width, height: rawBox.height };
    } else {
      // No measurement this frame — still advance the filter so it decays
      // gracefully instead of freezing on the last known position.
      this.tracker.predict();
    }
    const trackingLatencyMs = performance.now() - trackingStart;

    return {
      landmarks: result.faceLandmarks,
      rawBox,
      smoothedBox,
      inferenceLatencyMs,
      trackingLatencyMs,
      facesDetected: result.faceLandmarks.length,
    };
  }
}

export function boundingBoxFromLandmarks(points: NormalizedLandmark[]): BoundingBox {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const point of points) {
    if (point.x < minX) minX = point.x;
    if (point.x > maxX) maxX = point.x;
    if (point.y < minY) minY = point.y;
    if (point.y > maxY) maxY = point.y;
  }

  return {
    center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
    width: maxX - minX,
    height: maxY - minY,
  };
}
