import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GitHubIcon } from "@/components/shared/icons";

const GITHUB_PROFILE_URL = "https://github.com/Fouad-Smaoui";
const REPO_URL = "https://github.com/Fouad-Smaoui/TinyML-Driven-Embedded-AI-Vision";

export function AboutEngineer() {
  return (
    <section id="about" className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
          About the engineer
        </p>
        <div className="mt-3 grid gap-8 md:grid-cols-[auto_1fr] md:items-start">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Fouad Smaoui</h2>
          <p className="max-w-2xl text-muted-foreground">
            Built end-to-end across the whole stack this project touches: a constant-velocity
            Kalman filter implemented twice (once in Python/OpenCV, once as a dependency-free
            TypeScript port verified against the original&apos;s numeric output), an ONNX face-embedding
            pipeline with proper eye-alignment, a quantized classifier trained, converted, and
            flashed onto real ESP32 hardware over MQTT, and the browser-native edge-inference layer
            you can try right now.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href={GITHUB_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary"
          >
            <GitHubIcon className="size-4" />
            GitHub profile
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-primary"
          >
            Repository
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
