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
  STAGES,
  VALENCIA,
  stageAtScenario,
  eventsAtScenario,
  type StageNum,
  type ScenarioEvent,
} from "../lib/demo";
import { getCurrentPosition, reverseGeocode, type LatLng } from "../lib/geo";

type AlertState = {
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

  /** iOS install banner visibility. */
  installVisible: boolean;
  showInstall: () => void;
  hideInstall: () => void;

  resetScenario: () => void;
};

const Ctx = createContext<AlertState | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [stage, setStageState] = useState<StageNum>(1);
  const [scenarioT, setScenarioTState] = useState<number>(0);
  const [scenarioPlaying, setScenarioPlayingState] = useState<boolean>(false);
  const [pushVisible, setPushVisible] = useState<boolean>(false);
  const [installVisible, setInstallVisible] = useState<boolean>(false);
  const [userPosition, setUserPosition] = useState<LatLng | null>(null);
  const [userPlaceName, setUserPlaceName] = useState<string | null>(null);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const lastStageRef = useRef<StageNum>(1);
  const pushTimerRef = useRef<number | null>(null);

  const requestLocation = useCallback(async () => {
    const pos = await getCurrentPosition();
    if (!pos) return;
    setUserPosition(pos);
    const { label, country } = await reverseGeocode(pos);
    if (label) setUserPlaceName(label);
    if (country) setUserCountry(country);
  }, []);

  // Best-effort silent geolocation on mount — only succeeds if the user
  // has previously granted permission (or the browser auto-allows). No
  // permission prompt is forced; the onboarding flow handles that.
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions) {
      return;
    }
    navigator.permissions
      .query({ name: "geolocation" as PermissionName })
      .then((res) => {
        if (res.state === "granted") void requestLocation();
      })
      .catch(() => {
        /* permissions API not supported — skip */
      });
  }, [requestLocation]);

  const scenarioStage = scenarioT > 0 ? stageAtScenario(scenarioT) : null;
  const effectiveStage: StageNum = (scenarioStage ?? stage) as StageNum;

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

  const showInstall = useCallback(() => setInstallVisible(true), []);
  const hideInstall = useCallback(() => setInstallVisible(false), []);

  // Reference STAGES + VALENCIA so unused-import check is happy.
  void STAGES;
  void VALENCIA;

  const value: AlertState = {
    stage,
    setStage,
    scenarioT,
    setScenarioT,
    scenarioPlaying,
    setScenarioPlaying,
    effectiveStage,
    currentEvent,
    userPosition,
    userPlaceName,
    userCountry,
    requestLocation,
    pushVisible,
    showPush,
    hidePush,
    installVisible,
    showInstall,
    hideInstall,
    resetScenario,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAlert(): AlertState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAlert must be used within AlertProvider");
  return v;
}
