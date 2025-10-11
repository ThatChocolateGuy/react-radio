# React Radio Streamer - AI Agent Instructions

## Architecture Overview

This is a single-page React radio streaming app that deliberately mimics a **microservice architecture on the client side** for educational purposes. Each "service" is a separate module with clear responsibilities:

### Core Services Pattern

1. **Station Data Service** (`src/services/stationService.ts`)
   - Fetches stations from Radio Browser API with 8s timeout and fallback to `src/data/stations.json`
   - Maps inconsistent remote API fields (`stationuuid`, `url_resolved`, etc.) to consistent `ServiceStation` shape
   - Exports `fetchStations()` - the primary entry point for getting station data

2. **Storage Service** (`src/lib/storage.ts`)
   - Manages favorites persistence with `rr_favorites_v1` key, migrates from legacy `radio-favorites`
   - Preferred API: `getFavoriteIds()`/`setFavoriteIds()` using `Set<string>`
   - Backward-compatible array API exists but use Set-based methods for new code

3. **Recommendation Logic** (`src/App.tsx` useMemo)
   - Pure function that finds stations matching favorite genres
   - Located in main component for simplicity but conceptually a separate service
   - Filters out already-favorited stations, limits to 5 results

### Component Architecture

- **App.tsx**: Main component handling state, audio playback via `useRef<HTMLAudioElement>`, and service orchestration
- **StationList**: Reusable sub-component for displaying station lists (All/Favorites/Recommended)
- **Inline SVG Icons**: PlayIcon, PauseIcon, StarIcon defined in App.tsx to avoid external dependencies

### Data Flow & State Management

```
fetchStations() → allStations state → StationList components
localStorage ↔ favoriteIds Set ↔ StationList favorite buttons
favoriteIds + allStations → useMemo → recommendedStations
```

## Development Workflows

### Commands
- `npm run dev` - Start development server on port 5173
- `npm run build` - Production build (outputs to `dist/`)
- `npm run typecheck` - TypeScript checking without emit
- `npm run lint` - ESLint with TypeScript extensions

### PR-First Workflow
- Branch naming: `feat/description` or `fix/issue-id`
- CI runs lint, typecheck, build on PRs via `.github/workflows/ci.yml`
- Squash merge to main after green checks
- Use `gh pr create --fill --base main --head your-branch` for convenience

### Deployment
- Auto-deploys to GitHub Pages on main branch pushes via `.github/workflows/deploy.yml`
- Vite base path set to `/react-radio/` in `vite.config.ts` for GitHub Pages subpath

## Key Conventions

### Type System
- `ServiceStation` - normalized shape used throughout app (id, name, streamUrl, genre, favicon)
- `RemoteStation` - flexible interface for Radio Browser API responses
- `StaticStation` - shape of bundled fallback data in `stations.json`

### Error Handling
- Network failures gracefully fall back to static data
- Audio errors logged to console but don't crash app
- Storage errors silently ignored (localStorage may be disabled)

### Styling
- Tailwind CSS with dark theme (`bg-gray-900`, `text-white`)
- Cyan accent color (`text-cyan-400`, `bg-cyan-500`)
- Responsive grid layout (`md:grid-cols-3`)
- Sticky audio player footer with backdrop blur

## Integration Points

### External APIs
- **Radio Browser**: `https://de1.api.radio-browser.info/json/stations` with CORS support
- **Placeholder images**: `https://placehold.co/120x120/...` for missing favicons

### Browser APIs
- `localStorage` for favorites (with try/catch for disabled storage)
- `<audio>` element with `crossOrigin="anonymous"` for streaming
- `AbortController` for request timeouts

## Common Patterns

### Service Integration
```tsx
// Always use the service layer, never direct imports of static data
const [stations, setStations] = useState<ServiceStation[]>([]);
useEffect(() => {
  fetchStations().then(setStations).catch(console.error);
}, []);
```

### Favorites Management
```tsx
import { getFavoriteIds, setFavoriteIds as setFavoriteIdsToStorage } from './lib/storage';
// Use Set-based API for better performance
const [favoriteIds, setFavoriteIds] = useState<Set<string>>(getFavoriteIds());
const handleToggle = (id: string) => {
  const newSet = new Set(favoriteIds);
  newSet.has(id) ? newSet.delete(id) : newSet.add(id);
  setFavoriteIds(newSet);
  setFavoriteIdsToStorage(newSet); // Persist to storage
};
```

### Audio Control
```tsx
// Use useRef for imperative audio control
const audioRef = useRef<HTMLAudioElement>(null);
useEffect(() => {
  const audio = audioRef.current;
  if (isPlaying && currentStation) {
    audio.src = currentStation.streamUrl;
    const onCanPlay = () => {
      audio.play().catch(console.error);
    };
    audio.addEventListener('canplay', onCanPlay, { once: true });
    return () => {
      audio.removeEventListener('canplay', onCanPlay);
    };
  } else {
    audio.pause();
  }
}, [isPlaying, currentStation]);
```