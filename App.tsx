import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ErrorBoundary from './src/components/ErrorBoundary';
import { LanguageProvider, useLanguage } from './src/contexts/LanguageContext';
import { PinnedProvider } from './src/contexts/PinnedContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import StopScreen from './src/screens/StopScreen';
import TourScreen from './src/screens/TourScreen';
import { RootStackParamList } from './src/types';
import { resetCorrelationId } from './src/utils/correlationId';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Component to initialize logging and correlation ID
 */
function AppInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize correlation ID on app start
    resetCorrelationId();
  }, []);

  return <>{children}</>;
}

function AppNavigator() {
  const { appKey, language, t } = useLanguage();

  return (
    <AppInitializer>
      <View key={appKey} style={[styles.appRoot, language.isRTL ? styles.rtl : styles.ltr]}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <Stack.Navigator
              initialRouteName="Home"
              screenOptions={{
                headerStyle: { backgroundColor: '#FFFFFF' },
                headerTintColor: '#1A1A2E',
                headerTitleStyle: { fontWeight: '700' },
              }}
            >
              <Stack.Screen name="Home" component={HomeScreen} options={{ title: t.appTitle }} />
              <Stack.Screen
                name="Tour"
                component={TourScreen}
                options={({ route }) => ({
                  title: route.params.tour.city,
                })}
              />
              <Stack.Screen
                name="Stop"
                component={StopScreen}
                options={({ route }) => ({
                  title: route.params.stop.name,
                })}
              />
              <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: t.settings.title }} />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
      </View>
    </AppInitializer>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
  },
  ltr: {
    direction: 'ltr',
  },
  rtl: {
    direction: 'rtl',
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <SettingsProvider>
          <PinnedProvider>
            <AppNavigator />
          </PinnedProvider>
        </SettingsProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}
