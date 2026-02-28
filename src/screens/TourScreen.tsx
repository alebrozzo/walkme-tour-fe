import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Stop, TripPreferences } from '../types';
import { TYPE_ICON } from '../constants/stopTypes';
import { useLanguage } from '../contexts/LanguageContext';
import { usePinned } from '../contexts/PinnedContext';
import { generateRecommendedStops } from '../services/generateStops';

type Props = NativeStackScreenProps<RootStackParamList, 'Tour'>;

interface StopRowProps {
  stop: Stop;
  tourColor: string;
  onPress: () => void;
}

function StopRow({ stop, tourColor, onPress }: StopRowProps) {
  const { t, language } = useLanguage();
  return (
    <TouchableOpacity style={styles.stopRow} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.orderBubble, { backgroundColor: tourColor }]}>
        <Text style={styles.orderText}>{stop.order}</Text>
      </View>
      <View style={styles.stopInfo}>
        <View style={styles.stopNameRow}>
          <Text style={styles.stopIcon}>{TYPE_ICON[stop.type] ?? '📌'}</Text>
          <Text style={styles.stopName}>{stop.name}</Text>
        </View>
        <Text style={styles.stopAddress} numberOfLines={1}>
          {stop.address}
        </Text>
        <Text style={styles.stopDuration}>
          ⏱ {stop.duration} {t.units.min}
        </Text>
      </View>
      <Text style={styles.chevron}>{language.isRTL ? '‹' : '›'}</Text>
    </TouchableOpacity>
  );
}

interface PreferencesFormProps {
  tour: Props['route']['params']['tour'];
  onGenerate: (prefs: TripPreferences) => void;
}

function PreferencesForm({ tour, onGenerate }: PreferencesFormProps) {
  const { t, language } = useLanguage();
  const [days, setDays] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('');

  const daysNum = parseInt(days, 10);
  const hoursNum = parseFloat(hoursPerDay);
  const isValid = daysNum > 0 && hoursNum > 0 && hoursNum <= 24;

  return (
    <ScrollView style={{ direction: language.isRTL ? 'rtl' : 'ltr' }} keyboardShouldPersistTaps="handled">
      <View style={[styles.heroBanner, { backgroundColor: tour.color }]}>
        <Text style={styles.heroCity}>{tour.city}</Text>
        <Text style={styles.heroCountry}>{tour.country}</Text>
        <Text style={styles.heroDescription}>{tour.description}</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>{t.tour.planYourVisit}</Text>

        <Text style={styles.formLabel}>{t.tour.daysStaying}</Text>
        <TextInput
          style={[styles.formInput, { textAlign: language.isRTL ? 'right' : 'left' }]}
          keyboardType="number-pad"
          value={days}
          onChangeText={setDays}
          placeholder="1"
          placeholderTextColor="#A0A9B3"
        />

        <Text style={styles.formLabel}>{t.tour.hoursPerDay}</Text>
        <TextInput
          style={[styles.formInput, { textAlign: language.isRTL ? 'right' : 'left' }]}
          keyboardType="decimal-pad"
          value={hoursPerDay}
          onChangeText={setHoursPerDay}
          placeholder="4"
          placeholderTextColor="#A0A9B3"
        />
        <Text style={styles.formHint}>{t.tour.hoursPerDayHint}</Text>

        <TouchableOpacity
          style={[styles.generateButton, { backgroundColor: tour.color }, !isValid && styles.generateButtonDisabled]}
          onPress={() => isValid && onGenerate({ days: daysNum, hoursPerDay: hoursNum })}
          disabled={!isValid}
          activeOpacity={0.85}
        >
          <Text style={styles.generateButtonText}>{t.tour.generateStops}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default function TourScreen({ navigation, route }: Props) {
  const { tour } = route.params;
  const { t, language } = useLanguage();
  const { isPinned, togglePin, getItinerary, saveItinerary, removeItinerary } = usePinned();
  const pinned = isPinned(tour.id);

  const savedItinerary = getItinerary(tour.id);

  const [generatedStops, setGeneratedStops] = useState<Stop[] | null>(
    savedItinerary?.stops ?? null,
  );
  const [loading, setLoading] = useState(false);

  // When a saved itinerary appears (e.g. freshly pinned), sync local state
  useEffect(() => {
    if (savedItinerary) {
      setGeneratedStops(savedItinerary.stops);
    }
  }, [savedItinerary]);

  // Clean up itinerary when leaving the screen if the tour is not pinned
  useEffect(() => {
    return () => {
      // Only clean up if tour is not currently pinned
      if (!isPinned(tour.id)) {
        removeItinerary(tour.id);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => togglePin(tour)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          accessibilityLabel={pinned ? t.unpinCity : t.pinCity}
        >
          <Text style={styles.pinButton}>{pinned ? '📌' : '📍'}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, tour, pinned, togglePin, t]);

  const handleGenerate = useCallback(
    async (prefs: TripPreferences) => {
      setLoading(true);
      const stops = await generateRecommendedStops(tour.stops, prefs);
      setGeneratedStops(stops);
      setLoading(false);

      // Save itinerary if tour is pinned
      if (isPinned(tour.id)) {
        saveItinerary({ tourId: tour.id, preferences: prefs, stops });
      }
    },
    [tour, isPinned, saveItinerary],
  );

  // When pin state changes while we have generated stops, save or prepare for cleanup
  useEffect(() => {
    if (generatedStops && pinned) {
      // Just got pinned — persist the itinerary
      if (!savedItinerary) {
        saveItinerary({ tourId: tour.id, preferences: { days: 0, hoursPerDay: 0 }, stops: generatedStops });
      }
    }
  }, [pinned, generatedStops, savedItinerary, saveItinerary, tour.id]);

  // If tour is pinned and has a saved itinerary, show stops directly
  // If we have generated stops (from form submission), show them
  const stopsToShow = generatedStops;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={tour.color} />
          <Text style={styles.loadingText}>{t.tour.generating}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stopsToShow) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <PreferencesForm tour={tour} onGenerate={handleGenerate} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        style={{ direction: language.isRTL ? 'rtl' : 'ltr' }}
        data={stopsToShow}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <View style={[styles.heroBanner, { backgroundColor: tour.color }]}>
              <Text style={styles.heroCity}>{tour.city}</Text>
              <Text style={styles.heroCountry}>{tour.country}</Text>
              <Text style={styles.heroDescription}>{tour.description}</Text>
              <View style={styles.heroMeta}>
                <Text style={styles.heroMetaItem}>
                  🕐 {tour.duration} {t.units.min}
                </Text>
                <Text style={styles.heroMetaItem}>
                  📍 {tour.distance} {t.units.km}
                </Text>
                <Text style={styles.heroMetaItem}>🏛️ {t.units.stops(stopsToShow.length)}</Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>{t.tour.recommendedStops}</Text>
          </View>
        }
        renderItem={({ item }) => (
          <StopRow
            stop={item}
            tourColor={tour.color}
            onPress={() => navigation.navigate('Stop', { stop: item, tourColor: tour.color })}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  list: {
    paddingBottom: 32,
  },
  heroBanner: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  heroCity: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroCountry: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    marginBottom: 20,
  },
  heroMeta: {
    flexDirection: 'row',
    gap: 20,
  },
  heroMetaItem: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginTop: 20,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  stopRow: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  orderBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginEnd: 12,
  },
  orderText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  stopInfo: {
    flex: 1,
  },
  stopNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  stopIcon: {
    fontSize: 15,
  },
  stopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    flex: 1,
  },
  stopAddress: {
    fontSize: 12,
    color: '#95A5A6',
    marginBottom: 4,
  },
  stopDuration: {
    fontSize: 12,
    color: '#7F8C8D',
    fontWeight: '500',
  },
  chevron: {
    fontSize: 22,
    color: '#BDC3C7',
    marginStart: 8,
    fontWeight: '300',
  },
  pinButton: {
    fontSize: 22,
  },
  formContainer: {
    padding: 20,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: '#1A1A2E',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  formHint: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: -12,
    marginBottom: 24,
  },
  generateButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  generateButtonDisabled: {
    opacity: 0.5,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#7F8C8D',
  },
});
