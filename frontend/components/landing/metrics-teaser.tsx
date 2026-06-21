const METRICS = [
  { label: "FPS", detail: "rolling window, live" },
  { label: "Inference ms", detail: "per-frame MediaPipe latency" },
  { label: "Kalman ms", detail: "per-frame tracking latency" },
  { label: "Faces", detail: "detected this frame" },
];

export function MetricsTeaser() {
  return (
    <section className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
          Performance metrics
        </p>
        <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">
          Every number on this site is measured, not staged.
        </h2>
        <p className="mt-4 max-w-2xl text-muted-foreground">
          The demo ships its own rolling metrics recorder — a TypeScript port of the same
          windowed-average logic used server-side in the embedded pipeline. No canned numbers, no
          placeholder dashboards.
        </p>

        <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-border/60 bg-border/60 md:grid-cols-4">
          {METRICS.map((metric) => (
            <div key={metric.label} className="bg-card px-6 py-8">
              <p className="font-mono text-sm text-primary">{metric.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{metric.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
