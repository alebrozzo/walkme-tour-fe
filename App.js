import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import StopScreen from './src/screens/StopScreen';
import TourScreen from './src/screens/TourScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: { backgroundColor: '#FFFFFF' },
            headerTintColor: '#1A1A2E',
            headerTitleStyle: { fontWeight: '700' },
            headerBackTitleVisible: false,
          }}
        >
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'WalkMe Tour' }}
          />
          <Stack.Screen
            name="Tour"
            component={TourScreen}
            options={({ route }) => ({
              title: route.params.tour.city,
              headerStyle: {
                backgroundColor: route.params.tour.color,
              },
              headerTintColor: '#FFFFFF',
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
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
