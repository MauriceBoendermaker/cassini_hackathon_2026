import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../state/AlertContext";
import { useSettings } from "../../state/SettingsContext";
import { AegisLogo } from "../../components/brand/AegisLogo";
import { StageBadge } from "../../components/ui/StageBadge";
import { StatusBar } from "../../components/layout/StatusBar";
import { HomeIndicator } from "../../components/layout/HomeIndicator";
import {
  IconBell,
  IconCamera,
  IconChevronR,
  IconCrosshair,
  IconGlobe,
  IconInfo,
  IconMapPin,
  IconSatellite,
  IconShield,
} from "../../components/icons/Icons";
import { EU_LANGUAGES } from "../../lib/demo";
import { requestCompassPermission } from "../../lib/useCompass";

export function OnboardingPage() {
  const navigate = useNavigate();
  const { language, setLanguage, setHasOnboarded } = useSettings();
  const { requestLocation } = useAlert();
  const [step, setStep] = useState(0);
  const total = 5;

  const next = () => {
    // Step 1 is the location permission step — fire the real request when
    // the user advances past it (browser shows the native prompt).
    if (step === 1) void requestLocation();
    // Step 2 is the notifications step — request permission when advancing.
    if (step === 2 && "Notification" in window && Notification.permission === "default") {
      void Notification.requestPermission();
    }
    // Step 3 covers the AR overlay — request both camera (getUserMedia) and
    // iOS Motion & Orientation (DeviceOrientationEvent.requestPermission)
    // here so the user only sees the in-app "Enable compass" pill if they
    // explicitly denied it. Both calls must originate from this user gesture.
    if (step === 3) {
      // Fire-and-forget the iOS compass prompt before any await so the
      // gesture-activation token is still valid when Safari evaluates it.
      void requestCompassPermission();
      if (navigator.mediaDevices?.getUserMedia) {
        void navigator.mediaDevices
          .getUserMedia({ video: { facingMode: "environment" } })
          .then((s) => s.getTracks().forEach((t) => t.stop()))
          .catch(() => {/* denied — silent */});
      }
    }
    if (step < total - 1) setStep(step + 1);
    else {
      setHasOnboarded(true);
      navigate("/", { replace: true });
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <StatusBar />
      <div className="ob-stage">
        <div className="ob-progress">
          {Array.from({ length: total }).map((_, i) => (
            <i key={i} className={i <= step ? "on" : ""} />
          ))}
        </div>

        {step === 0 && <ObWelcome lang={language} setLang={setLanguage} />}
        {step === 1 && <ObLocation />}
        {step === 2 && <ObNotifications />}
        {step === 3 && <ObCamera />}
        {step === 4 && <ObReady />}

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          {step > 0 && (
            <button className="btn secondary" onClick={() => setStep(step - 1)}>
              Back
            </button>
          )}
          <button className="btn primary" style={{ flex: 1 }} onClick={next}>
            {step === total - 1 ? "Enter Aegis" : "Continue"}
            <IconChevronR size={16} />
          </button>
        </div>
      </div>
      <HomeIndicator />
    </div>
  );
}

function ObWelcome({ lang, setLang }: { lang: string; setLang: (c: string) => void }) {
  const cur = EU_LANGUAGES.find((l) => l.code === lang) ?? EU_LANGUAGES[5];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <AegisLogo size={48} color="var(--brand)" />
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.02em" }}>Aegis</div>
          <div
            style={{
              fontSize: 12,
              color: "var(--ink-3)",
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            EU Flood Alert
          </div>
        </div>
      </div>

      <div className="eyebrow" style={{ marginBottom: 6 }}>Welcome</div>
      <h1 className="h-title" style={{ marginBottom: 12 }}>
        Real-time flood warnings, powered by European space data.
      </h1>
      <p className="h-sub" style={{ marginBottom: 22 }}>
        Aegis combines Copernicus EMS satellite observation, Galileo precision positioning
        and local civil protection feeds into one trusted alert channel.
      </p>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="list-row" style={{ padding: "12px 14px", borderBottom: 0, cursor: "default" }}>
          <div className="lr-icon"><IconGlobe size={18} /></div>
          <div className="lr-body">
            <div className="lr-title">Language</div>
            <div className="lr-sub">{cur.name}</div>
          </div>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{
              appearance: "none",
              border: "1px solid var(--line)",
              background: "var(--surface)",
              color: "var(--ink)",
              borderRadius: 10,
              padding: "6px 10px",
              font: "500 16px var(--font-ui)",
            }}
          >
            {EU_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginTop: 28, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span className="chip"><IconShield size={12} /> EU Civil Protection</span>
        <span className="chip"><IconSatellite size={12} /> Copernicus EMS</span>
        <span className="chip"><IconMapPin size={12} /> Galileo</span>
      </div>
    </div>
  );
}

function ObLocation() {
  return (
    <div>
      <div className="permission-ill">
        <div className="ill-ring">
          <div className="ill-icon"><IconCrosshair size={28} /></div>
        </div>
        <div style={{ position: "absolute", bottom: 14, left: 14 }}>geo · gnss · galileo</div>
      </div>
      <div className="eyebrow" style={{ marginTop: 22 }}>Permission · 1 of 3</div>
      <h1 className="h-title" style={{ marginTop: 8 }}>Allow precise location</h1>
      <p className="h-sub" style={{ marginTop: 12 }}>
        Aegis only sends alerts that are relevant to you. Galileo precision lets us deliver
        block-level warnings, route you to the nearest safe point, and pin you for rescuers
        if you send an SOS — even when networks fail.
      </p>
      <div className="card" style={{ marginTop: 18, background: "var(--bg-soft)" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <IconInfo size={18} />
          <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5 }}>
            Your location stays on your device. Only an anonymised cell ID is shared with
            civil protection during an active emergency.
          </div>
        </div>
      </div>
    </div>
  );
}

function ObNotifications() {
  const tiers = [
    { n: 1, label: "Monitoring", sub: "Silent (overview only)" },
    { n: 2, label: "Watch",      sub: "Standard notification" },
    { n: 3, label: "Warning",    sub: "High priority" },
    { n: 4, label: "Severe",     sub: "Critical · breaks DND" },
    { n: 5, label: "Emergency",  sub: "Critical · breaks DND · siren" },
  ] as const;

  return (
    <div>
      <div className="permission-ill">
        <div className="ill-ring">
          <div className="ill-icon"><IconBell size={28} /></div>
        </div>
        <div style={{ position: "absolute", bottom: 14, left: 14 }}>NL-Alert · gov push</div>
      </div>
      <div className="eyebrow" style={{ marginTop: 22 }}>Permission · 2 of 3</div>
      <h1 className="h-title" style={{ marginTop: 8 }}>Allow critical alerts</h1>
      <p className="h-sub" style={{ marginTop: 12 }}>
        Aegis uses critical-alert delivery — EFAS warnings cut through silent and Do Not
        Disturb modes. You'll only receive alerts at your location.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
        {tiers.map((r) => (
          <div key={r.n} style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <StageBadge n={r.n} size="sm" />
            <div style={{ flex: 1, fontSize: 12.5, color: "var(--ink-2)" }}>{r.label}</div>
            <div
              style={{
                fontSize: 11,
                color: "var(--ink-3)",
                fontFamily: "var(--font-mono)",
              }}
            >
              {r.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ObCamera() {
  return (
    <div>
      <div className="permission-ill">
        <div className="ill-ring">
          <div className="ill-icon"><IconCamera size={28} /></div>
        </div>
        <div style={{ position: "absolute", bottom: 14, left: 14 }}>compass · ar overlay</div>
      </div>
      <div className="eyebrow" style={{ marginTop: 22 }}>Permission · 3 of 3</div>
      <h1 className="h-title" style={{ marginTop: 8 }}>Allow camera & compass</h1>
      <p className="h-sub" style={{ marginTop: 12 }}>
        Aegis uses your camera for the live AR overlay and your phone's
        motion sensor for the compass — together they keep you pointed
        toward the nearest safe point. iOS will ask for both separately.
      </p>
      <div className="card" style={{ marginTop: 18, background: "var(--bg-soft)" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <IconInfo size={18} />
          <div style={{ fontSize: 12.5, color: "var(--ink-2)", lineHeight: 1.5 }}>
            Both sensors stay off until you open the directions view, are
            never accessed in the background, and nothing is recorded or
            uploaded.
          </div>
        </div>
      </div>
    </div>
  );
}

function ObReady() {
  const { userPlaceName, userCountry, userPosition } = useAlert();
  const place = userPlaceName ?? (userPosition ? "Your area" : "—");
  const sub = userPlaceName
    ? userCountry ?? "—"
    : userPosition ? "Locating…" : "Enable location for live alerts";
  return (
    <div>
      <div
        className="permission-ill"
        style={{
          background: "linear-gradient(135deg, var(--ink-card) 0%, var(--ink-card-2) 100%)",
          border: "none",
          color: "rgba(255,255,255,.7)",
        }}
      >
        <AegisLogo size={84} color="#fff" mark="var(--ink-card)" />
        <div style={{ position: "absolute", bottom: 14, left: 14, color: "rgba(255,255,255,.55)" }}>
          ready · v1.0 · eu civil protection
        </div>
      </div>
      <div className="eyebrow" style={{ marginTop: 22 }}>You're set</div>
      <h1 className="h-title" style={{ marginTop: 8 }}>Aegis is watching for you.</h1>
      <p className="h-sub" style={{ marginTop: 12 }}>
        We'll tap you only when it matters. The first thing you'll see is your current
        stage card and a live flood map for your area.
      </p>
      <div className="card" style={{ marginTop: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <div className="eyebrow">Your area</div>
          <div className="eyebrow">EFAS feed</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{place}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{sub}</div>
          </div>
          <StageBadge n={1} />
        </div>
      </div>
    </div>
  );
}
