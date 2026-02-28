import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Tour } from '../types';

interface PinnedContextValue {
  pinnedTours: Tour[];
  isPinned: (tourId: string) => boolean;
  togglePin: (tour: Tour) => void;
}

const PinnedContext = createContext<PinnedContextValue>({
  pinnedTours: [],
  isPinned: () => false,
  togglePin: () => {},
});

export function PinnedProvider({ children }: { children: React.ReactNode }) {
  const [pinnedTours, setPinnedTours] = useState<Tour[]>([]);

  const pinnedIds = useMemo(() => new Set(pinnedTours.map((t) => t.id)), [pinnedTours]);

  const isPinned = useCallback((tourId: string) => pinnedIds.has(tourId), [pinnedIds]);

  const togglePin = useCallback((tour: Tour) => {
    setPinnedTours((prev) =>
      prev.some((t) => t.id === tour.id) ? prev.filter((t) => t.id !== tour.id) : [...prev, tour],
    );
  }, []);

  return <PinnedContext.Provider value={{ pinnedTours, isPinned, togglePin }}>{children}</PinnedContext.Provider>;
}

export function usePinned(): PinnedContextValue {
  return useContext(PinnedContext);
}
