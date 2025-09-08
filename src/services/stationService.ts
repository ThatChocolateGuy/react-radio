// Station data service: fetches a list of real stations from the Radio Browser
// public API, maps fields to the app's expected shape, and falls back to the
// bundled static `data/stations.json` if the network call fails.
import staticStationsData from "../data/stations.json";
import { RemoteStation, StaticStation, ServiceStation } from "../types";

const staticStations: StaticStation[] = staticStationsData as StaticStation[];

const RADIO_BROWSER_ENDPOINT =
  "https://de1.api.radio-browser.info/json/stations?limit=60&hidebroken=true";

async function fetchRemoteStations(): Promise<RemoteStation[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(RADIO_BROWSER_ENDPOINT, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    clearTimeout(timeout);
    console.warn(
      "Radio Browser fetch failed, falling back to bundled stations:",
      err
    );
    throw err;
  }
}

function mapRemoteToService(s: RemoteStation, idx: number): ServiceStation {
  const id = s.stationuuid || s.id || String(idx);
  const name = s.name || s.stationname || "Unknown";
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
  return { id, name, streamUrl, genre, favicon };
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
  };
}

export async function fetchStations(): Promise<ServiceStation[]> {
  try {
    const remote = await fetchRemoteStations();
    const mapped = remote
      .map((station, index) => mapRemoteToService(station, index))
      .filter((s) => typeof s.streamUrl === "string" && s.streamUrl.length > 0);
    if (mapped.length > 0) return mapped;
  } catch (err) {
    // fall through to bundled data
  }

  // Fallback to the bundled static stations included with the app
  try {
    return staticStations.map(mapStaticToService);
  } catch (err) {
    console.error("Failed to map static stations fallback", err);
    return [];
  }
}
