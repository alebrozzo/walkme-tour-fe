import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Platform,
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
import { estimateWalkingTime } from '../services/walkingTime';
import SwipeableRow from '../components/SwipeableRow';

type Props = NativeStackScreenProps<RootStackParamList, 'Tour'>;

/**
 * Recalculates order numbers and walking times for the entire stops array.
 * Walking times are estimated from coordinates; the last stop of each day gets none.
 */
function recalculateStops(stops: Stop[]): Stop[] {
  return stops.map((stop, i) => {
    const next = i < stops.length - 1 ? stops[i + 1] : undefined;
    const sameDay = next && next.day === stop.day;
    return {
      ...stop,
      order: i + 1,
      walkingTime: sameDay ? estimateWalkingTime(stop.coordinate, next.coordinate) : undefined,
    };
  });
}

function stopToGeoLocation(s: Stop): string {
  return `${s.coordinate.latitude},${s.coordinate.longitude}`;
}

function stopName(s: Stop): string {
  return encodeURIComponent(s.name);
}

// Returns the display label or coordinates for use in the waypoints text param.
function stopWaypointLabel(s: Stop): string {
  return s.googlePlaceId ? stopName(s) : stopToGeoLocation(s);
}

function buildGoogleMapsUrl(stops: Stop[]): string {
  if (stops.length === 0) {
    return '';
  }

  if (stops.length === 1) {
    const s = stops[0];
    let url = `https://www.google.com/maps/search/?api=1&query=${stopName(s)}`;
    if (s.googlePlaceId) {
      url += `&query_place_id=${s.googlePlaceId}`;
    }
    return url;
  }

  const first = stops[0];
  const last = stops[stops.length - 1];
  const middle = stops.slice(1, -1);

  const originParam = first.googlePlaceId
    ? `&origin=${stopName(first)}&origin_place_id=${first.googlePlaceId}`
    : `&origin=${stopToGeoLocation(first)}`;
  const destinationParam = last.googlePlaceId
    ? `&destination=${stopName(last)}&destination_place_id=${last.googlePlaceId}`
    : `&destination=${stopToGeoLocation(last)}`;

  let url = `https://www.google.com/maps/dir/?api=1${originParam}${destinationParam}&travelmode=walking`;

  if (middle.length > 0) {
    url += `&waypoints=${middle.map(stopWaypointLabel).join('|')}`;
    const waypointPlaceIds = middle.map((s) => s.googlePlaceId ?? '');
    if (waypointPlaceIds.some(Boolean)) {
      url += `&waypoint_place_ids=${waypointPlaceIds.join('|')}`;
    }
  }

  return url;
}

function buildAppleMapsUrl(stops: Stop[]): string {
  if (stops.length === 0) {
    return '';
  }
  if (stops.length === 1) {
    const location = stopToGeoLocation(stops[0]);
    return `https://maps.apple.com/?q=${encodeURIComponent(stops[0].name)}&ll=${location}`;
  }
  const origin = stopName(stops[0]);
  const destinations = stops.slice(1).map(stopName);
  return `https://maps.apple.com/?saddr=${origin}&daddr=${destinations.join('+to:')}&dirflg=w`;
}

async function openDirections(stops: Stop[]): Promise<void> {
  if (stops.length === 0) return;
  if (Platform.OS === 'ios') {
    const appleUrl = buildAppleMapsUrl(stops);
    try {
      await Linking.openURL(appleUrl);
      return;
    } catch (error) {
      if (__DEV__) {
        console.warn('Failed to open Apple Maps URL, falling back to Google Maps', error);
      }
      // Fall through to Google Maps web URL
    }
  }
  const googleUrl = buildGoogleMapsUrl(stops);
  await Linking.openURL(googleUrl);
}

interface StopRowProps {
  stop: Stop;
  onPress: () => void;
}

function StopRow({ stop, onPress }: StopRowProps) {
  const { t, language } = useLanguage();
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    setImageLoadError(false);
  }, [stop.imageUrl]);

  return (
    <TouchableOpacity style={styles.stopRow} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.orderBubble}>
        <Text style={styles.orderText}>{stop.order}</Text>
      </View>
      <View style={styles.stopInfo}>
        <View style={styles.stopNameRow}>
          {stop.imageUrl && !imageLoadError ? (
            <Image
              source={{ uri: stop.imageUrl }}
              style={styles.stopThumb}
              resizeMode="cover"
              onError={() => setImageLoadError(true)}
            />
          ) : (
            <Text style={styles.stopIcon}>{TYPE_ICON[stop.type] ?? '📌'}</Text>
          )}
          <Text style={styles.stopName}>{stop.name}</Text>
        </View>
        <Text style={styles.stopAddress} numberOfLines={1}>
          {stop.address}
        </Text>
        <View style={styles.stopMeta}>
          <Text style={styles.stopDuration}>
            ⏱ {stop.duration} {t.units.min}
          </Text>
          {stop.price ? <Text style={styles.stopPrice}>💰 {stop.price}</Text> : null}
        </View>
      </View>
      <Text style={styles.chevron}>{language.isRTL ? '‹' : '›'}</Text>
    </TouchableOpacity>
  );
}

interface PreferencesFormProps {
  tour: Props['route']['params']['tour'];
  onGenerate: (prefs: TripPreferences) => void;
}

interface WalkingConnectorProps {
  walkingTime: number;
}

function WalkingConnector({ walkingTime }: WalkingConnectorProps) {
  const { t } = useLanguage();
  return (
    <View style={styles.walkingConnector}>
      <View style={styles.walkingLine} />
      <View style={styles.walkingBadge}>
        <Text style={styles.walkingIcon}>🚶</Text>
        <Text style={styles.walkingText}>{t.tour.walkingMinutes(walkingTime)}</Text>
      </View>
      <View style={styles.walkingLine} />
    </View>
  );
}

interface DayHeaderProps {
  day: number;
}

function DayHeader({ day }: DayHeaderProps) {
  const { t } = useLanguage();
  return (
    <View style={styles.dayHeader}>
      <Text style={styles.dayHeaderText}>{t.tour.day(day)}</Text>
    </View>
  );
}

interface TourHeroImageProps {
  imageUrl?: string;
}

function TourHeroImage({ imageUrl }: TourHeroImageProps) {
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    setImageLoadError(false);
  }, [imageUrl]);

  if (!imageUrl || imageLoadError) {
    return null;
  }
  return (
    <Image
      source={{ uri: imageUrl }}
      style={styles.cityImage}
      resizeMode="cover"
      onError={() => setImageLoadError(true)}
    />
  );
}

function PreferencesForm({ tour, onGenerate }: PreferencesFormProps) {
  const { t, language } = useLanguage();
  const [days, setDays] = useState('2');
  const [hoursPerDay, setHoursPerDay] = useState('4');

  const daysNum = parseInt(days, 10);
  const hoursNum = parseFloat(hoursPerDay);
  const isValid = daysNum > 0 && hoursNum > 0 && hoursNum <= 24;

  return (
    <ScrollView style={{ direction: language.isRTL ? 'rtl' : 'ltr' }} keyboardShouldPersistTaps="handled">
      <View style={styles.heroBanner}>
        <TourHeroImage imageUrl={tour.imageUrl} />
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
          style={[styles.generateButton, !isValid && styles.generateButtonDisabled]}
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
  const { addCity, getItinerary, saveItinerary } = usePinned();

  const savedItinerary = getItinerary(tour.id);

  const [generatedStops, setGeneratedStops] = useState<Stop[] | null>(savedItinerary?.stops ?? null);
  const [loading, setLoading] = useState(false);
  const lastPrefsRef = useRef<TripPreferences | null>(savedItinerary?.preferences ?? null);
  const cancelRef = useRef<(() => void) | null>(null);

  // Auto-track every visited city
  useEffect(() => {
    addCity(tour);
  }, []);

  // When a saved itinerary appears (e.g. navigating back to a tracked city), sync local state
  useEffect(() => {
    if (savedItinerary) {
      setGeneratedStops(savedItinerary.stops);
    }
  }, [savedItinerary]);

  // Cancel any in-flight generation on unmount
  useEffect(() => {
    return () => {
      cancelRef.current?.();
    };
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: tour.city,
    });
  }, [navigation, tour]);

  const handleGenerate = useCallback(
    async (prefs: TripPreferences) => {
      let cancelled = false;
      cancelRef.current = () => {
        cancelled = true;
      };
      setLoading(true);
      try {
        const stops = await generateRecommendedStops(tour.stops, prefs);
        if (cancelled) return;
        setGeneratedStops(stops);
        lastPrefsRef.current = prefs;
        saveItinerary({ tourId: tour.id, preferences: prefs, stops });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    },
    [tour, saveItinerary],
  );

  const handleMoveStop = useCallback(
    (fromIndex: number, direction: -1 | 1) => {
      if (!generatedStops) return;
      const toIndex = fromIndex + direction;
      const totalDays = lastPrefsRef.current?.days ?? 1;

      // Boundary: first stop moving up → move to previous day without swapping
      if (toIndex < 0) {
        const stop = generatedStops[fromIndex];
        if (stop.day != null && stop.day > 1) {
          const next = [...generatedStops];
          next[fromIndex] = { ...stop, day: stop.day - 1 };
          const updated = recalculateStops(next);
          setGeneratedStops(updated);
          const prefs = lastPrefsRef.current;
          if (prefs) {
            saveItinerary({ tourId: tour.id, preferences: prefs, stops: updated });
          }
        }
        return;
      }

      // Boundary: last stop moving down → move to next day without swapping
      if (toIndex >= generatedStops.length) {
        const stop = generatedStops[fromIndex];
        if (stop.day != null && stop.day < totalDays) {
          const next = [...generatedStops];
          next[fromIndex] = { ...stop, day: stop.day + 1 };
          const updated = recalculateStops(next);
          setGeneratedStops(updated);
          const prefs = lastPrefsRef.current;
          if (prefs) {
            saveItinerary({ tourId: tour.id, preferences: prefs, stops: updated });
          }
        }
        return;
      }

      // Normal swap (same day) or day change (cross-day boundary)
      const next = [...generatedStops];
      const fromDay = next[fromIndex].day;
      const toDay = next[toIndex].day;

      if (fromDay !== toDay) {
        // Cross-day boundary: move by exactly one day based on direction, ignoring gaps
        const fromDaySafe = fromDay ?? 1;
        const newDay = Math.min(Math.max(fromDaySafe + direction, 1), totalDays);
        next[fromIndex] = { ...next[fromIndex], day: newDay };
      } else {
        // Same day: swap positions, days stay at positions
        [next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]];
        next[fromIndex] = { ...next[fromIndex], day: fromDay };
        next[toIndex] = { ...next[toIndex], day: toDay };
      }
      const updated = recalculateStops(next);
      setGeneratedStops(updated);
      // Persist updated order
      const prefs = lastPrefsRef.current;
      if (prefs) {
        saveItinerary({ tourId: tour.id, preferences: prefs, stops: updated });
      }
    },
    [generatedStops, tour.id, saveItinerary],
  );

  const handleRemoveStop = useCallback(
    (index: number) => {
      if (!generatedStops) return;
      const stopId = generatedStops[index]?.id;
      if (!stopId) return;
      Alert.alert(t.tour.removeStopTitle, t.tour.removeStopMessage, [
        { text: t.tour.cancelRemove, style: 'cancel' },
        {
          text: t.tour.confirmRemove,
          style: 'destructive',
          onPress: () => {
            setGeneratedStops((prev) => {
              if (!prev) {
                return prev;
              }
              const next = prev.filter((stop) => stop.id !== stopId);
              const updated = recalculateStops(next);
              const prefs = lastPrefsRef.current;
              if (prefs) {
                saveItinerary({ tourId: tour.id, preferences: prefs, stops: updated });
              }
              return updated;
            });
          },
        },
      ]);
    },
    [generatedStops, tour.id, saveItinerary, t],
  );

  // Use the currently generated stops (kept in sync with any saved itinerary)
  const stopsToShow = generatedStops;

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
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

  if (stopsToShow.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <View style={{ direction: language.isRTL ? 'rtl' : 'ltr' }}>
          <View style={styles.heroBanner}>
            <TourHeroImage imageUrl={tour.imageUrl} />
            <Text style={styles.heroCity}>{tour.city}</Text>
            <Text style={styles.heroCountry}>{tour.country}</Text>
          </View>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t.tour.noRecommendedStops}</Text>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={() => setGeneratedStops(null)}
              activeOpacity={0.85}
            >
              <Text style={styles.generateButtonText}>{t.tour.adjustPreferences}</Text>
            </TouchableOpacity>
          </View>
        </View>
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
            <View style={styles.heroBanner}>
              <TourHeroImage imageUrl={tour.imageUrl} />
              <Text style={styles.heroCity}>{tour.city}</Text>
              <Text style={styles.heroCountry}>{tour.country}</Text>
              <Text style={styles.heroDescription}>{tour.description}</Text>
              <View style={styles.heroMeta}>
                <Text style={styles.heroMetaItem}>🕐 {'TODO, maybe'}</Text>
                <Text style={styles.heroMetaItem}>📍 {'TODO, maybe'}</Text>
                <Text style={styles.heroMetaItem}>🏛️ {t.units.stops(stopsToShow.length)}</Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>{t.tour.recommendedStops}</Text>
            <TouchableOpacity
              style={[styles.mapButton]}
              onPress={async () => {
                try {
                  await openDirections(stopsToShow);
                } catch (error) {
                  if (__DEV__) {
                    console.warn('Failed to open maps URL', error);
                  }
                }
              }}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={t.tour.viewOnMap}
            >
              <Text style={styles.mapButtonIcon} accessible={false}>
                🗺️
              </Text>
              <Text style={[styles.mapButtonText]}>{t.tour.viewOnMap}</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item, index }) => {
          const prevStop = index > 0 ? stopsToShow[index - 1] : undefined;
          const isNewDay = index === 0 || item.day !== prevStop?.day;
          // Only show walking connector within the same day
          const walkingTime = !isNewDay && prevStop ? prevStop.walkingTime : undefined;
          const totalDays = lastPrefsRef.current?.days ?? 1;
          const canMoveUp = index > 0 || (item.day != null && item.day > 1);
          const canMoveDown = index < stopsToShow.length - 1 || (item.day != null && item.day < totalDays);

          // Show headers for empty days that precede this stop's day
          const emptyDayHeaders: number[] = [];
          if (isNewDay && item.day != null) {
            const startDay = prevStop?.day != null ? prevStop.day + 1 : 1;
            for (let d = startDay; d < item.day; d++) {
              emptyDayHeaders.push(d);
            }
          }

          return (
            <View>
              {emptyDayHeaders.map((d) => (
                <DayHeader key={`empty-day-${d}`} day={d} />
              ))}
              {isNewDay && item.day !== null && item.day !== undefined ? <DayHeader day={item.day} /> : null}
              {walkingTime != null ? <WalkingConnector walkingTime={walkingTime} /> : null}
              <SwipeableRow
                onDelete={() => handleRemoveStop(index)}
                isRTL={language.isRTL}
                deleteAccessibilityLabel={t.tour.removeStop}
              >
                <View style={styles.stopRowWithActions}>
                  <View style={styles.stopRowContent}>
                    <StopRow stop={item} onPress={() => navigation.navigate('Stop', { stop: item })} />
                  </View>
                  <View style={styles.moveButtons}>
                    <TouchableOpacity
                      onPress={() => handleMoveStop(index, -1)}
                      disabled={!canMoveUp}
                      style={[styles.moveButton, !canMoveUp && styles.moveButtonDisabled]}
                      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                      accessibilityRole="button"
                      accessibilityLabel={t.tour.moveUp}
                    >
                      <Text style={[styles.moveButtonText, !canMoveUp && styles.moveButtonTextDisabled]}>▲</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleMoveStop(index, 1)}
                      disabled={!canMoveDown}
                      style={[styles.moveButton, !canMoveDown && styles.moveButtonDisabled]}
                      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
                      accessibilityRole="button"
                      accessibilityLabel={t.tour.moveDown}
                    >
                      <Text style={[styles.moveButtonText, !canMoveDown && styles.moveButtonTextDisabled]}>▼</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </SwipeableRow>
            </View>
          );
        }}
        ListFooterComponent={
          lastPrefsRef.current && stopsToShow.length > 0
            ? () => {
                const totalDays = lastPrefsRef.current?.days ?? 1;
                const lastDay = stopsToShow[stopsToShow.length - 1].day ?? totalDays;
                const trailing: number[] = [];
                for (let d = lastDay + 1; d <= totalDays; d++) {
                  trailing.push(d);
                }
                if (trailing.length === 0) {
                  return null;
                }
                return (
                  <View>
                    {trailing.map((d) => (
                      <DayHeader key={`trailing-day-${d}`} day={d} />
                    ))}
                  </View>
                );
              }
            : undefined
        }
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
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  heroBanner: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  cityImage: {
    alignSelf: 'stretch',
    height: 160,
    borderRadius: 12,
    marginBottom: 16,
  },
  heroCity: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  heroCountry: {
    fontSize: 16,
    color: '#5A6376',
    marginTop: 2,
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 15,
    color: '#4A5568',
    lineHeight: 22,
    marginBottom: 20,
  },
  heroMeta: {
    flexDirection: 'row',
    gap: 20,
  },
  heroMetaItem: {
    fontSize: 13,
    color: '#4A5568',
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
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
  },
  mapButtonIcon: {
    fontSize: 18,
  },
  mapButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  stopRow: {
    backgroundColor: '#FFFFFF',
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
  stopThumb: {
    width: 24,
    height: 24,
    borderRadius: 6,
    marginEnd: 8,
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
  stopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stopPrice: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '600',
  },
  walkingConnector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
    paddingHorizontal: 8,
  },
  dayHeader: {
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderLeftWidth: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  dayHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  walkingLine: {
    flex: 1,
    height: 1,
    opacity: 0.3,
  },
  walkingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  walkingIcon: {
    fontSize: 14,
  },
  walkingText: {
    fontSize: 11,
    color: '#95A5A6',
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
    color: '#1A1A2E',
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
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    gap: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 24,
  },
  stopRowWithActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopRowContent: {
    flex: 1,
  },
  moveButtons: {
    justifyContent: 'center',
    gap: 4,
    marginStart: 4,
    marginEnd: 4,
  },
  moveButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moveButtonDisabled: {
    opacity: 0.3,
  },
  moveButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  moveButtonTextDisabled: {
    color: '#BDC3C7',
  },
});
