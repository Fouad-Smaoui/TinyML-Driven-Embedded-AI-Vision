"""Request/response schemas.

PingPayload uses `extra="forbid"`: this isn't just a privacy claim in prose,
it's enforced at the schema level — a request carrying a face embedding,
frame, or any field beyond these four numbers/labels is rejected with 422
before it ever reaches application code. See tests/test_ping.py.
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class PingPayload(BaseModel):
    model_config = ConfigDict(extra="forbid")

    fps: float = Field(ge=0, le=1000)
    inference_ms: float = Field(ge=0, le=60_000)
    tracking_ms: float = Field(ge=0, le=60_000)
    delegate: Literal["GPU", "CPU"]


class StatusResponse(BaseModel):
    status: Literal["ok"]
    version: str
    uptime_seconds: float
    ping_stats: dict
