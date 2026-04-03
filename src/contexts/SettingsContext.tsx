import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';

export type DistanceUnit = 'km' | 'mi';

const DISTANCE_UNIT_STORAGE_KEY = '@settings/distanceUnit';
const ENABLE_LOGGING_STORAGE_KEY = '@settings/enableLogging';

interface SettingsContextValue {
  distanceUnit: DistanceUnit;
  setDistanceUnit: (unit: DistanceUnit) => void;
  enableLogging: boolean;
  setEnableLogging: (enabled: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue>({
  distanceUnit: 'km',
  setDistanceUnit: () => {},
  enableLogging: false,
  setEnableLogging: () => {},
});

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [distanceUnit, setDistanceUnitState] = useState<DistanceUnit>('km');
  const [enableLogging, setEnableLoggingState] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        await Promise.all([
          AsyncStorage.getItem(DISTANCE_UNIT_STORAGE_KEY).then((stored) => {
            if (stored === 'km' || stored === 'mi') {
              setDistanceUnitState(stored);
            }
          }),
          AsyncStorage.getItem(ENABLE_LOGGING_STORAGE_KEY).then((stored) => {
            if (stored === 'true') {
              setEnableLoggingState(true);
            } else if (stored === 'false') {
              setEnableLoggingState(false);
            }
          }),
        ]);
      } catch {
        // Ignore hydration errors and keep default settings.
      }
    })();
  }, []);

  const setDistanceUnit = useCallback((unit: DistanceUnit) => {
    setDistanceUnitState(unit);
    AsyncStorage.setItem(DISTANCE_UNIT_STORAGE_KEY, unit);
  }, []);

  const setEnableLogging = useCallback((enabled: boolean) => {
    setEnableLoggingState(enabled);
    AsyncStorage.setItem(ENABLE_LOGGING_STORAGE_KEY, String(enabled));
  }, []);

  return (
    <SettingsContext.Provider value={{ distanceUnit, setDistanceUnit, enableLogging, setEnableLogging }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
