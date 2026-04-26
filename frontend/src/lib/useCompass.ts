import { useCallback, useEffect, useRef, useState } from "react";

// Augment the DeviceOrientationEvent with the iOS-only compass property and
// the iOS 13+ permission API. These aren't in the standard TypeScript libs.
type DOEStatic = {
  requestPermission?: () => Promise<"granted" | "denied">;
};
type DOEEvent = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
};

const COMPASS_GRANTED_KEY = "aegis:compass-granted";

function hasIOSCompassPermissionAPI(): boolean {
  if (typeof DeviceOrientationEvent === "undefined") return false;
  const req = (DeviceOrientationEvent as unknown as DOEStatic).requestPermission;
  return typeof req === "function";
}

function readGrantedFlag(): boolean {
  if (typeof sessionStorage === "undefined") return false;
  try {
    return sessionStorage.getItem(COMPASS_GRANTED_KEY) === "1";
  } catch {
    return false;
  }
}

function writeGrantedFlag() {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(COMPASS_GRANTED_KEY, "1");
  } catch {
    /* private mode — best effort */
  }
}

/**
 * Eagerly request iOS DeviceOrientation permission from a user gesture.
 * Returns true on grant, false on deny / unsupported / error. Safe to call
 * from anywhere — no-ops on non-iOS browsers. Persists the grant so the
 * in-app "Enable compass" pill doesn't reappear later in the same session.
 */
export async function requestCompassPermission(): Promise<boolean> {
  if (!hasIOSCompassPermissionAPI()) return false;
  const req = (DeviceOrientationEvent as unknown as DOEStatic).requestPermission!;
  try {
    const result = await req();
    if (result === "granted") {
      writeGrantedFlag();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Subscribe to the device's compass heading (0–360°, clockwise from north).
 *
 * Works on:
 *   - Android Chrome / Edge: `deviceorientationabsolute` provides true heading;
 *     plain `deviceorientation` is relative-only and explicitly ignored so it
 *     can't overwrite a good reading with a stale yaw.
 *   - Android Firefox: `deviceorientation` with `event.absolute === true`.
 *   - iOS Safari 13+: `webkitCompassHeading` on `deviceorientation` after the
 *     user grants `DeviceOrientationEvent.requestPermission()` (a user gesture
 *     is required — onboarding handles this; otherwise the in-app pill does).
 *
 * Returns `null` heading until the first usable reading arrives.
 */
export function useCompass() {
  const [heading, setHeading] = useState<number | null>(null);
  const [supported, setSupported] = useState(false);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [denied, setDenied] = useState(false);
  const handlerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  const attach = useCallback(() => {
    if (handlerRef.current) return;
    const handler = (e: DeviceOrientationEvent) => {
      const ev = e as DOEEvent;
      let h: number | null = null;
      if (typeof ev.webkitCompassHeading === "number") {
        // iOS Safari — magnetic heading, already clockwise from north.
        h = ev.webkitCompassHeading;
      } else if (
        // Use alpha only when the reading is Earth-frame absolute. Plain
        // `deviceorientation` on Android Chrome reports relative yaw that
        // resets to 0 at page load — using it as a heading would tear the
        // bezel away from north as soon as it fires.
        (e.type === "deviceorientationabsolute" || ev.absolute === true) &&
        typeof ev.alpha === "number"
      ) {
        // Spec: alpha increases counter-clockwise from north — flip to
        // clockwise heading.
        h = (360 - ev.alpha + 360) % 360;
      }
      if (h != null && Number.isFinite(h)) setHeading(h);
    };
    handlerRef.current = handler;
    // `deviceorientationabsolute` is the Chrome/Edge path; plain
    // `deviceorientation` carries the iOS reading and the Firefox-Android
    // absolute reading (gated by the `absolute === true` check above).
    window.addEventListener("deviceorientationabsolute", handler as EventListener);
    window.addEventListener("deviceorientation", handler);
  }, []);

  // Detect support and decide whether to attach immediately or wait for a
  // user-gesture permission prompt (iOS only).
  useEffect(() => {
    if (typeof window === "undefined" || typeof DeviceOrientationEvent === "undefined") return;
    setSupported(true);
    if (hasIOSCompassPermissionAPI()) {
      // iOS — if onboarding (or a previous in-session prompt) already granted
      // the permission, attach silently. Otherwise show the pill.
      if (readGrantedFlag()) {
        attach();
      } else {
        setNeedsPermission(true);
      }
    } else {
      // Android / desktop — no permission gate.
      attach();
    }
    return () => {
      const h = handlerRef.current;
      if (!h) return;
      window.removeEventListener("deviceorientationabsolute", h as EventListener);
      window.removeEventListener("deviceorientation", h);
      handlerRef.current = null;
    };
  }, [attach]);

  /** Call from a user gesture on iOS to prompt for the orientation permission. */
  const requestPermission = useCallback(async () => {
    if (!hasIOSCompassPermissionAPI()) {
      attach();
      setNeedsPermission(false);
      return;
    }
    const granted = await requestCompassPermission();
    setNeedsPermission(false);
    if (granted) attach();
    else setDenied(true);
  }, [attach]);

  return { heading, supported, needsPermission, denied, requestPermission };
}
