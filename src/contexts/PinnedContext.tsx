import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import tours from '../data/tours';
import { GeneratedItinerary, Tour } from '../types';

const STORAGE_KEY_PINNED = '@walkme:pinnedTours';
const STORAGE_KEY_ITINERARIES = '@walkme:itineraries';

interface PinnedContextValue {
  pinnedTours: Tour[];
  isPinned: (tourId: string) => boolean;
  togglePin: (tour: Tour) => void;
  getItinerary: (tourId: string) => GeneratedItinerary | undefined;
  saveItinerary: (itinerary: GeneratedItinerary) => void;
  removeItinerary: (tourId: string) => void;
}

const PinnedContext = createContext<PinnedContextValue>({
  pinnedTours: [],
  isPinned: () => false,
  togglePin: () => {},
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
    const toursById = new Map(tours.map((t) => [t.id, t]));

    (async () => {
      try {
        const [pinnedRaw, itinerariesRaw] = await AsyncStorage.multiGet([STORAGE_KEY_PINNED, STORAGE_KEY_ITINERARIES]);
        if (cancelled) {
          return;
        }
        if (pinnedRaw[1]) {
          let ids: string[] = [];

          try {
            const parsed: unknown = JSON.parse(pinnedRaw[1]);
            if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string')) {
              ids = parsed as string[];
            }
          } catch {
            // Malformed pinned data — treat as empty
            ids = [];
          }

          if (!cancelled && ids.length > 0) {
            const resolved = ids.map((id) => toursById.get(id)).filter((t): t is Tour => t !== undefined);
            setPinnedTours(resolved);
          }
        }
        if (cancelled) {
          return;
        }
        if (itinerariesRaw[1]) setItineraries(JSON.parse(itinerariesRaw[1]));
      } catch {
        // Storage read failure — start with empty state
      } finally {
        if (!cancelled) {
          hydrated.current = true;
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Persist pinned tours and itineraries together (after hydration)
  useEffect(() => {
    if (!hydrated.current) return;

    // Only persist itineraries for currently pinned tours to avoid stale entries
    const filteredItineraries: Record<string, GeneratedItinerary> = {};
    for (const tour of pinnedTours) {
      const itinerary = itineraries[tour.id];
      if (itinerary) {
        filteredItineraries[tour.id] = itinerary;
      }
    }

    AsyncStorage.multiSet([
      [STORAGE_KEY_PINNED, JSON.stringify(pinnedTours.map((t) => t.id))],
      [STORAGE_KEY_ITINERARIES, JSON.stringify(filteredItineraries)],
    ]).catch(() => {});
  }, [pinnedTours, itineraries]);

  const pinnedIds = useMemo(() => new Set(pinnedTours.map((t) => t.id)), [pinnedTours]);
  const pinnedIdsRef = useRef(pinnedIds);
  pinnedIdsRef.current = pinnedIds;

  const isPinned = useCallback((tourId: string) => pinnedIds.has(tourId), [pinnedIds]);

  const togglePin = useCallback((tour: Tour) => {
    const wasPinned = pinnedIdsRef.current.has(tour.id);
    setPinnedTours((prev) => (wasPinned ? prev.filter((t) => t.id !== tour.id) : [...prev, tour]));
    if (wasPinned) {
      setItineraries((curr) => {
        if (!(tour.id in curr)) {
          return curr;
        }
        const next = { ...curr };
        delete next[tour.id];
        return next;
      });
    }
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
    <PinnedContext.Provider value={{ pinnedTours, isPinned, togglePin, getItinerary, saveItinerary, removeItinerary }}>
      {children}
    </PinnedContext.Provider>
  );
}

export function usePinned(): PinnedContextValue {
  return useContext(PinnedContext);
}
