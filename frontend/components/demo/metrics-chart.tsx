"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { MetricsHistoryPoint } from "@/hooks/use-metrics-history";

const chartConfig: ChartConfig = {
  fps: { label: "FPS", color: "var(--chart-1)" },
  inferenceMs: { label: "Inference (ms)", color: "var(--chart-3)" },
};

export function MetricsChart({ history }: { history: MetricsHistoryPoint[] }) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-48 w-full">
      <LineChart data={history} margin={{ left: 4, right: 4, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="t" tickFormatter={() => ""} tickLine={false} axisLine={false} />
        <YAxis width={28} tickLine={false} axisLine={false} />
        <ChartTooltip
          content={<ChartTooltipContent labelFormatter={() => "live"} />}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="fps"
          stroke="var(--color-fps)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="inferenceMs"
          stroke="var(--color-inferenceMs)"
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
