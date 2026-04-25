import { useNavigate } from "react-router-dom";
import { useAlert } from "../../state/AlertContext";
import { AppBar } from "../../components/layout/AppBar";
import { IconChevronL, IconChevronR, IconSatellite, IconShield } from "../../components/icons/Icons";
import {
  ACTIVE_MODULES,
  COMING_SOON_MODULES,
  type DisasterModule,
  type ModuleStub,
} from "../../lib/disaster-types";

function ModuleCard({
  module,
  isActive,
  onSelect,
}: {
  module: DisasterModule;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      style={{
        width: "100%",
        textAlign: "left",
        padding: 16,
        borderRadius: 18,
        border: isActive
          ? "2px solid var(--brand)"
          : "1px solid var(--line)",
        background: isActive ? "var(--bg-soft)" : "var(--surface)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: isActive ? "var(--brand)" : "var(--bg-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            {module.emoji}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{module.name}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 1 }}>
              {module.tagline}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {isActive && (
            <span
              className="chip mono"
              style={{ background: "var(--brand)", color: "#fff", borderColor: "transparent", fontSize: 9 }}
            >
              <span className="dot" style={{ background: "#fff" }} />
              ACTIVE
            </span>
          )}
          <IconChevronR size={16} style={{ color: "var(--ink-3)" }} />
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {module.copernicusSources.map((src) => (
          <span
            key={src}
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              padding: "3px 8px",
              borderRadius: 6,
              background: "var(--bg-soft)",
              color: "var(--ink-2)",
              border: "1px solid var(--line)",
              letterSpacing: "0.03em",
            }}
          >
            {src}
          </span>
        ))}
      </div>

      <div
        style={{
          fontSize: 11.5,
          color: "var(--ink-3)",
          lineHeight: 1.5,
          display: "flex",
          alignItems: "flex-start",
          gap: 6,
        }}
      >
        <IconSatellite size={13} style={{ marginTop: 1, flexShrink: 0, color: "var(--brand)" }} />
        <span>Galileo: {module.galileoUse}</span>
      </div>
    </button>
  );
}

function ComingSoonCard({ module }: { module: ModuleStub }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 18,
        border: "1px solid var(--line)",
        background: "var(--surface)",
        opacity: 0.55,
        marginBottom: 10,
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 13,
              background: "var(--bg-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
            }}
          >
            {module.emoji}
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>{module.name}</div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 1 }}>{module.tagline}</div>
          </div>
        </div>
        <span
          className="chip mono"
          style={{ fontSize: 9, letterSpacing: "0.04em" }}
        >
          SOON
        </span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {module.copernicusSources.map((src) => (
          <span
            key={src}
            style={{
              fontSize: 10,
              fontFamily: "var(--font-mono)",
              padding: "3px 8px",
              borderRadius: 6,
              background: "var(--bg-soft)",
              color: "var(--ink-2)",
              border: "1px solid var(--line)",
              letterSpacing: "0.03em",
            }}
          >
            {src}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ModulesPage() {
  const navigate = useNavigate();
  const { activeModule, setActiveModule } = useAlert();

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AppBar
        sub="AEGIS DISASTER OS"
        title="Hazard Modules"
        left={
          <button className="icon-btn" onClick={() => navigate("/settings")} aria-label="Back">
            <IconChevronL size={18} />
          </button>
        }
      />

      <div className="scroll">
        {/* Platform pitch */}
        <div
          style={{
            padding: "18px 16px",
            borderRadius: 18,
            background: "linear-gradient(135deg, var(--ink-card) 0%, var(--ink-card-2) 100%)",
            color: "var(--ink-card-fg)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              opacity: 0.7,
              marginBottom: 6,
            }}
          >
            Open Standard · AegisModule v1
          </div>
          <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0, opacity: 0.92 }}>
            Aegis is not a flood app — it is{" "}
            <strong>disaster-agnostic infrastructure</strong>. Any hazard type can be
            added as a module: a satellite data source, an alert scale, and a set
            of citizen guidance. Switch modules below to see Aegis adapt in real time.
          </p>
          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: 8,
              alignItems: "center",
              fontSize: 11.5,
              opacity: 0.8,
            }}
          >
            <IconShield size={14} />
            <span>Complements NL-Alert, BeMASS, Katwarn — does not replace them</span>
          </div>
        </div>

        {/* Active modules */}
        <div className="eyebrow" style={{ marginTop: 22, marginBottom: 12 }}>
          Active modules — tap to switch
        </div>

        {ACTIVE_MODULES.map((mod) => (
          <ModuleCard
            key={mod.id}
            module={mod}
            isActive={activeModule.id === mod.id}
            onSelect={() => setActiveModule(mod)}
          />
        ))}

        {/* Coming soon */}
        <div className="eyebrow" style={{ marginTop: 18, marginBottom: 12 }}>
          Coming soon
        </div>

        {COMING_SOON_MODULES.map((mod) => (
          <ComingSoonCard key={mod.id} module={mod} />
        ))}

        {/* Open standard explainer */}
        <div
          className="card"
          style={{ marginTop: 18, background: "var(--bg-soft)", fontSize: 12, lineHeight: 1.6 }}
        >
          <div
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--ink-3)",
              marginBottom: 6,
            }}
          >
            AegisModule Standard · Apache 2.0
          </div>
          <p style={{ margin: 0, color: "var(--ink-2)" }}>
            The module format is open source. Emergency authorities can define their own
            hazard types using the standard schema — specifying Copernicus data sources,
            Galileo integration, alert stages, and citizen guidance. Aegis provides the
            managed satellite data feeds and citizen coordination layer as a paid service.
          </p>
        </div>

        {/* B2G pitch */}
        <div
          className="card"
          style={{ marginTop: 10, background: "var(--bg-soft)", fontSize: 12, lineHeight: 1.6 }}
        >
          <div
            style={{
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--ink-3)",
              marginBottom: 6,
            }}
          >
            Business model · B2G SaaS
          </div>
          <p style={{ margin: 0, color: "var(--ink-2)" }}>
            Licensed to EU safety regions and municipalities. 400+ potential customers
            across the EU at €15–50k/year per region. One integration, all hazard types.
          </p>
        </div>

        <button
          className="btn secondary"
          style={{ width: "100%", marginTop: 18 }}
          onClick={() => navigate("/settings")}
        >
          Settings
        </button>

        <div
          style={{
            marginTop: 18,
            padding: "14px 0",
            textAlign: "center",
            fontSize: 10.5,
            fontFamily: "var(--font-mono)",
            color: "var(--ink-3)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          built for the 11th cassini hackathon · eu space for water
        </div>
      </div>
    </div>
  );
}
