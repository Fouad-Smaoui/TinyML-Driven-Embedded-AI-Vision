"""Thread-safe rolling aggregator for anonymous frontend perf pings.

Same lock + bounded-deque shape as perception/metrics.py's MetricsRecorder
in the Python perception app — reusing a pattern already proven correct
there rather than inventing a new one. This aggregator never sees video,
landmarks, or embeddings; see app/models.py for the schema that enforces
that structurally.
"""

import threading
import time
from collections import deque


class PingAggregator:
    def __init__(self, window_size: int = 500) -> None:
        self._lock = threading.Lock()
        self._fps: deque[float] = deque(maxlen=window_size)
        self._inference_ms: deque[float] = deque(maxlen=window_size)
        self._tracking_ms: deque[float] = deque(maxlen=window_size)
        self._delegate_counts: dict[str, int] = {"GPU": 0, "CPU": 0}
        self._total_pings = 0
        self._started_at = time.time()

    def record(self, fps: float, inference_ms: float, tracking_ms: float, delegate: str) -> None:
        with self._lock:
            self._fps.append(fps)
            self._inference_ms.append(inference_ms)
            self._tracking_ms.append(tracking_ms)
            self._delegate_counts[delegate] = self._delegate_counts.get(delegate, 0) + 1
            self._total_pings += 1

    def snapshot(self) -> dict:
        with self._lock:
            fps = list(self._fps)
            inference_ms = list(self._inference_ms)
            tracking_ms = list(self._tracking_ms)
            delegate_counts = dict(self._delegate_counts)
            total_pings = self._total_pings

        def _avg(values: list[float]) -> float:
            return round(sum(values) / len(values), 2) if values else 0.0

        return {
            "avg_fps": _avg(fps),
            "avg_inference_ms": _avg(inference_ms),
            "avg_tracking_ms": _avg(tracking_ms),
            "delegate_counts": delegate_counts,
            "total_pings": total_pings,
            "sample_size": len(fps),
        }


# Process-wide singleton — Render runs this as a single persistent process,
# unlike Vercel's stateless-per-invocation serverless functions, so an
# in-memory aggregator actually accumulates real state here.
aggregator = PingAggregator()
