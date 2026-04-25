import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import { AppBar } from "../../components/layout/AppBar";
import { Stat } from "../../components/ui/Stat";
import {
  IconArrow,
  IconCheck,
  IconChevronL,
  IconClose,
  IconPhone,
  IconRoute,
  IconShare,
} from "../../components/icons/Icons";
import { useAlert } from "../../state/AlertContext";
import { tileLayerConfig } from "../../lib/map";
import {
  fetchFootRoute,
  formatDistance,
  formatDuration,
  offsetByMeters,
  type Route,
  type RouteStep,
} from "../../lib/route";
import type { LatLng } from "../../lib/geo";

/** Demo destination: 300 m NE of the user's GPS. OSRM snaps this to the
 *  nearest road, so it doesn't matter that it's not on a named feature —
 *  what matters is the start/end pair and the routed polyline between them. */
const EVAC_BEARING_DEG = 45; // NE
const EVAC_DISTANCE_M = 300;

export function EvacuationPage() {
  const navigate = useNavigate();
  const { userPosition } = useAlert();
  const [route, setRoute] = useState<Route | null>(null);
  const [routeError, setRouteError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [overlayIdx, setOverlayIdx] = useState<number | null>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Fetch a real OSRM walking route from current GPS to a 300 m NE destination.
  // Re-runs on userPosition change (Valencia toggle, GPS resolve, retry).
  useEffect(() => {
    if (!userPosition) return;
    let cancelled = false;
    setLoading(true);
    setRouteError(false);
    const dest = offsetByMeters(userPosition, EVAC_DISTANCE_M, EVAC_BEARING_DEG);
    fetchFootRoute(userPosition, dest).then((r) => {
      if (cancelled) return;
      setLoading(false);
      if (r && r.steps.length > 0) {
        setRoute(r);
      } else {
        setRoute(null);
        setRouteError(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userPosition]);

  const steps = route?.steps ?? [];

  // Close overlay on Escape, in addition to backdrop click and × button.
  useEffect(() => {
    if (overlayIdx == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOverlayIdx(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [overlayIdx]);

  // While navigating, keep the active step row visible — scroll it into view
  // inside the .scroll container whenever the user advances.
  useEffect(() => {
    if (!navigating) return;
    const el = stepRefs.current[currentStep];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [currentStep, navigating]);

  function startNavigation() {
    setCurrentStep(0);
    setNavigating(true);
    setOverlayIdx(null);
  }
  function stopNavigation() {
    setNavigating(false);
    setCurrentStep(0);
  }
  function nextStep() {
    if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
  }
  function arrive() {
    setNavigating(false);
    setCurrentStep(0);
  }
  function retryRoute() {
    if (!userPosition) return;
    setLoading(true);
    setRouteError(false);
    const dest = offsetByMeters(userPosition, EVAC_DISTANCE_M, EVAC_BEARING_DEG);
    fetchFootRoute(userPosition, dest).then((r) => {
      setLoading(false);
      if (r && r.steps.length > 0) setRoute(r);
      else setRouteError(true);
    });
  }

  const isLastStep = steps.length > 0 && currentStep === steps.length - 1;
  const currentStepObj: RouteStep | undefined = steps[currentStep];
  const nextStepObj: RouteStep | undefined = steps[currentStep + 1];

  const totalDistance = route?.distance;
  const totalDuration = route?.duration;
  const lastStep = steps[steps.length - 1];
  const destinationLabel = lastStep?.name || "Higher ground";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AppBar
        sub="EVACUATION ROUTE"
        title={destinationLabel}
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

      {/* Navigation instruction banner — pinned to a stable layout so the
          page below doesn't shift when stepping through. Each row reserves
          space whether or not its content is present. */}
      {navigating && currentStepObj && (
        <div
          style={{
            background: isLastStep ? "oklch(0.45 0.14 145)" : "var(--ink-card)",
            color: "var(--ink-card-fg)",
            padding: "12px 18px 14px",
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
            STEP {currentStep + 1} OF {steps.length}
          </div>
          <div
            style={{
              fontSize: 19,
              fontWeight: 700,
              marginTop: 2,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
            }}
          >
            {currentStepObj.instruction}
          </div>
          <div
            style={{
              fontSize: 12.5,
              opacity: 0.75,
              marginTop: 2,
              minHeight: 17,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {currentStepObj.name || " "}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 6,
              marginTop: 6,
              opacity: 0.85,
              minHeight: 22,
            }}
          >
            {!isLastStep && nextStepObj ? (
              <>
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
                    fontSize: 17,
                    fontWeight: 600,
                    fontFamily: "var(--font-mono)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {formatDistance(nextStepObj.distance)}
                </span>
              </>
            ) : (
              <span
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  opacity: 0.85,
                }}
              >
                Final step
              </span>
            )}
          </div>
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
            {route ? (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 6 }}>
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 600,
                      letterSpacing: "-0.02em",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {formatDuration(totalDuration ?? 0)} walk
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.75, fontFamily: "var(--font-mono)" }}>
                    · {formatDistance(totalDistance ?? 0)}
                  </div>
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
                  YOUR GPS → {EVAC_DISTANCE_M} M NE · OSRM · {steps.length} STEPS
                </div>
              </>
            ) : (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 14, opacity: 0.85 }}>
                  {loading
                    ? "Calculating route from your location…"
                    : "Routing service unreachable. Tap retry to try again."}
                </div>
                {routeError && !loading && (
                  <button
                    className="btn primary"
                    style={{ marginTop: 12, alignSelf: "flex-start" }}
                    onClick={retryRoute}
                  >
                    Retry
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step list — only when we have a real route */}
        {route && steps.length > 0 && (
          <>
            <div className="eyebrow" style={{ marginTop: navigating ? 0 : 22, marginBottom: 10 }}>
              Step by step
            </div>
            <div className="card" style={{ padding: "4px 0" }}>
              {steps.map((s, i) => {
                const isActive = navigating && i === currentStep;
                const isDone = navigating && i < currentStep;
                const upcoming = navigating && i > currentStep;
                const isLast = i === steps.length - 1;
                return (
                  <div
                    key={i}
                    ref={(el) => {
                      stepRefs.current[i] = el;
                    }}
                    style={{
                      borderBottom: !isLast ? "1px solid var(--line)" : "none",
                      opacity: upcoming ? 0.45 : 1,
                      transition: "opacity .2s",
                    }}
                  >
                    <button
                      className="step-row"
                      onClick={() => setOverlayIdx(i)}
                      aria-haspopup="dialog"
                    >
                      <div
                        className="step-bullet"
                        data-active={isActive ? "1" : "0"}
                        data-done={isDone ? "1" : "0"}
                        data-end={isLast ? "1" : "0"}
                      >
                        {isDone ? <IconCheck size={13} /> : i + 1}
                      </div>
                      <div className="step-content">
                        <div className="step-title">{s.instruction}</div>
                        <div className="step-sub">
                          <span>{s.name || (i === 0 ? "From your location" : "—")}</span>
                          <span className="dot-sep">·</span>
                          <span className="mono">{formatDistance(s.distance)}</span>
                        </div>
                      </div>
                      <StepThumb step={s} fullRoute={route.geometry} />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {!navigating && route && (
          <>
            <div className="eyebrow" style={{ marginTop: 22, marginBottom: 10 }}>
              Destination
            </div>
            <div className="card">
              <div
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600 }}>{destinationLabel}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 2 }}>
                    {EVAC_DISTANCE_M} m NE of your location · OSRM foot route
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
                <Stat label="Distance" value={String(Math.round(totalDistance ?? 0))} unit="m" />
                <Stat label="ETA" value={String(Math.round((totalDuration ?? 0) / 60))} unit="min" />
              </div>
            </div>
          </>
        )}

      </div>

      {/* Pinned action bar — sibling of .scroll so it stays at the bottom of
          the phone viewport while the step list scrolls. */}
      <div className="evac-actions">
        {navigating ? (
          <>
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
          </>
        ) : (
          <>
            <button className="btn secondary" style={{ flex: 1 }} type="button">
              <IconPhone size={16} /> Call 112
            </button>
            <button
              className="btn primary"
              style={{ flex: 1 }}
              onClick={startNavigation}
              disabled={!route}
            >
              <IconRoute size={16} /> Start
            </button>
          </>
        )}
      </div>

      {/* Step detail overlay — scales up over the page when a row is tapped. */}
      {overlayIdx != null && steps[overlayIdx] && (
        <StepOverlay
          step={steps[overlayIdx]}
          idx={overlayIdx}
          total={steps.length}
          fullRoute={route?.geometry ?? null}
          onClose={() => setOverlayIdx(null)}
        />
      )}

    </div>
  );
}

/** 60×60 non-interactive Leaflet thumbnail centred on the maneuver. Renders
 *  the full route polyline so the user always sees real, road-following
 *  geometry — not a per-step polyline that may be just 2 vertices. */
function StepThumb({ step, fullRoute }: { step: RouteStep; fullRoute: LatLng[] }) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, {
      center: [step.maneuver.location.lat, step.maneuver.location.lng],
      zoom: 17,
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
    });
    const { url, options } = tileLayerConfig();
    L.tileLayer(url, options).addTo(map);
    if (fullRoute.length > 1) {
      L.polyline(
        fullRoute.map((g) => [g.lat, g.lng] as [number, number]),
        { color: "#0b1d3a", weight: 3, opacity: 0.85 },
      ).addTo(map);
    }
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step.maneuver.location.lat, step.maneuver.location.lng]);

  return (
    <div className="step-thumb-wrap">
      <div ref={elRef} className="step-thumb-map" />
      <div
        className="step-thumb-arrow"
        style={{ transform: `translate(-50%, -50%) rotate(${step.maneuver.bearingAfter}deg)` }}
      >
        <ArrowGlyph size={14} />
      </div>
    </div>
  );
}

/** Centered scale-up overlay containing a larger Leaflet map for the tapped step. */
function StepOverlay({
  step,
  idx,
  total,
  fullRoute,
  onClose,
}: {
  step: RouteStep;
  idx: number;
  total: number;
  fullRoute: LatLng[] | null;
  onClose: () => void;
}) {
  return (
    <>
      <div className="step-overlay-bg" onClick={onClose} />
      <div className="step-overlay-card" role="dialog" aria-label={`Step ${idx + 1} of ${total}`}>
        <div className="step-overlay-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="step-overlay-eyebrow">
              STEP {idx + 1} OF {total}
            </div>
            <div className="step-overlay-title">{step.instruction}</div>
            {step.name && <div className="step-overlay-name">{step.name}</div>}
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <IconClose size={16} />
          </button>
        </div>
        <StepBigMap step={step} fullRoute={fullRoute} />
        <div className="step-overlay-foot">
          <span className="mono">{formatDistance(step.distance)}</span>
          <span className="dot-sep">·</span>
          <span>~{Math.max(1, Math.round(step.duration / 60))} min walk</span>
        </div>
      </div>
    </>
  );
}

/** Modal map: draws ONLY the OSRM full-route polyline (verified street-
 *  following), then a circle marker + arrow at the step's maneuver point.
 *  No per-step polyline → no straight-line artifacts on sparse OSM segments. */
function StepBigMap({
  step,
  fullRoute,
}: {
  step: RouteStep;
  fullRoute: LatLng[] | null;
}) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!elRef.current || mapRef.current) return;
    const map = L.map(elRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      touchZoom: false,
      boxZoom: false,
      keyboard: false,
    });
    const { url, options } = tileLayerConfig();
    L.tileLayer(url, options).addTo(map);

    if (fullRoute && fullRoute.length > 1) {
      const latlngs = fullRoute.map((g) => [g.lat, g.lng] as [number, number]);
      L.polyline(latlngs, { color: "#ffffff", weight: 8, opacity: 0.95 }).addTo(map);
      L.polyline(latlngs, {
        color: "oklch(0.62 0.18 240)",
        weight: 5,
        opacity: 1,
      }).addTo(map);

      // START — at first vertex of OSRM route (= user's GPS, snapped to road).
      // Rendered as the standard user-loc dot so it visually matches the home
      // map preview and makes the direction unmistakable.
      const startIcon = L.divIcon({
        className: "",
        html: '<div class="user-loc"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([fullRoute[0].lat, fullRoute[0].lng], { icon: startIcon }).addTo(map);

      // END — at last vertex of OSRM route (= the NE offset destination).
      const last = fullRoute[fullRoute.length - 1];
      const endIcon = L.divIcon({
        className: "",
        html: '<div class="route-end-pin">B</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker([last.lat, last.lng], { icon: endIcon }).addTo(map);
    }

    // Active step ring on top of everything else.
    L.circleMarker([step.maneuver.location.lat, step.maneuver.location.lng], {
      radius: 10,
      color: "#0b1d3a",
      weight: 3,
      fillColor: "#ffffff",
      fillOpacity: 1,
    }).addTo(map);

    map.setView([step.maneuver.location.lat, step.maneuver.location.lng], 17);
    mapRef.current = map;
    const t = window.setTimeout(() => map.invalidateSize(), 340);
    return () => {
      window.clearTimeout(t);
      map.remove();
      mapRef.current = null;
    };
  }, [step, fullRoute]);

  return (
    <div className="step-map-canvas">
      <div ref={elRef} style={{ position: "absolute", inset: 0 }} />
      <div
        className="step-map-arrow"
        style={{ transform: `translate(-50%, -50%) rotate(${step.maneuver.bearingAfter}deg)` }}
      >
        <ArrowGlyph size={32} />
      </div>
    </div>
  );
}

function ArrowGlyph({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <filter id="arrShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="1" stdDeviation="0.8" floodOpacity="0.45" />
        </filter>
      </defs>
      <path
        d="M12 2 L19 14 L13 14 L13 22 L11 22 L11 14 L5 14 Z"
        fill="#fff"
        stroke="#0b1d3a"
        strokeWidth="1.4"
        strokeLinejoin="round"
        filter="url(#arrShadow)"
      />
    </svg>
  );
}
