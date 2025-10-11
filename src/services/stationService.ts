// Station data service: fetches a list of real stations from the Radio Browser
// public API, maps fields to the app's expected shape, and falls back to the
// bundled static `data/stations.json` if the network call fails.
import staticStationsData from "../data/stations.json";
import { RemoteStation, StaticStation, ServiceStation } from "../types";

const staticStations: StaticStation[] = staticStationsData as StaticStation[];

// Try multiple Radio Browser API servers for better reliability
// Endpoints are periodically verified to ensure availability
const RADIO_BROWSER_ENDPOINTS = [
  "https://fi1.api.radio-browser.info/json/stations?limit=60&hidebroken=true&has_extended_info=true",
  "https://de2.api.radio-browser.info/json/stations?limit=60&hidebroken=true&has_extended_info=true",
  "https://de1.api.radio-browser.info/json/stations?limit=60&hidebroken=true&has_extended_info=true",
  "https://at1.api.radio-browser.info/json/stations?limit=60&hidebroken=true&has_extended_info=true",
];

async function fetchRemoteStations(): Promise<RemoteStation[]> {
  // Try each endpoint until one works
  for (const endpoint of RADIO_BROWSER_ENDPOINTS) {
    console.log(`Trying Radio Browser endpoint: ${endpoint}`);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const res = await fetch(endpoint, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      console.log(`Response status for ${endpoint}: ${res.status}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        console.log(`✅ Success! Got ${data.length} stations from ${endpoint}`);
        return data;
      }
    } catch (err) {
      clearTimeout(timeout);
      console.warn(`❌ Radio Browser endpoint ${endpoint} failed:`, err);
      // Continue to next endpoint
    }
  }
  
  // If all endpoints failed, throw an error to trigger fallback
  throw new Error("All Radio Browser endpoints failed");
}

function mapRemoteToService(s: RemoteStation, idx: number): ServiceStation {
  const stationUuid = s.stationuuid;
  const id = stationUuid || s.id || String(idx);
  const name = s.name || s.stationname || "Unknown";
  // Prefer url_resolved as it's already been resolved by Radio Browser and more likely to work
  // This provides better stream URLs that are less likely to have CORS issues
  const streamUrl =
    s.url_resolved || s.url || s.stream_url || s.streamUrl || "";
  const genre =
    (s.tags && String(s.tags).split(",")[0]) || s.genre || "Various";
  const favicon =
    s.favicon ||
    s.logo ||
    `https://placehold.co/120x120/1a1a1a/ffffff?text=${encodeURIComponent(
      (name || "").slice(0, 2)
    )}`;
  return { id, name, streamUrl, genre, favicon, stationUuid };
}

function mapStaticToService(s: StaticStation): ServiceStation {
  return {
    id: s.id ?? String(s.name),
    name: s.name ?? "Unknown",
    streamUrl: s.url ?? "",
    genre: s.genre ?? "Various",
    favicon:
      `https://placehold.co/120x120/1a1a1a/ffffff?text=${encodeURIComponent(
        (s.name || "").slice(0, 2)
      )}`,
    stationUuid: undefined, // Static stations don't have Radio Browser UUIDs
  };
}



/**
 * Gets the resolved stream URL for a station using Radio Browser's click endpoint.
 * This endpoint:
 * 1. Resolves redirects and provides the actual stream URL
 * 2. Increments the station's click count (helps the station)
 * 3. Often provides URLs with better CORS support
 */
export async function getResolvedStreamUrl(stationUuid: string): Promise<string | null> {
  if (!stationUuid) return null;
  
  // Try the same base domains that we use for station fetching
  const baseDomains = [
    "https://fi1.api.radio-browser.info",
    "https://de2.api.radio-browser.info",
    "https://de1.api.radio-browser.info",  
    "https://at1.api.radio-browser.info",
  ];
  
  for (const baseDomain of baseDomains) {
    try {
      const clickEndpoint = `${baseDomain}/json/url/${stationUuid}`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      
      const res = await fetch(clickEndpoint, {
        signal: controller.signal,
      });
      clearTimeout(timeout);
      
      if (!res.ok) continue; // Try next endpoint
      
      const data = await res.json();
      // The API returns an object with a 'url' property containing the resolved stream URL
      if (data.url) {
        return data.url;
      }
    } catch (err) {
      console.warn(`Failed to resolve stream URL for station ${stationUuid} via ${baseDomain}:`, err);
      // Continue to next endpoint
    }
  }
  
  return null; // All endpoints failed
}

// Track API health for smart retry logic
let lastApiCheck = 0;
let apiIsHealthy = false;
const API_RETRY_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Force a fresh attempt to fetch from Radio Browser API, bypassing the retry interval.
 * Useful for manual refresh or when user indicates they want to try again.
 */
export async function refreshStations(): Promise<ServiceStation[]> {
  lastApiCheck = 0; // Reset timer to force API attempt
  return fetchStations();
}

export async function fetchStations(): Promise<ServiceStation[]> {
  const now = Date.now();
  const shouldRetryApi = (now - lastApiCheck) > API_RETRY_INTERVAL;
  
  // Try remote API if we haven't checked recently or if it was working last time
  if (shouldRetryApi || apiIsHealthy) {
    try {
      const remote = await fetchRemoteStations();
      const mapped = remote
        .map((station, index) => mapRemoteToService(station, index))
        .filter((s) => typeof s.streamUrl === "string" && s.streamUrl.length > 0);
      
      if (mapped.length > 0) {
        lastApiCheck = now;
        apiIsHealthy = true;
        console.log(`Successfully fetched ${mapped.length} stations from Radio Browser API`);
        return mapped;
      }
    } catch (err) {
      lastApiCheck = now;
      apiIsHealthy = false;
      console.warn("Radio Browser API unavailable, using fallback stations:", err);
    }
  }

  // Fallback to the bundled static stations included with the app
  try {
    const fallbackStations = staticStations.map(mapStaticToService);
    console.log(`Using ${fallbackStations.length} fallback stations`);
    return fallbackStations;
  } catch (err) {
    console.error("Failed to map static stations fallback", err);
    return [];
  }
}


