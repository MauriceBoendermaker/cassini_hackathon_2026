import type { ComponentType } from "react";
import type { StageNum } from "./demo";
import {
  IconRoute,
  IconHand,
  IconPhone,
  IconUsers,
  IconDrop,
  IconEye,
  IconSatellite,
  IconShield,
} from "../components/icons/Icons";

type IconProps = { size?: number };

export type GuidanceItem = {
  Icon: ComponentType<IconProps>;
  title: string;
  sub: string;
};

export type MetricDef = {
  label: string;
  value: (stage: StageNum) => string;
  unit: string;
  tone: (stage: StageNum) => "" | "warn" | "danger";
};

export type ModuleStageDef = {
  n: StageNum;
  key: string;
  label: string;
  short: string;
  tone: "info" | "caution" | "warn" | "danger" | "critical";
  headline: string;
  blurb: string;
};

export type DisasterModuleId =
  | "flood"
  | "drought"
  | "wildfire"
  | "storm"
  | "heatwave";

export type DisasterModule = {
  id: DisasterModuleId;
  name: string;
  tagline: string;
  emoji: string;
  status: "active" | "soon";
  copernicusSources: string[];
  galileoUse: string;
  stages: ModuleStageDef[];
  metrics: MetricDef[];
  guidance: GuidanceItem[];
  /** "rescue" = SOS dispatch; "report" = citizen impact report; "none" = no action */
  sosType: "rescue" | "report" | "none";
  /** "route" = show evacuation navigation; "none" = no evacuation */
  evacuationType: "route" | "none";
  sourceLines: string[];
  mapLabel: string;
  countdownLabel: string;
};

// ─── Flood module ─────────────────────────────────────────────────────────────

export const FLOOD_MODULE: DisasterModule = {
  id: "flood",
  name: "Flood",
  tagline: "Extreme rainfall & river flooding",
  emoji: "🌊",
  status: "active",
  copernicusSources: ["EFAS", "Sentinel-1 SAR", "Sentinel-2", "DEM"],
  galileoUse: "HAS decimetre positioning for SOS; SAR offline distress signal",
  stages: [
    {
      n: 1, key: "monitoring", label: "Monitoring", short: "EFAS 1", tone: "info",
      headline: "Conditions normal",
      blurb: "Routine river and rainfall observation. No action required.",
    },
    {
      n: 2, key: "watch", label: "Watch", short: "EFAS 2", tone: "caution",
      headline: "Watch in effect",
      blurb: "Elevated rainfall forecast upstream. Stay informed and check kit.",
    },
    {
      n: 3, key: "warning", label: "Warning", short: "EFAS 3", tone: "warn",
      headline: "Flood warning",
      blurb: "Localised flooding likely within 6–12 hours. Prepare to move.",
    },
    {
      n: 4, key: "severe", label: "Severe", short: "EFAS 4", tone: "danger",
      headline: "Severe flood warning",
      blurb: "Move to higher ground now. Avoid basements and underpasses.",
    },
    {
      n: 5, key: "emergency", label: "Emergency", short: "EFAS 5", tone: "critical",
      headline: "Evacuation order",
      blurb: "Mandatory evacuation. Follow marked routes. Help is on the way.",
    },
  ],
  metrics: [
    {
      label: "Rainfall · 1h",
      value: (s) => (s >= 3 ? "38" : "4"),
      unit: "mm",
      tone: (s) => (s >= 3 ? "warn" : ""),
    },
    {
      label: "River level",
      value: (s) => (s >= 3 ? "+2.4" : "+0.3"),
      unit: "m",
      tone: (s) => (s >= 4 ? "danger" : s >= 3 ? "warn" : ""),
    },
    {
      label: "Wind gusts",
      value: () => "64",
      unit: "km/h",
      tone: () => "",
    },
    {
      label: "Sentinel-1",
      value: () => "07m",
      unit: "ago",
      tone: () => "",
    },
  ],
  guidance: [
    { Icon: IconRoute, title: "Move to higher ground",        sub: "420 m to assembly point B" },
    { Icon: IconHand,  title: "Avoid basements & underpasses", sub: "Water can rise within minutes" },
    { Icon: IconPhone, title: "Keep phone charged",            sub: "Galileo SOS works without signal" },
    { Icon: IconUsers, title: "Account for neighbours",        sub: "Especially elderly and children" },
  ],
  sosType: "rescue",
  evacuationType: "route",
  sourceLines: [
    "Source · Copernicus EMS · EFAS feed",
    "Co-issued · National civil protection",
    "Pass · Sentinel-1A · 13:51 CEST",
  ],
  mapLabel: "Flood overlays · SOS pins · evacuation routes",
  countdownLabel: "TIME UNTIL PEAK",
};

// ─── Drought module ───────────────────────────────────────────────────────────

export const DROUGHT_MODULE: DisasterModule = {
  id: "drought",
  name: "Drought",
  tagline: "Soil moisture & vegetation stress",
  emoji: "🌾",
  status: "active",
  copernicusSources: [
    "C3S Soil Moisture",
    "Sentinel-2 NDVI",
    "CDS ERA5 Precipitation",
    "EFAS Hydrology",
  ],
  galileoUse: "EGNOS precision for agriculture field reporting; mobile monitoring stations",
  stages: [
    {
      n: 1, key: "normal", label: "Normal", short: "D0 · Normal", tone: "info",
      headline: "No drought stress",
      blurb: "Soil moisture and vegetation within seasonal norms.",
    },
    {
      n: 2, key: "advisory", label: "Advisory", short: "D1 · Advisory", tone: "caution",
      headline: "Dryness advisory",
      blurb: "Below-normal rainfall detected. Monitor soil moisture and reduce discretionary use.",
    },
    {
      n: 3, key: "watch", label: "Watch", short: "D2 · Watch", tone: "warn",
      headline: "Drought watch",
      blurb: "Significant soil moisture deficit. Agricultural impact likely. Restrictions recommended.",
    },
    {
      n: 4, key: "warning", label: "Warning", short: "D3 · Warning", tone: "danger",
      headline: "Severe drought warning",
      blurb: "Critical moisture deficit. Crop failure risk. Emergency water measures activated.",
    },
    {
      n: 5, key: "emergency", label: "Emergency", short: "D4 · Emergency", tone: "critical",
      headline: "Drought emergency",
      blurb: "Extreme moisture deficit. Food security at risk. Emergency resources deployed.",
    },
  ],
  metrics: [
    {
      label: "Soil moisture",
      value: (s) => (s >= 3 ? "18" : "42"),
      unit: "%",
      tone: (s) => (s >= 4 ? "danger" : s >= 3 ? "warn" : ""),
    },
    {
      label: "NDVI vegetation",
      value: (s) => (s >= 3 ? "0.22" : "0.61"),
      unit: "idx",
      tone: (s) => (s >= 3 ? "warn" : ""),
    },
    {
      label: "Precip. anomaly",
      value: (s) => (s >= 2 ? "−48" : "−8"),
      unit: "%",
      tone: (s) => (s >= 3 ? "danger" : s >= 2 ? "warn" : ""),
    },
    {
      label: "Sentinel-2",
      value: () => "1d",
      unit: "ago",
      tone: () => "",
    },
  ],
  guidance: [
    { Icon: IconDrop,      title: "Reduce water consumption",     sub: "Limit irrigation to essential crops only" },
    { Icon: IconEye,       title: "Monitor vegetation health",    sub: "Sentinel-2 NDVI updated every 5 days" },
    { Icon: IconShield,    title: "Protect livestock water supply", sub: "Check and secure alternative sources" },
    { Icon: IconSatellite, title: "Report field conditions",       sub: "Share observations with civil protection" },
  ],
  sosType: "report",
  evacuationType: "none",
  sourceLines: [
    "Source · Copernicus C3S · soil moisture index",
    "Vegetation · Sentinel-2 NDVI · 10 m resolution",
    "Precip. · CDS ERA5 reanalysis",
  ],
  mapLabel: "Drought risk zones · moisture index · water sources",
  countdownLabel: "FORECAST HORIZON",
};

// ─── Coming-soon stubs ────────────────────────────────────────────────────────

export type ModuleStub = Pick<
  DisasterModule,
  "id" | "name" | "tagline" | "emoji" | "status" | "copernicusSources" | "galileoUse"
>;

export const COMING_SOON_MODULES: ModuleStub[] = [
  {
    id: "wildfire",
    name: "Wildfire",
    tagline: "Fire radiative power & spread modelling",
    emoji: "🔥",
    status: "soon",
    copernicusSources: ["Sentinel-3 VIIRS", "CEMS EFFIS", "Copernicus Atmosphere"],
    galileoUse: "Precise firefighter positioning in smoke-obscured terrain",
  },
  {
    id: "storm",
    name: "Severe Storm",
    tagline: "Extreme wind, hail & storm surge",
    emoji: "⛈️",
    status: "soon",
    copernicusSources: ["ECMWF ensemble", "Sentinel-1 wind fields", "Copernicus C3S"],
    galileoUse: "Storm surge positioning and evacuation route verification",
  },
  {
    id: "heatwave",
    name: "Heatwave",
    tagline: "Urban heat stress & mortality risk",
    emoji: "🌡️",
    status: "soon",
    copernicusSources: ["Copernicus C3S heat stress", "Sentinel-3 LST", "Urban Atlas"],
    galileoUse: "Cooling centre routing and vulnerable population reach",
  },
];

export const ACTIVE_MODULES: DisasterModule[] = [FLOOD_MODULE, DROUGHT_MODULE];
