import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  stageAtScenario,
  eventsAtScenario,
  VALENCIA,
  type StageNum,
  type ScenarioEvent,
} from "../lib/demo";
import { getCurrentPosition, reverseGeocode, type LatLng } from "../lib/geo";
import { type DisasterModule, FLOOD_MODULE } from "../lib/disaster-types";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type AlertState = {
  /** Active disaster module (flood, drought, …). */
  activeModule: DisasterModule;
  setActiveModule: (m: DisasterModule) => void;

  /** Manual stage. */
  stage: StageNum;
  setStage: (s: StageNum) => void;

  /** Scripted scenario time, 0..1 (0 = none). */
  scenarioT: number;
  setScenarioT: (t: number) => void;

  scenarioPlaying: boolean;
  setScenarioPlaying: (v: boolean) => void;

  /** Effective stage = scenario-derived if scenarioT > 0 else manual. */
  effectiveStage: StageNum;

  /** Current scenario event (most recent at t). */
  currentEvent: ScenarioEvent | null;

  /** Real user position from browser geolocation, or null if unknown.
   * When null, pages fall back to the Valencia demo anchor. */
  userPosition: LatLng | null;
  /** Reported accuracy of the geolocation fix in meters, or null if unknown. */
  userAccuracy: number | null;
  /** Human-readable place name for the user's position (e.g. "Amsterdam"),
   * or null if reverse geocoding hasn't resolved yet. */
  userPlaceName: string | null;
  /** Upper-case ISO country code (e.g. "NL"), or null if unknown. */
  userCountry: string | null;
  /** Requests geolocation and updates the state — called from onboarding or
   * settings when the user opts in. */
  requestLocation: () => Promise<void>;

  /** Push notification visibility. */
  pushVisible: boolean;
  showPush: () => void;
  hidePush: () => void;

  /** Install banner visibility. */
  installVisible: boolean;
  /** True when the browser has fired beforeinstallprompt and the native
   * dialog can be triggered (Android/Chrome). False on iOS, where manual
   * share-sheet steps are shown instead. */
  nativeInstallReady: boolean;
  showInstall: () => void;
  hideInstall: () => void;
  /** Calls the deferred beforeinstallprompt on Android/Chrome; no-op on iOS. */
  triggerInstall: () => Promise<void>;

  resetScenario: () => void;
};

const Ctx = createContext<AlertState | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [activeModule, setActiveModuleState] = useState<DisasterModule>(FLOOD_MODULE);
  const setActiveModule = useCallback((m: DisasterModule) => setActiveModuleState(m), []);

  const [stage, setStageState] = useState<StageNum>(1);
  const [scenarioT, setScenarioTState] = useState<number>(0);
  const [scenarioPlaying, setScenarioPlayingState] = useState<boolean>(false);
  const [pushVisible, setPushVisible] = useState<boolean>(false);
  const [installVisible, setInstallVisible] = useState<boolean>(false);
  const [nativeInstallReady, setNativeInstallReady] = useState<boolean>(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [realUserPosition, setRealUserPosition] = useState<LatLng | null>(null);
  const [realUserAccuracy, setRealUserAccuracy] = useState<number | null>(null);
  const [realUserPlaceName, setRealUserPlaceName] = useState<string | null>(null);
  const [realUserCountry, setRealUserCountry] = useState<string | null>(null);
  const lastStageRef = useRef<StageNum>(1);
  const pushTimerRef = useRef<number | null>(null);

  const requestLocation = useCallback(async () => {
    const pos = await getCurrentPosition();
    if (!pos) return;
    setRealUserPosition({ lat: pos.lat, lng: pos.lng });
    setRealUserAccuracy(pos.accuracy);
    const { label, country } = await reverseGeocode(pos);
    if (label) setRealUserPlaceName(label);
    if (country) setRealUserCountry(country);
  }, []);

  // Request geolocation on mount — triggers the browser permission popup on
  // first visit so the place name shows immediately without waiting for onboarding.
  useEffect(() => {
    void requestLocation();
  }, [requestLocation]);

  const scenarioStage = scenarioT > 0 ? stageAtScenario(scenarioT) : null;
  const effectiveStage: StageNum = (scenarioStage ?? stage) as StageNum;

  // While the Valencia 2024 demo scenario is active (playing or paused mid-run),
  // override the real GPS values so every page teleports to Valencia. Reverts
  // to the real position on resetScenario.
  const scenarioActive = scenarioT > 0 || scenarioPlaying;
  const userPosition = useMemo<LatLng | null>(
    () => (scenarioActive ? { lat: VALENCIA.user[0], lng: VALENCIA.user[1] } : realUserPosition),
    [scenarioActive, realUserPosition],
  );
  // Demo scenario fakes a high-precision Galileo fix; otherwise expose the
  // real browser-reported accuracy.
  const userAccuracy = scenarioActive ? 1.2 : realUserAccuracy;
  const userPlaceName = scenarioActive ? "Valencia" : realUserPlaceName;
  const userCountry = scenarioActive ? "ES" : realUserCountry;

  const currentEvent = useMemo<ScenarioEvent | null>(() => {
    const events = eventsAtScenario(scenarioT);
    return events.length ? events[events.length - 1] : null;
  }, [scenarioT]);

  // Apply effective stage to body data-stage so global CSS can react.
  useEffect(() => {
    document.body.dataset.stage = String(effectiveStage);
  }, [effectiveStage]);

  // Drive scenario tick.
  useEffect(() => {
    if (!scenarioPlaying) return;
    const id = window.setInterval(() => {
      setScenarioTState((prev) => {
        const next = Math.min(1, prev + 0.005);
        if (next >= 1) setScenarioPlayingState(false);
        return next;
      });
    }, 80);
    return () => window.clearInterval(id);
  }, [scenarioPlaying]);

  // Auto-fire push when stage rises.
  useEffect(() => {
    const prev = lastStageRef.current;
    if (effectiveStage > prev && effectiveStage >= 2) {
      setPushVisible(true);
      if (pushTimerRef.current) window.clearTimeout(pushTimerRef.current);
      pushTimerRef.current = window.setTimeout(() => setPushVisible(false), 5500);
    }
    lastStageRef.current = effectiveStage;
  }, [effectiveStage]);

  useEffect(() => () => {
    if (pushTimerRef.current) window.clearTimeout(pushTimerRef.current);
  }, []);

  const setStage = useCallback((s: StageNum) => {
    // Manual stage overrides scenario.
    setScenarioTState(0);
    setScenarioPlayingState(false);
    setStageState(s);
  }, []);

  const setScenarioT = useCallback((t: number) => {
    setScenarioPlayingState(false);
    setScenarioTState(Math.max(0, Math.min(1, t)));
  }, []);

  const setScenarioPlaying = useCallback((v: boolean) => {
    setScenarioPlayingState(v);
  }, []);

  const resetScenario = useCallback(() => {
    setScenarioTState(0);
    setScenarioPlayingState(false);
    setStageState(1);
    lastStageRef.current = 1;
  }, []);

  const showPush = useCallback(() => {
    setPushVisible(true);
    if (pushTimerRef.current) window.clearTimeout(pushTimerRef.current);
    pushTimerRef.current = window.setTimeout(() => setPushVisible(false), 5500);
  }, []);
  const hidePush = useCallback(() => setPushVisible(false), []);

  // Capture the browser's native install prompt (Android/Chrome) so we can
  // trigger it on demand. Prevents it from appearing unsolicited.
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setNativeInstallReady(true);
      setInstallVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  // iOS has no beforeinstallprompt — detect Safari on iPhone/iPad and show
  // the manual share-sheet instructions when not already installed.
  useEffect(() => {
    const ua = navigator.userAgent;
    const isIOS =
      /iPad|iPhone|iPod/.test(ua) &&
      !(window as unknown as { MSStream?: unknown }).MSStream;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isIOS && !isStandalone) setInstallVisible(true);
  }, []);

  const triggerInstall = useCallback(async () => {
    const prompt = deferredPromptRef.current;
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    deferredPromptRef.current = null;
    setNativeInstallReady(false);
    if (outcome === "accepted") setInstallVisible(false);
  }, []);

  const showInstall = useCallback(() => setInstallVisible(true), []);
  const hideInstall = useCallback(() => setInstallVisible(false), []);

  const value: AlertState = {
    activeModule,
    setActiveModule,
    stage,
    setStage,
    scenarioT,
    setScenarioT,
    scenarioPlaying,
    setScenarioPlaying,
    effectiveStage,
    currentEvent,
    userPosition,
    userAccuracy,
    userPlaceName,
    userCountry,
    requestLocation,
    pushVisible,
    showPush,
    hidePush,
    installVisible,
    nativeInstallReady,
    showInstall,
    hideInstall,
    triggerInstall,
    resetScenario,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAlert(): AlertState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAlert must be used within AlertProvider");
  return v;
}
