import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { TYPE_ICON } from '../constants/stopTypes';
import { GeneratedItinerary, Stop, Tour } from '../types';

const VALID_STOP_TYPES = new Set(Object.keys(TYPE_ICON));

function isValidStop(s: unknown): s is Stop {
  if (s === null || typeof s !== 'object') return false;
  const stop = s as Record<string, unknown>;
  return (
    typeof stop.id === 'string' &&
    typeof stop.order === 'number' &&
    typeof stop.name === 'string' &&
    typeof stop.address === 'string' &&
    typeof stop.description === 'string' &&
    typeof stop.duration === 'number' &&
    typeof stop.type === 'string' &&
    VALID_STOP_TYPES.has(stop.type) &&
    stop.coordinate !== null &&
    typeof stop.coordinate === 'object' &&
    typeof (stop.coordinate as Record<string, unknown>).latitude === 'number' &&
    typeof (stop.coordinate as Record<string, unknown>).longitude === 'number'
  );
}

function isValidTour(t: unknown): t is Tour {
  if (t === null || typeof t !== 'object') return false;
  const tour = t as Record<string, unknown>;
  return (
    typeof tour.id === 'string' &&
    typeof tour.placeId === 'string' &&
    typeof tour.city === 'string' &&
    typeof tour.country === 'string' &&
    typeof tour.description === 'string' &&
    typeof tour.color === 'string' &&
    Array.isArray(tour.stops) &&
    (tour.stops as unknown[]).every(isValidStop)
  );
}

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

    (async () => {
      try {
        const [pinnedRaw, itinerariesRaw] = await AsyncStorage.multiGet([STORAGE_KEY_PINNED, STORAGE_KEY_ITINERARIES]);
        if (cancelled) {
          return;
        }
        if (pinnedRaw[1]) {
          try {
            const parsed: unknown = JSON.parse(pinnedRaw[1]);
            if (Array.isArray(parsed)) {
              const resolved = parsed.filter(isValidTour);
              if (!cancelled && resolved.length > 0) {
                setPinnedTours(resolved);
              }
            }
          } catch {
            // Malformed pinned data — treat as empty
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
      [STORAGE_KEY_PINNED, JSON.stringify(pinnedTours)],
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
