import type { LatLng, Waterway } from "./overpass";
import { fetchElevations } from "./elevation";

export type FloodClass = "none" | "small" | "medium" | "large";

export type FloodAssessment = {
  floodClass: FloodClass;
  searchRadiusMeters: number;
  minElevationGainMeters: number;
  worstWaterway?: Waterway;
  nearestWaterPoint?: LatLng;
  distanceToWaterMeters?: number;
};

export type Candidate = {
  position: LatLng;
  elevationMeters: number;
  elevationGainMeters: number;
  distanceToUserMeters: number;
  distanceToWaterMeters: number;
  crossesWater: boolean;
  score: number;
};

export type EvacuationResult = {
  assessment: FloodAssessment;
  userElevationMeters: number;
  waterElevationMeters?: number;
  candidates: Candidate[];
  topCandidates: Candidate[];
};

// Haversine distance in meters.
export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Pick the closest point on a polyline to `p`.
function closestPointOn(polyline: LatLng[], p: LatLng): { point: LatLng; dist: number } {
  let best = { point: polyline[0], dist: Infinity };
  for (const v of polyline) {
    const d = distanceMeters(v, p);
    if (d < best.dist) best = { point: v, dist: d };
  }
  return best;
}

// Segment intersection in lat/lng space — fine at small scales for prototype.
function segmentsIntersect(a: LatLng, b: LatLng, c: LatLng, d: LatLng): boolean {
  const ccw = (p: LatLng, q: LatLng, r: LatLng) =>
    (r.lat - p.lat) * (q.lng - p.lng) > (q.lat - p.lat) * (r.lng - p.lng);
  return ccw(a, c, d) !== ccw(b, c, d) && ccw(a, b, c) !== ccw(a, b, d);
}

function lineCrossesWaterway(from: LatLng, to: LatLng, ways: Waterway[]): boolean {
  for (const w of ways) {
    for (let i = 0; i < w.geometry.length - 1; i++) {
      if (segmentsIntersect(from, to, w.geometry[i], w.geometry[i + 1])) return true;
    }
  }
  return false;
}

// Classify the flood threat based on the most dangerous nearby waterway.
export function classifyFlood(ways: Waterway[], user: LatLng): FloodAssessment {
  if (ways.length === 0) {
    return { floodClass: "none", searchRadiusMeters: 500, minElevationGainMeters: 0 };
  }

  // Severity score per way: river > canal > stream; wider = worse; closer = worse.
  let worst: Waterway | undefined;
  let worstSeverity = -Infinity;
  let nearestPoint: LatLng | undefined;
  let nearestDist = Infinity;

  for (const w of ways) {
    const { point, dist } = closestPointOn(w.geometry, user);
    const width = w.widthMeters ?? (w.type === "river" ? 15 : w.type === "canal" ? 10 : 2);
    const typeWeight = w.type === "river" ? 3 : w.type === "canal" ? 1.5 : 1;
    const severity = typeWeight * Math.log2(width + 1) - dist / 2000;
    if (severity > worstSeverity) {
      worstSeverity = severity;
      worst = w;
      nearestPoint = point;
      nearestDist = dist;
    }
  }

  const width =
    worst!.widthMeters ?? (worst!.type === "river" ? 15 : worst!.type === "canal" ? 10 : 2);

  let floodClass: FloodClass;
  let searchRadiusMeters: number;
  let minElevationGainMeters: number;

  if (worst!.type === "stream" && width < 5) {
    floodClass = "small";
    searchRadiusMeters = 500;
    minElevationGainMeters = 2;
  } else if (width < 20) {
    floodClass = "medium";
    searchRadiusMeters = 1500;
    minElevationGainMeters = 5;
  } else {
    floodClass = "large";
    searchRadiusMeters = 4000;
    minElevationGainMeters = 15;
  }

  return {
    floodClass,
    searchRadiusMeters,
    minElevationGainMeters,
    worstWaterway: worst,
    nearestWaterPoint: nearestPoint,
    distanceToWaterMeters: nearestDist,
  };
}

// Generate candidate points on concentric rings around user, inside searchRadius.
function generateCandidates(user: LatLng, radiusMeters: number): LatLng[] {
  const rings = 5;
  const anglesPerRing = 8;
  const candidates: LatLng[] = [];
  const metersPerDegLat = 111_320;
  const metersPerDegLng = 111_320 * Math.cos((user.lat * Math.PI) / 180);

  for (let r = 1; r <= rings; r++) {
    const dist = (radiusMeters * r) / rings;
    for (let a = 0; a < anglesPerRing; a++) {
      const theta = (a / anglesPerRing) * 2 * Math.PI;
      const dLat = (dist * Math.sin(theta)) / metersPerDegLat;
      const dLng = (dist * Math.cos(theta)) / metersPerDegLng;
      candidates.push({ lat: user.lat + dLat, lng: user.lng + dLng });
    }
  }
  return candidates;
}

// Shortest distance from point to any waterway vertex (approximation).
function nearestWaterDist(p: LatLng, ways: Waterway[]): number {
  let min = Infinity;
  for (const w of ways) {
    for (const v of w.geometry) {
      const d = distanceMeters(v, p);
      if (d < min) min = d;
    }
  }
  return min;
}

export async function planEvacuation(
  user: LatLng,
  ways: Waterway[],
): Promise<EvacuationResult> {
  const assessment = classifyFlood(ways, user);

  if (assessment.floodClass === "none") {
    const [userElev] = await fetchElevations([user]);
    return {
      assessment,
      userElevationMeters: userElev,
      candidates: [],
      topCandidates: [],
    };
  }

  const candidatePts = generateCandidates(user, assessment.searchRadiusMeters);
  const elevInputs = [user, assessment.nearestWaterPoint!, ...candidatePts];
  const elevs = await fetchElevations(elevInputs);
  const userElev = elevs[0];
  const waterElev = elevs[1];
  const candElevs = elevs.slice(2);

  const candidates: Candidate[] = candidatePts.map((pos, i) => {
    const elev = candElevs[i];
    const gain = elev - waterElev;
    const distUser = distanceMeters(user, pos);
    const distWater = nearestWaterDist(pos, ways);
    const crosses = lineCrossesWaterway(user, pos, ways);

    // Scoring: need elevation above flood + distance from water + reachable quickly.
    // Hard-fail if below min gain.
    let score = 0;
    if (gain >= assessment.minElevationGainMeters) {
      const elevScore =
        1 + Math.min((gain - assessment.minElevationGainMeters) / assessment.minElevationGainMeters, 2);
      const waterSafety = Math.min(distWater / assessment.searchRadiusMeters, 1);
      const reachability = 1 / (1 + distUser / 500); // 500m ≈ ~6min walk baseline
      const crossPenalty = crosses ? 0.25 : 1;
      score = elevScore * waterSafety * reachability * crossPenalty;
    }

    return {
      position: pos,
      elevationMeters: elev,
      elevationGainMeters: gain,
      distanceToUserMeters: distUser,
      distanceToWaterMeters: distWater,
      crossesWater: crosses,
      score,
    };
  });

  const topCandidates = [...candidates]
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return {
    assessment,
    userElevationMeters: userElev,
    waterElevationMeters: waterElev,
    candidates,
    topCandidates,
  };
}
