import { useAlert } from "../../state/AlertContext";
import { VALENCIA } from "../../lib/demo";

export function ScenarioRibbon() {
  const { scenarioT, scenarioPlaying, currentEvent, setScenarioPlaying, setScenarioT } = useAlert();

  return (
    <div
      style={{
        position: "absolute",
        left: 12,
        right: 12,
        bottom: 80,
        zIndex: 1050,
        padding: "12px 14px",
        borderRadius: 16,
        background: "rgba(11,29,58,.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        color: "#fff",
        boxShadow: "0 8px 30px rgba(0,0,0,.3)",
        pointerEvents: "auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          onClick={() => setScenarioPlaying(!scenarioPlaying)}
          aria-label={scenarioPlaying ? "Pause scenario" : "Play scenario"}
          style={{
            width: 30,
            height: 30,
            borderRadius: "50%",
            border: 0,
            background: "#fff",
            color: "var(--ink-card)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {scenarioPlaying ? (
            <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden="true">
              <rect x="0" y="0" width="3.5" height="12" fill="currentColor" />
              <rect x="6.5" y="0" width="3.5" height="12" fill="currentColor" />
            </svg>
          ) : (
            <svg width="11" height="12" viewBox="0 0 11 12" aria-hidden="true">
              <path d="M0 0L11 6L0 12Z" fill="currentColor" />
            </svg>
          )}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              opacity: 0.7,
            }}
          >
            VALENCIA · 29 OCT 2024
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              marginTop: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {currentEvent?.title || "Scripted DANA scenario"}
          </div>
        </div>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", opacity: 0.7 }}>
          T+{Math.round(scenarioT * VALENCIA.scriptedHours)}h
        </div>
      </div>
      <input
        type="range"
        min={0}
        max={1000}
        value={Math.round(scenarioT * 1000)}
        onChange={(e) => setScenarioT(Number(e.target.value) / 1000)}
        aria-label="Scenario timeline"
        style={{
          width: "100%",
          marginTop: 10,
          accentColor: "#fff",
          height: 4,
        }}
      />
    </div>
  );
}
