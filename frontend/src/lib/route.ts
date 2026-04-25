// OSRM foot-routing wrapper. Uses the routing.openstreetmap.de community
// mirror — the public router.project-osrm.org endpoint is car-only.
// Returns null on failure so callers can fall back gracefully.

import type { LatLng } from "./geo";

export type RouteManeuver = {
  type: string;
  modifier?: string;
  bearingBefore: number;
  bearingAfter: number;
  location: LatLng;
};

export type RouteStep = {
  /** Distance in metres covered by this step. */
  distance: number;
  /** Duration in seconds. */
  duration: number;
  /** Street name (may be empty). */
  name: string;
  maneuver: RouteManeuver;
  /** Polyline points covered by this step, lat/lng pairs. */
  geometry: LatLng[];
  /** Human-readable instruction. */
  instruction: string;
};

export type Route = {
  distance: number;
  duration: number;
  geometry: LatLng[];
  steps: RouteStep[];
};

const OSRM_BASE = "https://routing.openstreetmap.de/routed-foot/route/v1/foot";

type OSRMManeuver = {
  type: string;
  modifier?: string;
  bearing_before?: number;
  bearing_after?: number;
  location: [number, number];
};
type OSRMStep = {
  distance: number;
  duration: number;
  name?: string;
  maneuver: OSRMManeuver;
  geometry?: { coordinates?: [number, number][] };
};
type OSRMRoute = {
  distance: number;
  duration: number;
  geometry?: { coordinates?: [number, number][] };
  legs?: Array<{ steps?: OSRMStep[] }>;
};
type OSRMResponse = { routes?: OSRMRoute[] };

export async function fetchFootRoute(start: LatLng, end: LatLng): Promise<Route | null> {
  const coords = `${start.lng.toFixed(6)},${start.lat.toFixed(6)};${end.lng.toFixed(6)},${end.lat.toFixed(6)}`;
  const url = `${OSRM_BASE}/${coords}?overview=full&geometries=geojson&steps=true`;
  try {
    const r = await fetch(url);
    if (!r.ok) {
      console.warn(`[route] OSRM ${r.status} ${r.statusText}`, url);
      return null;
    }
    const data = (await r.json()) as OSRMResponse;
    const rt = data.routes?.[0];
    if (!rt) {
      console.warn("[route] no routes in OSRM response", data);
      return null;
    }
    return parseRoute(rt);
  } catch (err) {
    console.error("[route] fetch failed", err);
    return null;
  }
}

function parseRoute(rt: OSRMRoute): Route {
  const geometry: LatLng[] = (rt.geometry?.coordinates ?? []).map(([lng, lat]) => ({ lat, lng }));
  const steps: RouteStep[] = (rt.legs?.[0]?.steps ?? []).map((s) => {
    const m = s.maneuver;
    const stepGeom: LatLng[] = (s.geometry?.coordinates ?? []).map(([lng, lat]) => ({ lat, lng }));
    return {
      distance: s.distance,
      duration: s.duration,
      name: s.name ?? "",
      maneuver: {
        type: m.type,
        modifier: m.modifier,
        bearingBefore: m.bearing_before ?? 0,
        bearingAfter: m.bearing_after ?? 0,
        location: { lat: m.location[1], lng: m.location[0] },
      },
      geometry: stepGeom,
      instruction: humanInstruction(m.type, m.modifier, s.name),
    };
  });
  return { distance: rt.distance, duration: rt.duration, geometry, steps };
}

function humanInstruction(type: string, modifier?: string, name?: string): string {
  const onto = name ? ` onto ${name}` : "";
  const cont = name ? ` on ${name}` : "";
  switch (type) {
    case "depart":
      return name ? `Head out on ${name}` : "Head out";
    case "arrive":
      return "Arrive at destination";
    case "turn":
      return `${capitalize(modifier ?? "turn")}${onto}`;
    case "continue":
      if (modifier === "uturn") return `Make a U-turn${onto}`;
      return `Continue${cont}`;
    case "merge":
      return `Merge${onto}`;
    case "fork":
      return modifier ? `Take ${modifier} fork${onto}` : `Take fork${onto}`;
    case "end of road":
      return `End of road, ${modifier ?? "continue"}${onto}`;
    case "roundabout":
      return `Take roundabout${onto}`;
    case "rotary":
      return `Take rotary${onto}`;
    case "exit roundabout":
    case "exit rotary":
      return "Exit roundabout";
    case "new name":
      return name ? `Continue onto ${name}` : "Continue";
    case "notification":
      return name ? `Pass ${name}` : "Continue";
    default:
      return `${capitalize(type)}${modifier ? " " + modifier : ""}${onto}`;
  }
}

function capitalize(s: string): string {
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}

export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  const min = Math.round(seconds / 60);
  if (min < 1) return "<1 min";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

/** Move `start` by `distanceM` metres along `bearingDeg` (0=N, 90=E, 180=S,
 *  270=W). Standard great-circle destination formula — accurate for the
 *  hundreds-of-metres scale we use for evacuation demos. */
export function offsetByMeters(start: LatLng, distanceM: number, bearingDeg: number): LatLng {
  const R = 6_371_000;
  const δ = distanceM / R;
  const θ = (bearingDeg * Math.PI) / 180;
  const φ1 = (start.lat * Math.PI) / 180;
  const λ1 = (start.lng * Math.PI) / 180;
  const φ2 = Math.asin(
    Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ),
  );
  const λ2 =
    λ1 +
    Math.atan2(
      Math.sin(θ) * Math.sin(δ) * Math.cos(φ1),
      Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2),
    );
  return { lat: (φ2 * 180) / Math.PI, lng: (λ2 * 180) / Math.PI };
}
