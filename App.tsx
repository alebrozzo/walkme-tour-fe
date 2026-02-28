import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider, useLanguage } from './src/contexts/LanguageContext';
import { PinnedProvider } from './src/contexts/PinnedContext';
import HomeScreen from './src/screens/HomeScreen';
import StopScreen from './src/screens/StopScreen';
import TourScreen from './src/screens/TourScreen';
import { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { appKey, t } = useLanguage();

  return (
    <React.Fragment key={appKey}>
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
                headerStyle: {
                  backgroundColor: route.params.tour.color,
                },
                headerTintColor: '#FFFFFF',
                statusBarStyle: 'light',
                statusBarColor: route.params.tour.color,
              })}
            />
            <Stack.Screen
              name="Stop"
              component={StopScreen}
              options={({ route }) => ({
                title: route.params.stop.name,
                headerStyle: {
                  backgroundColor: route.params.tourColor,
                },
                headerTintColor: '#FFFFFF',
                statusBarStyle: 'light',
                statusBarColor: route.params.tourColor,
              })}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </React.Fragment>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <PinnedProvider>
        <AppNavigator />
      </PinnedProvider>
    </LanguageProvider>
  );
}
