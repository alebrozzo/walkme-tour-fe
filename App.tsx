import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider, useLanguage } from './src/contexts/LanguageContext';
import { PinnedProvider } from './src/contexts/PinnedContext';
import HomeScreen from './src/screens/HomeScreen';
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
    <LanguageProvider>
      <PinnedProvider>
        <AppNavigator />
      </PinnedProvider>
    </LanguageProvider>
  );
}
