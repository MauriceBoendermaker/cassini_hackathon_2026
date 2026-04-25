/**
 * Rotating compass ring overlay — sits inside .app-viewport tracing its
 * outer edge with N/E/S/W markers. Rotates by `-heading` so the markers
 * always point at their real-world direction as the user rotates the phone.
 *
 * Pure presentational — relies on the parent providing a heading from
 * `useCompass()`. Render `null` when no heading is available; that's the
 * graceful fallback for unsupported / denied compass.
 */
export function CompassRing({ heading }: { heading: number }) {
  return (
    <div className="compass-ring" style={{ transform: `rotate(${-heading}deg)` }}>
      <span className="compass-mark compass-mark-n">N</span>
      <span className="compass-mark compass-mark-e">E</span>
      <span className="compass-mark compass-mark-s">S</span>
      <span className="compass-mark compass-mark-w">W</span>
    </div>
  );
}
