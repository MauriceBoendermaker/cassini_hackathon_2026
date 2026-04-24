import type { LatLng } from "./overpass";

// OSRM public demo. The "foot" URL is accepted but the server is compiled
// with car data only, so durations come back at driving speed (~30 km/h).
// We trust the routed *distance* (road-accurate, avoids water, uses bridges)
// and compute walking time ourselves at a realistic pedestrian pace.
const OSRM_URL = "https://router.project-osrm.org";
const PROFILE = "foot";

// 1.4 m/s ≈ 5 km/h — same default as Google Maps and OSRM's own foot profile.
export const WALKING_SPEED_MPS = 1.4;

function coordStr(p: LatLng): string {
  return `${p.lng.toFixed(6)},${p.lat.toFixed(6)}`;
}

export type MatrixEntry = { distanceMeters: number; durationSeconds: number };

export type Route = {
  distanceMeters: number;
  durationSeconds: number;
  geometry: LatLng[];
};

// One matrix call gets walking distance+duration from `source` to every destination.
// Much cheaper than N individual route calls. Entries are null if no route exists.
export async function fetchWalkingMatrix(
  source: LatLng,
  destinations: LatLng[],
): Promise<(MatrixEntry | null)[]> {
  if (destinations.length === 0) return [];
  const coords = [source, ...destinations].map(coordStr).join(";");
  const url = `${OSRM_URL}/table/v1/${PROFILE}/${coords}?sources=0&annotations=distance,duration`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM matrix returned ${res.status}`);
  const data = await res.json();
  if (data.code !== "Ok") throw new Error(`OSRM: ${data.message ?? data.code}`);
  const d: (number | null)[] = data.distances?.[0] ?? [];
  return destinations.map((_, i) => {
    const dist = d[i + 1];
    if (dist == null) return null;
    return { distanceMeters: dist, durationSeconds: dist / WALKING_SPEED_MPS };
  });
}

// Full route with geometry — used for the top candidates so we can draw the
// actual path on the map and check whether it crosses the flooding waterway.
export async function fetchWalkingRoute(from: LatLng, to: LatLng): Promise<Route | null> {
  const url = `${OSRM_URL}/route/v1/${PROFILE}/${coordStr(from)};${coordStr(to)}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM route returned ${res.status}`);
  const data = await res.json();
  if (data.code !== "Ok" || !data.routes?.length) return null;
  const r = data.routes[0];
  const geometry: LatLng[] = r.geometry.coordinates.map(
    ([lng, lat]: [number, number]) => ({ lat, lng }),
  );
  return {
    distanceMeters: r.distance,
    durationSeconds: r.distance / WALKING_SPEED_MPS,
    geometry,
  };
}
