import { useEffect, useState } from "react";

export type Conditions = {
  precipitation_1h_mm: number;
  wind_gusts_kmh: number;
  river_level_m: number;
  river_discharge_m3s: number | null;
  river_station: string | null;
  river_observed_at: string | null;
  river_source: string;
  efas_stage: 1 | 2 | 3 | 4 | 5;
  sentinel_age_minutes: number;
  last_updated: string;
  source: string;
};

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Polls the Aegis backend's /api/conditions endpoint, which aggregates
 * Open-Meteo (rainfall, wind) with Rijkswaterstaat Waterinfo (KWGM
 * discharge at Katwijk gemaal). Returns null until the first successful
 * fetch; subsequent failures keep the last value visible.
 */
export function useConditions(intervalMs = 5 * 60 * 1000) {
  const [data, setData] = useState<Conditions | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const r = await fetch(`${BASE}/api/conditions`);
        if (!r.ok) return;
        const json = (await r.json()) as Conditions;
        if (!cancelled) setData(json);
      } catch {
        /* keep stale value */
      }
    };
    load();
    const id = window.setInterval(load, intervalMs);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [intervalMs]);

  return data;
}
