import { Navigate, Route, Routes } from "react-router-dom";
import { PhoneShell } from "./components/layout/PhoneShell";
import { OnboardingPage } from "./pages/citizen/OnboardingPage";
import { HomePage } from "./pages/citizen/HomePage";
import { MapPage } from "./pages/citizen/MapPage";
import { AlertPage } from "./pages/citizen/AlertPage";
import { SOSPage } from "./pages/citizen/SOSPage";
import { EvacuationPage } from "./pages/citizen/EvacuationPage";
import { HistoryPage } from "./pages/citizen/HistoryPage";
import { SettingsPage } from "./pages/citizen/SettingsPage";
import { AboutPage } from "./pages/citizen/AboutPage";
import { ModulesPage } from "./pages/citizen/ModulesPage";
import { FirefighterPage } from "./pages/responder/FirefighterPage";
import { useSettings } from "./state/SettingsContext";

function CitizenHome() {
  const { hasOnboarded } = useSettings();
  if (!hasOnboarded) return <Navigate to="/welcome" replace />;
  return <HomePage />;
}

/**
 * Role is session-scoped and only affects which tab bar / landing page the
 * user sees after they explicitly toggle it. There's no auto-redirect — the
 * default landing page is always `/` (citizen home), even if the previous
 * session left the role toggle on firefighter.
 */
export default function App() {
  return (
    <Routes>
      <Route element={<PhoneShell />}>
        <Route path="/welcome"     element={<OnboardingPage />} />
        <Route path="/"            element={<CitizenHome />} />
        <Route path="/map"         element={<MapPage />} />
        <Route path="/alert"       element={<AlertPage />} />
        <Route path="/sos"         element={<SOSPage />} />
        <Route path="/evacuation"  element={<EvacuationPage />} />
        <Route path="/history"     element={<HistoryPage />} />
        <Route path="/settings"    element={<SettingsPage />} />
        <Route path="/about"       element={<AboutPage />} />
        <Route path="/modules"     element={<ModulesPage />} />
        <Route path="/ops"         element={<FirefighterPage />} />
        <Route path="/ops/*"       element={<FirefighterPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
