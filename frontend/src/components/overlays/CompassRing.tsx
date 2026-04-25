/**
 * Traditional compass ring overlay — black bezel inset around the phone-frame
 * edge with white cardinal letters, a red North marker, and white tick marks
 * at the four intercardinal points (NE / SE / SW / NW). The whole ring
 * rotates by `-heading` so the markers always face their real-world
 * direction as the user turns the phone.
 *
 * Render `null` (no fallback) when no heading is available — the parent
 * decides when this is shown based on `useCompass()`.
 */
export function CompassRing({ heading }: { heading: number }) {
  return (
    <div className="compass-ring" style={{ transform: `rotate(${-heading}deg)` }}>
      <div className="cr-band" />
      <span className="cr-label cr-n">N</span>
      <span className="cr-label cr-e">E</span>
      <span className="cr-label cr-s">S</span>
      <span className="cr-label cr-w">W</span>
      <span className="cr-tick cr-tick-ne" />
      <span className="cr-tick cr-tick-se" />
      <span className="cr-tick cr-tick-sw" />
      <span className="cr-tick cr-tick-nw" />
    </div>
  );
}
