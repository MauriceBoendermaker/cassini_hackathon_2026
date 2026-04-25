import { useEffect, useState } from "react";

export type WeatherData = {
  precipitation1h: number;  // mm accumulated in last hour
  windGusts: number;         // km/h
  fetchedAt: Date;
};

async function fetchOpenMeteo(lat: number, lng: number): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lng}` +
    `&current=precipitation,wind_gusts_10m` +
    `&hourly=precipitation&past_hours=1&forecast_hours=0` +
    `&timezone=auto`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`open-meteo ${res.status}`);
  const json = await res.json();

  const hourlyPrecip: number[] = json.hourly?.precipitation ?? [];
  const p1h = hourlyPrecip.reduce((s, v) => s + (v ?? 0), 0);

  return {
    precipitation1h: Math.round(p1h * 10) / 10,
    windGusts: Math.round(json.current?.wind_gusts_10m ?? 0),
    fetchedAt: new Date(),
  };
}

/**
 * Fetches live weather from Open-Meteo for the given coordinates.
 * Returns null until the first successful fetch or when coords are unavailable.
 */
export function useWeather(lat: number | null | undefined, lng: number | null | undefined) {
  const [data, setData] = useState<WeatherData | null>(null);

  useEffect(() => {
    if (lat == null || lng == null) return;
    let cancelled = false;

    const load = () =>
      fetchOpenMeteo(lat, lng)
        .then((d) => { if (!cancelled) setData(d); })
        .catch(() => {/* keep stale */});

    load();
    const id = setInterval(load, 5 * 60 * 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, [lat, lng]);

  return data;
}
