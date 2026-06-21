import time

from fastapi import APIRouter

from app.config import settings
from app.metrics.aggregator import aggregator
from app.models import StatusResponse

router = APIRouter()

_PROCESS_STARTED_AT = time.time()


@router.get("/status", response_model=StatusResponse)
def status() -> StatusResponse:
    return StatusResponse(
        status="ok",
        version=settings.version,
        uptime_seconds=round(time.time() - _PROCESS_STARTED_AT, 2),
        ping_stats=aggregator.snapshot(),
    )
