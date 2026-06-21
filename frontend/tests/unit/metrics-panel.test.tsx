import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MetricsPanel } from "@/components/demo/metrics-panel";
import type { MetricsSnapshot } from "@/lib/metrics/perf-metrics";

const SNAPSHOT: MetricsSnapshot = {
  fps: 24.345,
  avgInferenceLatencyMs: 12.3,
  avgTrackingLatencyMs: 0.456,
  facesDetected: 1,
  sampleSize: 60,
  uptimeSeconds: 30,
};

describe("MetricsPanel", () => {
  it("renders formatted metric values when active", () => {
    render(<MetricsPanel metrics={SNAPSHOT} isActive />);

    expect(screen.getByText("24.3")).toBeInTheDocument();
    expect(screen.getByText("12.3 ms")).toBeInTheDocument();
    expect(screen.getByText("0.46 ms")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("shows placeholders instead of stale numbers when inactive", () => {
    render(<MetricsPanel metrics={SNAPSHOT} isActive={false} />);

    const panel = screen.getByTestId("metrics-panel");
    expect(panel.textContent?.match(/—/g)).toHaveLength(4);
    expect(screen.queryByText("24.3")).not.toBeInTheDocument();
  });
});
