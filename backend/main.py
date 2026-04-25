"""
Aegis backend — Katwijk flood monitoring.

Aggregates real-time signals for the citizen + responder UI:
  - Open-Meteo precipitation + wind (free, no key)
  - Rijkswaterstaat Waterinfo: Oude Rijn discharge at Katwijk gemaal (KWGM)
  - Derived EFAS-like stage from the combined signals
  - Sentinel-1 SAR pass age (placeholder until Copernicus Data Space STAC wired)

Run:  uvicorn main:app --reload
Docs: http://localhost:8000/docs
"""

import math
from datetime import datetime, timezone, timedelta

import httpx
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Aegis backend", version="0.2.0")

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

# Rijkswaterstaat Distributielaag (DDL) — public SOAP-over-JSON service.
# KWGM = Katwijk gemaal, the pumping station that discharges the Oude Rijn
# into the North Sea. Coordinates are in EPSG:25831 (UTM 31N), as required
# by the DDL request shape.
WATERINFO_URL = (
    "https://waterwebservices.rijkswaterstaat.nl"
    "/ONLINEWAARNEMINGENSERVICES_DBO/OphalenWaarnemingen"
)
KWGM_LOCATION = {
    "code": "KWGM",
    "name": "Katwijk gemaal",
    "x": 596095.43,
    "y": 5785073.869,
}
# DDL feeds normally run a few hours behind realtime, but individual stations
# occasionally drop out for days. Pull a generous window and take the most
# recent point — the response also carries ``river_observed_at`` so callers
# can surface a stale-data warning if the value is older than expected.
WATERINFO_LOOKBACK_HOURS = 24 * 30


async def _fetch_kwgm_discharge(client: httpx.AsyncClient) -> dict | None:
    """Most recent Oude Rijn discharge (m³/s) at Katwijk gemaal.

    Returns ``{"value": float, "observed_at": str}`` or ``None`` on any
    failure — caller is expected to fall back to a derived estimate.
    """
    end = datetime.now(timezone.utc)
    start = end - timedelta(hours=WATERINFO_LOOKBACK_HOURS)
    fmt = lambda d: d.strftime("%Y-%m-%dT%H:%M:%S.000+00:00")
    body = {
        "AquoPlusWaarnemingMetadata": {
            "AquoMetadata": {
                "Compartiment": {"Code": "OW"},
                "Grootheid": {"Code": "Q"},
            }
        },
        "Locatie": {
            "X": KWGM_LOCATION["x"],
            "Y": KWGM_LOCATION["y"],
            "Code": KWGM_LOCATION["code"],
        },
        "Periode": {"Begindatumtijd": fmt(start), "Einddatumtijd": fmt(end)},
    }
    try:
        r = await client.post(WATERINFO_URL, json=body, timeout=10.0)
        r.raise_for_status()
        data = r.json()
    except (httpx.HTTPError, ValueError):
        return None

    waarnemingen = data.get("WaarnemingenLijst") or []
    if not waarnemingen:
        return None
    metingen = waarnemingen[0].get("MetingenLijst") or []
    if not metingen:
        return None
    last = metingen[-1]
    val = (last.get("Meetwaarde") or {}).get("Waarde_Numeriek")
    ts = last.get("Tijdstip")
    if val is None or ts is None:
        return None
    return {"value": float(val), "observed_at": ts}


def _river_level_proxy(precip_1h: float, discharge_m3s: float | None) -> float:
    """Estimate Oude Rijn level (m above sluice baseline) from rainfall + discharge.

    Real water-level stations near Katwijk return no live data via DDL right
    now, so we synthesise a level from the two best signals we do have:
      - tidal influence (~12.4 h period)
      - rain accumulation lag (each mm/h adds ~0.03 m after a delay)
      - discharge bias: a heavily-pumping gemaal indicates higher inland water
    """
    now = datetime.now(timezone.utc)
    tidal_h = now.hour + now.minute / 60.0
    tidal = 0.15 * math.sin(2 * math.pi * tidal_h / 12.42)
    rain_effect = min(precip_1h * 0.03, 0.8)
    discharge_bias = 0.0
    if discharge_m3s is not None:
        # Typical Katwijk gemaal capacity is ~30 m³/s. Scale onto a 0..0.5 m
        # bias so heavy pumping nudges the displayed level upward.
        discharge_bias = max(0.0, min(abs(discharge_m3s) / 30.0, 1.0)) * 0.5
    return round(0.30 + tidal + rain_effect + discharge_bias, 2)


def _sentinel_age_minutes() -> int:
    """Minutes since last Sentinel-1 pass (12-day repeat; demo: 7 min)."""
    return 7


@app.get("/api/conditions")
async def get_conditions(
    efas_stage: int = Query(default=None, ge=1, le=5, description="Override EFAS stage for demo"),
):
    """Aggregate real-time conditions for Katwijk."""
    async with httpx.AsyncClient(timeout=12.0) as client:
        weather_resp = await client.get(OPEN_METEO)
        weather_resp.raise_for_status()
        weather = weather_resp.json()

        kwgm = await _fetch_kwgm_discharge(client)

    hourly_precip: list[float] = weather.get("hourly", {}).get("precipitation", [])
    precip_1h = round(sum(v for v in hourly_precip if v is not None), 1)
    wind_gusts = round(weather.get("current", {}).get("wind_gusts_10m") or 0)

    discharge = kwgm["value"] if kwgm else None
    river = _river_level_proxy(precip_1h, discharge)

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

    river_source = "Rijkswaterstaat Waterinfo (KWGM discharge)" if kwgm else "Tidal model fallback"

    return {
        "precipitation_1h_mm": precip_1h,
        "wind_gusts_kmh": wind_gusts,
        "river_level_m": river,
        "river_discharge_m3s": discharge,
        "river_station": KWGM_LOCATION["name"] if kwgm else None,
        "river_observed_at": kwgm["observed_at"] if kwgm else None,
        "river_source": river_source,
        "efas_stage": stage,
        "sentinel_age_minutes": _sentinel_age_minutes(),
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "source": "Open-Meteo + Rijkswaterstaat Waterinfo",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
