import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import { useSettings } from "../../state/SettingsContext";
import { AppBar } from "../../components/layout/AppBar";
import { Stat } from "../../components/ui/Stat";
import {
  IconChevronL,
  IconClose,
  IconFilter,
  IconMinus,
  IconPhone,
  IconPlus,
  IconRoute,
  IconShield,
} from "../../components/icons/Icons";
import { FF_UNITS, FLOOD_LAYERS, SOS_PINS, VALENCIA, type SOSPin } from "../../lib/demo";
import { tileLayerConfig } from "../../lib/map";

export function FirefighterPage() {
  const { online } = useSettings();
  const navigate = useNavigate();
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [selected, setSelected] = useState<SOSPin | null>(null);

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return;
    const map = L.map(mapEl.current, {
      center: VALENCIA.center,
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });
    const { url, options } = tileLayerConfig();
    L.tileLayer(url, options).addTo(map);
    mapRef.current = map;

    FLOOD_LAYERS.severe.forEach((c) => {
      L.polygon(
        c.map(([lng, lat]) => [lat, lng] as [number, number]),
        { color: "#c8412c", fillColor: "#c8412c", fillOpacity: 0.4, weight: 1.5 },
      ).addTo(map);
    });
    FLOOD_LAYERS.warning.forEach((c) => {
      L.polygon(
        c.map(([lng, lat]) => [lat, lng] as [number, number]),
        { color: "#e07b29", fillColor: "#e07b29", fillOpacity: 0.25, weight: 1 },
      ).addTo(map);
    });

    const clusterIc = L.divIcon({
      className: "",
      html: '<div class="cluster-dot">37</div>',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
    L.marker([39.461, -0.378], { icon: clusterIc })
      .addTo(map)
      .bindTooltip("37 phones · stranded cluster", { direction: "top" });

    SOS_PINS.forEach((p) => {
      const ic = L.divIcon({
        className: "",
        html: '<div class="sos-pin"><i>S</i></div>',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });
      L.marker([p.lat, p.lng], { icon: ic })
        .addTo(map)
        .on("click", () => setSelected(p));
    });

    FF_UNITS.forEach((u) => {
      const ic = L.divIcon({
        className: "",
        html: `<div class="firefighter-pin">${u.type[0]}</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      L.marker([u.lat, u.lng], { icon: ic }).addTo(map);
    });
  }, []);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div
        style={{
          background: "var(--ink-card)",
          color: "var(--ink-card-fg)",
          padding: "6px 14px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <IconShield size={14} />
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          BOMBEROS · OPS-VAL-04
        </div>
        <div style={{ flex: 1 }} />
        <span
          className="chip"
          style={{
            background: "rgba(255,255,255,.12)",
            color: "#fff",
            borderColor: "rgba(255,255,255,.18)",
          }}
        >
          <span className="dot" style={{ background: "oklch(0.7 0.14 145)" }} />
          {online ? "CONNECTED" : "MESH"}
        </span>
      </div>
      <AppBar
        sub="OPERATIONS · VALENCIA"
        title="Live rescue map"
        left={
          <button className="icon-btn" onClick={() => navigate("/")} aria-label="Back">
            <IconChevronL size={18} />
          </button>
        }
        right={
          <button className="icon-btn" aria-label="Filter">
            <IconFilter size={18} />
          </button>
        }
      />
      <div className="map-canvas">
        <div ref={mapEl} style={{ position: "absolute", inset: 0 }} />
        <div className="map-controls">
          <button
            className="icon-btn"
            onClick={() => mapRef.current?.zoomIn()}
            aria-label="Zoom in"
          >
            <IconPlus size={16} />
          </button>
          <button
            className="icon-btn"
            onClick={() => mapRef.current?.zoomOut()}
            aria-label="Zoom out"
          >
            <IconMinus size={16} />
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
            Live operations
          </div>
          <div className="lg-row">
            <i style={{ background: "#c8412c", borderRadius: "50%" }} /> SOS · {SOS_PINS.length}
          </div>
          <div className="lg-row">
            <i style={{ background: "oklch(0.55 0.18 250)" }} /> Units · {FF_UNITS.length}
          </div>
          <div className="lg-row">
            <i style={{ background: "oklch(0.62 0.18 25 / 0.85)", borderRadius: "50%" }} /> Density cluster
          </div>
        </div>
      </div>

      {/* Triage queue rail */}
      <div
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--line)",
          padding: "12px 14px 14px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <div className="eyebrow">SOS QUEUE · PRIORITISED</div>
          <div style={{ fontSize: 11, color: "var(--ink-3)", fontFamily: "var(--font-mono)" }}>
            {SOS_PINS.length} ACTIVE
          </div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
            margin: "0 -14px",
            padding: "0 14px 4px",
          }}
        >
          {SOS_PINS.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelected(p)}
              style={{
                minWidth: 200,
                padding: 12,
                borderRadius: 14,
                border: "1px solid var(--line)",
                background: "var(--surface-2)",
                cursor: "pointer",
                flexShrink: 0,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {p.id}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    padding: "2px 6px",
                    borderRadius: 6,
                    background: p.age > 15 ? "var(--s4)" : "var(--s3)",
                    color: "#fff",
                    fontFamily: "var(--font-mono)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {p.age} MIN
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 500, marginTop: 6 }}>{p.n} people</div>
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--ink-3)",
                  marginTop: 4,
                  lineHeight: 1.4,
                }}
              >
                {p.note}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <>
          <div className="sheet-bg" onClick={() => setSelected(null)} />
          <div className="sheet">
            <div className="sh-grab" />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="sos-pin" style={{ position: "relative", transform: "none" }}>
                <i style={{ transform: "none" }}>S</i>
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {selected.id}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                  {selected.n} people · {selected.note}
                </div>
              </div>
              <button
                className="icon-btn"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                <IconClose size={16} />
              </button>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginTop: 16,
              }}
            >
              <Stat label="Reported" value={selected.age} unit="min ago" />
              <Stat label="Coords" value={selected.lat.toFixed(4)} unit="±1.2 m" />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button className="btn secondary" style={{ flex: 1 }}>
                <IconPhone size={16} /> Call
              </button>
              <button className="btn primary" style={{ flex: 1 }}>
                <IconRoute size={16} /> Assign unit
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
