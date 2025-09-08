const FAVORITES_KEY = "rr_favorites_v1";
const LEGACY_KEYS = ["radio-favorites"]; // older key used in early versions

// New preferred API: work with Set<string>
export function getFavoriteIds(): Set<string> {
  // Try the current key first
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr.map(String));
    }
  } catch {
    // ignore and try legacy keys below
  }

  // Fall back to legacy keys if present
  for (const key of LEGACY_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return new Set(arr.map(String));
      }
    } catch {
      // continue checking others
    }
  }

  return new Set<string>();
}

export function setFavoriteIds(ids: Set<string>) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(ids)));
    // Optionally clear legacy keys to avoid confusion
    for (const key of LEGACY_KEYS) {
      try { localStorage.removeItem(key); } catch { /* noop */ }
    }
  } catch {
    // ignore storage errors
  }
}

// Back-compat API kept for existing imports
export function getFavorites(): string[] {
  return Array.from(getFavoriteIds());
}

export function setFavorites(list: string[]) {
  setFavoriteIds(new Set(list));
}