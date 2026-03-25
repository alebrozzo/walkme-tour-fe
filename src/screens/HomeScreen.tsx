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
import { fetchCityTour } from '../services/tourApi';
import { hasPlacesApiKey, PlaceSuggestion, searchCities } from '../services/placesApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface PinnedCardProps {
  tour: Tour;
  onPress: () => void;
  onUnpin: () => void;
}

function PinnedCard({ tour, onPress, onUnpin }: PinnedCardProps) {
  const { t, language } = useLanguage();
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    setImageLoadError(false);
  }, [tour.imageUrl]);

  return (
    <View style={[styles.pinnedCard, { backgroundColor: tour.color, direction: language.isRTL ? 'rtl' : 'ltr' }]}>
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
      <TouchableOpacity
        onPress={onUnpin}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={t.unpinCity}
      >
        <Text style={styles.pinnedCardUnpin}>📌</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const { t, language, languages, setLanguage } = useLanguage();
  const { pinnedTours, togglePin } = usePinned();
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const activeRequestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Debounced Places autocomplete
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (!trimmed) {
      setSuggestions([]);
      return;
    }
    if (!hasPlacesApiKey()) {
      if (__DEV__) console.warn('[Places] EXPO_PUBLIC_GOOGLE_PLACES_API_KEY is not set');
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    debounceRef.current = setTimeout(async () => {
      const results = await searchCities(trimmed, language.code, controller.signal);
      if (!controller.signal.aborted) {
        setSuggestions(results);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      controller.abort();
    };
  }, [query, language.code]);
  const isRTL = language.isRTL;
  const hasQuery = query.trim().length > 0;
  const directionStyle = isRTL ? styles.directionRTL : styles.directionLTR;
  const textAlignStyle = isRTL ? styles.textAlignRight : styles.textAlignLeft;

  const handleCitySelect = async (placeId: string, cityName: string, country: string = '') => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setSuggestions([]);
    activeRequestIdRef.current += 1;
    const requestId = activeRequestIdRef.current;
    setIsSearching(true);
    try {
      const tour = await fetchCityTour(placeId, cityName, country, language.code);
      if (activeRequestIdRef.current !== requestId) return;
      setQuery('');
      navigation.navigate('Tour', { tour });
    } catch (error) {
      if (activeRequestIdRef.current !== requestId) return;
      if (__DEV__) {
        console.warn(`Failed to fetch tour for ${cityName}`, error);
      }
      Alert.alert(t.home.offlineModeTitle, t.home.offlineModeMessage);
    } finally {
      if (activeRequestIdRef.current === requestId) {
        setIsSearching(false);
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
              returnKeyType="search"
              autoCorrect={false}
            />
            {hasQuery && !isSearching && (
              <TouchableOpacity
                onPress={() => setQuery('')}
                style={styles.clearButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
            {isSearching && <ActivityIndicator size="small" color="#1A1A2E" style={styles.searchSpinner} />}
          </View>

          {hasQuery && (
            <View style={styles.resultsList}>
              {isSearching ? (
                suggestions.map((s) => (
                  <TouchableOpacity
                    key={s.placeId}
                    style={[styles.resultRow, { direction: isRTL ? 'rtl' : 'ltr' }]}
                    onPress={() => handleCitySelect(s.placeId, s.name, s.country)}
                    disabled={isSearching}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.searchIcon}>📍</Text>
                    <View style={styles.resultTextContainer}>
                      <Text style={styles.resultCity}>{s.name}</Text>
                      {!!s.country && <Text style={styles.resultCountry}>{s.country}</Text>}
                    </View>
                    {isSearching ? (
                      <ActivityIndicator size="small" color="#BDC3C7" />
                    ) : (
                      <Text style={styles.resultChevron}>{isRTL ? '‹' : '›'}</Text>
                    )}
                  </TouchableOpacity>
                ))
              ) : suggestions.length === 0 ? (
                <View
                  style={[
                    styles.resultRow,
                    {
                      justifyContent: 'center',
                      alignItems: 'center',
                      direction: isRTL ? 'rtl' : 'ltr',
                    },
                  ]}
                >
                  <Text style={styles.resultCity}>{t.searchNoResults}</Text>
                </View>
              ) : (
                suggestions.map((s) => (
                  <TouchableOpacity
                    key={s.placeId}
                    style={[styles.resultRow, { direction: isRTL ? 'rtl' : 'ltr' }]}
                    onPress={() => handleCitySelect(s.placeId, s.name, s.country)}
                    disabled={isSearching}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.searchIcon}>📍</Text>
                    <View style={styles.resultTextContainer}>
                      <Text style={styles.resultCity}>{s.name}</Text>
                      {!!s.country && <Text style={styles.resultCountry}>{s.country}</Text>}
                    </View>
                    <Text style={styles.resultChevron}>{isRTL ? '‹' : '›'}</Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {!hasQuery && pinnedTours.length > 0 && (
            <View style={styles.pinnedSection}>
              <Text style={styles.pinnedSectionTitle}>{t.pinnedCities}</Text>
              {pinnedTours.map((tour) => (
                <PinnedCard
                  key={tour.id}
                  tour={tour}
                  onPress={() => navigation.navigate('Tour', { tour })}
                  onUnpin={() => togglePin(tour)}
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
  searchSpinner: {
    marginStart: 8,
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
  resultCountry: {
    fontSize: 13,
    color: '#7F8C8D',
    marginTop: 2,
  },
  resultChevron: {
    fontSize: 22,
    color: '#BDC3C7',
    fontWeight: '300',
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
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  pinnedCardThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginEnd: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
  },
  pinnedCardContent: {
    flex: 1,
  },
  pinnedCardCity: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pinnedCardCountry: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  pinnedCardUnpin: {
    fontSize: 20,
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
