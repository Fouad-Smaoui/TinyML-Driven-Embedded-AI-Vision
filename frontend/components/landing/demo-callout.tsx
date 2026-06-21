import Link from "next/link";
import { ArrowRight, ScanFace, ShieldCheck, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

const POINTS = [
  { icon: ScanFace, text: "478-point landmark mesh + Kalman-smoothed tracking box" },
  { icon: Timer, text: "Live FPS, inference latency, and tracking latency — measured, not staged" },
  { icon: ShieldCheck, text: "Video stays on your device; only anonymous perf counters leave the browser" },
];

export function DemoCallout() {
  return (
    <section id="demo" className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-md border border-border/60 bg-card p-10 md:p-14">
          <div className="grid items-center gap-10 md:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
                Live demo
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                Two minutes. Your webcam. Real inference.
              </h2>
              <p className="mt-4 max-w-md text-muted-foreground">
                Open the demo, grant camera access, and watch detection, landmark tracking, and
                Kalman smoothing run live — entirely in this browser tab.
              </p>
              <Button render={<Link href="/demo" />} nativeButton={false} size="lg" className="group mt-7">
                Open the live demo
                <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>

            <ul className="space-y-4">
              {POINTS.map((point) => (
                <li key={point.text} className="flex items-start gap-3">
                  <point.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-sm text-muted-foreground">{point.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
