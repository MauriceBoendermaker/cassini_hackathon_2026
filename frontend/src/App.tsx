import { Navigate, Route, Routes, useLocation } from "react-router-dom";
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
import { FirefighterPage } from "./pages/responder/FirefighterPage";
import { useSettings } from "./state/SettingsContext";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * If the user is in firefighter role, hard-route them to /ops. Citizens
 * stay on whatever screen they navigated to. Reset to /ops or / when role
 * changes.
 */
function RoleSync() {
  const { role } = useSettings();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === "firefighter" && !pathname.startsWith("/ops")) navigate("/ops", { replace: true });
    else if (role === "citizen" && pathname.startsWith("/ops")) navigate("/", { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  return null;
}

function CitizenHome() {
  const { hasOnboarded } = useSettings();
  if (!hasOnboarded) return <Navigate to="/welcome" replace />;
  return <HomePage />;
}

export default function App() {
  return (
    <>
      <RoleSync />
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
          <Route path="/ops"         element={<FirefighterPage />} />
          <Route path="/ops/*"       element={<FirefighterPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
