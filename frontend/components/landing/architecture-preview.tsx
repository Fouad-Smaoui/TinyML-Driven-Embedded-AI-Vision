import Link from "next/link";
import { ArrowRight, Cpu, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ARCHITECTURE_DOC_URL =
  "https://github.com/Fouad-Smaoui/TinyML-Driven-Embedded-AI-Vision/blob/main/docs/architecture.md";

const TRACKS = [
  {
    icon: Globe,
    title: "Track A — Browser demo",
    description:
      "MediaPipe's FaceLandmarker runs entirely client-side via WASM/WebGL — no server round-trip per frame. A TypeScript port of the same Kalman filter smooths tracking, with live FPS and latency measured in the page itself.",
    tags: ["Next.js", "MediaPipe Tasks Vision", "WebAssembly", "WebGL"],
  },
  {
    icon: Cpu,
    title: "Track B — Embedded pipeline",
    description:
      "The original research-grade system: dlib landmark detection, ONNX ArcFace embeddings, cosine-similarity verification, MQTT, and a quantized TFLite Micro classifier running real inference on physical ESP32 hardware.",
    tags: ["dlib", "ONNX Runtime", "MQTT", "TensorFlow Lite Micro", "ESP32"],
  },
];

export function ArchitecturePreview() {
  return (
    <section id="architecture" className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">Architecture</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Two tracks, one set of ideas.
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          Landmark detection, Kalman smoothing, and latency-aware metrics are implemented twice —
          once in TypeScript for an instant, zero-install demo, once in Python for the deep-dive
          embedded system. Same concepts, different runtimes, both real.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {TRACKS.map((track) => (
            <Card key={track.title} className="rounded-md border-border/60 py-7">
              <CardHeader>
                <track.icon className="size-5 text-primary" />
                <CardTitle className="mt-3 text-lg">{track.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{track.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {track.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="font-mono">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Link
          href={ARCHITECTURE_DOC_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
        >
          View full architecture diagrams
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  );
}
