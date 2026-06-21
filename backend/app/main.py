"""FastAPI entrypoint for the EdgeVision AI API.

Supporting infrastructure for the browser demo, not the demo itself: health
checks, Prometheus metrics, process status, and an anonymous perf-ping
endpoint. Deployed as a persistent process (Render/Fly), not Vercel — see
docs/architecture.md for why.
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.metrics.registry import HTTP_REQUESTS_TOTAL
from app.routers import health, metrics, ping, status

app = FastAPI(title="EdgeVision AI API", version=settings.version)

_cors_origin_regex = None
if settings.cors_allow_vercel_previews:
    _cors_origin_regex = r"https://.*\.vercel\.app"

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_origin_regex=_cors_origin_regex,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.middleware("http")
async def count_requests(request: Request, call_next):
    response = await call_next(request)
    route = request.scope.get("route")
    path_template = route.path if route else request.url.path
    HTTP_REQUESTS_TOTAL.labels(
        method=request.method, path=path_template, status=response.status_code
    ).inc()
    return response


app.include_router(health.router)
app.include_router(status.router)
app.include_router(metrics.router)
app.include_router(ping.router)
