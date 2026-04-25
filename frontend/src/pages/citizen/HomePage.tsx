import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import { useAlert } from "../../state/AlertContext";
import { useSettings } from "../../state/SettingsContext";
import { AegisLogo } from "../../components/brand/AegisLogo";
import { AppBar } from "../../components/layout/AppBar";
import { StageMeter } from "../../components/ui/StageMeter";
import {
  IconChevronR,
  IconRoute,
  IconSettings,
  IconTriangle,
  IconWifiOff,
} from "../../components/icons/Icons";
import { formatRelative, NOTIFICATIONS, DROUGHT_NOTIFICATIONS, STAGE_COLORS, VALENCIA } from "../../lib/demo";
import { stageHeadline, t } from "../../lib/i18n";
import { tileLayerConfig } from "../../lib/map";

function nextEfasCountdown(): string {
  const now = new Date();
  const secsPastHour = now.getUTCMinutes() * 60 + now.getUTCSeconds();
  const secsInto6h = ((now.getUTCHours() % 6) * 3600) + secsPastHour;
  const remaining = 6 * 3600 - secsInto6h;
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function nextEfasParts(): { h: string; m: string; s: string } {
  const now = new Date();
  const secsInto6h = (now.getUTCHours() % 6) * 3600 + now.getUTCMinutes() * 60 + now.getUTCSeconds();
  const rem = 6 * 3600 - secsInto6h;
  return {
    h: String(Math.floor(rem / 3600)).padStart(2, "0"),
    m: String(Math.floor((rem % 3600) / 60)).padStart(2, "0"),
    s: String(rem % 60).padStart(2, "0"),
  };
}

export function HomePage() {
  const { effectiveStage, userPosition, userPlaceName, userCountry, activeModule } = useAlert();
  const { online, previewLang } = useSettings();
  const navigate = useNavigate();

  const [countdown, setCountdown] = useState(nextEfasCountdown);
  useEffect(() => {
    const id = setInterval(() => setCountdown(nextEfasCountdown()), 30_000);
    return () => clearInterval(id);
  }, []);

  // High-precision countdown for stage ≥ 4 — same source as AlertPage. Only
  // ticks while critical so we don't re-render every second on quiet stages.
  const [cd, setCd] = useState(nextEfasParts);
  const isCriticalEarly = effectiveStage >= 4;
  useEffect(() => {
    if (!isCriticalEarly) return;
    setCd(nextEfasParts());
    const id = setInterval(() => setCd(nextEfasParts()), 1_000);
    return () => clearInterval(id);
  }, [isCriticalEarly]);

  // Vague OSM map preview centred on the user (or Valencia anchor as fallback).
  // Non-interactive — clicks pass through to the parent button which opens /map.
  const previewMapEl = useRef<HTMLDivElement | null>(null);
  const previewMapRef = useRef<L.Map | null>(null);
  useEffect(() => {
    if (!previewMapEl.current) return;
    const lat = userPosition?.lat ?? VALENCIA.center[0];
    const lng = userPosition?.lng ?? VALENCIA.center[1];
    if (previewMapRef.current) {
      previewMapRef.current.setView([lat, lng], 13);
      return;
    }
    const map = L.map(previewMapEl.current, {
      center: [lat, lng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
    });
    const { url, options } = tileLayerConfig();
    L.tileLayer(url, options).addTo(map);
    previewMapRef.current = map;
  }, [userPosition]);

  const stage = effectiveStage;
  const s = activeModule.stages[stage - 1];
  const headline = activeModule.id === "flood" ? stageHeadline(previewLang, stage) : s.headline;
  const isCritical = stage >= 4;

  const notifications = activeModule.id === "drought" ? DROUGHT_NOTIFICATIONS : NOTIFICATIONS;

  // Real place name from GPS reverse-geocoding; blank until resolved.
  const placeName = userPlaceName ?? (userPosition ? "Your area" : "—");
  void userCountry;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "var(--bg)" }}>
      {!online && (
        <div className="offline-bar">
          <IconWifiOff size={11} style={{ verticalAlign: "-2px", marginRight: 6 }} />
          OFFLINE — Galileo broadcast · last sync 04m ago
        </div>
      )}
      <AppBar
        sub={online ? "LIVE · COPERNICUS EMS" : "OFFLINE · CACHED"}
        title={placeName}
        left={
          <button className="icon-btn ghost" aria-label="Aegis">
            <AegisLogo size={26} color="var(--brand)" />
          </button>
        }
        right={
          <button className="icon-btn" onClick={() => navigate("/settings")} aria-label="Settings">
            <IconSettings size={18} />
          </button>
        }
      />

      <div className="scroll">
        {/* Stage card */}
        <div className="stage-card" data-stage={stage} onClick={() => navigate("/alert")}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
            <div>
              <div className="eyebrow" style={{ color: "rgba(255,255,255,.7)" }}>
                {t(previewLang, "currentStage")}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                  fontSize: 13.5,
                  letterSpacing: "0.05em",
                  marginTop: 6,
                  opacity: 0.85,
                }}
              >
                {s.short} · {s.label.toUpperCase()}
              </div>
            </div>
            <span
              className="chip mono"
              style={{
                background: "rgba(255,255,255,.18)",
                color: "inherit",
                borderColor: "rgba(255,255,255,.25)",
              }}
            >
              <span className="dot" style={{ background: "currentColor", opacity: 0.9 }} />
              {isCritical ? "ACTIVE" : online ? "LIVE" : "CACHED"}
            </span>
          </div>

          <div
            style={{
              fontSize: 34,
              fontWeight: 600,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              marginTop: 22,
              maxWidth: "92%",
            }}
          >
            {headline}
          </div>
          <div style={{ fontSize: 15, opacity: 0.88, marginTop: 12, lineHeight: 1.45, maxWidth: "94%" }}>
            {s.blurb}
          </div>

          <StageMeter n={stage} />

          {isCritical && (
            <div
              style={{
                marginTop: 18,
                paddingTop: 16,
                borderTop: "1px solid rgba(255,255,255,.18)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  opacity: 0.8,
                }}
              >
                {activeModule.countdownLabel}
              </div>
              <div className="countdown" style={{ marginTop: 6 }}>
                <span className="num">{cd.h}</span>
                <span className="lbl">H</span>
                <span className="num">{cd.m}</span>
                <span className="lbl">M</span>
                <span className="num">{cd.s}</span>
                <span className="lbl">S</span>
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: isCritical ? "flex-end" : "space-between",
              alignItems: "center",
              marginTop: isCritical ? 14 : 18,
              fontSize: 12,
              opacity: 0.85,
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.04em",
            }}
          >
            {!isCritical && <span>NEXT UPDATE · {countdown}</span>}
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600 }}>
              {t(previewLang, "seeAlert")} <IconChevronR size={13} />
            </span>
          </div>
        </div>

        {/* Critical action card */}
        {isCritical && activeModule.evacuationType === "route" && (
          <button
            onClick={() => navigate("/evacuation")}
            style={{
              marginTop: 14,
              width: "100%",
              textAlign: "left",
              padding: 16,
              borderRadius: 18,
              border: 0,
              cursor: "pointer",
              background: "var(--ink-card)",
              color: "var(--ink-card-fg)",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 14,
                background: "rgba(255,255,255,.12)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconRoute size={22} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t(previewLang, "safeRoute")}</div>
              <div
                style={{
                  fontSize: 11.5,
                  opacity: 0.7,
                  marginTop: 2,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "0.04em",
                }}
              >
                420 m · 6 MIN WALK · ASSEMBLY POINT B
              </div>
            </div>
            <IconChevronR size={18} />
          </button>
        )}

        {/* Map preview */}
        <button
          onClick={() => navigate("/map")}
          style={{
            marginTop: 18,
            width: "100%",
            textAlign: "left",
            padding: 0,
            borderRadius: 18,
            border: "1px solid var(--line)",
            cursor: "pointer",
            overflow: "hidden",
            background: "var(--surface)",
          }}
        >
          <div className="home-map-preview">
            <div ref={previewMapEl} className="home-map-preview-tiles" />
            <div className="home-map-preview-tint" />
            <div
              style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}
              className="user-loc"
            />
            <div
              style={{
                position: "absolute",
                top: 12,
                left: 14,
                padding: "4px 8px",
                borderRadius: 6,
                background: "rgba(255,255,255,.78)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                color: "var(--ink-2)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {activeModule.id === "drought"
                ? "drought risk zones · c3s"
                : userPlaceName
                  ? `${userPlaceName.toLowerCase()} · live area`
                  : "túria basin · 11.5 km radius"}
            </div>
          </div>
          <div
            style={{
              padding: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{t(previewLang, "viewMap")}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                {activeModule.mapLabel}
              </div>
            </div>
            <IconChevronR size={18} style={{ color: "var(--ink-3)" }} />
          </div>
        </button>

        {/* Recent alerts */}
        <div className="eyebrow" style={{ marginTop: 22, marginBottom: 6 }}>Recent alerts</div>
        <div className="card" style={{ padding: "4px 14px" }}>
          <div className="list">
            {notifications.slice(0, 3).map((n) => (
              <div key={n.id} className="list-row" onClick={() => navigate("/history")}>
                <div
                  className="lr-icon"
                  style={{
                    background: STAGE_COLORS[n.stage].bg,
                    color: STAGE_COLORS[n.stage].ink,
                  }}
                >
                  <IconTriangle size={16} />
                </div>
                <div className="lr-body">
                  <div className="lr-title">{n.title}</div>
                  <div className="lr-sub">{n.body.slice(0, 60)}…</div>
                </div>
                <div className="lr-meta">{formatRelative(n.minutesAgo)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: 22,
            padding: "14px 0",
            display: "flex",
            flexDirection: "column",
            gap: 4,
            fontSize: 10.5,
            color: "var(--ink-3)",
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            textAlign: "center",
          }}
        >
          <div>Aegis · v1.0.0 · build 2026.04.26</div>
          <div>operated by EU Civil Protection · funded by CASSINI</div>
        </div>
      </div>
    </div>
  );
}
