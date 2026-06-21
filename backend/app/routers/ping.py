from fastapi import APIRouter, Response, status

from app.metrics.aggregator import aggregator
from app.metrics.registry import PING_FPS, PING_INFERENCE_MS, PING_TOTAL
from app.models import PingPayload

router = APIRouter()


@router.post("/ping", status_code=status.HTTP_204_NO_CONTENT)
def ping(payload: PingPayload) -> Response:
    aggregator.record(payload.fps, payload.inference_ms, payload.tracking_ms, payload.delegate)
    PING_TOTAL.labels(delegate=payload.delegate).inc()
    PING_FPS.observe(payload.fps)
    PING_INFERENCE_MS.observe(payload.inference_ms)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
