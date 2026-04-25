"""
Aegis backend — Katwijk flood monitoring.

Provides a single endpoint that aggregates:
  - Real-time weather from Open-Meteo (free, no key needed)
  - Simulated river-level with tidal variation
  - A placeholder EFAS stage (override via query param ?efas_stage=N for demo)

Run:  uvicorn main:app --reload
Docs: http://localhost:8000/docs
"""

import math
from datetime import datetime, timezone

import httpx
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Aegis backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

KATWIJK_LAT = 52.2035
KATWIJK_LON = 4.4086
OPEN_METEO = (
    "https://api.open-meteo.com/v1/forecast"
    f"?latitude={KATWIJK_LAT}&longitude={KATWIJK_LON}"
    "&current=precipitation,wind_gusts_10m"
    "&hourly=precipitation&past_hours=1&forecast_hours=0"
    "&timezone=Europe%2FAmsterdam"
)


def _river_level(precip_1h: float) -> float:
    """
    Simulate Oude Rijn water level at Katwijk sluice.
    Base: tidal influence (~12.4 h period, ±0.15 m).
    Rain lag: each mm/h adds ~0.03 m after a ~3 h delay
    (simplified — for a real integration use Rijkswaterstaat waterinfo API).
    """
    now = datetime.now(timezone.utc)
    tidal_h = now.hour + now.minute / 60.0
    tidal = 0.15 * math.sin(2 * math.pi * tidal_h / 12.42)
    rain_effect = min(precip_1h * 0.03, 0.8)
    return round(0.30 + tidal + rain_effect, 2)


def _sentinel_age_minutes() -> int:
    """Minutes since last Sentinel-1 pass (12-day repeat; demo: 7 min)."""
    return 7


@app.get("/api/conditions")
async def get_conditions(
    efas_stage: int = Query(default=None, ge=1, le=5, description="Override EFAS stage for demo"),
):
    """Return aggregated real-time conditions for Katwijk."""
    async with httpx.AsyncClient(timeout=8.0) as client:
        resp = await client.get(OPEN_METEO)
        resp.raise_for_status()
        weather = resp.json()

    hourly_precip: list[float] = weather.get("hourly", {}).get("precipitation", [])
    precip_1h = round(sum(v for v in hourly_precip if v is not None), 1)
    wind_gusts = round(weather.get("current", {}).get("wind_gusts_10m") or 0)

    river = _river_level(precip_1h)

    # Derive a simple EFAS-like stage from precipitation + river level.
    # In production this would come from the Copernicus CDS EFAS API.
    if efas_stage is not None:
        stage = efas_stage
    elif river > 1.2 or precip_1h > 30:
        stage = 4
    elif river > 0.8 or precip_1h > 15:
        stage = 3
    elif river > 0.5 or precip_1h > 5:
        stage = 2
    else:
        stage = 1

    return {
        "precipitation_1h_mm": precip_1h,
        "wind_gusts_kmh": wind_gusts,
        "river_level_m": river,
        "efas_stage": stage,
        "sentinel_age_minutes": _sentinel_age_minutes(),
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "source": "Open-Meteo + tidal model (Rijkswaterstaat integration pending)",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
