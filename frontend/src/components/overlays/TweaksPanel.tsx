import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../state/AlertContext";
import { useSettings } from "../../state/SettingsContext";
import { STAGE_COLORS, type StageNum } from "../../lib/demo";
import { DEMO_LANGS } from "../../lib/i18n";
import { ACTIVE_MODULES } from "../../lib/disaster-types";
import "./TweaksPanel.css";

/**
 * Demo controls are visible by default during pitch / browser demos, but
 * auto-hide when running as an installed PWA — which is the "real app"
 * experience. Add `?demo=1` to the URL to force them on (handy if you
 * still want to drive the scenario from a phone).
 */
function shouldShowTweaks(): boolean {
  if (typeof window === "undefined") return false;
  const params = new URLSearchParams(window.location.search);
  if (params.has("demo")) return true;
  if (params.get("demo") === "0") return false;
  const standalone =
    window.matchMedia?.("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;
  return !standalone;
}

const SCREENS = [
  { value: "/",            label: "home" },
  { value: "/map",         label: "map" },
  { value: "/alert",       label: "alert" },
  { value: "/sos",         label: "sos" },
  { value: "/evacuation",  label: "evacuation" },
  { value: "/history",     label: "history" },
  { value: "/settings",    label: "settings" },
  { value: "/about",       label: "about" },
  { value: "/modules",     label: "modules" },
];

/**
 * Demo controls overlay — locked to the bottom-right of the page (outside
 * the phone frame) so judges can drive the pitch in real time. Mirrors the
 * Claude Design "tweaks panel" look but without the host-protocol bits.
 */
export function TweaksPanel() {
  const [open, setOpen] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const navigate = useNavigate();
  const {
    stage,
    setStage,
    scenarioT,
    setScenarioT,
    scenarioPlaying,
    setScenarioPlaying,
    showPush,
    showInstall,
    resetScenario,
    activeModule,
    setActiveModule,
  } = useAlert();
  const {
    online,
    setOnline,
    role,
    setRole,
    dark,
    setDark,
    previewLang,
    setPreviewLang,
    setHasOnboarded,
  } = useSettings();

  useEffect(() => {
    setAllowed(shouldShowTweaks());
  }, []);

  const scenarioActive = scenarioT > 0 || scenarioPlaying;

  if (!allowed) return null;

  if (!open) {
    return (
      <button
        className="twk-handle"
        onClick={() => setOpen(true)}
        aria-label="Open demo controls"
      >
        DEMO
      </button>
    );
  }

  return (
    <div className="twk-panel" role="region" aria-label="Demo controls">
      <div className="twk-hd">
        <b>Tweaks</b>
        <button className="twk-x" aria-label="Close" onClick={() => setOpen(false)}>×</button>
      </div>
      <div className="twk-body">
        <div className="twk-sect">Stage</div>
        <div className="twk-stages">
          {[1, 2, 3, 4, 5].map((n) => {
            const N = n as StageNum;
            const active = stage === N && scenarioT === 0;
            return (
              <button
                key={n}
                onClick={() => setStage(N)}
                style={{
                  background: active ? STAGE_COLORS[N].bg : "rgba(0,0,0,.06)",
                  color: active ? STAGE_COLORS[N].ink : "inherit",
                }}
              >
                {n}
              </button>
            );
          })}
        </div>

        <div className="twk-sect">Hazard module</div>
        <div className="twk-row">
          <div className="twk-seg-fixed">
            {ACTIVE_MODULES.map((mod) => (
              <button
                key={mod.id}
                className={activeModule.id === mod.id ? "active" : ""}
                onClick={() => setActiveModule(mod)}
              >
                {mod.name.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="twk-sect">Scenario</div>
        <div className="twk-row twk-row-h">
          <div className="twk-lbl"><span>Play Valencia 2024</span></div>
          <button
            type="button"
            className="twk-toggle"
            data-on={scenarioActive ? "1" : "0"}
            onClick={() => (scenarioActive ? resetScenario() : setScenarioPlaying(true))}
            aria-checked={scenarioActive}
            role="switch"
          >
            <i />
          </button>
        </div>
        <div className="twk-row">
          <div className="twk-lbl">
            <span>Timeline</span>
            <span className="twk-val">{(scenarioT * 100).toFixed(0)}%</span>
          </div>
          <input
            type="range"
            className="twk-slider"
            min={0}
            max={1}
            step={0.01}
            value={scenarioT}
            onChange={(e) => setScenarioT(Number(e.target.value))}
          />
        </div>
        <button className="twk-btn secondary" onClick={resetScenario}>
          Reset scenario
        </button>

        <div className="twk-sect">Connection</div>
        <div className="twk-row twk-row-h">
          <div className="twk-lbl"><span>Online</span></div>
          <button
            type="button"
            className="twk-toggle"
            data-on={online ? "1" : "0"}
            onClick={() => setOnline(!online)}
            aria-checked={online}
            role="switch"
          >
            <i />
          </button>
        </div>

        <div className="twk-sect">Role</div>
        <div className="twk-row">
          <div className="twk-seg-fixed">
            <button
              className={role === "citizen" ? "active" : ""}
              onClick={() => { setRole("citizen"); navigate("/"); }}
            >
              citizen
            </button>
            <button
              className={role === "firefighter" ? "active" : ""}
              onClick={() => { setRole("firefighter"); navigate("/ops"); }}
            >
              firefighter
            </button>
          </div>
        </div>

        <div className="twk-sect">Theme</div>
        <div className="twk-row twk-row-h">
          <div className="twk-lbl"><span>Dark mode</span></div>
          <button
            type="button"
            className="twk-toggle"
            data-on={dark ? "1" : "0"}
            onClick={() => setDark(!dark)}
            aria-checked={dark}
            role="switch"
          >
            <i />
          </button>
        </div>

        <div className="twk-sect">Language preview</div>
        <div className="twk-row">
          <div className="twk-seg-fixed">
            {DEMO_LANGS.map((l) => (
              <button
                key={l}
                className={previewLang === l ? "active" : ""}
                onClick={() => setPreviewLang(l)}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="twk-sect">Demo overlays</div>
        <button className="twk-btn" onClick={showPush}>Trigger push notification</button>
        <button className="twk-btn" onClick={showInstall}>Show iOS install banner</button>
        <button
          className="twk-btn"
          onClick={() => { setHasOnboarded(false); navigate("/welcome"); }}
        >
          Restart onboarding
        </button>

        <div className="twk-sect">Jump to screen</div>
        <select
          className="twk-field"
          onChange={(e) => navigate(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>Choose…</option>
          {SCREENS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
