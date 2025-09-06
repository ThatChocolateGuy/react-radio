import React, { useEffect, useMemo, useState } from "react";
import StationList from "./components/StationList";
import RadioPlayer from "./components/RadioPlayer";
import { loadStations } from "./services/catalog";
import { getFavorites, setFavorites } from "./lib/storage";
import { recommend } from "./services/recommendation";

export default function App() {
  const [stations, setStations] = useState(loadStations());
  const [current, setCurrent] = useState<string | null>(null);
  const [favorites, setFavs] = useState<string[]>(getFavorites());

  useEffect(() => {
    setFavoritesLocal(favorites);
  }, [favorites]);

  const recommendations = useMemo(
    () => recommend(stations, favorites),
    [stations, favorites]
  );

  return (
    <div className="app">
      <header>
        <h1>react-radio</h1>
        <p>Small learning app: streaming radio, favorites, and recommendations</p>
      </header>

      <main>
        <StationList
          stations={stations}
          favorites={favorites}
          onToggleFavorite={(id) =>
            setFavs((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
          }
          onPlay={(id) => setCurrent(id)}
        />

        <section className="side">
          <h2>Recommendations</h2>
          <ul className="recommend-list">
            {recommendations.map((s) => (
              <li key={s.id}>
                <button onClick={() => setCurrent(s.id)}>{s.name} — {s.genre}</button>
              </li>
            ))}
          </ul>
          <RadioPlayer
            station={stations.find((s) => s.id === current) ?? null}
          />
        </section>
      </main>

      <footer>
        <small>All data stored in browser storage (localStorage). No server required.</small>
      </footer>
    </div>
  );
}