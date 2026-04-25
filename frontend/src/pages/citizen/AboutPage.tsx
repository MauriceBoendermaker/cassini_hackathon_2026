import { useNavigate } from "react-router-dom";
import { AppBar } from "../../components/layout/AppBar";
import { useAlert } from "../../state/AlertContext";
import { AegisLogo } from "../../components/brand/AegisLogo";
import { StageBadge } from "../../components/ui/StageBadge";
import {
  IconChevronL,
  IconDrop,
  IconLayers,
  IconMapPin,
  IconRoute,
  IconSatellite,
  IconShield,
  IconUsers,
} from "../../components/icons/Icons";

export function AboutPage() {
  const navigate = useNavigate();
  const { activeModule } = useAlert();

  const sources = [
    {
      Ic: IconSatellite,
      t: "Copernicus EMS + C3S",
      s: "Sentinel-1 SAR flood extent · Sentinel-2 NDVI · C3S soil moisture · EFAS · DEM",
    },
    {
      Ic: IconMapPin,
      t: "Galileo HAS + EGNOS",
      s: "Decimetre positioning · Galileo SAR for SOS · EGNOS precision agriculture",
    },
    {
      Ic: IconShield,
      t: "Civil Protection feeds",
      s: "NL-Alert · DWD · Météo-France · AEMET · ECHO ERCC",
    },
    {
      Ic: IconDrop,
      t: "Hydrology & climate models",
      s: "EFAS · GloFAS · CDS ERA5 · local river-gauge networks",
    },
    {
      Ic: IconRoute,
      t: "OpenStreetMap",
      s: "OSM tiles · Nominatim reverse geocoding · OSRM foot routing for evacuation paths",
    },
    {
      Ic: IconLayers,
      t: "AegisModule Standard",
      s: "Open disaster module format — flood, drought, wildfire, storm, heatwave",
    },
  ];

  const developers = [
    "Maurice Boendermaker",
    "Thijs van Steenbeek",
    "Mark Salloum",
    "Mathijs de Niet",
    "Harika Ireddy",
  ];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <AppBar
        sub="ABOUT"
        title="Aegis"
        left={
          <button className="icon-btn" onClick={() => navigate("/settings")} aria-label="Back">
            <IconChevronL size={18} />
          </button>
        }
      />
      <div className="scroll">
        <div
          style={{
            padding: "22px 18px",
            borderRadius: 22,
            background: "linear-gradient(135deg, var(--ink-card) 0%, var(--ink-card-2) 100%)",
            color: "var(--ink-card-fg)",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <AegisLogo size={56} color="#fff" mark="var(--ink-card)" />
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>Aegis</div>
            <div
              style={{
                fontSize: 12,
                opacity: 0.8,
                fontFamily: "var(--font-mono)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginTop: 4,
              }}
            >
              EU MULTI-HAZARD · v1.0
            </div>
          </div>
        </div>

        <p className="h-sub" style={{ marginTop: 18, lineHeight: 1.6 }}>
          Aegis is a <strong>multi-hazard citizen alert and rescue coordination platform</strong>{" "}
          built on European space infrastructure. It turns raw Copernicus satellite observations
          into clear, staged alerts your community can act on — even when terrestrial networks
          fail. Flood, drought, wildfire, storm: one platform, any hazard.
        </p>

        <div className="eyebrow" style={{ marginTop: 22, marginBottom: 10 }}>Data sources</div>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {sources.map((r, i, a) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 14,
                padding: 14,
                borderBottom: i < a.length - 1 ? "1px solid var(--line)" : "none",
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "var(--bg-soft)",
                  color: "var(--ink-2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <r.Ic size={18} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{r.t}</div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: "var(--ink-3)",
                    marginTop: 4,
                    lineHeight: 1.5,
                  }}
                >
                  {r.s}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="eyebrow" style={{ marginTop: 22, marginBottom: 10 }}>
          {activeModule.name} alert scale
        </div>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {activeModule.stages.map((s, i, a) => (
            <div
              key={s.n}
              style={{
                padding: "14px 16px",
                borderBottom: i < a.length - 1 ? "1px solid var(--line)" : "none",
              }}
            >
              <div>
                <StageBadge n={s.n} size="sm" short={s.short} label={s.label} />
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 8 }}>{s.headline}</div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--ink-3)",
                  marginTop: 3,
                  lineHeight: 1.5,
                }}
              >
                {s.blurb}
              </div>
            </div>
          ))}
        </div>

        <div
          className="card"
          style={{
            marginTop: 22,
            background: "var(--bg-soft)",
            fontSize: 12,
            color: "var(--ink-2)",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ display: "block", marginBottom: 6, fontSize: 12.5 }}>Privacy</strong>
          Your location and household profile stay on-device. Only anonymised cell IDs are
          shared with civil protection during an active emergency. SOS submissions transmit
          your precise coordinates to the assigned rescue unit only.
        </div>

        <div className="eyebrow" style={{ marginTop: 22, marginBottom: 10 }}>Credits</div>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            style={{
              display: "flex",
              gap: 14,
              padding: 14,
              borderBottom: "1px solid var(--line)",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: "var(--bg-soft)",
                color: "var(--ink-2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <IconUsers size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>Built by</div>
              <div
                style={{
                  fontSize: 12.5,
                  color: "var(--ink-3)",
                  marginTop: 4,
                  lineHeight: 1.5,
                }}
              >
                CASSINI Hackathon 2026 team — EU Space for Water
              </div>
            </div>
          </div>
          {developers.map((name, i) => (
            <div
              key={name}
              style={{
                padding: "12px 16px",
                fontSize: 14,
                fontWeight: 500,
                borderBottom: i < developers.length - 1 ? "1px solid var(--line)" : "none",
              }}
            >
              {name}
            </div>
          ))}
        </div>

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
