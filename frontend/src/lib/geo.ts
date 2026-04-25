// Browser geolocation + Nominatim reverse geocoding helpers.
//
// Both are best-effort — if the user denies geolocation or the network is
// down, callers fall back to the Valencia demo anchor.

export type LatLng = { lat: number; lng: number };

export async function getCurrentPosition(): Promise<LatLng | null> {
  if (typeof navigator === "undefined" || !("geolocation" in navigator)) return null;
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 6000, maximumAge: 60_000, enableHighAccuracy: false },
    );
  });
}

type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  suburb?: string;
  county?: string;
  country_code?: string;
};

/**
 * Reverse-geocode coordinates to a human place name via OpenStreetMap's
 * free Nominatim service. Returns the most specific label available
 * (city → town → village → municipality → suburb → county) and the ISO
 * country code, or nulls if the lookup fails.
 */
export async function reverseGeocode(
  p: LatLng,
): Promise<{ label: string | null; country: string | null }> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "json");
    url.searchParams.set("lat", p.lat.toFixed(5));
    url.searchParams.set("lon", p.lng.toFixed(5));
    url.searchParams.set("zoom", "12");
    url.searchParams.set("addressdetails", "1");
    const r = await fetch(url.toString(), {
      headers: { "Accept-Language": "en" },
    });
    if (!r.ok) return { label: null, country: null };
    const data = (await r.json()) as { address?: NominatimAddress };
    const a = data.address ?? {};
    const label =
      a.city ?? a.town ?? a.village ?? a.municipality ?? a.suburb ?? a.county ?? null;
    const country = a.country_code ? a.country_code.toUpperCase() : null;
    return { label, country };
  } catch {
    return { label: null, country: null };
  }
}
