# Aegis — CASSINI Hackathon 2026 Prototype
(11th [CASSINI Hackathon](https://taikai.network/en/cassinihackathons/hackathons/space-for-water/overview) · EU Space for Water, April 2026)

Aegis is a multi-hazard citizen alert and rescue coordination platform built for the **11th CASSINI Hackathon** under the **"EU Space for Water"** challenge theme.
The CASSINI Hackathon is the European Commission's flagship space hackathon, run across multiple European cities to challenge teams to build solutions powered by EU space programmes — **Copernicus** (Earth observation) and **Galileo** (positioning + Search & Rescue).

Our team (Maurice Boendermaker, Thijs van Steenbeek, Mathijs de Niet, Mark Salloum and Harika Ireddy) built Aegis as a working prototype that turns raw Copernicus satellite observations into clear, staged alerts citizens can act on — even when terrestrial networks fail.

## About the Project

Aegis is a proof of concept demonstrating how European space infrastructure can be combined into a single, citizen-facing early-warning platform that scales across hazards.
It directly responds to the rising frequency of climate-driven flood, drought, wildfire, storm and heatwave events across the EU, and to the "Space for Water" call for tools that turn satellite data into actionable civil-protection workflows.

The Valencia 2024 (DANA) flash flood — 200+ casualties, billions in damage, less than 12 hours of warning — is the demo scenario shipped with the prototype.

## Key Features

- **Multi-hazard module system** — Flood, drought, wildfire, storm and heatwave; each driven by an open `AegisModule` format that defines stage thresholds, satellite sources and SOS semantics. New hazards can be added without changing the app shell.

- **5-stage EFAS alert scale** — Monitoring → Watch → Warning → Severe → Emergency, with perceptually-matched OKLCH colours and consistent semantics across every hazard module.

- **Live OSM map with real river gauges** — Leaflet map showing flood-extent zones, real water-level sensors (CHJ / SAIH for Spain, Rijkswaterstaat for the Netherlands), road closures and active SOS pins.

- **Citizen + Rescue views** — One app, two roles. A toggle in settings switches between the citizen interface and the firefighter / rescue-unit operations dashboard.

- **Galileo SOS button** — Press-and-hold emergency report that transmits the user's precise EGNOS-grade coordinates to the nearest rescue unit, with the Galileo Search & Rescue Service as offline fallback.

- **OSRM evacuation routing** — Foot-routing to the nearest assembly point with turn-by-turn directions, step-thumbnail maps and live progress along the route.

- **Offline-first PWA** — Service worker caches map tiles and critical alerts; falls back to Galileo broadcast when terrestrial networks are down. Installable on iOS and Android.

- **24-language EU coverage** — All 24 official EU languages selectable; reverse-geocoded place names via Nominatim.

- **Phone-frame demo shell** — Desktop preview renders inside a device frame for stakeholder pitches; mobile and PWA modes strip the chrome and respect real OS safe areas (dynamic island, home indicator).

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, TypeScript, Vite, React Router, Leaflet + React-Leaflet |
| Backend | Python (FastAPI, Uvicorn, httpx) |
| PWA / Build | vite-plugin-pwa, Workbox, Sharp icon pipeline |
| Data | Copernicus EMS + C3S · Sentinel-1 SAR · Sentinel-2 NDVI · EFAS / GloFAS · CDS ERA5 · Galileo HAS + EGNOS · OSM tiles · Nominatim · OSRM · Open-Meteo |

## Hackathon Context

The "EU Space for Water" challenge addresses a fast-growing societal problem:

- **2024 Valencia (DANA) flash floods** — 200+ killed, billions in damage, well under 12 hours of warning
- Climate-driven hazards across the EU are intensifying — flood, drought, wildfire, storm, heatwave
- **Copernicus** observes them all, but raw satellite data isn't actionable for non-expert citizens
- **Galileo / EGNOS** delivers sub-metre positioning and a Search & Rescue channel that works without a mobile network
- **Key question:** how do we turn EU space infrastructure into something a citizen can use during the moments that matter most — and that civil-protection units can still rely on when the network goes down?

Aegis demonstrates a single, multi-hazard answer: stage-based alerts, role-aware navigation, and offline-first rescue coordination — all powered by the EU's existing space programmes.

## Project Structure

```
cassini_hackathon_2026/
├── backend/      FastAPI service — Open-Meteo ingest, river-level model, EFAS stage endpoint
├── frontend/     React + TypeScript PWA — citizen + rescue UI, Leaflet maps, offline shell
└── docs/         Internal specs and notes
```

## Running locally

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload          # http://localhost:8000/docs

# Frontend
cd frontend
npm install
npm run dev                         # http://localhost:5173
```

## Team

- Maurice Boendermaker
- Thijs van Steenbeek
- Mathijs de Niet
- Mark Salloum
- Harika Ireddy

---

Built for the **11th CASSINI Hackathon · EU Space for Water · April 2026**.
Live demo: https://aegis.mauriceb.nl
