import { useEffect, useRef, useState } from "react";

/**
 * Compass-bezel ring traced on the inside edge of the phone-frame.
 *
 * Visual model: the black metallic band path stays glued to the phone-frame
 * outline (it does not rotate). The white tick imprint and the red North
 * marker slide *along* that path via `stroke-dashoffset` as the device
 * heading changes — the bezel acts like a real compass face where only the
 * markings move, not the bezel itself.
 *
 * pathLength=360 normalises the path so 1 unit ≈ 1° of a circular
 * equivalent, which lets us bind dash offsets to heading directly.
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

  // Compute where on the path (in pathLength=360 units) the **top centre**
  // sits, so we can anchor the red North marker there when heading = 0.
  // The path starts at (x + pathRadius, y) and goes clockwise — top edge,
  // top-right corner, right edge, bottom-right corner, bottom edge, …
  const straightTop = Math.max(0, cw - 2 * pathRadius);
  const straightSide = Math.max(0, ch - 2 * pathRadius);
  const perimeter =
    2 * straightTop + 2 * straightSide + 2 * Math.PI * pathRadius;
  const topCenterUnits =
    perimeter > 0 ? ((straightTop / 2) / perimeter) * 360 : 0;

  const tickPathLength = 360;
  const minorDash = "0.4 5.6";   // 60 minor ticks (every 6° equivalent)
  const majorDash = "1.4 28.6";  // 12 major ticks (every 30° equivalent)
  const nDash     = "3 357";     // single 3-unit red dash for North

  // Heading is clockwise from north. Stroke-dashoffset positive shifts the
  // pattern *backward* along the path — opposite to the path direction.
  // Path is drawn clockwise, so positive dashoffset moves dashes CCW on
  // the bezel, which is exactly the direction we want when the device
  // turns clockwise.
  const h = typeof heading === "number" && Number.isFinite(heading) ? heading : 0;
  const minorOffset = h;
  const majorOffset = h;
  // Anchor: at h=0, the dash should sit at top-centre → place the dash
  // pattern so its first dash starts `topCenterUnits` into the path.
  const nOffset = h - topCenterUnits;

  return (
    <div ref={ref} className="compass-ring" aria-hidden="true">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        <defs>
          {/* Subtle metallic gradient on the band — top + bottom slightly
              lifted so the bezel reads as turned steel rather than ink. */}
          <linearGradient id="cr-band" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor="#1a1a1a" />
            <stop offset="50%"  stopColor="#070707" />
            <stop offset="100%" stopColor="#1a1a1a" />
          </linearGradient>
        </defs>

        {/* Static metallic band — no animation. */}
        <rect
          x={x} y={y} width={cw} height={ch} rx={pathRadius}
          fill="none"
          stroke="url(#cr-band)"
          strokeWidth={bandWidth}
        />
        {/* Inner highlight — hairline white at very low opacity. */}
        <rect
          x={x} y={y} width={cw} height={ch} rx={pathRadius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={bandWidth - 1}
        />
        {/* Minor ticks — slide CCW along the path as heading increases. */}
        <rect
          x={x} y={y} width={cw} height={ch} rx={pathRadius}
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth={bandWidth * 0.5}
          strokeDasharray={minorDash}
          strokeDashoffset={minorOffset}
          pathLength={tickPathLength}
        />
        {/* Major ticks — same direction, slightly thicker. */}
        <rect
          x={x} y={y} width={cw} height={ch} rx={pathRadius}
          fill="none"
          stroke="#ffffff"
          strokeWidth={bandWidth}
          strokeDasharray={majorDash}
          strokeDashoffset={majorOffset}
          pathLength={tickPathLength}
        />
        {/* Red North marker — single 3-unit dash, anchored to top-centre at
            heading=0 and shifted by heading so it always points north. */}
        <rect
          x={x} y={y} width={cw} height={ch} rx={pathRadius}
          fill="none"
          stroke="#e8443b"
          strokeWidth={bandWidth}
          strokeDasharray={nDash}
          strokeDashoffset={nOffset}
          pathLength={tickPathLength}
        />
      </svg>
    </div>
  );
}
