import { Badge } from "@/components/ui/badge";
import type { BackendStatus } from "@/lib/metrics/backend-ping";

const LABELS: Record<BackendStatus, string> = {
  ok: "Backend: live",
  waking: "Backend: waking up…",
  unreachable: "Backend: unreachable",
};

const DOT_CLASSES: Record<BackendStatus, string> = {
  ok: "bg-emerald-400",
  waking: "bg-amber-400",
  unreachable: "bg-zinc-500",
};

/**
 * Free-tier backends sleep when idle — this surfaces that honestly instead
 * of hiding it. "Unreachable" never blocks the demo: it's purely metadata
 * about an anonymous-analytics side channel, not the perception pipeline.
 */
export function BackendStatusBadge({ status }: { status: BackendStatus }) {
  return (
    <Badge variant="secondary" className="bg-black/60 text-white backdrop-blur-sm">
      <span className={`mr-1 inline-block size-1.5 rounded-full ${DOT_CLASSES[status]}`} />
      {LABELS[status]}
    </Badge>
  );
}
