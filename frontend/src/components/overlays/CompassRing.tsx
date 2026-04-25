import { useEffect, useRef, useState } from "react";

/**
 * Static compass-bezel ring traced on the inside edge of the phone frame.
 *
 * Visual model: a black band that follows the frame's rounded-rect
 * perimeter, with white minor tick marks every ~5°-equivalent of the
 * perimeter, longer white major ticks at the eight intercardinal positions,
 * and N/E/S/W cardinals burned into the band — N rendered red, the rest
 * white. Doesn't rotate, doesn't depend on a sensor — purely a decorative
 * instrument-face overlay for the directions page.
 *
 * Internals: a single SVG with two stacked stroked rects. The first rect is
 * the solid black band. The second rect re-strokes the same path in white
 * with a `pathLength` + `strokeDasharray` pair so the dashes evenly
 * distribute around the entire perimeter regardless of the phone-frame's
 * actual width/height. We size the SVG via ResizeObserver so the viewBox
 * exactly matches the rendered pixel size and there's no scale distortion
 * on stroke widths.
 */
export function CompassRing() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 360, h: 740 });

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

  const W = size.w;
  const H = size.h;
  const bandWidth = 14;
  const outerRadius = 30;
  const pathRadius = Math.max(0, outerRadius - bandWidth / 2);

  // Centerline rect for the band path.
  const x = bandWidth / 2;
  const y = bandWidth / 2;
  const cw = Math.max(0, W - bandWidth);
  const ch = Math.max(0, H - bandWidth);

  // Normalise the rounded-rect path to `tickPathLength` units so the
  // dasharray creates an exact tick count regardless of geometry.
  // 360 ticks → 1 per ~degree on a circular equivalent.
  const tickPathLength = 360;
  const minorDash = "0.4 0.6"; // 360 minor ticks
  const majorDash = "1.2 43.8"; // 8 major ticks (one per intercardinal slot)
  // 360 / 8 = 45 — so each cycle is 45 units, 1.2 dash + 43.8 gap = 45.

  return (
    <div ref={ref} className="compass-ring" aria-hidden="true">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
      >
        {/* Solid black band */}
        <rect
          x={x}
          y={y}
          width={cw}
          height={ch}
          rx={pathRadius}
          fill="none"
          stroke="#0b0b0b"
          strokeWidth={bandWidth}
        />
        {/* Minor tick imprint — every ~1°. */}
        <rect
          x={x}
          y={y}
          width={cw}
          height={ch}
          rx={pathRadius}
          fill="none"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth={bandWidth - 2}
          strokeDasharray={minorDash}
          pathLength={tickPathLength}
          vectorEffect="non-scaling-stroke"
        />
        {/* Major ticks at the 8 cardinal/intercardinal slots — slightly
            wider + fully opaque. Offset by half the major width so the
            dashes align with the top of the path (the N position). */}
        <rect
          x={x}
          y={y}
          width={cw}
          height={ch}
          rx={pathRadius}
          fill="none"
          stroke="#ffffff"
          strokeWidth={bandWidth}
          strokeDasharray={majorDash}
          strokeDashoffset={-0.6}
          pathLength={tickPathLength}
        />
      </svg>
      <span className="cr-cardinal cr-n">N</span>
      <span className="cr-cardinal cr-e">E</span>
      <span className="cr-cardinal cr-s">S</span>
      <span className="cr-cardinal cr-w">W</span>
    </div>
  );
}
