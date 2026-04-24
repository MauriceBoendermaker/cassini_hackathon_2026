import { useState } from "react";
import FloodMap from "./components/FloodMap";
import { fetchWaterways, type LatLng, type Waterway } from "./lib/overpass";
import { planEvacuation, type EvacuationResult } from "./lib/evacuation";
import "./App.css";

const OVERPASS_SEARCH_RADIUS_M = 5000;

export default function App() {
  const [user, setUser] = useState<LatLng | null>(null);
  const [waterways, setWaterways] = useState<Waterway[]>([]);
  const [result, setResult] = useState<EvacuationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPick(p: LatLng) {
    setUser(p);
    setResult(null);
    setWaterways([]);
    setError(null);
    setLoading(true);
    try {
      const ways = await fetchWaterways(p, OVERPASS_SEARCH_RADIUS_M);
      setWaterways(ways);
      const r = await planEvacuation(p, ways);
      setResult(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  const a = result?.assessment;
  const badgeClass =
    a?.floodClass === "large"
      ? "large"
      : a?.floodClass === "medium"
        ? "medium"
        : a?.floodClass === "small"
          ? "small"
          : "safe";

  return (
    <div className="app">
      <div className="map-wrap">
        {!user && (
          <div className="instructions">Click anywhere on the map to simulate your location</div>
        )}
        <FloodMap user={user} waterways={waterways} result={result} onPick={onPick} />
      </div>

      <div className="panel">
        <h1>🌊 Flood Evacuation</h1>
        <p style={{ color: "#94a3b8", fontSize: 12 }}>
          Click the map to simulate your position. The planner finds the safest nearby high ground based
          on OSM waterways and Open-Meteo elevation.
        </p>

        {loading && <p className="loading">Analyzing terrain & waterways…</p>}
        {error && <div className="err">⚠ {error}</div>}

        {result && a && (
          <>
            <h2>Flood threat</h2>
            <span className={`badge ${badgeClass}`}>
              {a.floodClass === "none" ? "No flood source nearby" : `${a.floodClass} flood risk`}
            </span>
            {a.floodClass !== "none" && (
              <>
                <p>
                  <b>Source:</b>{" "}
                  {a.worstWaterway?.name ?? "(unnamed)"} · {a.worstWaterway?.type}
                  {a.worstWaterway?.widthMeters ? ` · ${a.worstWaterway.widthMeters}m wide` : ""}
                </p>
                <p>
                  <b>Distance to water:</b> {a.distanceToWaterMeters?.toFixed(0)}m
                </p>
                <p>
                  <b>Search radius:</b> {a.searchRadiusMeters}m
                </p>
                <p>
                  <b>Min elevation gain:</b> +{a.minElevationGainMeters}m above water
                </p>
                <p>
                  <b>Your elevation:</b> {result.userElevationMeters.toFixed(1)}m ·{" "}
                  <b>Water:</b> {result.waterElevationMeters?.toFixed(1)}m
                </p>
              </>
            )}

            {result.topCandidates.length > 0 && (
              <>
                <h2>Top evacuation points</h2>
                {result.topCandidates.map((c, i) => (
                  <div key={i} className={`candidate ${i === 0 ? "best" : ""}`}>
                    <div>
                      <span className="score">{c.score.toFixed(2)}</span>{" "}
                      <span style={{ color: "#94a3b8" }}>#{i + 1}</span>
                    </div>
                    <div className="meta">
                      {c.elevationMeters.toFixed(1)}m elev · +{c.elevationGainMeters.toFixed(1)}m gain
                      {c.routedDistanceMeters != null && c.routedDurationSeconds != null
                        ? ` · ${(c.routedDistanceMeters / 1000).toFixed(2)}km walk · ${Math.round(
                            c.routedDurationSeconds / 60,
                          )} min`
                        : ` · ${(c.distanceToUserMeters / 1000).toFixed(2)}km straight`}
                      {c.crossesWater && " · ⚠ route crosses water"}
                    </div>
                    {c.scoreBreakdown && (
                      <div className="formula">
                        elev <b>{c.scoreBreakdown.elevationFactor.toFixed(2)}</b>
                        {" × "}
                        safety <b>{c.scoreBreakdown.waterSafetyFactor.toFixed(2)}</b>
                        {" × "}
                        reach <b>{c.scoreBreakdown.reachabilityFactor.toFixed(2)}</b>
                        {" = "}
                        <b style={{ color: "#10b981" }}>{c.score.toFixed(2)}</b>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {a.floodClass !== "none" && result.topCandidates.length === 0 && (
              <p className="err">
                No candidate in the search radius meets the minimum elevation requirement. The area
                may be a floodplain — a longer-distance evacuation would be needed.
              </p>
            )}
          </>
        )}

        <details className="score-details">
          <summary>How the score works</summary>
          <div className="score-explainer">
          <div className="formula-hero">
            score = elevation × waterSafety × reachability
          </div>
          <p>
            <b>elevation</b> <span className="range">1.0–3.0</span>
            <br />
            how far above water level, relative to the minimum gain required for this flood class.
            1.0 at min gain, saturates at 3.0 when the point is 3× higher than required.
          </p>
          <p>
            <b>waterSafety</b> <span className="range">0–1</span>
            <br />
            distance from the waterway as a fraction of the search radius. Hits 1.0 at the edge of
            the search area; 0 right next to the water.
          </p>
          <p>
            <b>reachability</b> <span className="range">0–1</span>
            <br />
            <code>1 / (1 + walkMinutes/6)</code> — 6 min walk = 0.5, 12 min = 0.33, 18 min = 0.25.
            <br />
            <span style={{ color: "#64748b", fontSize: 11 }}>
              Walking time is estimated from the routed road distance at 5 km/h
              (1.4 m/s), the standard adult pace — we don't assume access to a car.
            </span>
          </p>
          <p className="zero-note">
            Candidates below the minimum elevation gain or with no walking route score <b>0</b>.
          </p>
          <table className="thresholds">
            <thead>
              <tr>
                <th>Flood class</th>
                <th>Radius</th>
                <th>Min gain</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>small (stream)</td><td>500 m</td><td>+2 m</td></tr>
              <tr><td>medium (river &lt; 20m)</td><td>1500 m</td><td>+5 m</td></tr>
              <tr><td>large (river ≥ 20m)</td><td>4000 m</td><td>+15 m</td></tr>
            </tbody>
          </table>
          </div>
        </details>

        <h2>Legend</h2>
        <p>🔵 Rivers · 🟦 Canals · 🩵 Streams</p>
        <p>🟢 Best evac point · 🔷 Runner-ups</p>
        <p>━━ Best walking route · - - - Runner-up routes</p>
        <p style={{ color: "#64748b", fontSize: 11, marginTop: 20 }}>
          Data: OpenStreetMap (Overpass), Open-Meteo elevation (Copernicus DEM), OSRM pedestrian routing.
        </p>
      </div>
    </div>
  );
}
