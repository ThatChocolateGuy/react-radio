import React from "react";
import type { Station } from "../types";

export default function StationList({
  stations,
  favorites,
  onToggleFavorite,
  onPlay
}: {
  stations: Station[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onPlay: (id: string) => void;
}) {
  return (
    <section className="station-list">
      <h2>Stations</h2>
      <ul>
        {stations.map((s) => (
          <li key={s.id} className="station-item">
            <div>
              <strong>{s.name}</strong>
              <div className="meta">{s.genre} — {s.country}</div>
            </div>
            <div className="controls">
              <button onClick={() => onPlay(s.id)}>Play</button>
              <button onClick={() => onToggleFavorite(s.id)}>
                {favorites.includes(s.id) ? "★" : "☆"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}