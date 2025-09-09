## Summary

Extract inline favorites storage from App into a reusable storage service. Adds a Set-based API and supports legacy key migration.

## Changes
- Add `src/lib/storage.ts` Set-based API: `getFavoriteIds` / `setFavoriteIds`
- Keep back-compat array API: `getFavorites` / `setFavorites`
- Legacy key support (reads `radio-favorites`, writes `rr_favorites_v1`, clears legacy on save)
- Refactor `src/App.tsx` to use the storage service
- Update README to reflect services layout

## How to test
- Start dev server and load app
- Favorite/unfavorite stations; refresh to verify persistence
- If `localStorage['radio-favorites']` exists from older runs, confirm favorites load and re-save under `rr_favorites_v1`
- Run lint/typecheck/build locally to verify green

## Checklist
- [x] Tests/CI pass locally (lint, typecheck, build)
- [x] Updated docs/README if needed
- [x] Backwards compatible change

### Demo
![Favoriting stations demo](https://github.com/ThatChocolateGuy/react-radio/blob/6b188a578cab85c17b88b04b6c9ec0b100b0445f/docs/favouriting_stations.gif?raw=true)
