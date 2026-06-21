"""Environment-driven configuration for the EdgeVision AI API.

Mirrors perception/config.py's approach in the Python perception app: every
value that varies between local dev and the deployed Render service lives
here, driven by env vars with sane local-dev defaults.
"""

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="EDGEVISION_")

    version: str = "0.1.0"

    # Exact origins allowed to call this API (e.g. the production Vercel
    # domain), set via EDGEVISION_CORS_ORIGINS as a comma-separated string —
    # kept as str rather than list[str] since pydantic-settings expects JSON
    # for complex env values otherwise.
    cors_origins_raw: str = Field("http://localhost:3000", alias="EDGEVISION_CORS_ORIGINS")

    # Vercel preview deployments get a new subdomain per branch/PR — allow
    # any *.vercel.app origin rather than hardcoding one preview URL.
    cors_allow_vercel_previews: bool = True

    # Rolling window size for the anonymous perf-ping aggregator.
    ping_window_size: int = 500

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]


settings = Settings()
