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
  const isFullBleed =
    onboarding ||
    pathname.startsWith("/alert") ||
    pathname.startsWith("/sos");
  const isFirefighter = role === "firefighter" || pathname.startsWith("/ops");

  const statusTone =
    pathname.startsWith("/alert") || pathname.startsWith("/sos") ? "dark" : "light";

  // Tab bar hidden on full-bleed and (for now) firefighter ops view.
  const showTabBar = !onboarding && !pathname.startsWith("/alert") && !pathname.startsWith("/sos");

  return (
    <div className="app-stage">
      <div className="app-frame">
        <div className="app-viewport" data-stage={effectiveStage}>
          {!isFullBleed && <StatusBar tone={statusTone} />}

          <Outlet />

          {showTabBar && <TabBar role={isFirefighter ? "firefighter" : "citizen"} />}
          {!isFullBleed && <HomeIndicator />}

          {/* Overlays — anchored inside the phone frame, not the page. */}
          <PushStack />
          <IOSInstallBanner />
          {(scenarioPlaying || scenarioT > 0) && <ScenarioRibbon />}
        </div>
      </div>

      <TweaksPanel />
    </div>
  );
}
