import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import { useAlert } from "../../state/AlertContext";
import { useSettings } from "../../state/SettingsContext";
import { AppBar } from "../../components/layout/AppBar";
import { StageBadge } from "../../components/ui/StageBadge";
import {
  IconChevronL,
  IconChevronR,
  IconClose,
  IconCrosshair,
  IconDrop,
  IconLayers,
  IconMinus,
  IconPlus,
  IconRoute,
  IconWifiOff,
} from "../../components/icons/Icons";
import { FLOOD_LAYERS, SOS_PINS, FF_UNITS, VALENCIA } from "../../lib/demo";
import { tileLayerConfig } from "../../lib/map";

// Demo road closures — key routes affected by flooding
const ROAD_CLOSURES: [number, number][][] = [
  [[39.466, -0.385], [39.463, -0.379]],
  [[39.455, -0.377], [39.452, -0.372]],
  [[39.458, -0.353], [39.461, -0.348]],
];

// Demo river sensors along the Túria
const RIVER_SENSORS = [
  { id: "S1", lat: 39.485, lng: -0.421, level: 2.1, status: "warn" as const },
  { id: "S2", lat: 39.475, lng: -0.395, level: 3.4, status: "alert" as const },
  { id: "S3", lat: 39.462, lng: -0.368, level: 1.8, status: "ok" as const },
  { id: "S4", lat: 39.449, lng: -0.341, level: 1.2, status: "ok" as const },
];

type LayerState = { floodZones: boolean; roadClosures: boolean; sensors: boolean };
const DEFAULT_LAYERS: LayerState = { floodZones: true, roadClosures: false, sensors: false };

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      style={{
        width: 34,
        height: 20,
        borderRadius: 10,
        background: on ? "var(--ink-card)" : "var(--line-strong, #c5c2bb)",
        border: "none",
        cursor: "pointer",
        position: "relative",
        flexShrink: 0,
        transition: "background .15s",
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: on ? 17 : 3,
          width: 14,
          height: 14,
          borderRadius: "50%",
          background: "#fff",
          transition: "left .15s",
          display: "block",
        }}
      />
    </button>
  );
}

export function MapPage() {
  const { effectiveStage, userPosition, userPlaceName } = useAlert();
  const { online, role } = useSettings();
  const navigate = useNavigate();

  const [showLayers, setShowLayers] = useState(false);
  const [layers, setLayers] = useState<LayerState>(DEFAULT_LAYERS);

  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);
  const roadLayersRef = useRef<L.Layer[]>([]);
  const sensorLayersRef = useRef<L.Layer[]>([]);

  const hasNonDefault = !layers.floodZones || layers.roadClosures || layers.sensors;

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
    const { url, options } = tileLayerConfig();
    L.tileLayer(url, options).addTo(map);
    mapRef.current = map;
  }, [userPosition]);

  useEffect(() => {
    if (mapRef.current && userPosition) {
      mapRef.current.setView([userPosition.lat, userPosition.lng], 13);
    }
  }, [userPosition]);

  // Flood zones + user marker + SOS + FF units
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

    if (layers.floodZones) {
      if (effectiveStage >= 2) FLOOD_LAYERS.watch.forEach((c) => addPoly(c, "#f5c542", 0.25));
      if (effectiveStage >= 3) FLOOD_LAYERS.warning.forEach((c) => addPoly(c, "#e07b29", 0.35));
      if (effectiveStage >= 4) FLOOD_LAYERS.severe.forEach((c) => addPoly(c, "#c8412c", 0.45));
    }

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
  }, [effectiveStage, role, layers.floodZones]);

  // Road closure overlays
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    roadLayersRef.current.forEach((l) => map.removeLayer(l));
    roadLayersRef.current = [];
    if (!layers.roadClosures) return;
    ROAD_CLOSURES.forEach((pts) => {
      const line = L.polyline(pts as [number, number][], {
        color: "#e07b29",
        weight: 5,
        opacity: 0.85,
        dashArray: "8 6",
      }).addTo(map);
      line.bindTooltip("Road closed · flooding", { direction: "top" });
      roadLayersRef.current.push(line);
    });
  }, [layers.roadClosures]);

  // River sensor overlays
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    sensorLayersRef.current.forEach((l) => map.removeLayer(l));
    sensorLayersRef.current = [];
    if (!layers.sensors) return;
    RIVER_SENSORS.forEach((s) => {
      const color =
        s.status === "alert" ? "#c8412c" : s.status === "warn" ? "#f5c542" : "oklch(0.65 0.14 145)";
      const ic = L.divIcon({
        className: "",
        html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#fff;font-family:monospace">H</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      const m = L.marker([s.lat, s.lng], { icon: ic }).addTo(map);
      m.bindTooltip(`${s.id} · ${s.level} m water level`, { direction: "top" });
      sensorLayersRef.current.push(m);
    });
  }, [layers.sensors]);

  function setLayer<K extends keyof LayerState>(key: K, val: boolean) {
    setLayers((prev) => ({ ...prev, [key]: val }));
  }

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
          <button
            className="icon-btn"
            onClick={() => setShowLayers(true)}
            aria-label="Layers"
            style={{ position: "relative" }}
          >
            <IconLayers size={18} />
            {hasNonDefault && (
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--s3)",
                  border: "1.5px solid var(--surface)",
                }}
              />
            )}
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
          {layers.floodZones && (
            <>
              <div className="lg-row"><i style={{ background: "#f5c542" }} /> Watch · forecast</div>
              <div className="lg-row"><i style={{ background: "#e07b29" }} /> Warning · likely</div>
              <div className="lg-row"><i style={{ background: "#c8412c" }} /> Severe · observed (SAR)</div>
            </>
          )}
          {layers.roadClosures && (
            <div className="lg-row"><i style={{ background: "#e07b29", borderRadius: 2 }} /> Road closed</div>
          )}
          {layers.sensors && (
            <div className="lg-row"><i style={{ background: "#f5c542", borderRadius: "50%" }} /> River sensor</div>
          )}
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

      {showLayers && (
        <LayersPanel layers={layers} setLayer={setLayer} onClose={() => setShowLayers(false)} />
      )}
    </div>
  );
}

function LayerRow({
  icon,
  iconBg,
  title,
  sub,
  on,
  onChange,
}: {
  icon: ReactNode;
  iconBg: string;
  title: string;
  sub: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0" }}>
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 9,
          background: iconBg,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 1 }}>{sub}</div>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

function LayersPanel({
  layers,
  setLayer,
  onClose,
}: {
  layers: LayerState;
  setLayer: <K extends keyof LayerState>(key: K, val: boolean) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="sheet-bg" onClick={onClose} />
      <div className="sheet">
        <div className="sh-grab" />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ flex: 1, fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>
            Map layers
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose size={16} />
          </button>
        </div>

        <div className="card" style={{ padding: "4px 14px" }}>
          <LayerRow
            icon={<IconLayers size={18} />}
            iconBg="var(--ink-card)"
            title="Flood zones"
            sub="Copernicus SAR flood extent"
            on={layers.floodZones}
            onChange={(v) => setLayer("floodZones", v)}
          />
          <div style={{ height: 1, background: "var(--line)", margin: "0 0 0 44px" }} />
          <LayerRow
            icon={<IconRoute size={18} />}
            iconBg="oklch(0.62 0.18 50)"
            title="Road closures"
            sub="Affected roads · real-time traffic"
            on={layers.roadClosures}
            onChange={(v) => setLayer("roadClosures", v)}
          />
          <div style={{ height: 1, background: "var(--line)", margin: "0 0 0 44px" }} />
          <LayerRow
            icon={<IconDrop size={18} />}
            iconBg="oklch(0.55 0.18 230)"
            title="River sensors"
            sub="Water level gauges · Túria basin"
            on={layers.sensors}
            onChange={(v) => setLayer("sensors", v)}
          />
        </div>

        <div
          style={{
            fontSize: 11.5,
            color: "var(--ink-3)",
            marginTop: 14,
            lineHeight: 1.5,
            textAlign: "center",
          }}
        >
          Satellite data: Copernicus EMS · Sensor data: CHJ / SAIH
        </div>
      </div>
    </>
  );
}
