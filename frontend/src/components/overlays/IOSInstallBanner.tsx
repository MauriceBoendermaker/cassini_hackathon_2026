import { useAlert } from "../../state/AlertContext";
import { AegisLogo } from "../brand/AegisLogo";
import { IconChevronR } from "../icons/Icons";

export function IOSInstallBanner() {
  const { installVisible, hideInstall } = useAlert();
  if (!installVisible) return null;

  return (
    <div className="ios-install" role="dialog" aria-label="Install Aegis">
      <div className="ii-head">
        <div className="ii-app">
          <AegisLogo size={28} color="#fff" mark="var(--ink-card)" />
        </div>
        <div style={{ flex: 1 }}>
          <div className="ii-title">Install Aegis</div>
          <div className="ii-sub">Add to Home Screen for critical alerts and offline access.</div>
        </div>
      </div>
      <div className="ii-steps">
        <div className="ii-step">
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none" aria-hidden="true">
            <path
              d="M8 2v11M3 6l5-4 5 4"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 10v7a1 1 0 001 1h10a1 1 0 001-1v-7"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
          Tap Share
        </div>
        <IconChevronR size={12} style={{ opacity: 0.4 }} />
        <div className="ii-step">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <rect x="1" y="1" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 4v6M4 7h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          "Add to Home Screen"
        </div>
      </div>
      <div className="ii-actions">
        <button onClick={hideInstall}>Later</button>
        <button className="cta" onClick={hideInstall}>Got it</button>
      </div>
    </div>
  );
}
