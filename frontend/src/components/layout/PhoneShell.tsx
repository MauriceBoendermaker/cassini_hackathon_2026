import { Outlet, useLocation } from "react-router-dom";
import { useAlert } from "../../state/AlertContext";
import { useSettings } from "../../state/SettingsContext";
import { StatusBar } from "./StatusBar";
import { HomeIndicator } from "./HomeIndicator";
import { TabBar } from "./TabBar";
import { PushStack } from "../overlays/PushStack";
import { IOSInstallBanner } from "../overlays/IOSInstallBanner";
import { ScenarioRibbon } from "../overlays/ScenarioRibbon";
import { TweaksPanel } from "../overlays/TweaksPanel";
import { CompassOverlay } from "../overlays/CompassOverlay";

/**
 * PhoneShell — the device-dressed canvas every screen renders inside.
 *
 * Layout: [device-stage] → [phone frame] → [viewport with status bar + outlet
 * + tab bar + home indicator + overlays]. Full-bleed screens (alert, sos,
 * onboarding, firefighter) hide the chrome and render edge-to-edge.
 */
export function PhoneShell() {
  const { effectiveStage, scenarioT, scenarioPlaying } = useAlert();
  const { role, hasOnboarded } = useSettings();
  const { pathname } = useLocation();

  const onboarding = pathname === "/welcome" || !hasOnboarded;
  const onSos = pathname.startsWith("/sos");
  const onAlert = pathname.startsWith("/alert");
  const isFullBleed = onboarding || onAlert || onSos;
  const isFirefighter = role === "firefighter" || pathname.startsWith("/ops");

  const statusTone = onAlert || onSos ? "dark" : "light";

  // Tab bar hidden on onboarding and the alert push screen. SOS keeps the tab
  // bar with a red-tinted theme so it blends with the emergency stage.
  const showTabBar = !onboarding && !onAlert;
  const tabBarTone: "default" | "sos" = onSos ? "sos" : "default";
  // SOS routes the home indicator through PhoneShell (below the tab bar)
  // instead of letting the page render its own at the bottom of the stage.
  const showHomeIndicator = !onboarding && !onAlert;
  const homeIndicatorTone: "default" | "sos" = onSos ? "sos" : "default";

  // Compass-bezel ring traces the phone-frame edge on pages where heading is
  // useful — the live map and the directions/evacuation page. Adding the
  // `has-compass` modifier insets .app-viewport by the bezel width so the
  // ring sits in the gap between the frame and the content.
  const showCompass = pathname === "/evacuation" || pathname.startsWith("/map");

  return (
    <div className="app-stage">
      <div className={`app-frame${showCompass ? " has-compass" : ""}`}>
        <div className="app-viewport" data-stage={effectiveStage}>
          {!isFullBleed && <StatusBar tone={statusTone} />}

          <Outlet />

          {showTabBar && (
            <TabBar role={isFirefighter ? "firefighter" : "citizen"} tone={tabBarTone} />
          )}
          {showHomeIndicator && <HomeIndicator tone={homeIndicatorTone} />}

          {/* Overlays — anchored inside the phone frame, not the page. */}
          <PushStack />
          <IOSInstallBanner />
          {(scenarioPlaying || scenarioT > 0) && <ScenarioRibbon />}
        </div>
        {showCompass && <CompassOverlay />}
      </div>

      <TweaksPanel />
    </div>
  );
}
