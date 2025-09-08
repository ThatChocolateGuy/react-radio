import { useState, useEffect, useRef, useMemo } from 'react';
import { fetchStations } from './services/stationService';
import type { ServiceStation } from './types';
import { getFavoriteIds as storageGetFavoriteIds, setFavoriteIds as storageSetFavoriteIds } from './lib/storage';

type Station = ServiceStation;

//===========//
// --- 4. UI ICON COMPONENTS --- //
// To keep this app self-contained without extra libraries, we define our SVG
// icons directly as React components.
//===========//
const PlayIcon = ({ className }: { className?: string }) => (
  <svg className={className} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 010 1.393z"></path></svg>
);
const PauseIcon = ({ className }: { className?: string }) => (
  <svg className={className} stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 3.5A1.5 1.5 0 017 5v6a1.5 1.5 0 01-3 0V5a1.5 1.5 0 011.5-1.5zm5 0A1.5 1.5 0 0112 5v6a1.5 1.5 0 01-3 0V5a1.5 1.5 0 011.5-1.5z"></path></svg>
);
const StarIcon = ({ className, isFilled }: { className?: string; isFilled: boolean }) => (
  <svg className={className} stroke="currentColor" fill={isFilled ? "currentColor" : "none"} strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);

//===========//
// --- 5. MAIN APPLICATION COMPONENT --- //
// This is the heart of our application. It brings together the data,
// storage, state, and UI.
//===========//
export default function App() {
  // --- STATE MANAGEMENT --- //
  const [allStations, setAllStations] = useState<Station[]>([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  // We initialize favorites by reading from our "storage service".
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(storageGetFavoriteIds());

  // `useRef` is used to get a direct reference to an HTML element, in this
  // case, the <audio> tag. This lets us control it programmatically.
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let mounted = true;
    setLoadingStations(true);
    fetchStations()
      .then((list) => {
        if (mounted) setAllStations(list);
      })
      .catch((e) => console.error("Failed to load stations", e))
      .finally(() => mounted && setLoadingStations(false));
    return () => { mounted = false; };
  }, []);

  // --- "RECOMMENDATION MICROSERVICE" --- //
  // This logic generates recommendations. It's wrapped in `useMemo` to prevent
  // recalculating on every render, improving performance.
  // The logic is simple: get all genres from favorites, then find other
  // stations with those genres that aren't already favorited.
  const recommendedStations = useMemo(() => {
    if (favoriteIds.size === 0) return [];
    const favoriteStations = allStations.filter(s => favoriteIds.has(s.id));
    const favoriteGenres = new Set(favoriteStations.map(s => s.genre));
    
    return allStations.filter(s => 
      !favoriteIds.has(s.id) && favoriteGenres.has(s.genre)
    ).slice(0, 5); // Limit to 5 recommendations
  }, [favoriteIds, allStations]);

  const favoriteStations = useMemo(() => {
    return allStations.filter(s => favoriteIds.has(s.id));
  }, [favoriteIds, allStations]);


  // --- AUDIO PLAYBACK LOGIC --- //
  // `useEffect` runs side effects. This effect syncs the <audio> element's
  // state with our component's state (`currentStation`, `isPlaying`).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying && currentStation) {
      if (audio.src !== currentStation.streamUrl) {
        audio.src = currentStation.streamUrl;
      }
      audio.play().catch(e => console.error("Audio playback error:", e));
    } else {
      audio.pause();
    }
  }, [isPlaying, currentStation]);

  // --- EVENT HANDLERS --- //
  // These functions handle user interactions.
  const handleSelectStation = (station: Station) => {
    setCurrentStation(station);
    setIsPlaying(true);
  };

  const handleTogglePlayPause = () => {
    if (currentStation) {
      setIsPlaying(!isPlaying);
    }
  };

  const handleToggleFavorite = (stationId: string) => {
    const newFavoriteIds = new Set(favoriteIds);
    if (newFavoriteIds.has(stationId)) {
      newFavoriteIds.delete(stationId);
    } else {
      newFavoriteIds.add(stationId);
    }
    setFavoriteIds(newFavoriteIds);
    // Persist the change to our "storage service".
    storageSetFavoriteIds(newFavoriteIds);
  };
  
  // --- RENDER --- //
  // This is the JSX that defines what the user sees.
  // It's styled with Tailwind CSS classes for a modern look.
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 tracking-wider">React Radio</h1>
          <p className="text-gray-400 mt-2">Your simple station for streaming</p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content: All Stations and Recommendations */}
          <div className="md:col-span-2 space-y-8">
            {recommendedStations.length > 0 && (
              <StationList
                title="Recommended For You"
                stations={recommendedStations}
                onSelectStation={handleSelectStation}
                onToggleFavorite={handleToggleFavorite}
                favoriteIds={favoriteIds}
                currentStationId={currentStation?.id}
              />
            )}
            <StationList
              title={loadingStations ? "Stations (loading...)" : "All Stations"}
              stations={allStations}
              onSelectStation={handleSelectStation}
              onToggleFavorite={handleToggleFavorite}
              favoriteIds={favoriteIds}
              currentStationId={currentStation?.id}
            />
          </div>

          {/* Sidebar: Favorites */}
          <aside>
            {favoriteStations.length > 0 && (
                <StationList
                    title="Your Favorites"
                    stations={favoriteStations}
                    onSelectStation={handleSelectStation}
                    onToggleFavorite={handleToggleFavorite}
                    favoriteIds={favoriteIds}
                    currentStationId={currentStation?.id}
                />
            )}
          </aside>
        </main>
      </div>

      {/* --- Sticky Audio Player --- */}
      {currentStation && (
        <footer className="sticky bottom-0 left-0 right-0 mt-8">
          <div className="bg-gray-800/80 backdrop-blur-sm border-t border-cyan-500/20 max-w-7xl mx-auto rounded-t-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={currentStation.favicon} alt={currentStation.name} className="w-12 h-12 rounded-md" onError={(e) => e.currentTarget.src = 'https://placehold.co/120x120/1a1a1a/ffffff?text=??'}/>
              <div>
                <p className="font-bold">{currentStation.name}</p>
                <p className="text-sm text-gray-400">{currentStation.genre}</p>
              </div>
            </div>
            <button
              onClick={handleTogglePlayPause}
              className="bg-cyan-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl hover:bg-cyan-400 transition-colors"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
          </div>
        </footer>
      )}

      <audio ref={audioRef} crossOrigin="anonymous"></audio>
    </div>
  );
}

// --- SUB-COMPONENT for displaying lists of stations --- //
// Breaking the UI into smaller components makes it easier to manage.
interface StationListProps {
    title: string;
    stations: Station[];
    onSelectStation: (station: Station) => void;
    onToggleFavorite: (stationId: string) => void;
    favoriteIds: Set<string>;
    currentStationId?: string | null;
}

const StationList = ({ title, stations, onSelectStation, onToggleFavorite, favoriteIds, currentStationId }: StationListProps) => (
  <section>
    <h2 className="text-2xl font-semibold text-gray-300 border-b-2 border-gray-700 pb-2 mb-4">{title}</h2>
    <div className="space-y-3">
      {stations.map(station => (
        <div
          key={station.id}
          className={`flex items-center p-3 rounded-lg cursor-pointer transition-all ${currentStationId === station.id ? 'bg-cyan-500/20' : 'hover:bg-gray-800'}`}
          onClick={() => onSelectStation(station)}
        >
          <img src={station.favicon} alt={station.name} className="w-10 h-10 rounded-md mr-4" onError={(e) => e.currentTarget.src = 'https://placehold.co/100x100/1a1a1a/ffffff?text=??'}/>
          <div className="flex-grow">
            <p className="font-medium">{station.name}</p>
            <p className="text-sm text-gray-400">{station.genre}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent station selection when favoriting
              onToggleFavorite(station.id);
            }}
            className={`p-2 rounded-full hover:bg-gray-700 transition-colors text-2xl ${favoriteIds.has(station.id) ? 'text-yellow-400' : 'text-gray-500'}`}
            aria-label={favoriteIds.has(station.id) ? 'Unfavorite' : 'Favorite'}
          >
            <StarIcon isFilled={favoriteIds.has(station.id)} />
          </button>
        </div>
      ))}
    </div>
  </section>
);