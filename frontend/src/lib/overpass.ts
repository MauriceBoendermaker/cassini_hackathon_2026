export type LatLng = { lat: number; lng: number };

export type Waterway = {
  id: number;
  type: "stream" | "river" | "canal" | "other";
  name?: string;
  widthMeters?: number;
  geometry: LatLng[];
};

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

export async function fetchWaterways(
  center: LatLng,
  radiusMeters: number,
): Promise<Waterway[]> {
  const q = `
    [out:json][timeout:25];
    (
      way["waterway"~"^(stream|river|canal)$"](around:${radiusMeters},${center.lat},${center.lng});
    );
    out geom tags;
  `;

  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "data=" + encodeURIComponent(q),
  });

  if (!res.ok) throw new Error(`Overpass returned ${res.status}`);
  const data = await res.json();

  return (data.elements ?? [])
    .filter((el: any) => el.type === "way" && Array.isArray(el.geometry))
    .map((el: any): Waterway => {
      const tags = el.tags ?? {};
      const waterwayTag = tags.waterway as string | undefined;
      const widthRaw = tags.width as string | undefined;
      return {
        id: el.id,
        type:
          waterwayTag === "stream" || waterwayTag === "river" || waterwayTag === "canal"
            ? waterwayTag
            : "other",
        name: tags.name,
        widthMeters: widthRaw ? parseFloat(widthRaw) : undefined,
        geometry: el.geometry.map((g: any) => ({ lat: g.lat, lng: g.lon })),
      };
    });
}
