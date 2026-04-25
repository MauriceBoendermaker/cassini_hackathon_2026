import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Workbox } from "workbox-window";
import "leaflet/dist/leaflet.css";
import "./styles/globals.css";
import App from "./App";
import { SettingsProvider } from "./state/SettingsContext";
import { AlertProvider } from "./state/AlertContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <AlertProvider>
          <App />
        </AlertProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>,
);

// Register the PWA service worker (vite-plugin-pwa emits /sw.js on build).
if ("serviceWorker" in navigator) {
  const wb = new Workbox("/sw.js");
  wb.addEventListener("waiting", () => wb.messageSkipWaiting());
  wb.register().catch(() => {
    /* SW registration is best-effort; failures stay silent in dev */
  });
}
