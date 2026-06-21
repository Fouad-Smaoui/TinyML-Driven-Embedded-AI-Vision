import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/shared/icons";

const REPO_URL = "https://github.com/Fouad-Smaoui/TinyML-Driven-Embedded-AI-Vision";

const STATS = [
  { value: "478", label: "landmarks tracked / face" },
  { value: "0", label: "frames ever uploaded" },
  { value: "2", label: "runtimes: browser + embedded" },
];

export function Hero() {
  return (
    <section className="bg-grid relative overflow-hidden border-b border-border/60">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, color-mix(in oklch, var(--primary) 18%, transparent), transparent)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-28 md:py-36">
        <p
          className="animate-fade-up font-mono text-xs tracking-[0.2em] text-primary uppercase"
          style={{ animationDelay: "0ms" }}
        >
          Edge AI · Computer Vision · Embedded Systems
        </p>

        <h1
          className="animate-fade-up mt-5 max-w-3xl text-balance text-5xl font-semibold tracking-tight md:text-6xl"
          style={{ animationDelay: "80ms" }}
        >
          Face tracking that never leaves your browser.
        </h1>

        <p
          className="animate-fade-up mt-6 max-w-xl text-balance text-lg text-muted-foreground"
          style={{ animationDelay: "160ms" }}
        >
          A real-time perception platform with two implementations of the same ideas: an
          instant, client-side demo running on WebAssembly/WebGL, and a deeper Python pipeline —
          dlib, ONNX, Kalman filtering, MQTT, and a real TensorFlow Lite Micro model running on
          physical ESP32 hardware.
        </p>

        <div
          className="animate-fade-up mt-9 flex flex-wrap items-center gap-3"
          style={{ animationDelay: "240ms" }}
        >
          <Button render={<Link href="/demo" />} nativeButton={false} size="lg" className="group">
            Run the live demo
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
          </Button>
          <Button
            render={<Link href={REPO_URL} target="_blank" rel="noopener noreferrer" />}
            nativeButton={false}
            variant="outline"
            size="lg"
          >
            <GitHubIcon className="size-4" />
            View source
          </Button>
        </div>

        <dl
          className="animate-fade-up mt-20 grid max-w-2xl grid-cols-3 gap-8 border-t border-border/60 pt-8"
          style={{ animationDelay: "320ms" }}
        >
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="font-mono text-3xl font-semibold tabular-nums text-primary">
                {stat.value}
              </dt>
              <dd className="mt-1 text-sm text-muted-foreground">{stat.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
