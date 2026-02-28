import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { GeneratedItinerary, Tour } from '../types';

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

  const pinnedIds = useMemo(() => new Set(pinnedTours.map((t) => t.id)), [pinnedTours]);

  const isPinned = useCallback((tourId: string) => pinnedIds.has(tourId), [pinnedIds]);

  const togglePin = useCallback((tour: Tour) => {
    setPinnedTours((prev) => {
      const wasPinned = prev.some((t) => t.id === tour.id);
      return wasPinned ? prev.filter((t) => t.id !== tour.id) : [...prev, tour];
    });
    // Remove itinerary when unpinning (independent call, not nested)
    setItineraries((curr) => {
      if (!(tour.id in curr)) return curr;
      const next = { ...curr };
      delete next[tour.id];
      return next;
    });
  }, []);

  const getItinerary = useCallback(
    (tourId: string) => itineraries[tourId],
    [itineraries],
  );

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
    <PinnedContext.Provider
      value={{ pinnedTours, isPinned, togglePin, getItinerary, saveItinerary, removeItinerary }}
    >
      {children}
    </PinnedContext.Provider>
  );
}

export function usePinned(): PinnedContextValue {
  return useContext(PinnedContext);
}
