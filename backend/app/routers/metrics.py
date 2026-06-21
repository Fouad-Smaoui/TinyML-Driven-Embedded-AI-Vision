import time

from fastapi import APIRouter, Response
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest

from app.metrics.registry import PROCESS_UPTIME_SECONDS, registry

router = APIRouter()

_PROCESS_STARTED_AT = time.time()


@router.get("/metrics")
def metrics() -> Response:
    PROCESS_UPTIME_SECONDS.set(time.time() - _PROCESS_STARTED_AT)
    return Response(content=generate_latest(registry), media_type=CONTENT_TYPE_LATEST)
