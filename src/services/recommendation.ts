import type { Station } from "../types";

/**
 * Simple recommendation algorithm:
 * - Count genres from favorites.
 * - Recommend stations of top genres not already favorited.
 * - Fallback: return first available non-favorited stations.
 */
export function recommend(all: Station[], favorites: string[]): Station[] {
  if (!favorites || favorites.length === 0) {
    return all.slice(0, 5);
  }

  const favStations = all.filter((s) => favorites.includes(s.id));
  const genreCount: Record<string, number> = {};
  favStations.forEach((s) => (genreCount[s.genre] = (genreCount[s.genre] || 0) + 1));
  const topGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .map((x) => x[0]);

  const recs: Station[] = [];
  for (const g of topGenres) {
    for (const s of all) {
      if (!favorites.includes(s.id) && s.genre === g && recs.length < 5) recs.push(s);
    }
    if (recs.length >= 5) break;
  }

  if (recs.length === 0) {
    all.forEach((s) => {
      if (!favorites.includes(s.id) && recs.length < 5) recs.push(s);
    });
  }

  return recs;
}