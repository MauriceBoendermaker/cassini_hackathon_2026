import { useNavigate } from "react-router-dom";
import { useAlert } from "../../state/AlertContext";
import { useSettings } from "../../state/SettingsContext";
import { StatusBar } from "../../components/layout/StatusBar";
import { HomeIndicator } from "../../components/layout/HomeIndicator";
import {
  IconChevronL,
  IconLightning,
  IconMap,
  IconRoute,
  IconShare,
  IconWifiOff,
} from "../../components/icons/Icons";

export function AlertPage() {
  const { effectiveStage, activeModule } = useAlert();
  const { online } = useSettings();
  const navigate = useNavigate();
  const stage = effectiveStage;
  const s = activeModule.stages[stage - 1];
  const isOfflineCritical = !online && stage >= 3;

  // Stage 2 (yellow) needs dark UI — the rest use white. rgb is the channel
  // triple we interpolate transparency from, so accents (chips, card tints)
  // look consistent against whatever the stage background happens to be.
  const isLightStage = stage === 2;
  const rgb = isLightStage ? "0,0,0" : "255,255,255";
  const borderRgba = `rgba(${rgb},.2)`;

  return (
    <div className="fullbleed-stage" data-stage={stage}>
      <StatusBar tone={isLightStage ? "light" : "dark"} />
      <div className="app-bar">
        <button
          className="icon-btn ghost"
          style={{ color: "inherit", borderColor: borderRgba }}
          onClick={() => navigate("/")}
          aria-label="Back"
        >
          <IconChevronL size={18} />
        </button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div
            style={{
              fontSize: 11,
              opacity: 0.7,
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            ACTIVE ALERT · {s.short}
          </div>
        </div>
        <button className="icon-btn ghost" style={{ color: "inherit" }} aria-label="Share">
          <IconShare size={18} />
        </button>
      </div>

      <div style={{ flex: 1, padding: "8px 24px 24px", overflowY: "auto" }}>
        <div
          style={{
            fontSize: 11,
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            opacity: 0.85,
            marginBottom: 8,
          }}
        >
          {s.label} · ISSUED 14:08 CEST · 29 OCT 2026
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          {s.headline}
        </h1>
        <p style={{ fontSize: 15, opacity: 0.9, marginTop: 14, lineHeight: 1.55 }}>
          {s.blurb} Civil Protection has activated Phase {Math.min(stage, 5)}.
        </p>

        {/* Countdown */}
        <div
          style={{
            marginTop: 22,
            padding: 18,
            borderRadius: 18,
            background: `rgba(${rgb === "0,0,0" ? "0,0,0" : "0,0,0"},.22)`,
            border: `1px solid rgba(${rgb},.14)`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div
              style={{
                fontSize: 11,
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                opacity: 0.8,
              }}
            >
              {isOfflineCritical ? "OFFLINE AI · ETA TO PEAK" : activeModule.countdownLabel}
            </div>
            {isOfflineCritical && (
              <span
                className="chip"
                style={{
                  background: `rgba(${rgb},.12)`,
                  color: "inherit",
                  borderColor: borderRgba,
                }}
              >
                <IconWifiOff size={11} /> Galileo
              </span>
            )}
          </div>
          <div className="countdown" style={{ marginTop: 10 }}>
            <span className="num">01</span>
            <span className="lbl">H</span>
            <span className="num">42</span>
            <span className="lbl">M</span>
            <span className="num">08</span>
            <span className="lbl">S</span>
          </div>
          {isOfflineCritical && (
            <div style={{ fontSize: 11.5, opacity: 0.7, marginTop: 10, lineHeight: 1.5 }}>
              Calculated on-device from last Sentinel-1 SAR pass · ±12 min uncertainty.
            </div>
          )}
        </div>

        {/* What to do */}
        <div
          className="eyebrow"
          style={{ color: "inherit", opacity: 0.7, marginTop: 22, marginBottom: 10 }}
        >
          What to do now
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {activeModule.guidance.map((row, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                padding: 14,
                background: `rgba(${rgb},.10)`,
                borderRadius: 14,
                border: `1px solid rgba(${rgb},.12)`,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: `rgba(${rgb},.14)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <row.Icon size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{row.title}</div>
                <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>{row.sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Source */}
        <div
          style={{
            marginTop: 22,
            padding: 14,
            borderRadius: 14,
            background: "rgba(0,0,0,.22)",
            fontSize: 11.5,
            fontFamily: "var(--font-mono)",
            opacity: 0.8,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          {activeModule.sourceLines.map((line, i) => (
            <div key={i}>{line}</div>
          ))}
        </div>
      </div>

      <div style={{ padding: "12px 18px", display: "flex", gap: 10 }}>
        <button
          className="btn secondary"
          style={{
            flex: 1,
            background: `rgba(${rgb},.16)`,
            color: "inherit",
            border: `1px solid rgba(${rgb},.22)`,
          }}
          onClick={() => navigate(activeModule.evacuationType === "route" ? "/evacuation" : "/map")}
        >
          {activeModule.evacuationType === "route"
            ? <><IconRoute size={16} /> Route</>
            : <><IconMap size={16} /> View Map</>
          }
        </button>
        <button
          className="btn"
          style={{ flex: 1, background: "#fff", color: "var(--ink-card)" }}
          onClick={() => navigate("/sos")}
        >
          <IconLightning size={16} />
          {activeModule.sosType === "report" ? " Report Impact" : " Send SOS"}
        </button>
      </div>
      <HomeIndicator />
    </div>
  );
}
