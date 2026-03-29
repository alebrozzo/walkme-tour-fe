import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';

export type DistanceUnit = 'km' | 'mi';

interface SettingsContextValue {
  distanceUnit: DistanceUnit;
  setDistanceUnit: (unit: DistanceUnit) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  distanceUnit: 'km',
  setDistanceUnit: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [distanceUnit, setDistanceUnitState] = useState<DistanceUnit>('km');

  const setDistanceUnit = useCallback((unit: DistanceUnit) => {
    setDistanceUnitState(unit);
  }, []);

  return <SettingsContext.Provider value={{ distanceUnit, setDistanceUnit }}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
