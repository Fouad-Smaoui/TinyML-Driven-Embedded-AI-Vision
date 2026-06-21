"""Prometheus collectors for the EdgeVision AI API.

A dedicated CollectorRegistry (rather than prometheus_client's global
default) keeps this importable in tests without leaking state across test
modules that each construct their own FastAPI app instance.
"""

from prometheus_client import CollectorRegistry, Counter, Gauge, Histogram

registry = CollectorRegistry()

HTTP_REQUESTS_TOTAL = Counter(
    "edgevision_http_requests_total",
    "Total HTTP requests handled, labeled by route, method, and status code.",
    ["method", "path", "status"],
    registry=registry,
)

PING_TOTAL = Counter(
    "edgevision_ping_total",
    "Anonymous perf pings received from the browser demo, labeled by inference delegate.",
    ["delegate"],
    registry=registry,
)

PING_FPS = Histogram(
    "edgevision_ping_fps",
    "Client-reported FPS at time of ping.",
    buckets=(5, 10, 15, 20, 24, 30, 45, 60, float("inf")),
    registry=registry,
)

PING_INFERENCE_MS = Histogram(
    "edgevision_ping_inference_latency_ms",
    "Client-reported MediaPipe inference latency at time of ping, in milliseconds.",
    buckets=(1, 5, 10, 20, 50, 100, 200, 500, 1000, float("inf")),
    registry=registry,
)

PROCESS_UPTIME_SECONDS = Gauge(
    "edgevision_process_uptime_seconds",
    "Seconds since this API process started.",
    registry=registry,
)
