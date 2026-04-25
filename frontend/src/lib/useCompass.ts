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

/**
 * Subscribe to the device's compass heading (0–360°, clockwise from north).
 *
 * Works on:
 *   - Android Chrome / Firefox: auto-attaches via `deviceorientationabsolute`
 *     and converts `alpha` (counter-clockwise from north) to a clockwise heading.
 *   - iOS Safari 13+: requires a user-gesture call to
 *     `DeviceOrientationEvent.requestPermission()` first; once granted, reads
 *     `webkitCompassHeading` directly (magnetic-north heading).
 *
 * Returns `null` heading until the first reading arrives. If compass is
 * denied/unsupported the heading stays `null` — callers should render
 * nothing rather than a fallback indicator.
 */
export function useCompass() {
  const [heading, setHeading] = useState<number | null>(null);
  const [supported, setSupported] = useState(false);
  const [needsPermission, setNeedsPermission] = useState(false);
  const [denied, setDenied] = useState(false);
  const handlerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  // Detect support and whether we need an iOS permission gesture.
  useEffect(() => {
    if (typeof window === "undefined" || typeof DeviceOrientationEvent === "undefined") return;
    setSupported(true);
    const req = (DeviceOrientationEvent as unknown as DOEStatic).requestPermission;
    if (typeof req === "function") {
      setNeedsPermission(true);
    }
  }, []);

  const attach = useCallback(() => {
    if (handlerRef.current) return;
    const handler = (e: DeviceOrientationEvent) => {
      const ev = e as DOEEvent;
      let h: number | null = null;
      if (typeof ev.webkitCompassHeading === "number") {
        // iOS Safari — magnetic heading, already clockwise from north.
        h = ev.webkitCompassHeading;
      } else if (typeof ev.alpha === "number") {
        // Spec: alpha increases counter-clockwise from north.
        // Convert to clockwise heading.
        h = (360 - ev.alpha + 360) % 360;
      }
      if (h != null && Number.isFinite(h)) setHeading(h);
    };
    handlerRef.current = handler;
    // `deviceorientationabsolute` is preferred on Chrome (Earth-frame). Fall
    // back to plain `deviceorientation` on iOS / older browsers.
    window.addEventListener("deviceorientationabsolute", handler as EventListener);
    window.addEventListener("deviceorientation", handler);
  }, []);

  // Auto-attach on platforms that don't gate behind a permission prompt.
  useEffect(() => {
    if (supported && !needsPermission) attach();
    return () => {
      const h = handlerRef.current;
      if (!h) return;
      window.removeEventListener("deviceorientationabsolute", h as EventListener);
      window.removeEventListener("deviceorientation", h);
      handlerRef.current = null;
    };
  }, [supported, needsPermission, attach]);

  /** Call from a user gesture on iOS to prompt for the orientation permission. */
  const requestPermission = useCallback(async () => {
    const req = (DeviceOrientationEvent as unknown as DOEStatic).requestPermission;
    if (typeof req !== "function") {
      attach();
      setNeedsPermission(false);
      return;
    }
    try {
      const result = await req();
      setNeedsPermission(false);
      if (result === "granted") attach();
      else setDenied(true);
    } catch {
      setNeedsPermission(false);
      setDenied(true);
    }
  }, [attach]);

  return { heading, supported, needsPermission, denied, requestPermission };
}
