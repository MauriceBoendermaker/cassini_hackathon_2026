import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../../state/AlertContext";
import { useSettings } from "../../state/SettingsContext";
import { StatusBar } from "../../components/layout/StatusBar";
import { HomeIndicator } from "../../components/layout/HomeIndicator";
import { IconCheck, IconClose } from "../../components/icons/Icons";
import { fmtCoord, VALENCIA } from "../../lib/demo";

type Phase = "idle" | "holding" | "sending" | "sent";

export function SOSPage() {
  const { online } = useSettings();
  const { userPosition } = useAlert();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("idle");
  const [hold, setHold] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Show the user's real coords when geolocation is available, fall back
  // to the Valencia demo anchor otherwise.
  const [lat, lng] = userPosition
    ? [userPosition.lat, userPosition.lng]
    : VALENCIA.user;

  const start = () => {
    setPhase("holding");
    setHold(0);
    timerRef.current = window.setInterval(() => {
      setHold((h) => {
        const v = h + 4;
        if (v >= 100) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          setPhase("sending");
          window.setTimeout(() => setPhase("sent"), 1400);
          return 100;
        }
        return v;
      });
    }, 60);
  };

  const cancel = () => {
    if (timerRef.current) window.clearInterval(timerRef.current);
    setPhase((p) => {
      if (p === "sent" || p === "sending") return p;
      return "idle";
    });
    setHold((h) => (phase === "sent" ? h : 0));
  };

  useEffect(
    () => () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    },
    [],
  );

  if (phase === "sent") return <SosSent online={online} onHome={() => navigate("/")} />;

  return (
    <div className="fullbleed-stage" data-stage="4">
      <StatusBar tone="dark" />
      <div className="app-bar" style={{ color: "#fff" }}>
        <button
          className="icon-btn ghost"
          style={{ color: "#fff" }}
          onClick={() => navigate("/")}
          aria-label="Close"
        >
          <IconClose size={18} />
        </button>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div
            style={{
              fontSize: 11,
              opacity: 0.8,
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            EMERGENCY SOS
          </div>
        </div>
        <div style={{ width: 38 }} />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 28px",
          color: "#fff",
          textAlign: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            opacity: 0.8,
          }}
        >
          GALILEO {online ? "NETWORK + SAR" : "SAR · OFFLINE"} · ±1.2 m
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            marginTop: 8,
            marginBottom: 8,
            lineHeight: 1.1,
          }}
        >
          {phase === "sending" ? "Sending SOS…" : "Hold the button to send SOS"}
        </h1>
        <p style={{ fontSize: 14, opacity: 0.85, lineHeight: 1.5, maxWidth: 320 }}>
          Your precise location and emergency profile will be transmitted to the nearest
          rescue unit.{" "}
          {online ? "Network active." : "Galileo Search & Rescue Service used as fallback."}
        </p>

        <div
          style={{
            position: "relative",
            marginTop: 36,
            marginBottom: 24,
            width: 200,
            height: 200,
          }}
        >
          {phase === "holding" && (
            <>
              <div
                className="ripple"
                style={{ color: "rgba(255,255,255,.45)", width: 220, height: 220 }}
              />
              <div
                className="ripple r2"
                style={{ color: "rgba(255,255,255,.45)", width: 220, height: 220 }}
              />
            </>
          )}
          <button
            onMouseDown={start}
            onMouseUp={cancel}
            onMouseLeave={cancel}
            onTouchStart={start}
            onTouchEnd={cancel}
            onTouchCancel={cancel}
            onContextMenu={(e) => e.preventDefault()}
            disabled={phase === "sending"}
            style={{
              position: "relative",
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: "#fff",
              color: "var(--s4)",
              border: 0,
              cursor: "pointer",
              fontFamily: "var(--font-ui)",
              fontWeight: 700,
              fontSize: 32,
              letterSpacing: "0.08em",
              boxShadow: "0 20px 50px rgba(0,0,0,.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              touchAction: "manipulation",
              WebkitTouchCallout: "none",
              WebkitUserSelect: "none",
              userSelect: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                bottom: 0,
                height: hold + "%",
                width: "100%",
                background: "oklch(0.85 0.12 25)",
                transition: "height .06s linear",
              }}
            />
            <span style={{ position: "relative" }}>SOS</span>
          </button>
        </div>

        <div
          style={{
            fontSize: 12,
            fontFamily: "var(--font-mono)",
            opacity: 0.7,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          {phase === "idle" && "Press and hold for 2 seconds"}
          {phase === "holding" && "Keep holding · " + Math.round(hold) + "%"}
          {phase === "sending" && "Transmitting…"}
        </div>
      </div>

      <div
        style={{
          padding: "0 18px 12px",
          color: "#fff",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          opacity: 0.75,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>LAT {fmtCoord(lat)}</span>
        <span>LNG {fmtCoord(lng)}</span>
        <span>±1.2 M</span>
      </div>
      <HomeIndicator />
    </div>
  );
}

function SosSent({ online, onHome }: { online: boolean; onHome: () => void }) {
  void online;
  return (
    <div
      className="fullbleed-stage"
      data-stage="4"
      style={{ background: "linear-gradient(180deg, var(--ink-card) 0%, #050a18 100%)" }}
    >
      <StatusBar tone="dark" />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "32px 24px",
          color: "#fff",
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: "oklch(0.65 0.14 145)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
          }}
        >
          <IconCheck size={32} />
        </div>
        <div className="eyebrow" style={{ color: "rgba(255,255,255,.7)" }}>SOS · ID #SOS-A41</div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            marginTop: 8,
            lineHeight: 1.15,
          }}
        >
          SOS received. Stay where you are.
        </h1>
        <p style={{ fontSize: 14, opacity: 0.85, marginTop: 12, lineHeight: 1.55 }}>
          A rescue unit has been dispatched. Keep your phone visible and your screen on.
          You'll be marked as priority.
        </p>

        <div
          style={{
            marginTop: 20,
            padding: 18,
            borderRadius: 18,
            background: "rgba(255,255,255,.08)",
            border: "1px solid rgba(255,255,255,.12)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div className="eyebrow" style={{ color: "rgba(255,255,255,.6)" }}>Nearest unit</div>
            <span
              className="chip mono"
              style={{
                background: "rgba(255,255,255,.1)",
                color: "#fff",
                borderColor: "rgba(255,255,255,.18)",
              }}
            >
              <span className="dot" style={{ background: "oklch(0.7 0.14 145)" }} /> EN ROUTE
            </span>
          </div>
          <div style={{ fontSize: 18, fontWeight: 600, marginTop: 6 }}>BV-04 · Boat unit</div>
          <div
            style={{
              fontSize: 12,
              opacity: 0.7,
              marginTop: 4,
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            CREW 4 · ETA 12 MIN · 1.4 KM
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            padding: 14,
            borderRadius: 14,
            background: "rgba(255,255,255,.08)",
            fontSize: 12,
            color: "rgba(255,255,255,.85)",
            lineHeight: 1.5,
          }}
        >
          <strong>While you wait:</strong> move to the highest accessible point indoors,
          take warm clothes, a torch, and any medications you need.
        </div>

        <button
          className="btn"
          style={{ marginTop: 14, background: "#fff", color: "var(--ink-card)" }}
          onClick={onHome}
        >
          Return to home
        </button>
      </div>
      <HomeIndicator />
    </div>
  );
}
