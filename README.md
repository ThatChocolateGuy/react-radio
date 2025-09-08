# React Radio Streamer

This is a simple, single-page internet radio streaming application built with React, Vite, and TypeScript, and styled with Tailwind CSS.

The primary goal of this project is to provide a clear and easy-to-understand codebase for learning purposes, demonstrating core React concepts while simulating a "microservice" architecture on the client side.

## How to Run This Project

1. Prerequisites: You need to have Node.js (which includes npm) installed on your machine.

2. Unzip Files: Make sure all the generated files are in a single project folder.

3. Install Dependencies: Open your terminal, navigate to the project folder, and run:
   ```
   npm install
   ```

4. Start the Development Server: Once the installation is complete, run:
   ```
   npm run dev
   ```
    Your browser should open to `http://localhost:5173` (or a similar address), and you will see the radio app running.

## Learning Guide: A "Microservice" Approach

While this app doesn't have a traditional backend microservice architecture, its code is structured to mimic that separation of concerns. This is a great way to organize frontend applications.

1. The "Station Data Service"
    - File: `src/services/stationService.ts`
    - Exports (examples):
        - `export async function fetchStations(): Promise<Station[]>` — fetches the stations API, throws on HTTP errors, returns parsed JSON.
        - `export function getCachedStations(): Station[]` — returns an in-memory cache or the fallback `allStations`.
        - `export async function getStationById(id: string): Promise<Station | undefined>` — finds a single station (from cache or by fetching).
        - `export const allStations: Station[]` — a small local fallback dataset used when network calls fail or for quick local dev.
    - Concept: One module to own network calls, error handling, caching, and any station-related transformations. Call `fetchStations()` from your components (e.g., inside `useEffect`) instead of using a global `allStations` constant so the rest of the app doesn't need to change if the backend or auth changes.

2. The "Browser Storage Service"
    - File: `src/lib/storage.ts`
    - Code Block: The `storage` object with `getFavoriteIds` and `setFavoriteIds` methods.
    - Concept: This acts as our database layer. It abstracts away the implementation details of how we're storing data (in this case, `localStorage`). If we decided to store favorites in a different way (like `sessionStorage` or an online database like Firebase), we would only need to update the methods inside this `storage` object. The rest of the application wouldn't need to change.

3. The "Recommendation Service"
    - File: `src/App.tsx`
    - Code Block: The `recommendedStations` variable calculated using the `useMemo` hook.
    - Concept: This contains our business logic for generating recommendations. It's a "pure" function: it takes the list of all stations and the user's favorites as input and produces a list of recommendations as output. By isolating this logic, we can easily test it or make the recommendation algorithm more complex without affecting the UI or data-fetching parts of the app.

4. The "UI / Client"
    - File: src/App.tsx
    - Code Block: The main `App` component's `return (...)` statement and the `StationList` sub-component.
    - Concept: This is the presentation layer. It is responsible for displaying the data and capturing user input. It doesn't know how favorites are stored or how recommendations are calculated; it simply calls the appropriate functions (`handleToggleFavorite`, `onSelectStation`) and displays the data it's given (`allStations`, `recommendedStations`).

By thinking about this app in these separate parts, code becomes more organized, easier to debug, and simpler to upgrade over time.

## Contributing workflow (PR-first)

To keep history clean and enable CI checks, use a PR-first workflow:

1. Create a branch for your change:
    - Example: `feat/short-description` or `fix/issue-id`
2. Commit and push your work to your branch.
3. Open a Pull Request to `main`.
4. CI will run lint, typecheck, and build on your PR.
5. Merge via Squash after approvals and green checks.

Convenience: we use GitHub CLI. If you have `gh` installed and authenticated, you can run:
- `gh pr create --fill --base main --head your-branch`

## Deploying to GitHub Pages

This repo is configured to auto-deploy to GitHub Pages on pushes to `main`.

- Vite `base` is set to `/react-radio/` in `vite.config.ts` to serve assets from the correct subpath.
- A workflow at `.github/workflows/deploy.yml` builds the app and publishes the `dist/` folder.

Steps to enable on your fork:

1. Push to `main` or manually run the workflow from the Actions tab.
2. In your GitHub repo, go to Settings → Pages and ensure “Source: GitHub Actions”.
3. Your site will be available at: `https://<your-username>.github.io/react-radio/`.

