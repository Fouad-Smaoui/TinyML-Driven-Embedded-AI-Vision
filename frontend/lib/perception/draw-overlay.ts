import type { FrameResult } from "@/lib/perception/detection-loop";

/**
 * Imperative canvas overlay draw — intentionally outside React's render
 * cycle. This runs once per video frame (potentially 60fps); routing it
 * through React state/props would re-render the component tree at the same
 * rate for no benefit.
 */
export function drawOverlay(
  canvas: HTMLCanvasElement,
  video: HTMLVideoElement,
  result: FrameResult,
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  if (width === 0 || height === 0) return;

  const primaryFace = result.landmarks[0];
  if (primaryFace) {
    ctx.fillStyle = "rgba(56, 189, 248, 0.9)";
    for (const point of primaryFace) {
      ctx.beginPath();
      ctx.arc(point.x * width, point.y * height, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  if (result.smoothedBox) {
    const { center, width: boxWidth, height: boxHeight } = result.smoothedBox;
    const x = center.x * width - (boxWidth * width) / 2;
    const y = center.y * height - (boxHeight * height) / 2;
    ctx.strokeStyle = "rgba(34, 197, 94, 0.95)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, boxWidth * width, boxHeight * height);
  }
}
