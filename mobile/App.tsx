import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FloodMap from "./src/components/FloodMap";
import Collapsible from "./src/components/Collapsible";
import { fetchWaterways, type LatLng, type Waterway } from "./src/lib/overpass";
import {
  planEvacuation,
  type EvacuationResult,
  type FloodClass,
} from "./src/lib/evacuation";

const OVERPASS_SEARCH_RADIUS_M = 5000;
const MONO = Platform.OS === "ios" ? "Menlo" : "monospace";

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

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />

      <View style={styles.mapWrap}>
        <FloodMap user={user} waterways={waterways} result={result} onPick={onPick} />
        {!user && (
          <View style={styles.instructions} pointerEvents="none">
            <Text style={styles.instructionsText}>
              Tap the map to simulate your location
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.panel}
        contentContainerStyle={styles.panelContent}
        showsVerticalScrollIndicator
      >
        <Text style={styles.h1}>🌊 Flood Evacuation</Text>
        <Text style={styles.sub}>
          Tap the map to simulate your position. The planner finds the safest nearby
          high ground based on OSM waterways, elevation, and walking routes.
        </Text>

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#fbbf24" />
            <Text style={styles.loading}>Analyzing terrain & waterways…</Text>
          </View>
        )}
        {error && (
          <View style={styles.errBox}>
            <Text style={styles.errText}>⚠ {error}</Text>
          </View>
        )}

        {result && a && (
          <>
            <Text style={styles.h2}>Flood threat</Text>
            <View style={[styles.badge, badgeBg(a.floodClass)]}>
              <Text style={[styles.badgeText, badgeFg(a.floodClass)]}>
                {a.floodClass === "none"
                  ? "No flood source nearby"
                  : `${a.floodClass} flood risk`}
              </Text>
            </View>
            {a.floodClass !== "none" && (
              <View style={{ marginTop: 4 }}>
                <KV
                  label="Source"
                  value={
                    `${a.worstWaterway?.name ?? "(unnamed)"} · ${a.worstWaterway?.type}` +
                    (a.worstWaterway?.widthMeters
                      ? ` · ${a.worstWaterway.widthMeters}m wide`
                      : "")
                  }
                />
                <KV
                  label="Distance to water"
                  value={`${a.distanceToWaterMeters?.toFixed(0)}m`}
                />
                <KV label="Search radius" value={`${a.searchRadiusMeters}m`} />
                <KV
                  label="Min elevation gain"
                  value={`+${a.minElevationGainMeters}m above water`}
                />
                <KV
                  label="Your elevation"
                  value={`${result.userElevationMeters.toFixed(1)}m · Water: ${result.waterElevationMeters?.toFixed(1)}m`}
                />
              </View>
            )}

            {result.topCandidates.length > 0 && (
              <>
                <Text style={styles.h2}>Top evacuation points</Text>
                {result.topCandidates.map((c, i) => (
                  <View
                    key={i}
                    style={[styles.candidate, i === 0 && styles.candidateBest]}
                  >
                    <Text>
                      <Text style={styles.score}>{c.score.toFixed(2)}</Text>
                      <Text style={styles.rank}>  #{i + 1}</Text>
                    </Text>
                    <Text style={styles.meta}>
                      {c.elevationMeters.toFixed(1)}m elev · +
                      {c.elevationGainMeters.toFixed(1)}m gain
                      {c.routedDistanceMeters != null && c.routedDurationSeconds != null
                        ? ` · ${(c.routedDistanceMeters / 1000).toFixed(2)}km walk · ${Math.round(
                            c.routedDurationSeconds / 60,
                          )} min`
                        : ` · ${(c.distanceToUserMeters / 1000).toFixed(2)}km straight`}
                      {c.crossesWater ? "  ⚠ route crosses water" : ""}
                    </Text>
                    {c.scoreBreakdown && (
                      <Text style={styles.formula}>
                        elev{" "}
                        <Text style={styles.bold}>
                          {c.scoreBreakdown.elevationFactor.toFixed(2)}
                        </Text>
                        {" × "}safety{" "}
                        <Text style={styles.bold}>
                          {c.scoreBreakdown.waterSafetyFactor.toFixed(2)}
                        </Text>
                        {" × "}reach{" "}
                        <Text style={styles.bold}>
                          {c.scoreBreakdown.reachabilityFactor.toFixed(2)}
                        </Text>
                        {" = "}
                        <Text style={[styles.bold, { color: "#10b981" }]}>
                          {c.score.toFixed(2)}
                        </Text>
                      </Text>
                    )}
                  </View>
                ))}
              </>
            )}

            {a.floodClass !== "none" && result.topCandidates.length === 0 && (
              <View style={styles.errBox}>
                <Text style={styles.errText}>
                  No candidate in the search radius meets the minimum elevation
                  requirement. The area may be a floodplain — a longer evacuation
                  would be needed.
                </Text>
              </View>
            )}
          </>
        )}

        <Collapsible title="How the score works">
          <View style={styles.explainer}>
            <View style={styles.formulaHero}>
              <Text style={styles.formulaHeroText}>
                score = elevation × waterSafety × reachability
              </Text>
            </View>

            <Factor name="elevation" range="1.0–3.0">
              how far above water level, relative to the minimum gain required for this
              flood class. 1.0 at min gain, saturates at 3.0 when 3× higher.
            </Factor>

            <Factor name="waterSafety" range="0–1">
              distance from the waterway as a fraction of the search radius. Hits 1.0
              at the edge of the search area; 0 right next to the water.
            </Factor>

            <Factor name="reachability" range="0–1">
              <Text style={styles.code}>1 / (1 + walkMin/6)</Text> — 6 min walk = 0.5,
              12 min = 0.33, 18 min = 0.25.{"\n"}
              <Text style={styles.footnote}>
                Walking time is estimated from routed road distance at 5 km/h (1.4 m/s),
                the standard adult pace — we don't assume access to a car.
              </Text>
            </Factor>

            <View style={styles.zeroNote}>
              <Text style={styles.zeroNoteText}>
                Candidates below the minimum elevation gain or with no walking route
                score <Text style={styles.bold}>0</Text>.
              </Text>
            </View>

            <View style={styles.table}>
              <View style={styles.trHead}>
                <Text style={[styles.thCell, { flex: 1.4 }]}>Flood class</Text>
                <Text style={styles.thCell}>Radius</Text>
                <Text style={styles.thCell}>Min gain</Text>
              </View>
              <TableRow cells={["small (stream)", "500 m", "+2 m"]} />
              <TableRow cells={["medium (river <20m)", "1500 m", "+5 m"]} />
              <TableRow cells={["large (river ≥20m)", "4000 m", "+15 m"]} />
            </View>
          </View>
        </Collapsible>

        <Text style={styles.h2}>Legend</Text>
        <Text style={styles.legend}>🔵 Rivers · 🟦 Canals · 🩵 Streams</Text>
        <Text style={styles.legend}>🟢 Best evac point · 🔷 Runner-ups</Text>
        <Text style={styles.legend}>━━ Best route · - - - Runner-up routes</Text>
        <Text style={styles.attribution}>
          Data: OpenStreetMap (Overpass), Open-Meteo elevation (Copernicus DEM), OSRM.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function KV({ label, value }: { label: string; value: string | undefined }) {
  return (
    <Text style={styles.kv}>
      <Text style={styles.bold}>{label}:</Text> {value}
    </Text>
  );
}

function Factor({
  name,
  range,
  children,
}: {
  name: string;
  range: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.factor}>
      <View style={styles.factorHeader}>
        <Text style={styles.bold}>{name}</Text>
        <View style={styles.rangePill}>
          <Text style={styles.rangePillText}>{range}</Text>
        </View>
      </View>
      <Text style={styles.factorBody}>{children}</Text>
    </View>
  );
}

function TableRow({ cells }: { cells: string[] }) {
  return (
    <View style={styles.tr}>
      {cells.map((c, i) => (
        <Text key={i} style={[styles.tdCell, i === 0 && { flex: 1.4 }]}>
          {c}
        </Text>
      ))}
    </View>
  );
}

function badgeBg(c: FloodClass) {
  switch (c) {
    case "large":
      return { backgroundColor: "#7f1d1d" };
    case "medium":
      return { backgroundColor: "#713f12" };
    case "small":
      return { backgroundColor: "#1e3a8a" };
    default:
      return { backgroundColor: "#14532d" };
  }
}

function badgeFg(c: FloodClass) {
  switch (c) {
    case "large":
      return { color: "#fecaca" };
    case "medium":
      return { color: "#fde68a" };
    case "small":
      return { color: "#bfdbfe" };
    default:
      return { color: "#bbf7d0" };
  }
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0f172a" },
  mapWrap: { flex: 1.1 },
  instructions: {
    position: "absolute",
    top: 12,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  instructionsText: {
    color: "#e2e8f0",
    fontSize: 13,
    backgroundColor: "rgba(15,23,42,0.9)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
    overflow: "hidden",
  },
  panel: { flex: 1, backgroundColor: "#0f172a" },
  panelContent: { padding: 16, paddingBottom: 40 },

  h1: { fontSize: 20, color: "#38bdf8", fontWeight: "700", marginBottom: 4 },
  h2: {
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#94a3b8",
    marginTop: 20,
    marginBottom: 8,
    fontWeight: "600",
  },
  sub: { color: "#94a3b8", fontSize: 12, marginBottom: 8, lineHeight: 18 },

  loadingBox: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  loading: { color: "#fbbf24", fontStyle: "italic", marginLeft: 8 },
  errBox: {
    backgroundColor: "#450a0a",
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  errText: { color: "#fca5a5" },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  badgeText: { fontWeight: "600", fontSize: 12 },
  kv: { color: "#e2e8f0", fontSize: 13, marginVertical: 2, lineHeight: 18 },

  candidate: {
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#1e293b",
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#38bdf8",
  },
  candidateBest: { borderLeftColor: "#10b981" },
  score: { fontSize: 20, fontWeight: "700", color: "#10b981" },
  rank: { color: "#94a3b8", fontSize: 14 },
  meta: { fontSize: 12, color: "#94a3b8", marginTop: 2, lineHeight: 16 },
  formula: {
    fontFamily: MONO,
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#334155",
  },
  bold: { fontWeight: "700", color: "#e2e8f0" },

  explainer: { backgroundColor: "#1e293b", padding: 12, borderRadius: 6 },
  formulaHero: {
    backgroundColor: "#0f172a",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginBottom: 10,
    alignItems: "center",
  },
  formulaHeroText: { fontFamily: MONO, color: "#38bdf8", fontSize: 12 },

  factor: { marginTop: 8 },
  factorHeader: { flexDirection: "row", alignItems: "center" },
  factorBody: { color: "#cbd5e1", fontSize: 12, lineHeight: 18, marginTop: 4 },
  rangePill: {
    backgroundColor: "#334155",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 8,
  },
  rangePillText: { color: "#cbd5e1", fontSize: 10 },
  code: {
    backgroundColor: "#0f172a",
    color: "#7dd3fc",
    fontFamily: MONO,
    fontSize: 11,
  },
  footnote: { color: "#64748b", fontSize: 11 },

  zeroNote: {
    backgroundColor: "#0f172a",
    padding: 8,
    borderRadius: 4,
    marginTop: 10,
  },
  zeroNoteText: { color: "#cbd5e1", fontSize: 11, lineHeight: 16 },

  table: { marginTop: 12 },
  trHead: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#334155",
  },
  tr: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#334155",
  },
  thCell: {
    flex: 1,
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
    fontSize: 10,
    letterSpacing: 1,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  tdCell: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 2,
    color: "#cbd5e1",
    fontSize: 11,
  },

  legend: { color: "#cbd5e1", fontSize: 12, marginVertical: 2 },
  attribution: { color: "#64748b", fontSize: 11, marginTop: 16 },
});
