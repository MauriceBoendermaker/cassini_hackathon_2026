"""
Aegis backend — Katwijk flood monitoring.

Endpoints:
  - GET /api/conditions               aggregated real-time conditions
  - GET /api/precipitation/today      hourly rainfall (mm/h) for today (Open-Meteo)
  - GET /api/precipitation/copernicus historical hourly rainfall (mm/h) from
                                      Copernicus ERA5-Land (~5-7 day lag)
  - GET /api/precipitation/copernicus/debug  show active CDS endpoint
  - GET /health                       liveness probe

Run:  uvicorn main:app --reload
Docs: http://localhost:8000/docs
"""

import math
from datetime import datetime, timezone

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from copernicus import active_endpoint, get_hourly_precipitation

app = FastAPI(title="Aegis backend", version="0.1.0")


@app.on_event("startup")
async def _log_copernicus_endpoint() -> None:
    info = active_endpoint()
    print(f"[copernicus] endpoint={info['url']} source={info['source']}")
    if info["warning"]:
        print(f"[copernicus] WARNING: {info['warning']}")

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
OPEN_METEO_TODAY = (
    "https://api.open-meteo.com/v1/forecast"
    f"?latitude={KATWIJK_LAT}&longitude={KATWIJK_LON}"
    "&hourly=precipitation"
    "&timezone=Europe%2FAmsterdam"
    "&forecast_days=1"
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


@app.get("/api/precipitation/today")
async def precipitation_today():
    """Hourly rainfall (mm/h) for Katwijk, today, Europe/Amsterdam time."""
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.get(OPEN_METEO_TODAY)
            resp.raise_for_status()
            data = resp.json()
    except httpx.HTTPError as exc:
        raise HTTPException(status_code=502, detail=f"Open-Meteo request failed: {exc}") from exc

    times: list[str] = data.get("hourly", {}).get("time", [])
    precip: list[float | None] = data.get("hourly", {}).get("precipitation", [])

    hourly = [
        {"hour_local": t.split("T")[1] if "T" in t else t, "mm": round(p or 0.0, 3)}
        for t, p in zip(times, precip)
    ]
    values = [p or 0.0 for p in precip]

    return {
        "date_local": times[0].split("T")[0] if times else None,
        "timezone": data.get("timezone", "Europe/Amsterdam"),
        "location": {"lat": KATWIJK_LAT, "lon": KATWIJK_LON, "name": "Katwijk"},
        "hourly_mm_per_hour": hourly,
        "max_mm_per_hour": round(max(values, default=0.0), 3),
        "total_mm": round(sum(values), 3),
        "source": "Open-Meteo",
    }


@app.get("/api/precipitation/copernicus/debug")
async def precipitation_copernicus_debug():
    """Show which Copernicus endpoint the backend is wired to."""
    return active_endpoint()


@app.get("/api/precipitation/copernicus")
async def precipitation_copernicus(
    force_refresh: bool = Query(default=False, description="Bypass the in-memory cache."),
):
    """Hourly rainfall (mm/h) over Katwijk from Copernicus ERA5-Land.

    Reanalysis product with ~5-7 day publication lag — for live data use
    /api/precipitation/today instead. First call for a given target date
    is slow (CDS queues the retrieval — typically 30 s to a few minutes);
    subsequent calls hit the in-memory cache.
    """
    try:
        return await get_hourly_precipitation(force_refresh=force_refresh)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"CDS retrieval failed: {exc}") from exc


@app.get("/health")
async def health():
    return {"status": "ok"}
