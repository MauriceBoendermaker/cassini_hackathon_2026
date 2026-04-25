import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../state/AlertContext";
import { useSettings } from "../../state/SettingsContext";
import { AegisLogo } from "../../components/brand/AegisLogo";
import { AppBar } from "../../components/layout/AppBar";
import { StageMeter } from "../../components/ui/StageMeter";
import { Stat } from "../../components/ui/Stat";
import {
  IconChevronR,
  IconRoute,
  IconSettings,
  IconTriangle,
  IconWifiOff,
} from "../../components/icons/Icons";
import { formatRelative, NOTIFICATIONS, DROUGHT_NOTIFICATIONS, STAGE_COLORS } from "../../lib/demo";
import { stageHeadline, t } from "../../lib/i18n";
import { useWeather } from "../../lib/useWeather";

function nextEfasCountdown(): string {
  const now = new Date();
  const secsPastHour = now.getUTCMinutes() * 60 + now.getUTCSeconds();
  const secsInto6h = ((now.getUTCHours() % 6) * 3600) + secsPastHour;
  const remaining = 6 * 3600 - secsInto6h;
  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function HomePage() {
  const { effectiveStage, userPosition, userPlaceName, userCountry, activeModule } = useAlert();
  const { online, previewLang } = useSettings();
  const navigate = useNavigate();
  // Fall back to Valencia coords so weather always loads even before GPS resolves.
  const weather = useWeather(userPosition?.lat ?? 39.4699, userPosition?.lng ?? -0.3763);

  const [countdown, setCountdown] = useState(nextEfasCountdown);
  useEffect(() => {
    const id = setInterval(() => setCountdown(nextEfasCountdown()), 30_000);
    return () => clearInterval(id);
  }, []);

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
                  fontSize: 13,
                  letterSpacing: "0.04em",
                  marginTop: 4,
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
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              marginTop: 18,
              maxWidth: "90%",
            }}
          >
            {headline}
          </div>
          <div style={{ fontSize: 13.5, opacity: 0.85, marginTop: 8, lineHeight: 1.5 }}>
            {s.blurb}
          </div>

          <StageMeter n={stage} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 14,
              fontSize: 11,
              opacity: 0.8,
              fontFamily: "var(--font-mono)",
            }}
          >
            <span>NEXT UPDATE · {countdown}</span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              {t(previewLang, "seeAlert")} <IconChevronR size={12} />
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

        {/* Live signals */}
        <div className="eyebrow" style={{ marginTop: 22, marginBottom: 10 }}>Live signals</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {activeModule.metrics.map((m) => {
            let value = m.value(stage);
            if (weather) {
              if (m.label.startsWith("Rainfall")) value = String(weather.precipitation1h);
              if (m.label.startsWith("Wind"))     value = String(weather.windGusts);
            }
            return (
              <Stat
                key={m.label}
                label={m.label}
                value={value}
                unit={m.unit}
                tone={m.tone(stage)}
              />
            );
          })}
        </div>

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
          <div
            style={{
              position: "relative",
              height: 140,
              background: `
                radial-gradient(60% 50% at 30% 50%, oklch(0.85 0.12 240 / .5), transparent 60%),
                radial-gradient(40% 30% at 70% 60%, oklch(0.78 0.18 25 / .5), transparent 70%),
                repeating-linear-gradient(135deg, var(--bg-soft) 0 6px, var(--surface-2) 6px 12px)
              `,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at 45% 55%, transparent 0, transparent 14px, var(--surface) 14px, var(--surface) 16px, transparent 16px)",
              }}
            />
            <div
              style={{ position: "absolute", left: "45%", top: "55%", transform: "translate(-50%,-50%)" }}
              className="user-loc"
            />
            <div
              style={{
                position: "absolute",
                top: 10,
                left: 12,
                fontSize: 10,
                fontFamily: "var(--font-mono)",
                color: "var(--ink-3)",
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
          <div>Aegis · v1.0.0-rc · build 2026.04.24</div>
          <div>operated by EU Civil Protection · funded by CASSINI</div>
        </div>
      </div>
    </div>
  );
}
