import { useEffect, useRef, useState } from "react";

/**
 * Compass-bezel ring traced on the inside edge of the phone-frame.
 *
 * Rendered at .app-frame level (sibling of .app-viewport) when the parent
 * sets the `has-compass` class, which insets the viewport by the bezel
 * width — leaving a 9 px gap that this SVG fills as a black band with a
 * subtle metallic gradient, white major / minor tick imprint, and a
 * bright-red triangle at North.
 *
 * Rotation: rotates by `-heading` so the bezel + N triangle stay glued to
 * real-world directions as the user turns the phone. When `heading` is
 * null (sensor unavailable / permission denied) the ring stays at 0° as a
 * static instrument-face decoration.
 */
export function CompassRing({ heading }: { heading?: number | null }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 360, h: 740 });
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        setSize({ w: Math.round(r.width), h: Math.round(r.height) });
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Match the .app-frame border-radius — 36 px on desktop, 0 on real
  // mobile / standalone PWA — so the bezel curves with the phone shell.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia(
      "(max-width: 520px), (display-mode: standalone), (pointer: coarse)",
    );
    const update = () => setIsMobileViewport(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  const W = size.w;
  const H = size.h;
  const bandWidth = 6;
  const outerRadius = isMobileViewport ? 0 : 36;
  const pathRadius = Math.max(0, outerRadius - bandWidth / 2);

  const x = bandWidth / 2;
  const y = bandWidth / 2;
  const cw = Math.max(0, W - bandWidth);
  const ch = Math.max(0, H - bandWidth);

  // Normalise the rounded-rect path to 360 units so dasharrays distribute
  // by exact tick count regardless of phone-frame width or height.
  const tickPathLength = 360;
  const minorDash = "0.4 5.6";   // 60 minor ticks (every 6° equivalent)
  const majorDash = "1.4 28.6";  // 12 major ticks (every 30° equivalent)
  const rotation =
    typeof heading === "number" && Number.isFinite(heading) ? -heading : 0;

  return (
    <div
      ref={ref}
      className="compass-ring"
      style={{ transform: `rotate(${rotation}deg)` }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Subtle metallic gradient — top + bottom slightly lifted so the
              bezel reads as turned steel rather than flat ink. */}
          <linearGradient id="cr-band" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1a1a1a" />
            <stop offset="50%"  stopColor="#070707" />
            <stop offset="100%" stopColor="#1a1a1a" />
          </linearGradient>
        </defs>

        {/* Solid metallic band. */}
        <rect
          x={x} y={y} width={cw} height={ch} rx={pathRadius}
          fill="none"
          stroke="url(#cr-band)"
          strokeWidth={bandWidth}
        />
        {/* Inner highlight — hairline white at very low opacity, gives the
            bezel a turned-edge feel. */}
        <rect
          x={x} y={y} width={cw} height={ch} rx={pathRadius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={bandWidth - 1}
        />
        {/* Minor ticks. */}
        <rect
          x={x} y={y} width={cw} height={ch} rx={pathRadius}
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth={bandWidth * 0.5}
          strokeDasharray={minorDash}
          pathLength={tickPathLength}
        />
        {/* Major ticks at the 12 cardinal/30° slots, with the first dash
            anchored on the top edge so it lines up with the red North. */}
        <rect
          x={x} y={y} width={cw} height={ch} rx={pathRadius}
          fill="none"
          stroke="#ffffff"
          strokeWidth={bandWidth}
          strokeDasharray={majorDash}
          strokeDashoffset={-0.7}
          pathLength={tickPathLength}
        />
      </svg>
      {/* Red North triangle — sits on the top edge of the band and replaces
          the white major tick visually so true north is unmistakable. */}
      <span className="cr-north" />
    </div>
  );
}
