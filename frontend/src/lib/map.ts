// Tile layer configuration for Leaflet.
// Set VITE_MAPTILER_API_KEY for production (MapTiler free tier: 100k loads/month).
// Falls back to OSM for local dev when no key is present.

const KEY = import.meta.env.VITE_MAPTILER_API_KEY;

type TileConfig = {
  url: string;
  options: { maxZoom: number; tileSize?: number; zoomOffset?: number };
};

export function tileLayerConfig(): TileConfig {
  if (KEY) {
    return {
      url: `https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${KEY}`,
      options: { maxZoom: 19, tileSize: 512, zoomOffset: -1 },
    };
  }
  return {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    options: { maxZoom: 19 },
  };
}
