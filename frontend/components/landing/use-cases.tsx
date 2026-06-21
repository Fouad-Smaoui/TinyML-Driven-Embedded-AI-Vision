import { Bot, Eye, ScanFace, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const USE_CASES = [
  {
    icon: Eye,
    title: "Driver / operator monitoring",
    description:
      "Eye-aspect-ratio extracted from landmarks feeds a quantized TFLite Micro classifier running on-device on the ESP32 — real blink detection with no cloud round-trip, the same shape as a drowsiness-monitoring system.",
  },
  {
    icon: ScanFace,
    title: "Identity verification",
    description:
      "Eye-aligned face crops embedded with an ONNX ArcFace model, matched via cosine similarity against enrolled identities — no per-frame model fitting, no hardcoded thresholds on a single output.",
  },
  {
    icon: Bot,
    title: "Robotics & gimbal tracking",
    description:
      "The Kalman filter smoothing the tracked face center is the same constant-velocity model used to stabilize a tracked target for a camera gimbal or a mobile robot's perception stack.",
  },
  {
    icon: Sparkles,
    title: "AR effects & face filters",
    description:
      "478-point landmark mesh, normalized image coordinates, running at interactive frame rates client-side — the same primitive behind try-on filters and AR face effects.",
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">Use cases</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Built from real perception primitives.
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Every use case below maps to something this repository actually does, not a marketing
          slide.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {USE_CASES.map((useCase) => (
            <Card key={useCase.title} className="rounded-md border-border/60 py-7">
              <CardHeader>
                <useCase.icon className="size-5 text-primary" />
                <CardTitle className="mt-3 text-base">{useCase.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{useCase.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
