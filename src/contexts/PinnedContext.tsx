import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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
    (async () => {
      try {
        const [pinnedRaw, itinerariesRaw] = await AsyncStorage.multiGet([STORAGE_KEY_PINNED, STORAGE_KEY_ITINERARIES]);
        if (pinnedRaw[1]) setPinnedTours(JSON.parse(pinnedRaw[1]));
        if (itinerariesRaw[1]) setItineraries(JSON.parse(itinerariesRaw[1]));
      } catch {
        // Storage read failure — start with empty state
      } finally {
        hydrated.current = true;
      }
    })();
  }, []);

  // Persist pinned tours whenever they change (after hydration)
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY_PINNED, JSON.stringify(pinnedTours)).catch(() => {});
  }, [pinnedTours]);

  // Persist itineraries whenever they change (after hydration)
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY_ITINERARIES, JSON.stringify(itineraries)).catch(() => {});
  }, [itineraries]);

  const pinnedIds = useMemo(() => new Set(pinnedTours.map((t) => t.id)), [pinnedTours]);
  const pinnedIdsRef = useRef(pinnedIds);
  pinnedIdsRef.current = pinnedIds;

  const isPinned = useCallback((tourId: string) => pinnedIds.has(tourId), [pinnedIds]);

  const togglePin = useCallback((tour: Tour) => {
    const wasPinned = pinnedIdsRef.current.has(tour.id);
    setPinnedTours((prev) => (wasPinned ? prev.filter((t) => t.id !== tour.id) : [...prev, tour]));
    if (wasPinned) {
      setItineraries((curr) => {
        if (!(tour.id in curr)) return curr;
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
