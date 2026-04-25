import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSettings } from "../../state/SettingsContext";
import { AppBar } from "../../components/layout/AppBar";
import { AegisLogo } from "../../components/brand/AegisLogo";
import {
  IconBell,
  IconChevronL,
  IconChevronR,
  IconCheck,
  IconClose,
  IconEye,
  IconGlobe,
  IconHand,
  IconInfo,
  IconMapPin,
  IconPhone,
  IconSearch,
  IconShield,
  IconWifi,
  IconWifiOff,
} from "../../components/icons/Icons";
import { EU_LANGUAGES } from "../../lib/demo";

export function SettingsPage() {
  const navigate = useNavigate();
  const { language, setLanguage, dark, setDark, online, setOnline, role, setRole } = useSettings();
  const [showLang, setShowLang] = useState(false);

  const cur = EU_LANGUAGES.find((l) => l.code === language) ?? EU_LANGUAGES[5];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AppBar
        sub="SETTINGS"
        title="More"
        left={
          <button className="icon-btn" onClick={() => navigate("/")} aria-label="Back">
            <IconChevronL size={18} />
          </button>
        }
      />
      <div className="scroll">
        {/* Profile */}
        <div
          className="card"
          style={{
            background: "var(--ink-card)",
            color: "var(--ink-card-fg)",
            borderColor: "transparent",
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <AegisLogo size={40} color="#fff" mark="var(--ink-card)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Profile · resident</div>
            <div
              style={{
                fontSize: 12,
                opacity: 0.7,
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginTop: 2,
              }}
            >
              QUART DE POBLET · ES
            </div>
          </div>
          <IconChevronR size={18} />
        </div>

        <div className="eyebrow" style={{ marginTop: 22, marginBottom: 6 }}>Preferences</div>
        <div className="card" style={{ padding: "4px 14px" }}>
          <div className="list">
            <div className="list-row" onClick={() => setShowLang(true)}>
              <div className="lr-icon"><IconGlobe size={18} /></div>
              <div className="lr-body">
                <div className="lr-title">Language</div>
                <div className="lr-sub">{cur.name} · {cur.en}</div>
              </div>
              <div className="lr-meta">{cur.code}</div>
              <IconChevronR size={16} style={{ color: "var(--ink-3)" }} />
            </div>
            <div className="list-row" onClick={() => setDark(!dark)}>
              <div className="lr-icon"><IconEye size={18} /></div>
              <div className="lr-body">
                <div className="lr-title">Appearance</div>
                <div className="lr-sub">
                  {dark ? "Dark" : "Light"} · auto follows system
                </div>
              </div>
              <div className="seg" onClick={(e) => e.stopPropagation()}>
                <button className={!dark ? "active" : ""} onClick={() => setDark(false)}>
                  Light
                </button>
                <button className={dark ? "active" : ""} onClick={() => setDark(true)}>
                  Dark
                </button>
              </div>
            </div>
            <div className="list-row" onClick={() => setOnline(!online)}>
              <div className="lr-icon">
                {online ? <IconWifi size={18} /> : <IconWifiOff size={18} />}
              </div>
              <div className="lr-body">
                <div className="lr-title">Connection</div>
                <div className="lr-sub">
                  {online ? "Online · network + Galileo" : "Offline · Galileo broadcast only"}
                </div>
              </div>
              <span className={"chip " + (online ? "live" : "offline")}>
                <span className="dot" />
                {online ? "On" : "Off"}
              </span>
            </div>
          </div>
        </div>

        <div className="eyebrow" style={{ marginTop: 22, marginBottom: 6 }}>Alerts</div>
        <div className="card" style={{ padding: "4px 14px" }}>
          <div className="list">
            {[
              { Ic: IconBell, t: "Alert tiers",         s: "EFAS 1–5 enabled · critical breaks DND" },
              { Ic: IconMapPin, t: "Alert area",        s: "5 km radius · Quart de Poblet" },
              { Ic: IconHand, t: "Vulnerable household", s: "Add household members for triage" },
              { Ic: IconPhone, t: "Emergency contacts",  s: "2 contacts · 112 + family" },
            ].map((r, i) => (
              <div key={i} className="list-row">
                <div className="lr-icon"><r.Ic size={18} /></div>
                <div className="lr-body">
                  <div className="lr-title">{r.t}</div>
                  <div className="lr-sub">{r.s}</div>
                </div>
                <IconChevronR size={16} style={{ color: "var(--ink-3)" }} />
              </div>
            ))}
          </div>
        </div>

        <div className="eyebrow" style={{ marginTop: 22, marginBottom: 6 }}>Demo controls</div>
        <div className="card" style={{ padding: "4px 14px" }}>
          <div className="list">
            <div
              className="list-row"
              onClick={() => setRole(role === "firefighter" ? "citizen" : "firefighter")}
            >
              <div className="lr-icon"><IconShield size={18} /></div>
              <div className="lr-body">
                <div className="lr-title">View as</div>
                <div className="lr-sub">Switch between citizen & firefighter</div>
              </div>
              <div className="seg" onClick={(e) => e.stopPropagation()}>
                <button className={role === "citizen" ? "active" : ""} onClick={() => setRole("citizen")}>
                  Citizen
                </button>
                <button
                  className={role === "firefighter" ? "active" : ""}
                  onClick={() => { setRole("firefighter"); navigate("/ops"); }}
                >
                  Rescue
                </button>
              </div>
            </div>
            <div className="list-row" onClick={() => navigate("/about")}>
              <div className="lr-icon"><IconInfo size={18} /></div>
              <div className="lr-body">
                <div className="lr-title">About Aegis & data sources</div>
                <div className="lr-sub">Copernicus · Galileo · CASSINI</div>
              </div>
              <IconChevronR size={16} style={{ color: "var(--ink-3)" }} />
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 22,
            padding: "14px 0",
            fontSize: 10.5,
            color: "var(--ink-3)",
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            textAlign: "center",
          }}
        >
          Aegis · v1.0.0-rc · CASSINI Hackathon 2026
        </div>
      </div>

      {showLang && (
        <LanguageSheet
          lang={language}
          setLang={(c) => {
            setLanguage(c);
            setShowLang(false);
          }}
          onClose={() => setShowLang(false)}
        />
      )}
    </div>
  );
}

function LanguageSheet({
  lang,
  setLang,
  onClose,
}: {
  lang: string;
  setLang: (c: string) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const filtered = EU_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(q.toLowerCase()) ||
      l.en.toLowerCase().includes(q.toLowerCase()) ||
      l.code.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <>
      <div className="sheet-bg" onClick={onClose} />
      <div className="sheet">
        <div className="sh-grab" />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{ flex: 1 }}>
            <div className="eyebrow">EU OFFICIAL LANGUAGES · 24</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginTop: 2 }}>Choose language</div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose size={16} />
          </button>
        </div>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <IconSearch
            size={16}
            style={{ position: "absolute", left: 12, top: 14, color: "var(--ink-3)" }}
          />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
            style={{
              width: "100%",
              height: 44,
              padding: "0 14px 0 36px",
              border: "1px solid var(--line)",
              borderRadius: 12,
              background: "var(--surface-2)",
              color: "var(--ink)",
              font: "16px var(--font-ui)",
            }}
          />
        </div>
        <div className="list">
          {filtered.map((l) => (
            <div key={l.code} className="list-row" onClick={() => setLang(l.code)}>
              <div
                className="lr-icon"
                style={{
                  background: l.code === lang ? "var(--ink-card)" : "var(--bg-soft)",
                  color: l.code === lang ? "var(--ink-card-fg)" : "var(--ink-2)",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 600,
                  fontSize: 12,
                }}
              >
                {l.code}
              </div>
              <div className="lr-body">
                <div className="lr-title">{l.name}</div>
                <div className="lr-sub">{l.en}</div>
              </div>
              {l.code === lang && <IconCheck size={18} style={{ color: "var(--brand)" }} />}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
