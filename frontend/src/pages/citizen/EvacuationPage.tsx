import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppBar } from "../../components/layout/AppBar";
import { Stat } from "../../components/ui/Stat";
import {
  IconArrow,
  IconCheck,
  IconChevronL,
  IconPhone,
  IconRoute,
  IconShare,
} from "../../components/icons/Icons";

const STEPS = [
  { dist: "0 m",   title: "Leave home",           sub: "Take ID, phone & charger, water" },
  { dist: "60 m",  title: "Right onto C/ Major",  sub: "Avoid the underpass on your left" },
  { dist: "180 m", title: "Cross at footbridge",  sub: "Footbridge is above flood line" },
  { dist: "320 m", title: "Up Avgda Constitució", sub: "Steady incline, well lit" },
  { dist: "420 m", title: "Assembly Point B",     sub: "Marktplein · sporthal" },
];

export function EvacuationPage() {
  const navigate = useNavigate();
  const [navigating, setNavigating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  function startNavigation() {
    setCurrentStep(0);
    setNavigating(true);
  }

  function stopNavigation() {
    setNavigating(false);
    setCurrentStep(0);
  }

  function nextStep() {
    if (currentStep < STEPS.length - 1) setCurrentStep((s) => s + 1);
  }

  function arrive() {
    setNavigating(false);
    setCurrentStep(0);
  }

  const isLastStep = currentStep === STEPS.length - 1;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AppBar
        sub="EVACUATION ROUTE"
        title="Assembly Point B"
        left={
          <button className="icon-btn" onClick={() => navigate("/")} aria-label="Back">
            <IconChevronL size={18} />
          </button>
        }
        right={
          <button className="icon-btn" aria-label="Share">
            <IconShare size={18} />
          </button>
        }
      />

      {/* Navigation instruction banner */}
      {navigating && (
        <div
          style={{
            background: isLastStep ? "oklch(0.45 0.14 145)" : "var(--ink-card)",
            color: "var(--ink-card-fg)",
            padding: "16px 20px 18px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              fontSize: 10,
              opacity: 0.6,
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            STEP {currentStep + 1} OF {STEPS.length}
          </div>
          <div
            style={{
              fontSize: 21,
              fontWeight: 700,
              marginTop: 5,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            {STEPS[currentStep].title}
          </div>
          <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
            {STEPS[currentStep].sub}
          </div>
          {!isLastStep && (
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 6,
                marginTop: 10,
                opacity: 0.85,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Next in
              </span>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  fontFamily: "var(--font-mono)",
                  letterSpacing: "-0.02em",
                }}
              >
                {STEPS[currentStep + 1].dist}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="scroll">
        {/* Route summary — hide when navigating to save space */}
        {!navigating && (
          <div
            className="card"
            style={{
              background: "var(--ink-card)",
              color: "var(--ink-card-fg)",
              borderColor: "transparent",
              padding: "20px 18px",
            }}
          >
            <div className="eyebrow" style={{ color: "rgba(255,255,255,.7)" }}>
              RECOMMENDED ROUTE
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 600,
                  letterSpacing: "-0.02em",
                  fontFamily: "var(--font-mono)",
                }}
              >
                6 min walk
              </div>
              <div style={{ fontSize: 12, opacity: 0.75, fontFamily: "var(--font-mono)" }}>· 420 m</div>
            </div>
            <div
              style={{
                fontSize: 12,
                opacity: 0.7,
                marginTop: 6,
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              ELEVATION GAIN · 12 M · DRY ROUTE
            </div>
          </div>
        )}

        <div className="eyebrow" style={{ marginTop: navigating ? 0 : 22, marginBottom: 10 }}>
          Step by step
        </div>
        <div className="card" style={{ padding: "4px 14px" }}>
          {STEPS.map((s, i, a) => {
            const isActive = navigating && i === currentStep;
            const isDone = navigating && i < currentStep;
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 12,
                  padding: "12px 0",
                  borderBottom: i < a.length - 1 ? "1px solid var(--line)" : "none",
                  opacity: navigating && i > currentStep ? 0.4 : 1,
                  transition: "opacity .2s",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: isActive
                        ? "var(--ink-card)"
                        : isDone
                          ? "oklch(0.65 0.14 145)"
                          : i === 0 && !navigating
                            ? "var(--ink-card)"
                            : i === a.length - 1 && !navigating
                              ? "oklch(0.65 0.14 145)"
                              : "var(--bg-soft)",
                      color:
                        isActive || isDone || i === 0 || i === a.length - 1 ? "#fff" : "var(--ink-2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      fontFamily: "var(--font-mono)",
                      transition: "background .2s",
                      flexShrink: 0,
                    }}
                  >
                    {isDone ? <IconCheck size={13} /> : i + 1}
                  </div>
                  {i < a.length - 1 && (
                    <div
                      style={{
                        flex: 1,
                        width: 1,
                        background: isDone ? "oklch(0.65 0.14 145)" : "var(--line)",
                        minHeight: 16,
                        marginTop: 4,
                        transition: "background .2s",
                      }}
                    />
                  )}
                </div>
                <div style={{ flex: 1, paddingBottom: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? "var(--ink)" : "inherit",
                      }}
                    >
                      {s.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--ink-3)",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {s.dist}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>{s.sub}</div>
                </div>
              </div>
            );
          })}
        </div>

        {!navigating && (
          <>
            <div className="eyebrow" style={{ marginTop: 22, marginBottom: 10 }}>
              Assembly Point B
            </div>
            <div className="card">
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>Marktplein sporthal</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                    Capacity 280 · Open 24h
                  </div>
                </div>
                <span className="chip live">
                  <span className="dot" /> Open
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  marginTop: 14,
                }}
              >
                <Stat label="Distance" value="420" unit="m" />
                <Stat label="ETA" value="6" unit="min" />
              </div>
            </div>
          </>
        )}

        {/* Action buttons */}
        {navigating ? (
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button className="btn secondary" style={{ flex: 1 }} onClick={stopNavigation}>
              Stop
            </button>
            {isLastStep ? (
              <button
                className="btn primary"
                style={{ flex: 1, background: "oklch(0.55 0.14 145)" }}
                onClick={arrive}
              >
                <IconCheck size={16} /> Arrived
              </button>
            ) : (
              <button className="btn primary" style={{ flex: 1 }} onClick={nextStep}>
                <IconArrow size={16} /> Next step
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <a className="btn secondary" style={{ flex: 1 }} href="tel:112">
              <IconPhone size={16} /> Call 112
            </a>
            <button className="btn primary" style={{ flex: 1 }} onClick={startNavigation}>
              <IconRoute size={16} /> Start
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
