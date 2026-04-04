import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Tour } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { usePinned } from '../contexts/PinnedContext';
import { fetchTourForCity, TourApiError } from '../services/tourApi';
import { logMessage } from '../utils/logger';
import { searchCities, CityPrediction } from '../services/placesApi';
import SwipeableRow from '../components/SwipeableRow';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface PlaceResultProps {
  prediction: CityPrediction;
  loading: boolean;
  onPress: () => void;
}

function PlaceResult({ prediction, loading, onPress }: PlaceResultProps) {
  const { language } = useLanguage();
  return (
    <TouchableOpacity
      style={[styles.resultRow, { direction: language.isRTL ? 'rtl' : 'ltr' }]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      <Text style={styles.resultPlaceIcon}>📍</Text>
      <View style={styles.resultTextContainer}>
        <Text style={styles.resultCity}>{prediction.description}</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={styles.activityIndicator.color} />
      ) : (
        <Text style={styles.resultChevron}>{language.isRTL ? '‹' : '›'}</Text>
      )}
    </TouchableOpacity>
  );
}

interface PinnedCardProps {
  tour: Tour;
  onPress: () => void;
  onRemove: () => void;
}

function PinnedCard({ tour, onPress, onRemove }: PinnedCardProps) {
  const { t, language } = useLanguage();
  const [imageLoadError, setImageLoadError] = useState(false);
  const isRTL = language.isRTL;

  useEffect(() => {
    setImageLoadError(false);
  }, [tour.imageUrl]);

  return (
    <SwipeableRow onDelete={onRemove} isRTL={isRTL} deleteAccessibilityLabel={t.removeCity}>
      <View style={styles.pinnedCard}>
        {tour.imageUrl && !imageLoadError ? (
          <Image
            source={{ uri: tour.imageUrl }}
            style={styles.pinnedCardThumb}
            resizeMode="cover"
            onError={() => setImageLoadError(true)}
          />
        ) : null}
        <Pressable
          style={styles.pinnedCardContent}
          onPress={onPress}
          android_ripple={null}
          accessibilityRole="button"
          accessibilityLabel={tour.city}
        >
          <Text style={styles.pinnedCardCity}>{tour.city}</Text>
          <Text style={styles.pinnedCardCountry}>{tour.country}</Text>
        </Pressable>
        <Text style={styles.pinnedCardChevron}>{isRTL ? '‹' : '›'}</Text>
      </View>
    </SwipeableRow>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const { t, language } = useLanguage();
  const { pinnedTours, removeCity } = usePinned();
  const [query, setQuery] = useState('');
  const [predictions, setPredictions] = useState<CityPrediction[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loadingCityId, setLoadingCityId] = useState<string | null>(null);
  const activeRequestIdRef = useRef(0);
  const latestSearchIdRef = useRef(0);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t.appTitle,
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.langButton}>
          <Text style={styles.langButtonText}>⚙️</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, t]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setPredictions([]);
      setSearchLoading(false);
      return;
    }
    latestSearchIdRef.current += 1;
    const requestId = latestSearchIdRef.current;
    setSearchLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const results = await searchCities(q, language.code, controller.signal);
        if (requestId !== latestSearchIdRef.current) return;
        logMessage('log', 'HomeScreen', 'search results', { q, count: results.length });
        setPredictions(results);
      } catch (e) {
        if ((e as Error).name !== 'AbortError' && requestId === latestSearchIdRef.current) {
          logMessage('error', 'HomeScreen', 'search error', { error: String(e) });
          setPredictions([]);
        }
      } finally {
        if (requestId === latestSearchIdRef.current) {
          setSearchLoading(false);
        }
      }
    }, 350);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, language.code]);

  const isRTL = language.isRTL;
  const hasQuery = query.trim().length > 0;
  const directionStyle = isRTL ? styles.directionRTL : styles.directionLTR;
  const textAlignStyle = isRTL ? styles.textAlignRight : styles.textAlignLeft;

  const handleCityPress = async (prediction: CityPrediction) => {
    activeRequestIdRef.current += 1;
    const requestId = activeRequestIdRef.current;
    setLoadingCityId(prediction.placeId);
    const tourStub: Tour = {
      id: prediction.placeId,
      placeId: prediction.placeId,
      city: prediction.city,
      country: prediction.country,
      description: '',
      stops: [],
    };
    try {
      const apiTour = await fetchTourForCity(tourStub, language.code);
      setQuery('');
      navigation.navigate('Tour', { tour: apiTour });
    } catch (error) {
      logMessage('warn', 'HomeScreen', `Failed to fetch remote tour for ${prediction.city}`, { error: String(error) });
      if ((error as Error).name === 'AbortError') {
        Alert.alert(t.home.errorTitle, t.home.timeoutErrorMessage);
      } else if (error instanceof TourApiError && error.statusCode !== undefined) {
        const message = error.statusCode >= 500 ? t.home.serverErrorMessage : t.home.requestErrorMessage;
        Alert.alert(t.home.errorTitle, message);
      } else {
        Alert.alert(t.home.offlineModeTitle, t.home.offlineModeMessage);
      }
    } finally {
      if (activeRequestIdRef.current === requestId) {
        setLoadingCityId(null);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
        <View style={directionStyle}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={[styles.searchInput, textAlignStyle]}
              placeholder={t.searchPlaceholder}
              placeholderTextColor="#A0A9B3"
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
            />
            {hasQuery && (
              <TouchableOpacity
                onPress={() => setQuery('')}
                style={styles.clearButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {hasQuery && (
            <View style={styles.resultsList}>
              {searchLoading ? (
                <ActivityIndicator size="small" color={styles.activityIndicator.color} style={styles.searchSpinner} />
              ) : predictions.length === 0 ? (
                <Text style={styles.noResults}>{t.searchNoResults}</Text>
              ) : (
                predictions.map((item) => (
                  <PlaceResult
                    key={item.placeId}
                    prediction={item}
                    loading={loadingCityId === item.placeId}
                    onPress={() => handleCityPress(item)}
                  />
                ))
              )}
            </View>
          )}

          {!hasQuery && pinnedTours.length > 0 && (
            <View style={styles.pinnedSection}>
              <Text style={styles.pinnedSectionTitle}>{t.recentCities}</Text>
              {pinnedTours.map((tour) => (
                <PinnedCard
                  key={tour.id}
                  tour={tour}
                  onPress={() => navigation.navigate('Tour', { tour })}
                  onRemove={() => removeCity(tour.id)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Loading overlay */}
      <Modal
        visible={loadingCityId !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          /* intentionally blocked */
        }}
      >
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#2C3E8C" />
            <Text style={styles.loadingText}>{t.home.loadingTour}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F0F4FF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  directionLTR: {
    direction: 'ltr',
  },
  directionRTL: {
    direction: 'rtl',
  },
  textAlignLeft: {
    textAlign: 'left',
  },
  textAlignRight: {
    textAlign: 'right',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    fontSize: 18,
    marginEnd: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
    padding: 0,
  },
  clearButton: {
    marginStart: 8,
    padding: 2,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  noResults: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 15,
    marginTop: 32,
  },
  resultRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  resultColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginEnd: 12,
  },
  resultThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    marginEnd: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultCity: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  resultChevron: {
    fontSize: 20,
    color: '#4F46E5',
    fontWeight: '600',
  },
  resultPlaceIcon: {
    fontSize: 20,
    marginEnd: 12,
  },
  activityIndicator: {
    color: '#2C3E8C',
  },
  searchSpinner: {
    marginTop: 32,
  },
  pinnedSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  pinnedSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  pinnedCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinnedCardThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    marginEnd: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  pinnedCardContent: {
    flex: 1,
  },
  pinnedCardCity: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  pinnedCardCountry: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  pinnedCardChevron: {
    fontSize: 20,
    color: '#4F46E5',
    fontWeight: '600',
  },
  langButton: {
    padding: 4,
  },
  langButtonText: {
    fontSize: 22,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 40,
    alignItems: 'center',
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
});
