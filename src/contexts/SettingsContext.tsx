import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';

export type DistanceUnit = 'km' | 'mi';

const DISTANCE_UNIT_STORAGE_KEY = '@settings/distanceUnit';

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

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.getItem(DISTANCE_UNIT_STORAGE_KEY).then((stored) => {
          if (stored === 'km' || stored === 'mi') {
            setDistanceUnitState(stored);
          }
        });
      } catch {
        // Ignore hydration errors and keep default settings.
      }
    })();
  }, []);

  const setDistanceUnit = useCallback((unit: DistanceUnit) => {
    setDistanceUnitState(unit);
    AsyncStorage.setItem(DISTANCE_UNIT_STORAGE_KEY, unit);
  }, []);

  return <SettingsContext.Provider value={{ distanceUnit, setDistanceUnit }}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
