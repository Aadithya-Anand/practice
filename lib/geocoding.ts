/**
 * Geocoding utilities - Nominatim forward & reverse
 * Building-level precision with addressdetails=1, zoom=18
 */

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";
const NOMINATIM_RATE_LIMIT_MS = 1100; // Nominatim: max 1 req/sec

// Chennai bounding box for restricted search (lon,lat order for Nominatim)
export const CHENNAI_VIEWBOX = {
  minLon: 80.05,
  minLat: 12.9,
  maxLon: 80.35,
  maxLat: 13.25,
};

/** Raw address components from Nominatim addressdetails - values may be string or string[] */
export interface NominatimAddress {
  house_number?: string;
  road?: string;
  building?: string;
  apartment?: string;
  suburb?: string;
  neighbourhood?: string;
  city_district?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  [key: string]: string | string[] | undefined;
}

/** Reverse geocode result - building-level */
export interface ReverseGeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  rawAddress: NominatimAddress;
  displayName: string;
}

/** Forward search result */
export interface ForwardGeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
  formattedAddress: string;
  rawAddress: NominatimAddress;
  placeId: number;
}

let lastRequestTime = 0;

async function rateLimit(): Promise<void> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < NOMINATIM_RATE_LIMIT_MS) {
    await new Promise((r) => setTimeout(r, NOMINATIM_RATE_LIMIT_MS - elapsed));
  }
  lastRequestTime = Date.now();
}

/**
 * Format address components into clean display string
 * "Flat 3B, Lakshmi Apartments, Adyar, Chennai"
 */
function toString(v: string | string[] | undefined): string {
  if (!v) return "";
  return Array.isArray(v) ? v[0] ?? "" : v;
}

function formatBuildingAddress(addr: NominatimAddress): string {
  const parts: string[] = [];
  const road = toString(addr.road);
  const houseNumber = toString(addr.house_number);
  const building = toString(addr.building);
  const apartment = toString(addr.apartment);

  if (houseNumber && road) {
    parts.push(`${houseNumber}, ${road}`);
  } else if (road) {
    parts.push(road);
  }

  if (building) parts.push(building);
  if (apartment) parts.push(apartment);

  const area = toString(addr.suburb) || toString(addr.neighbourhood) || toString(addr.city_district);
  if (area) parts.push(area);
  const city = toString(addr.city);
  if (city) parts.push(city);
  const postcode = toString(addr.postcode);
  if (postcode && !parts.includes(postcode)) parts.push(postcode);

  return parts.length > 0 ? parts.join(", ") : "";
}

/**
 * Reverse geocode - convert lat/lng to building-level address
 * zoom=18 for building precision
 */
export async function reverseGeocode(
  lat: number,
  lng: number,
  signal?: AbortController["signal"]
): Promise<ReverseGeocodeResult | null> {
  await rateLimit();

  try {
    const params = new URLSearchParams({
      lat: String(lat),
      lon: String(lng),
      format: "json",
      addressdetails: "1",
      zoom: "18",
    });

    const res = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
      headers: { "Accept-Language": "en" },
      signal,
    });

    if (!res.ok) return null;

    const data = await res.json();
    const addr = data.address as NominatimAddress | undefined;
    if (!addr) return null;

    const formattedAddress = formatBuildingAddress(addr);
    const displayName = data.display_name ?? formattedAddress;

    return {
      latitude: parseFloat(data.lat),
      longitude: parseFloat(data.lon),
      formattedAddress: formattedAddress || displayName,
      rawAddress: addr,
      displayName,
    };
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    return null;
  }
}

/**
 * Forward geocode - search by query with building-aware results
 * Bounded to Chennai, addressdetails=1 for structured data
 */
export async function forwardGeocode(
  query: string,
  signal?: AbortController["signal"]
): Promise<ForwardGeocodeResult[]> {
  if (!query.trim() || query.length < 3) return [];

  await rateLimit();

  try {
    const viewbox = `${CHENNAI_VIEWBOX.minLon},${CHENNAI_VIEWBOX.minLat},${CHENNAI_VIEWBOX.maxLon},${CHENNAI_VIEWBOX.maxLat}`;
    const params = new URLSearchParams({
      q: query,
      format: "json",
      addressdetails: "1",
      limit: "5",
      countrycodes: "in",
      bounded: "1",
      viewbox,
    });

    const res = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
      headers: { "Accept-Language": "en" },
      signal,
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!Array.isArray(data)) return [];

    return data.map((item: { lat: string; lon: string; display_name: string; address?: NominatimAddress; place_id: number }) => {
      const addr = item.address ?? {};
      const formattedAddress = formatBuildingAddress(addr) || item.display_name;
      return {
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        displayName: item.display_name,
        formattedAddress,
        rawAddress: addr,
        placeId: item.place_id,
      };
    });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    return [];
  }
}
