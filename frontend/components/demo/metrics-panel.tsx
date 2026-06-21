import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MetricsSnapshot } from "@/lib/metrics/perf-metrics";

interface MetricsPanelProps {
  metrics: MetricsSnapshot;
  isActive: boolean;
}

/** Presentational by design — owns no MediaPipe/hook state so it's cheap to unit test. */
export function MetricsPanel({ metrics, isActive }: MetricsPanelProps) {
  const dash = "—";

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="metrics-panel">
      <MetricCard label="FPS" value={isActive ? metrics.fps.toFixed(1) : dash} />
      <MetricCard
        label="Inference"
        value={isActive ? `${metrics.avgInferenceLatencyMs.toFixed(1)} ms` : dash}
      />
      <MetricCard
        label="Kalman tracking"
        value={isActive ? `${metrics.avgTrackingLatencyMs.toFixed(2)} ms` : dash}
      />
      <MetricCard label="Faces detected" value={isActive ? String(metrics.facesDetected) : dash} />
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card size="sm">
      <CardHeader className="pb-1">
        <CardTitle className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
      </CardContent>
    </Card>
  );
}
