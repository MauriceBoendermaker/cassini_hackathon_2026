import { useAlert } from "../../../state/AlertContext";
import { useSettings } from "../../../state/SettingsContext";
import { IconClose } from "../../../components/icons/Icons";
import { STAGE_COLORS, type StageNum } from "../../../lib/demo";

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onChange}
      style={{
        width: 34,
        height: 20,
        borderRadius: 10,
        background: on ? "var(--ink-card)" : "var(--line-strong)",
        border: "none",
        position: "relative",
        flexShrink: 0,
        cursor: "pointer",
        transition: "background .2s",
        padding: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 2,
          left: on ? "calc(100% - 18px)" : 2,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,.25)",
          transition: "left .18s",
          display: "block",
        }}
      />
    </button>
  );
}

export function AlertTiersSheet({ onClose }: { onClose: () => void }) {
  const { alertTiers, setAlertTiers, alertTiersDND, setAlertTiersDND } = useSettings();
  const { activeModule } = useAlert();

  function toggleTier(i: number) {
    const next = [...alertTiers];
    next[i] = !next[i];
    setAlertTiers(next);
  }

  return (
    <>
      <div className="sheet-bg" onClick={onClose} />
      <div className="sheet">
        <div className="sh-grab" />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>
            Alert tiers
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose size={16} />
          </button>
        </div>

        {activeModule.stages.map((s, i) => (
          <div
            key={s.n}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              padding: "11px 0",
              borderBottom: i < 4 ? "1px solid var(--line)" : "none",
            }}
          >
            <div
              className="lr-icon"
              style={{ background: STAGE_COLORS[s.n as StageNum].soft }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                <circle cx="5" cy="5" r="4.5" fill={STAGE_COLORS[s.n as StageNum].bg} />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 500 }}>{s.short}</div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                {s.label}
              </div>
            </div>
            <Toggle on={alertTiers[i] ?? false} onChange={() => toggleTier(i)} />
          </div>
        ))}

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            background: "var(--s2-soft)",
            borderRadius: "var(--r)",
            padding: "10px 12px",
            marginTop: 10,
            border: "1px solid oklch(0.90 0.06 95)",
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "oklch(0.45 0.12 75)" }}>
              Break Do Not Disturb
            </div>
            <div style={{ fontSize: 12, color: "oklch(0.55 0.10 75)", marginTop: 2 }}>
              Stages 4 & 5 always notify
            </div>
          </div>
          <Toggle on={alertTiersDND} onChange={() => setAlertTiersDND(!alertTiersDND)} />
        </div>
      </div>
    </>
  );
}
