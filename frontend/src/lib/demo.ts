// Aegis demo dataset — Valencia 2024 (DANA) scripted scenario.
// Replace with live feeds when backend is wired.

export type StageNum = 1 | 2 | 3 | 4 | 5;

export type StageDef = {
  n: StageNum;
  key: "monitoring" | "watch" | "warning" | "severe" | "emergency";
  label: string;
  short: string;          // EFAS 1..5
  tone: "info" | "caution" | "warn" | "danger" | "critical";
  headline: string;
  blurb: string;
};

export const STAGES: StageDef[] = [
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
];

export const STAGE_COLORS: Record<StageNum, { bg: string; soft: string; ink: string }> = {
  1: { bg: "oklch(0.62 0.12 240)", soft: "oklch(0.94 0.04 240)", ink: "#fff" },
  2: { bg: "oklch(0.78 0.15 95)",  soft: "oklch(0.96 0.06 95)",  ink: "#1a1304" },
  3: { bg: "oklch(0.70 0.17 55)",  soft: "oklch(0.94 0.06 55)",  ink: "#fff" },
  4: { bg: "oklch(0.55 0.21 25)",  soft: "oklch(0.93 0.06 25)",  ink: "#fff" },
  5: { bg: "oklch(0.45 0.22 350)", soft: "oklch(0.92 0.06 350)", ink: "#fff" },
};

export function getStage(n: number): StageDef {
  const i = Math.max(0, Math.min(4, Math.round(n) - 1));
  return STAGES[i];
}

export function fmtCoord(v: number | null | undefined): string {
  if (v == null) return "—";
  return v.toFixed(5) + "°";
}

const pad2 = (n: number) => String(n).padStart(2, "0");
export function fmtClock(d: Date): string {
  return pad2(d.getHours()) + ":" + pad2(d.getMinutes());
}

// ─── Valencia 2024 scenario ───────────────────────────────────────────

export type ScenarioEvent = {
  t: number;       // hours from t=0 (Oct 29, 2024 09:00 local)
  stage: StageNum;
  title: string;
  detail: string;
};

export const VALENCIA = {
  center: [39.4699, -0.3763] as [number, number],
  zoom: 11,
  user: [39.4585, -0.3614] as [number, number],   // Quart de Poblet area
  scriptedHours: 36,
  events: [
    { t: 0,  stage: 1, title: "Routine monitoring",
      detail: "Copernicus EMS observing convective cells over Iberian Peninsula." },
    { t: 4,  stage: 2, title: "Watch issued — EFAS",
      detail: "Heavy rainfall forecast 80–120 mm over 12h in Túria basin." },
    { t: 9,  stage: 3, title: "Warning — Túria & Magro basins",
      detail: "Sentinel-1 SAR detects rising water levels. Local flooding likely." },
    { t: 13, stage: 4, title: "Severe warning — Poyo ravine",
      detail: "Flash flood imminent. Move to upper floors. Avoid basements & underpasses." },
    { t: 14, stage: 5, title: "Evacuation order",
      detail: "Civil Protection: mandatory evacuation in red zone. Follow marked routes." },
    { t: 18, stage: 5, title: "Rescue operations active",
      detail: "Bomberos coordinating with Aegis SOS pin density." },
    { t: 28, stage: 4, title: "Stabilising — water receding",
      detail: "Search & recovery phase. Stay clear of damaged structures." },
    { t: 36, stage: 3, title: "Stand-down to Warning",
      detail: "Continued elevated risk over next 24h." },
  ] as ScenarioEvent[],
};

// Mock flood polygons (lng/lat pairs) keyed by stage threshold.
type LngLat = [number, number];
export const FLOOD_LAYERS: Record<"watch" | "warning" | "severe", LngLat[][]> = {
  watch: [
    [[-0.39, 39.47], [-0.36, 39.475], [-0.34, 39.46], [-0.37, 39.455]],
  ],
  warning: [
    [[-0.42, 39.46], [-0.38, 39.47], [-0.34, 39.455], [-0.36, 39.44], [-0.41, 39.445]],
    [[-0.33, 39.49], [-0.30, 39.495], [-0.28, 39.48], [-0.31, 39.475]],
  ],
  severe: [
    [[-0.43, 39.455], [-0.36, 39.47], [-0.32, 39.45], [-0.35, 39.43], [-0.42, 39.435]],
    [[-0.32, 39.50], [-0.28, 39.51], [-0.25, 39.49], [-0.30, 39.48]],
  ],
};

export type SOSPin = {
  id: string;
  lat: number; lng: number;
  age: number;     // minutes since requested
  n: number;       // people involved
  note: string;
};

export const SOS_PINS: SOSPin[] = [
  { id: "SOS-A41", lat: 39.4612, lng: -0.3702, age: 8,  n: 3, note: "2nd floor, no elderly" },
  { id: "SOS-B12", lat: 39.4538, lng: -0.3810, age: 22, n: 1, note: "Roof, mobility issue" },
  { id: "SOS-C07", lat: 39.4488, lng: -0.3551, age: 12, n: 4, note: "Family, child injured" },
  { id: "SOS-D33", lat: 39.4720, lng: -0.3380, age: 4,  n: 2, note: "Trapped in vehicle" },
  { id: "SOS-E18", lat: 39.4420, lng: -0.3940, age: 18, n: 2, note: "Roof, water rising" },
  { id: "SOS-F02", lat: 39.4660, lng: -0.4020, age: 31, n: 5, note: "Care home staff + 4" },
];

export type FFUnit = {
  id: string;
  lat: number; lng: number;
  type: "Boat" | "Heli" | "Truck";
  crew: number;
};

export const FF_UNITS: FFUnit[] = [
  { id: "BV-04", lat: 39.467, lng: -0.358, type: "Boat",  crew: 4 },
  { id: "HX-12", lat: 39.475, lng: -0.345, type: "Heli",  crew: 3 },
  { id: "TR-09", lat: 39.456, lng: -0.395, type: "Truck", crew: 6 },
];

export type AegisNotification = {
  id: string;
  /** Minutes before "now" (page load) when this notification was issued.
   * Renders via `formatRelative` so the demo always looks current. */
  minutesAgo: number;
  stage: StageNum;
  title: string;
  body: string;
};

export const NOTIFICATIONS: AegisNotification[] = [
  { id: "n1", minutesAgo: 12,      stage: 5, title: "Evacuation order issued",
    body: "Mandatory evacuation. Move to designated assembly point now. Follow blue route." },
  { id: "n2", minutesAgo: 38,      stage: 4, title: "Severe flood warning",
    body: "Flash flood imminent. Move to upper floors. Avoid basements and underpasses." },
  { id: "n3", minutesAgo: 60 * 5,  stage: 3, title: "Flood warning",
    body: "Localised flooding likely within 6–12 hours. Prepare to move." },
  { id: "n4", minutesAgo: 60 * 10, stage: 2, title: "Watch in effect",
    body: "80–120 mm rainfall forecast over 12h. Stay informed." },
  { id: "n5", minutesAgo: 60 * 30, stage: 2, title: "Watch issued — upstream",
    body: "Routine watch for upstream rainfall." },
  { id: "n6", minutesAgo: 60 * 24 * 7, stage: 1, title: "System update",
    body: "Aegis offline cache refreshed via Galileo broadcast." },
];

export const DROUGHT_NOTIFICATIONS: AegisNotification[] = [
  { id: "d1", minutesAgo: 45,         stage: 4, title: "Severe drought warning",
    body: "Critical soil moisture deficit. Sentinel-2 NDVI confirms severe vegetation stress in monitored zone." },
  { id: "d2", minutesAgo: 60 * 3,     stage: 3, title: "Drought watch activated",
    body: "C3S soil moisture 38% below seasonal average. Agricultural restrictions recommended." },
  { id: "d3", minutesAgo: 60 * 8,     stage: 3, title: "NDVI alert — vegetation stress",
    body: "Sentinel-2 NDVI dropped to 0.22. Crop impact assessment underway." },
  { id: "d4", minutesAgo: 60 * 24,    stage: 2, title: "Dryness advisory issued",
    body: "Precipitation 48% below normal over 30 days. Discretionary water use reduction advised." },
  { id: "d5", minutesAgo: 60 * 72,    stage: 2, title: "Groundwater level declining",
    body: "EFAS hydrology models show groundwater at seasonal low. Conservation measures begin." },
  { id: "d6", minutesAgo: 60 * 24 * 7, stage: 1, title: "Seasonal monitoring update",
    body: "Copernicus C3S routine assessment complete. Soil moisture within seasonal norms." },
];

/** Format a minutes-ago value as a compact relative-time string. */
export function formatRelative(minutes: number): string {
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${Math.round(minutes)}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}

// 24 EU official languages.
export type EuLang = { code: string; name: string; en: string };
export const EU_LANGUAGES: EuLang[] = [
  { code: "BG", name: "Български",   en: "Bulgarian" },
  { code: "HR", name: "Hrvatski",     en: "Croatian" },
  { code: "CS", name: "Čeština",      en: "Czech" },
  { code: "DA", name: "Dansk",        en: "Danish" },
  { code: "NL", name: "Nederlands",   en: "Dutch" },
  { code: "EN", name: "English",      en: "English" },
  { code: "ET", name: "Eesti",        en: "Estonian" },
  { code: "FI", name: "Suomi",        en: "Finnish" },
  { code: "FR", name: "Français",     en: "French" },
  { code: "DE", name: "Deutsch",      en: "German" },
  { code: "EL", name: "Ελληνικά",    en: "Greek" },
  { code: "HU", name: "Magyar",       en: "Hungarian" },
  { code: "GA", name: "Gaeilge",      en: "Irish" },
  { code: "IT", name: "Italiano",     en: "Italian" },
  { code: "LV", name: "Latviešu",     en: "Latvian" },
  { code: "LT", name: "Lietuvių",     en: "Lithuanian" },
  { code: "MT", name: "Malti",        en: "Maltese" },
  { code: "PL", name: "Polski",       en: "Polish" },
  { code: "PT", name: "Português",    en: "Portuguese" },
  { code: "RO", name: "Română",       en: "Romanian" },
  { code: "SK", name: "Slovenčina",   en: "Slovak" },
  { code: "SL", name: "Slovenščina",  en: "Slovenian" },
  { code: "ES", name: "Español",      en: "Spanish" },
  { code: "SV", name: "Svenska",      en: "Swedish" },
];

// Compute current stage at scenario time t (0..1).
export function stageAtScenario(t: number): StageNum {
  const hours = t * VALENCIA.scriptedHours;
  let s: StageNum = 1;
  for (const e of VALENCIA.events) {
    if (e.t <= hours) s = e.stage;
  }
  return s;
}

export function eventsAtScenario(t: number): ScenarioEvent[] {
  const hours = t * VALENCIA.scriptedHours;
  return VALENCIA.events.filter((e) => e.t <= hours);
}
