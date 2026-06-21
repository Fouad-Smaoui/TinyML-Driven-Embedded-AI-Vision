"use client";

import { type ReactNode } from "react";
import { Camera, CameraOff, Loader2, ShieldAlert, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackendStatusBadge } from "@/components/demo/backend-status-badge";
import type { UseFacePerception } from "@/hooks/use-face-perception";
import type { BackendStatus } from "@/lib/metrics/backend-ping";

function StatusOverlay({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 px-6 text-center text-white backdrop-blur-sm">
      {children}
    </div>
  );
}

type PerceptionCanvasProps = Pick<
  UseFacePerception,
  "videoRef" | "canvasRef" | "status" | "delegate" | "requestCamera" | "stopCamera" | "errorMessage"
> & {
  backendStatus?: BackendStatus;
};

/**
 * Purely presentational: the caller owns the `useFacePerception()` instance
 * (so the page can also feed the same metrics into MetricsPanel/MetricsChart
 * without running a second, redundant pipeline).
 */
export function PerceptionCanvas({
  videoRef,
  canvasRef,
  status,
  delegate,
  requestCamera,
  stopCamera,
  errorMessage,
  backendStatus,
}: PerceptionCanvasProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-black">
      <video
        ref={videoRef}
        playsInline
        muted
        className="h-full w-full -scale-x-100 object-cover"
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full -scale-x-100" />

      {status === "loading-model" && (
        <StatusOverlay>
          <Loader2 className="size-6 animate-spin" />
          <p className="text-sm text-zinc-200">Loading the edge inference model in your browser…</p>
        </StatusOverlay>
      )}

      {status === "model-error" && (
        <StatusOverlay>
          <ShieldAlert className="size-6 text-destructive" />
          <p className="text-sm text-zinc-200">
            Couldn&apos;t load the inference model{errorMessage ? `: ${errorMessage}` : "."}
          </p>
        </StatusOverlay>
      )}

      {status === "awaiting-camera" && (
        <StatusOverlay>
          <Camera className="size-6" />
          <p className="max-w-sm text-sm text-zinc-200">
            Inference runs entirely in your browser. Nothing is uploaded — video never leaves
            this device.
          </p>
          <Button onClick={requestCamera}>Enable camera</Button>
        </StatusOverlay>
      )}

      {status === "requesting-camera" && (
        <StatusOverlay>
          <Loader2 className="size-6 animate-spin" />
          <p className="text-sm text-zinc-200">Waiting for camera permission…</p>
        </StatusOverlay>
      )}

      {status === "camera-denied" && (
        <StatusOverlay>
          <CameraOff className="size-6" />
          <p className="max-w-sm text-sm text-zinc-200">
            Camera access was denied. Allow camera access in your browser&apos;s address-bar
            permissions, then try again.
          </p>
          <Button onClick={requestCamera}>Try again</Button>
        </StatusOverlay>
      )}

      {status === "camera-unavailable" && (
        <StatusOverlay>
          <VideoOff className="size-6" />
          <p className="max-w-sm text-sm text-zinc-200">
            No camera was found, or this browser doesn&apos;t support webcam access over this
            connection.
          </p>
        </StatusOverlay>
      )}

      {status === "running" && (
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm">
            <span className="mr-1 inline-block size-1.5 rounded-full bg-emerald-400" />
            Live · running on {delegate ?? "…"}
          </Badge>
          {backendStatus && <BackendStatusBadge status={backendStatus} />}
        </div>
      )}

      {status === "running" && (
        <div className="absolute top-3 right-3">
          <Button size="sm" variant="outline" className="bg-black/40 text-white" onClick={stopCamera}>
            Stop camera
          </Button>
        </div>
      )}
    </div>
  );
}
