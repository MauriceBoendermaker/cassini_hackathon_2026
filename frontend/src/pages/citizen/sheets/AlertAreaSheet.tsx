import { useSettings, type AlertRadius } from "../../../state/SettingsContext";
import { useAlert } from "../../../state/AlertContext";
import { IconClose, IconMapPin } from "../../../components/icons/Icons";

const RADII: AlertRadius[] = [1, 5, 10, 25, 50];

export function AlertAreaSheet({ onClose }: { onClose: () => void }) {
  const { alertRadiusKm, setAlertRadiusKm } = useSettings();
  const { userPlaceName, userPosition, userCountry } = useAlert();

  const placeName = userPlaceName ?? (userPosition ? "Your area" : "—");
  const coords = userPosition
    ? `${Math.abs(userPosition.lat).toFixed(4)}° ${userPosition.lat >= 0 ? "N" : "S"} · ${Math.abs(userPosition.lng).toFixed(4)}° ${userPosition.lng >= 0 ? "E" : "W"}${userCountry ? ` · ${userCountry}` : ""}`
    : "39.4699° N · 0.4510° W · ES";

  return (
    <>
      <div className="sheet-bg" onClick={onClose} />
      <div className="sheet">
        <div className="sh-grab" />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, fontSize: 17, fontWeight: 600, letterSpacing: "-0.01em" }}>
            Alert area
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose size={16} />
          </button>
        </div>

        {/* Current location */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            background: "var(--bg-soft)",
            border: "1px solid var(--line)",
            borderRadius: "var(--r)",
            padding: "10px 12px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--ink-card)",
              color: "var(--ink-card-fg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconMapPin size={18} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{placeName}</div>
            <div
              style={{
                fontSize: 11,
                color: "var(--ink-3)",
                fontFamily: "var(--font-mono)",
                marginTop: 2,
              }}
            >
              {coords}
            </div>
          </div>
        </div>

        {/* Radius presets */}
        <div className="eyebrow" style={{ marginBottom: 8 }}>Radius</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {RADII.map((r) => (
            <button
              key={r}
              onClick={() => setAlertRadiusKm(r)}
              style={{
                flex: 1,
                height: 36,
                borderRadius: "var(--r-sm)",
                border: "1px solid",
                borderColor: alertRadiusKm === r ? "var(--ink-card)" : "var(--line)",
                background: alertRadiusKm === r ? "var(--ink-card)" : "var(--surface)",
                color: alertRadiusKm === r ? "var(--ink-card-fg)" : "var(--ink-3)",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                transition: "background .15s, border-color .15s, color .15s",
                fontFamily: "var(--font-ui)",
              }}
            >
              {r} km
            </button>
          ))}
        </div>

        {/* Decorative ring visualisation */}
        <div
          style={{
            height: 72,
            borderRadius: "var(--r)",
            background: "linear-gradient(145deg, #ccdde8, #b8cdd8)",
            border: "1px solid #adc0cc",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {[90, 64, 38].map((pct, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: `${pct}%`,
                height: `${pct}%`,
                borderRadius: "50%",
                border: "1px solid rgba(11,29,58,.18)",
              }}
            />
          ))}
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "oklch(0.62 0.18 240)",
              border: "2px solid #fff",
              boxShadow: "0 0 0 6px oklch(0.62 0.18 240 / 0.25)",
              position: "relative",
              zIndex: 2,
            }}
          />
        </div>
        <div
          style={{
            fontSize: 11.5,
            color: "var(--ink-3)",
            textAlign: "center",
            marginTop: 8,
          }}
        >
          Flood events within {alertRadiusKm} km will trigger alerts
        </div>
      </div>
    </>
  );
}
