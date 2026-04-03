import type { ExpoConfig } from 'expo/config';
import appJson from './app.json';

type AppJsonShape = {
  expo: ExpoConfig;
};

export default (): ExpoConfig => {
  const config: ExpoConfig = { ...(appJson as AppJsonShape).expo };
  const baseUrl = process.env.EXPO_BASE_URL?.trim();

  if (baseUrl) {
    config.experiments = {
      ...(config.experiments ?? {}),
      baseUrl,
    };
  }

  return config;
};
