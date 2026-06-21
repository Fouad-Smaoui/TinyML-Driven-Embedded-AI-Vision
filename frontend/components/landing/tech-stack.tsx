const STACK_GROUPS = [
  {
    category: "Frontend",
    items: ["Next.js", "React", "TypeScript", "Tailwind CSS", "shadcn/ui"],
  },
  {
    category: "Computer vision / AI",
    items: ["MediaPipe Tasks Vision", "ONNX Runtime", "dlib", "OpenCV", "TensorFlow Lite Micro"],
  },
  {
    category: "Backend / observability",
    items: ["FastAPI", "Prometheus", "Pydantic"],
  },
  {
    category: "Embedded",
    items: ["ESP32", "FreeRTOS", "PlatformIO", "MQTT"],
  },
  {
    category: "Engineering",
    items: ["Docker", "GitHub Actions", "Vercel", "pytest / Vitest / Playwright"],
  },
];

export function TechStack() {
  return (
    <section id="stack" className="border-b border-border/60 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <p className="font-mono text-xs tracking-[0.2em] text-primary uppercase">
          Technology stack
        </p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
          Full-stack, on purpose.
        </h2>

        <div className="mt-12 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {STACK_GROUPS.map((group) => (
            <div key={group.category}>
              <h3 className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
                {group.category}
              </h3>
              <ul className="mt-3 space-y-2">
                {group.items.map((item) => (
                  <li key={item} className="text-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
