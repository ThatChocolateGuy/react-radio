import stations from "../data/stations.json";
import type { Station } from "../types";

// This service represents a station catalog microservice (for learning).
// Right now it returns a static list bundled with the app.
export function loadStations(): Station[] {
  return stations as Station[];
}