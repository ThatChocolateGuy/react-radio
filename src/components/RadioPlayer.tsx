import React, { useEffect, useRef, useState } from "react";
import type { Station } from "../types";

export default function RadioPlayer({ station }: { station: Station | null }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "none";
    }
    const audio = audioRef.current!;

    if (station) {
      audio.src = station.url;
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      audio.pause();
      setPlaying(false);
    }

    return () => {
      // keep audio element for continuing playback if needed
    };
  }, [station]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  return (
    <div className="player">
      <h3>Player</h3>
      <div>{station ? `${station.name} — ${station.genre}` : "No station selected"}</div>
      <div className="player-controls">
        <button
          onClick={() => {
            if (!audioRef.current) return;
            if (playing) {
              audioRef.current.pause();
              setPlaying(false);
            } else {
              audioRef.current.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
            }
          }}
        >
          {playing ? "Pause" : "Play"}
        </button>
        <label>
          Vol
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
          />
        </label>
      </div>
      <div className="notes">Note: Streaming requires a valid stream URL and CORS permitting playback.</div>
    </div>
  );
}