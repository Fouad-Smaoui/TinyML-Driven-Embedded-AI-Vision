"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { loadFaceLandmarker, type InferenceDelegate } from "@/lib/perception/face-landmarker";
import { FaceTracker } from "@/lib/perception/kalman";
import { DetectionLoop } from "@/lib/perception/detection-loop";
import { drawOverlay } from "@/lib/perception/draw-overlay";
import { PerfMetricsRecorder, type MetricsSnapshot } from "@/lib/metrics/perf-metrics";

export type PerceptionStatus =
  | "loading-model"
  | "model-error"
  | "awaiting-camera"
  | "requesting-camera"
  | "camera-denied"
  | "camera-unavailable"
  | "running";

export interface UseFacePerception {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  status: PerceptionStatus;
  delegate: InferenceDelegate | null;
  metrics: MetricsSnapshot;
  errorMessage: string | null;
  requestCamera: () => void;
  stopCamera: () => void;
}

const METRICS_REFRESH_MS = 200;

/**
 * Owns the whole client-side perception pipeline: MediaPipe model loading,
 * webcam permission/stream lifecycle, the per-frame detection+tracking loop,
 * and metrics aggregation. Drawing happens imperatively on every animation
 * frame (see drawOverlay) — only the throttled metrics snapshot flows
 * through React state, so the UI doesn't re-render at video frame rate.
 */
export function useFacePerception(): UseFacePerception {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectionLoopRef = useRef<DetectionLoop | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Held in state (not a ref) purely as a stable instance — its identity
  // never changes, but unlike a ref it's safe to read during render.
  const [metricsRecorder] = useState(() => new PerfMetricsRecorder(120));

  const [status, setStatus] = useState<PerceptionStatus>("loading-model");
  const [delegate, setDelegate] = useState<InferenceDelegate | null>(null);
  const [metrics, setMetrics] = useState<MetricsSnapshot>(() => metricsRecorder.snapshot());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadFaceLandmarker()
      .then(({ landmarker, delegate: chosenDelegate }) => {
        if (cancelled) return;
        detectionLoopRef.current = new DetectionLoop(landmarker, new FaceTracker());
        setDelegate(chosenDelegate);
        setStatus("awaiting-camera");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setErrorMessage(err instanceof Error ? err.message : String(err));
        setStatus("model-error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The rAF loop lives entirely inside this effect: a fresh `loop` closure
  // is created (and torn down) every time `status` changes, so there's no
  // risk of a memoized callback recursively re-scheduling a stale version
  // of itself across renders.
  useEffect(() => {
    if (status !== "running") return;

    let rafId: number;
    const loop = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const detectionLoop = detectionLoopRef.current;

      if (video && canvas && detectionLoop && video.readyState >= 2 && !video.paused) {
        const result = detectionLoop.processFrame(video, performance.now());
        metricsRecorder.recordFrame(
          result.inferenceLatencyMs,
          result.trackingLatencyMs,
          result.facesDetected,
        );
        drawOverlay(canvas, video, result);
      }
      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, [status, metricsRecorder]);

  useEffect(() => {
    const id = setInterval(() => {
      setMetrics(metricsRecorder.snapshot());
    }, METRICS_REFRESH_MS);
    return () => clearInterval(id);
  }, [metricsRecorder]);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStatus((prev) => (prev === "running" ? "awaiting-camera" : prev));
  }

  function requestCamera() {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setStatus("camera-unavailable");
      return;
    }

    setStatus("requesting-camera");
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
        setStatus("running");
      })
      .catch((err: unknown) => {
        const name = err instanceof DOMException ? err.name : "";
        setStatus(name === "NotFoundError" ? "camera-unavailable" : "camera-denied");
      });
  }

  // Release the camera if the component unmounts mid-stream.
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return {
    videoRef,
    canvasRef,
    status,
    delegate,
    metrics,
    errorMessage,
    requestCamera,
    stopCamera,
  };
}
