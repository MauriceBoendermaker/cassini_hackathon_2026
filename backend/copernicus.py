"""
Copernicus Climate Data Store — hourly rainfall over Katwijk.

Pulls `total_precipitation` from the ERA5-Land reanalysis, de-accumulates
the hourly values (ERA5-Land tp is accumulated since 00:00 UTC), and
returns mm/hour for the most recent fully-available day.

ERA5-Land has a ~5-day publication lag — this endpoint is for
Copernicus-validated historical reference, not real-time.

Requires CDS credentials (separate from EWDS) and a one-time license
accept on the reanalysis-era5-land dataset page. Credentials can come
from (in priority order):
  1. backend/env file (two lines: `url=...` and `key=...`)
  2. CDS_API_URL / CDS_API_KEY env vars
  3. ~/.cdsapirc
"""

from __future__ import annotations

import asyncio
import os
import tempfile
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from threading import Lock

import cdsapi
import xarray as xr

KATWIJK_LAT = 52.2035
KATWIJK_LON = 4.4086

# ERA5-Land has a ~5 day publication lag (ERA5T preliminary). 7 is a safe margin.
ERA5_LAND_LAG_DAYS = 7

CDS_ENV_FILE = Path(__file__).with_name(".env")

_cache: dict[str, dict] = {}
_cache_lock = Lock()


def _target_date() -> date:
    return (datetime.now(timezone.utc) - timedelta(days=ERA5_LAND_LAG_DAYS)).date()


def _load_cds_env_file() -> tuple[str | None, str | None]:
    """Read url/key from backend/.cds.env if present."""
    if not CDS_ENV_FILE.exists():
        return None, None
    url = key = None
    for raw in CDS_ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        name, _, value = line.partition("=")
        name = name.strip().lower()
        value = value.strip().strip('"').strip("'")
        if name == "url":
            url = value
        elif name == "key":
            key = value
    return url, key


def _resolve_credentials() -> tuple[str, str | None, str]:
    """Return (url, key_or_None, source) for diagnostics."""
    file_url, file_key = _load_cds_env_file()
    if file_url and file_key:
        return file_url, file_key, "file"

    env_url = os.environ.get("CDS_API_URL")
    env_key = os.environ.get("CDS_API_KEY")
    if env_url and env_key:
        return env_url, env_key, "env"

    rc_path = os.path.expanduser("~/.cdsapirc")
    rc_url = None
    if os.path.exists(rc_path):
        with open(rc_path, encoding="utf-8") as fh:
            for line in fh:
                if line.startswith("url:"):
                    rc_url = line.split(":", 1)[1].strip()
                    break
    return rc_url or "<unset>", None, "rc-file"


def active_endpoint() -> dict:
    url, key, source = _resolve_credentials()
    is_cds = "cds.climate.copernicus.eu" in url and "ewds" not in url
    return {
        "url": url,
        "source": source,
        "is_cds_endpoint": is_cds,
        "warning": (
            None
            if is_cds
            else (
                "ERA5-Land is hosted on CDS, not EWDS. Create "
                f"{CDS_ENV_FILE} with `url=` and `key=` lines pointing at "
                "https://cds.climate.copernicus.eu/api."
            )
        ),
    }


def _build_client() -> cdsapi.Client:
    url, key, _ = _resolve_credentials()
    if key:
        return cdsapi.Client(url=url, key=key, quiet=True, progress=False)
    return cdsapi.Client(quiet=True, progress=False)


def _fetch_era5_land(target: date) -> dict:
    """Blocking CDS retrieval. Run via asyncio.to_thread."""
    client = _build_client()
    fd, path = tempfile.mkstemp(suffix=".nc", prefix="era5land_")
    os.close(fd)
    try:
        client.retrieve(
            "reanalysis-era5-land",
            {
                "variable": ["total_precipitation"],
                "year": [f"{target.year:04d}"],
                "month": [f"{target.month:02d}"],
                "day": [f"{target.day:02d}"],
                "time": [f"{h:02d}:00" for h in range(24)],
                "data_format": "netcdf",
                "download_format": "unarchived",
                "area": [
                    KATWIJK_LAT + 0.05,
                    KATWIJK_LON - 0.05,
                    KATWIJK_LAT - 0.05,
                    KATWIJK_LON + 0.05,
                ],
            },
            path,
        )

        with xr.open_dataset(path, engine="netcdf4") as ds:
            spatial_dims = [d for d in (
                "latitude", "longitude") if d in ds.dims]
            # meters, accumulated since 00:00 UTC
            tp_accum_m = ds["tp"].mean(dim=spatial_dims).values

        # De-accumulate: ERA5-Land tp at hour H is the running sum from
        # 00:00 UTC; diff between consecutive hours yields mm/h.
        hourly_mm: list[float] = [max(float(tp_accum_m[0]) * 1000.0, 0.0)]
        for i in range(1, len(tp_accum_m)):
            diff_mm = (float(tp_accum_m[i]) -
                       float(tp_accum_m[i - 1])) * 1000.0
            hourly_mm.append(max(diff_mm, 0.0))

        return {
            "date_utc": target.isoformat(),
            "location": {"lat": KATWIJK_LAT, "lon": KATWIJK_LON, "name": "Katwijk"},
            "hourly_mm_per_hour": [
                {"hour_utc": f"{h:02d}:00", "mm": round(v, 3)}
                for h, v in enumerate(hourly_mm)
            ],
            "max_mm_per_hour": round(max(hourly_mm), 3),
            "total_mm": round(sum(hourly_mm), 3),
            "dataset": "reanalysis-era5-land",
            "variable": "total_precipitation",
            "source": "Copernicus Climate Data Store (CDS)",
            "note": f"Reanalysis lag ~{ERA5_LAND_LAG_DAYS} days — historical reference, not real-time.",
        }
    finally:
        try:
            os.remove(path)
        except OSError:
            pass


async def get_hourly_precipitation(force_refresh: bool = False) -> dict:
    """ERA5-Land hourly precipitation in mm/h for Katwijk.

    First call for a given date is slow (CDS queues retrievals). Cached
    per-date in memory; bounded to the last 7 days.
    """
    target = _target_date()
    key = target.isoformat()

    if not force_refresh:
        with _cache_lock:
            cached = _cache.get(key)
        if cached is not None:
            return cached

    data = await asyncio.to_thread(_fetch_era5_land, target)

    with _cache_lock:
        _cache[key] = data
        if len(_cache) > 7:
            for stale in sorted(_cache)[:-7]:
                _cache.pop(stale, None)

    return data
