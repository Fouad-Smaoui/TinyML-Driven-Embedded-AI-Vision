"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useFacePerception } from "@/hooks/use-face-perception";
import { useMetricsHistory } from "@/hooks/use-metrics-history";
import { useBackendSync } from "@/hooks/use-backend-sync";
import { PerceptionCanvas } from "@/components/demo/perception-canvas";
import { MetricsPanel } from "@/components/demo/metrics-panel";
import { MetricsChart } from "@/components/demo/metrics-chart";
import { Button } from "@/components/ui/button";

export default function DemoPage() {
  const perception = useFacePerception();
  const { status, metrics } = perception;
  const isActive = status === "running";
  const history = useMetricsHistory(metrics, isActive);
  const backendStatus = useBackendSync(metrics, perception.delegate, isActive);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-10">
      <div className="flex items-center justify-between">
        <Button render={<Link href="/" />} nativeButton={false} variant="ghost" size="sm">
          <ArrowLeft />
          Back
        </Button>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Live edge inference demo</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Face detection, 478-point landmark tracking, and Kalman-filtered bounding-box smoothing
          run entirely in this browser tab via WebAssembly/WebGL — no frame, landmark, or
          embedding ever reaches a server. The numbers below are measured live, not canned.
        </p>
      </div>

      <PerceptionCanvas
        videoRef={perception.videoRef}
        canvasRef={perception.canvasRef}
        status={perception.status}
        delegate={perception.delegate}
        requestCamera={perception.requestCamera}
        stopCamera={perception.stopCamera}
        errorMessage={perception.errorMessage}
        backendStatus={isActive ? backendStatus : undefined}
      />

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground">Live performance metrics</h2>
        <MetricsPanel metrics={metrics} isActive={isActive} />
      </div>

      {isActive && (
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">FPS &amp; inference latency</h2>
          <MetricsChart history={history} />
        </div>
      )}
    </div>
  );
}
