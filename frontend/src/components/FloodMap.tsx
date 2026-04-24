import { useEffect } from "react";
import { CircleMarker, MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { LatLng, Waterway } from "../lib/overpass";
import type { EvacuationResult } from "../lib/evacuation";

// Fix Leaflet's default marker icon paths when bundled.
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const bestIcon = L.divIcon({
  className: "best-marker",
  html: '<div style="background:#10b981;width:22px;height:22px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(16,185,129,0.8);"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const runnerUpIcon = L.divIcon({
  className: "runnerup-marker",
  html: '<div style="background:#38bdf8;width:16px;height:16px;border-radius:50%;border:2px solid white;"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function ClickHandler({ onClick }: { onClick: (p: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function Recenter({ center }: { center: LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView([center.lat, center.lng], Math.max(map.getZoom(), 14));
  }, [center, map]);
  return null;
}

type Props = {
  user: LatLng | null;
  waterways: Waterway[];
  result: EvacuationResult | null;
  onPick: (p: LatLng) => void;
};

export default function FloodMap({ user, waterways, result, onPick }: Props) {
  return (
    <MapContainer center={[52.1, 5.1]} zoom={8} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onClick={onPick} />
      <Recenter center={user} />

      {waterways.map((w) => (
        <Polyline
          key={w.id}
          positions={w.geometry.map((g) => [g.lat, g.lng])}
          pathOptions={{
            color: w.type === "river" ? "#2563eb" : w.type === "canal" ? "#0891b2" : "#60a5fa",
            weight: w.type === "river" ? 4 : 2,
            opacity: 0.85,
          }}
        >
          <Popup>
            {w.name ?? "(unnamed)"} — {w.type}
            {w.widthMeters ? ` · ${w.widthMeters}m wide` : ""}
          </Popup>
        </Polyline>
      ))}

      {user && (
        <Marker position={[user.lat, user.lng]}>
          <Popup>Your location</Popup>
        </Marker>
      )}

      {result?.candidates.map((c, i) => (
        <CircleMarker
          key={i}
          center={[c.position.lat, c.position.lng]}
          radius={4}
          pathOptions={{
            color: c.score > 0 ? "#10b981" : "#ef4444",
            fillOpacity: c.score > 0 ? Math.min(0.2 + c.score * 0.3, 0.9) : 0.3,
            weight: 1,
          }}
        />
      ))}

      {result?.topCandidates.map((c, i) => (
        <Marker
          key={`top-${i}`}
          position={[c.position.lat, c.position.lng]}
          icon={i === 0 ? bestIcon : runnerUpIcon}
        >
          <Popup>
            <b>#{i + 1} evacuation point</b>
            <br />
            Score: {c.score.toFixed(2)}
            <br />
            Elevation: {c.elevationMeters.toFixed(1)}m
            <br />
            Gain above water: +{c.elevationGainMeters.toFixed(1)}m
            <br />
            {c.routedDistanceMeters != null && c.routedDurationSeconds != null ? (
              <>
                Walking: {(c.routedDistanceMeters / 1000).toFixed(2)}km ·{" "}
                {Math.round(c.routedDurationSeconds / 60)} min
              </>
            ) : (
              <>Distance: {(c.distanceToUserMeters / 1000).toFixed(2)}km</>
            )}
            {c.crossesWater && (
              <>
                <br />
                <span style={{ color: "red" }}>⚠ route crosses water</span>
              </>
            )}
          </Popup>
        </Marker>
      ))}

      {result?.topCandidates.map((c, i) =>
        c.route ? (
          <Polyline
            key={`route-${i}`}
            positions={c.route.geometry.map((g) => [g.lat, g.lng])}
            pathOptions={
              i === 0
                ? { color: "#10b981", weight: 5 }
                : { color: "#38bdf8", weight: 3, opacity: 0.6, dashArray: "4 4" }
            }
          />
        ) : null,
      )}
    </MapContainer>
  );
}
