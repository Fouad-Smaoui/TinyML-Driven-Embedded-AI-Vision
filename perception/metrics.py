"""Thread-safe rolling perception metrics, exposed by app.py at /metrics and
polled by the Streamlit dashboard. This is what makes "performance metrics
dashboard" mean something real instead of reading static CSVs that nothing
produces."""

import threading
import time
from collections import deque


class MetricsRecorder:
    def __init__(self, window_size: int = 120) -> None:
        self._lock = threading.Lock()
        self._frame_times: deque[float] = deque(maxlen=window_size)
        self._detection_latency_ms: deque[float] = deque(maxlen=window_size)
        self._embedding_latency_ms: deque[float] = deque(maxlen=window_size)
        self._verified_count = 0
        self._unknown_count = 0

    def record_frame(self, detection_latency_ms: float, embedding_latency_ms: float) -> None:
        with self._lock:
            self._frame_times.append(time.time())
            self._detection_latency_ms.append(detection_latency_ms)
            self._embedding_latency_ms.append(embedding_latency_ms)

    def record_verification(self, name: str) -> None:
        with self._lock:
            if name == "Unknown":
                self._unknown_count += 1
            else:
                self._verified_count += 1

    def snapshot(self) -> dict:
        with self._lock:
            frame_times = list(self._frame_times)
            detection_latency = list(self._detection_latency_ms)
            embedding_latency = list(self._embedding_latency_ms)
            verified_count = self._verified_count
            unknown_count = self._unknown_count

        fps = 0.0
        if len(frame_times) >= 2:
            span = frame_times[-1] - frame_times[0]
            if span > 0:
                fps = (len(frame_times) - 1) / span

        def _avg(values: list[float]) -> float:
            return sum(values) / len(values) if values else 0.0

        return {
            "fps": round(fps, 2),
            "avg_detection_latency_ms": round(_avg(detection_latency), 2),
            "avg_embedding_latency_ms": round(_avg(embedding_latency), 2),
            "verified_count": verified_count,
            "unknown_count": unknown_count,
            "sample_size": len(frame_times),
        }
