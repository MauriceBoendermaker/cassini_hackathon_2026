import type { LatLng } from "./overpass";

const ELEVATION_URL = "https://api.open-meteo.com/v1/elevation";
const BATCH_SIZE = 100;

export async function fetchElevations(points: LatLng[]): Promise<number[]> {
  if (points.length === 0) return [];
  const out: number[] = [];
  for (let i = 0; i < points.length; i += BATCH_SIZE) {
    const batch = points.slice(i, i + BATCH_SIZE);
    const lats = batch.map((p) => p.lat.toFixed(5)).join(",");
    const lngs = batch.map((p) => p.lng.toFixed(5)).join(",");
    const res = await fetch(`${ELEVATION_URL}?latitude=${lats}&longitude=${lngs}`);
    if (!res.ok) throw new Error(`Elevation API returned ${res.status}`);
    const data = await res.json();
    if (!Array.isArray(data.elevation)) throw new Error("Unexpected elevation response");
    out.push(...data.elevation);
  }
  return out;
}
