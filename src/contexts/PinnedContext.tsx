import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { GeneratedItinerary, Tour } from '../types';

const STORAGE_KEY_RECENT = '@walkme:pinnedTours';
const STORAGE_KEY_ITINERARIES = '@walkme:itineraries';

interface PinnedContextValue {
  pinnedTours: Tour[];
  addCity: (tour: Tour) => void;
  removeCity: (tourId: string) => void;
  getItinerary: (tourId: string) => GeneratedItinerary | undefined;
  saveItinerary: (itinerary: GeneratedItinerary) => void;
  removeItinerary: (tourId: string) => void;
}

const PinnedContext = createContext<PinnedContextValue>({
  pinnedTours: [],
  addCity: () => {},
  removeCity: () => {},
  getItinerary: () => undefined,
  saveItinerary: () => {},
  removeItinerary: () => {},
});

export function PinnedProvider({ children }: { children: React.ReactNode }) {
  const [pinnedTours, setPinnedTours] = useState<Tour[]>([]);
  const [itineraries, setItineraries] = useState<Record<string, GeneratedItinerary>>({});
  const hydrated = useRef(false);

  // Hydrate from storage on mount
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [recentRaw, itinerariesRaw] = await AsyncStorage.multiGet([STORAGE_KEY_RECENT, STORAGE_KEY_ITINERARIES]);
        if (cancelled) return;

        if (recentRaw[1]) {
          try {
            const parsed: unknown = JSON.parse(recentRaw[1]);
            // Accept both the new format (array of Tour objects) and ignore old ID-only format
            if (
              Array.isArray(parsed) &&
              parsed.every((item) => item !== null && typeof item === 'object' && typeof item.id === 'string')
            ) {
              if (!cancelled) setPinnedTours(parsed as Tour[]);
            }
          } catch {
            // Malformed data — start empty
          }
        }

        if (cancelled) return;
        if (itinerariesRaw[1]) setItineraries(JSON.parse(itinerariesRaw[1]));
      } catch {
        // Storage read failure — start with empty state
      } finally {
        if (!cancelled) hydrated.current = true;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Persist recent tours and itineraries together (after hydration)
  useEffect(() => {
    if (!hydrated.current) return;

    // Only persist itineraries for tracked cities to avoid stale entries
    const filteredItineraries: Record<string, GeneratedItinerary> = {};
    for (const tour of pinnedTours) {
      const itinerary = itineraries[tour.id];
      if (itinerary) filteredItineraries[tour.id] = itinerary;
    }

    AsyncStorage.multiSet([
      [STORAGE_KEY_RECENT, JSON.stringify(pinnedTours)],
      [STORAGE_KEY_ITINERARIES, JSON.stringify(filteredItineraries)],
    ]).catch(() => {});
  }, [pinnedTours, itineraries]);

  const addCity = useCallback((tour: Tour) => {
    setPinnedTours((prev) => {
      // Move to front if already present (most-recently-visited order), otherwise prepend
      const without = prev.filter((t) => t.id !== tour.id);
      return [tour, ...without];
    });
  }, []);

  const removeCity = useCallback((tourId: string) => {
    setPinnedTours((prev) => prev.filter((t) => t.id !== tourId));
    setItineraries((curr) => {
      if (!(tourId in curr)) return curr;
      const next = { ...curr };
      delete next[tourId];
      return next;
    });
  }, []);

  const getItinerary = useCallback((tourId: string) => itineraries[tourId], [itineraries]);

  const saveItinerary = useCallback((itinerary: GeneratedItinerary) => {
    setItineraries((prev) => ({ ...prev, [itinerary.tourId]: itinerary }));
  }, []);

  const removeItinerary = useCallback((tourId: string) => {
    setItineraries((prev) => {
      const next = { ...prev };
      delete next[tourId];
      return next;
    });
  }, []);

  return (
    <PinnedContext.Provider value={{ pinnedTours, addCity, removeCity, getItinerary, saveItinerary, removeItinerary }}>
      {children}
    </PinnedContext.Provider>
  );
}

export function usePinned(): PinnedContextValue {
  return useContext(PinnedContext);
}
