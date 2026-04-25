import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import { useAlert } from "../../state/AlertContext";
import { useSettings } from "../../state/SettingsContext";
import { AppBar } from "../../components/layout/AppBar";
import { StageBadge } from "../../components/ui/StageBadge";
import {
  IconChevronL,
  IconChevronR,
  IconCrosshair,
  IconLayers,
  IconMinus,
  IconPlus,
  IconWifiOff,
} from "../../components/icons/Icons";
import { FLOOD_LAYERS, SOS_PINS, FF_UNITS, VALENCIA } from "../../lib/demo";

export function MapPage() {
  const { effectiveStage, userPosition, userPlaceName } = useAlert();
  const { online, role } = useSettings();
  const navigate = useNavigate();

  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    const center: [number, number] = userPosition
      ? [userPosition.lat, userPosition.lng]
      : VALENCIA.center;
    const map = L.map(mapEl.current, {
      center,
      zoom: userPosition ? 13 : VALENCIA.zoom,
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
    mapRef.current = map;
  }, [userPosition]);

  // When the user's position arrives after the map is mounted, recenter.
  useEffect(() => {
    if (mapRef.current && userPosition) {
      mapRef.current.setView([userPosition.lat, userPosition.lng], 13);
    }
  }, [userPosition]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    layersRef.current.forEach((l) => map.removeLayer(l));
    layersRef.current = [];

    const addPoly = (coords: [number, number][], color: string, opacity = 0.35) => {
      const latlngs = coords.map(([lng, lat]) => [lat, lng] as [number, number]);
      const p = L.polygon(latlngs, {
        color,
        fillColor: color,
        fillOpacity: opacity,
        weight: 1.5,
        opacity: 0.7,
      }).addTo(map);
      layersRef.current.push(p);
    };

    if (effectiveStage >= 2) FLOOD_LAYERS.watch.forEach((c) => addPoly(c, "#f5c542", 0.25));
    if (effectiveStage >= 3) FLOOD_LAYERS.warning.forEach((c) => addPoly(c, "#e07b29", 0.35));
    if (effectiveStage >= 4) FLOOD_LAYERS.severe.forEach((c) => addPoly(c, "#c8412c", 0.45));

    const userIcon = L.divIcon({
      className: "",
      html: '<div class="user-loc"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });
    const userLatLng: [number, number] = userPosition
      ? [userPosition.lat, userPosition.lng]
      : VALENCIA.user;
    layersRef.current.push(L.marker(userLatLng, { icon: userIcon }).addTo(map));

    if ((role === "firefighter" && effectiveStage >= 4) || effectiveStage >= 5) {
      SOS_PINS.forEach((p) => {
        const ic = L.divIcon({
          className: "",
          html: '<div class="sos-pin"><i>S</i></div>',
          iconSize: [28, 28],
          iconAnchor: [14, 28],
        });
        const m = L.marker([p.lat, p.lng], { icon: ic }).addTo(map);
        m.bindTooltip(`${p.id} · ${p.n} people · ${p.age}m`, { direction: "top" });
        layersRef.current.push(m);
      });
    }

    if (role === "firefighter") {
      FF_UNITS.forEach((u) => {
        const ic = L.divIcon({
          className: "",
          html: `<div class="firefighter-pin">${u.type[0]}</div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });
        layersRef.current.push(L.marker([u.lat, u.lng], { icon: ic }).addTo(map));
      });
    }
  }, [effectiveStage, role]);

  const locSuffix = userPlaceName ? ` · ${userPlaceName}` : "";
  const stageHeadline =
    effectiveStage <= 2
      ? "No active flooding"
      : effectiveStage === 3
        ? `Localised flooding${locSuffix}`
        : effectiveStage === 4
          ? "Severe flooding reported"
          : "Evacuation in effect";
  const mapTitle = userPlaceName ?? "Túria basin";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      {!online && (
        <div className="offline-bar">
          <IconWifiOff size={11} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          OFFLINE — using cached tiles · Galileo broadcast active
        </div>
      )}
      <AppBar
        sub="LIVE FLOOD MAP"
        title={mapTitle}
        left={
          <button className="icon-btn" onClick={() => navigate("/")} aria-label="Back">
            <IconChevronL size={18} />
          </button>
        }
        right={
          <button className="icon-btn" aria-label="Layers">
            <IconLayers size={18} />
          </button>
        }
      />
      <div className="map-canvas">
        <div ref={mapEl} style={{ position: "absolute", inset: 0 }} />
        <div className="map-controls">
          <button className="icon-btn" onClick={() => mapRef.current?.zoomIn()} aria-label="Zoom in">
            <IconPlus size={16} />
          </button>
          <button className="icon-btn" onClick={() => mapRef.current?.zoomOut()} aria-label="Zoom out">
            <IconMinus size={16} />
          </button>
          <button
            className="icon-btn"
            onClick={() => {
              const target: [number, number] = userPosition
                ? [userPosition.lat, userPosition.lng]
                : VALENCIA.user;
              mapRef.current?.setView(target, 14);
            }}
            aria-label="Centre on me"
          >
            <IconCrosshair size={16} />
          </button>
        </div>
        <div className="map-legend">
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 600,
              fontSize: 10,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 6,
              color: "var(--ink-3)",
            }}
          >
            Flood extent
          </div>
          <div className="lg-row"><i style={{ background: "#f5c542" }} /> Watch · forecast</div>
          <div className="lg-row"><i style={{ background: "#e07b29" }} /> Warning · likely</div>
          <div className="lg-row"><i style={{ background: "#c8412c" }} /> Severe · observed (SAR)</div>
          {role === "firefighter" && (
            <>
              <div className="divider" style={{ margin: "6px 0" }} />
              <div className="lg-row"><i style={{ background: "oklch(0.55 0.18 250)" }} /> Units</div>
              <div className="lg-row"><i style={{ background: "#c8412c", borderRadius: "50%" }} /> SOS active</div>
            </>
          )}
        </div>
        <div className="map-info-card">
          <div className="card" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <StageBadge n={effectiveStage} size="sm" />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{stageHeadline}</div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--ink-3)",
                  fontFamily: "var(--font-mono)",
                  marginTop: 2,
                }}
              >
                {role === "firefighter"
                  ? `${SOS_PINS.length} SOS · ${FF_UNITS.length} UNITS`
                  : `SAR ${online ? "live" : "cached"} · 7 min ago`}
              </div>
            </div>
            <IconChevronR size={16} style={{ color: "var(--ink-3)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
