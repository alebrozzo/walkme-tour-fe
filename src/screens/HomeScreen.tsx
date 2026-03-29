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
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Tour } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { usePinned } from '../contexts/PinnedContext';
import { fetchTourForCity, TourApiError } from '../services/tourApi';
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
  const { t, language, languages, setLanguage } = useLanguage();
  const { pinnedTours, removeCity } = usePinned();
  const [showLangPicker, setShowLangPicker] = useState(false);
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
        <TouchableOpacity onPress={() => setShowLangPicker(true)} style={styles.langButton}>
          <Text style={styles.langButtonText}>🌐</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, t, setShowLangPicker]);

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
        if (__DEV__) {
          console.log({ results });
        }
        setPredictions(results);
      } catch (e) {
        if ((e as Error).name !== 'AbortError' && requestId === latestSearchIdRef.current) {
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
      if (__DEV__) {
        console.warn(`Failed to fetch remote tour for ${prediction.city}`, error);
      }
      if (error instanceof TourApiError && error.statusCode !== undefined) {
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

      {/* Language picker modal */}
      <Modal visible={showLangPicker} transparent animationType="fade" onRequestClose={() => setShowLangPicker(false)}>
        <TouchableWithoutFeedback onPress={() => setShowLangPicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalCard, directionStyle]}>
                <Text style={styles.modalTitle}>{t.selectLanguage}</Text>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.langOption,
                      isRTL ? styles.langOptionRTL : styles.langOptionLTR,
                      language.code === lang.code && styles.langOptionSelected,
                    ]}
                    onPress={() => {
                      setLanguage(lang.code);
                      setShowLangPicker(false);
                    }}
                  >
                    <Text style={[styles.langNativeName, textAlignStyle]}>{lang.nativeName}</Text>
                    <Text style={[styles.langName, textAlignStyle]}>{t.languageNames[lang.code]}</Text>
                    {language.code === lang.code && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
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
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 18,
    marginEnd: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A2E',
    padding: 0,
  },
  clearButton: {
    marginStart: 8,
    padding: 2,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#95A5A6',
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  noResults: {
    textAlign: 'center',
    color: '#7F8C8D',
    fontSize: 15,
    marginTop: 32,
  },
  resultRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  resultChevron: {
    fontSize: 22,
    color: '#BDC3C7',
    fontWeight: '300',
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 12,
  },
  pinnedCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pinnedCardThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginEnd: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  pinnedCardContent: {
    flex: 1,
  },
  pinnedCardCity: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  pinnedCardCountry: {
    fontSize: 13,
    color: '#7F8C8D',
    marginTop: 2,
  },
  pinnedCardChevron: {
    fontSize: 22,
    color: '#BDC3C7',
    fontWeight: '300',
  },
  langButton: {
    padding: 4,
  },
  langButtonText: {
    fontSize: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 16,
    textAlign: 'center',
  },
  langOption: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  langOptionLTR: {
    flexDirection: 'row',
  },
  langOptionRTL: {
    flexDirection: 'row-reverse',
  },
  langOptionSelected: {
    backgroundColor: '#F0F4FF',
  },
  langNativeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A2E',
    flex: 1,
  },
  langName: {
    fontSize: 13,
    color: '#7F8C8D',
    marginEnd: 8,
  },
  checkmark: {
    fontSize: 16,
    color: '#2C3E8C',
    fontWeight: '700',
  },
});
