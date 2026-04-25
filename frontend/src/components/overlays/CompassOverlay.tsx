import { useCompass } from "../../lib/useCompass";
import { CompassRing } from "./CompassRing";

/**
 * Wraps the device-orientation hook + iOS permission pill + the bezel ring
 * so PhoneShell only needs to mount one element when the compass is wanted
 * for a page. The ring renders at .app-frame level (sibling of the viewport)
 * so it traces the phone-frame edge, not the page content.
 */
export function CompassOverlay() {
  const { heading, needsPermission, requestPermission } = useCompass();
  return (
    <>
      {needsPermission && (
        <button
          type="button"
          className="compass-enable"
          onClick={() => void requestPermission()}
        >
          Enable compass
        </button>
      )}
      <CompassRing heading={heading} />
    </>
  );
}
