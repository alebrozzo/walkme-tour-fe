import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (__DEV__) {
      console.error('[ErrorBoundary] Caught error:', error);
      console.error('[ErrorBoundary] Component stack:', info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 8 }}>Something went wrong</Text>
          <Text style={{ color: 'red', fontFamily: 'monospace' }}>{this.state.error?.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}
import { LanguageProvider, useLanguage } from './src/contexts/LanguageContext';
import { PinnedProvider } from './src/contexts/PinnedContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import StopScreen from './src/screens/StopScreen';
import TourScreen from './src/screens/TourScreen';
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { appKey, language, t } = useLanguage();

  return (
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
