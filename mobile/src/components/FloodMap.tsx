import { useEffect, useRef } from "react";
import { StyleSheet, View, Text } from "react-native";
import MapView, {
  Circle,
  Marker,
  Polyline,
  UrlTile,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import type { LatLng, Waterway } from "../lib/overpass";
import type { EvacuationResult } from "../lib/evacuation";

type Props = {
  user: LatLng | null;
  waterways: Waterway[];
  result: EvacuationResult | null;
  onPick: (p: LatLng) => void;
};

export default function FloodMap({ user, waterways, result, onPick }: Props) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (user && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: user.lat,
          longitude: user.lng,
          latitudeDelta: 0.04,
          longitudeDelta: 0.04,
        },
        500,
      );
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        mapType="none"
        initialRegion={{
          latitude: 52.1,
          longitude: 5.1,
          latitudeDelta: 4,
          longitudeDelta: 4,
        }}
        onPress={(e) =>
          onPick({
            lat: e.nativeEvent.coordinate.latitude,
            lng: e.nativeEvent.coordinate.longitude,
          })
        }
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
        />

        {waterways.map((w) => (
          <Polyline
            key={`w-${w.id}`}
            coordinates={w.geometry.map((g) => ({ latitude: g.lat, longitude: g.lng }))}
            strokeColor={
              w.type === "river" ? "#2563eb" : w.type === "canal" ? "#0891b2" : "#60a5fa"
            }
            strokeWidth={w.type === "river" ? 4 : 2}
          />
        ))}

        {result?.candidates.map((c, i) => (
          <Circle
            key={`cand-${i}`}
            center={{ latitude: c.position.lat, longitude: c.position.lng }}
            radius={40}
            strokeColor={c.score > 0 ? "#10b981" : "#ef4444"}
            fillColor={
              c.score > 0
                ? `rgba(16,185,129,${Math.min(0.2 + c.score * 0.3, 0.9).toFixed(2)})`
                : "rgba(239,68,68,0.25)"
            }
            strokeWidth={1}
          />
        ))}

        {result?.topCandidates.map((c, i) =>
          c.route ? (
            <Polyline
              key={`route-${i}`}
              coordinates={c.route.geometry.map((g) => ({
                latitude: g.lat,
                longitude: g.lng,
              }))}
              strokeColor={i === 0 ? "#10b981" : "#38bdf8"}
              strokeWidth={i === 0 ? 5 : 3}
              lineDashPattern={i === 0 ? undefined : [6, 6]}
            />
          ) : null,
        )}

        {user && (
          <Marker
            coordinate={{ latitude: user.lat, longitude: user.lng }}
            title="Your location"
            pinColor="red"
          />
        )}

        {result?.topCandidates.map((c, i) => (
          <Marker
            key={`top-${i}`}
            coordinate={{ latitude: c.position.lat, longitude: c.position.lng }}
            title={`#${i + 1} evacuation point`}
            description={
              `Score ${c.score.toFixed(2)} · +${c.elevationGainMeters.toFixed(1)}m gain` +
              (c.routedDistanceMeters != null && c.routedDurationSeconds != null
                ? ` · ${(c.routedDistanceMeters / 1000).toFixed(2)}km, ${Math.round(
                    c.routedDurationSeconds / 60,
                  )} min`
                : "") +
              (c.crossesWater ? " ⚠ crosses water" : "")
            }
            pinColor={i === 0 ? "green" : "blue"}
          />
        ))}
      </MapView>

      <View style={styles.attribution} pointerEvents="none">
        <Text style={styles.attributionText}>© OpenStreetMap</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  attribution: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(255,255,255,0.75)",
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  attributionText: { fontSize: 9, color: "#333" },
});
