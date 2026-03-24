import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
import tours from '../data/tours';
import { RootStackParamList, Tour } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { usePinned } from '../contexts/PinnedContext';
import { fetchTourForCity } from '../services/tourApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

interface CityResultProps {
  tour: Tour;
  loading: boolean;
  onPress: () => void;
}

function CityResult({ tour, loading, onPress }: CityResultProps) {
  const { language } = useLanguage();
  const [imageLoadError, setImageLoadError] = useState(false);

  useEffect(() => {
    setImageLoadError(false);
  }, [tour.imageUrl]);

  return (
    <TouchableOpacity
      style={[styles.resultRow, { direction: language.isRTL ? 'rtl' : 'ltr' }]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
    >
      {tour.imageUrl && !imageLoadError ? (
        <Image
          source={{ uri: tour.imageUrl }}
          style={styles.resultThumb}
          resizeMode="cover"
          onError={() => setImageLoadError(true)}
        />
      ) : (
        <View style={[styles.resultColorDot, { backgroundColor: tour.color }]} />
      )}
      <View style={styles.resultTextContainer}>
        <Text style={styles.resultCity}>{tour.city}</Text>
        <Text style={styles.resultCountry}>{tour.country}</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={tour.color} />
      ) : (
        <Text style={styles.resultChevron}>{language.isRTL ? '‹' : '›'}</Text>
      )}
    </TouchableOpacity>
  );
}

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
  const [loadingCityId, setLoadingCityId] = useState<string | null>(null);
  const fetchInFlightRef = useRef(false);

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return tours.filter((tour) => tour.city.toLowerCase().includes(q));
  }, [query]);

  const hasQuery = query.trim().length > 0;
  const directionStyle = useMemo(
    () => ({ direction: language.isRTL ? ('rtl' as const) : ('ltr' as const) }),
    [language.isRTL],
  );

  const handleCityPress = async (tour: Tour) => {
    if (fetchInFlightRef.current) return;
    fetchInFlightRef.current = true;
    setLoadingCityId(tour.id);
    try {
      const apiTour = await fetchTourForCity(tour);
      setQuery('');
      navigation.navigate('Tour', { tour: apiTour });
    } catch (error) {
      if (__DEV__) {
        console.warn(`Failed to fetch remote tour for ${tour.city}`, error);
      }
      Alert.alert('Offline mode', 'Could not reach the server. Using local city data.');
      setQuery('');
      navigation.navigate('Tour', { tour });
    } finally {
      fetchInFlightRef.current = false;
      setLoadingCityId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContent}>
        <View style={directionStyle}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={t.searchPlaceholder}
              placeholderTextColor="#A0A9B3"
              value={query}
              onChangeText={setQuery}
              autoCorrect={false}
              textAlign={language.isRTL ? 'right' : 'left'}
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
              {filtered.length === 0 ? (
                <Text style={styles.noResults}>{t.searchNoResults}</Text>
              ) : (
                filtered.map((item) => (
                  <CityResult
                    key={item.id}
                    tour={item}
                    loading={loadingCityId === item.id}
                    onPress={() => handleCityPress(item)}
                  />
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
              <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>{t.selectLanguage}</Text>
                {languages.map((lang) => (
                  <TouchableOpacity
                    key={lang.code}
                    style={[styles.langOption, language.code === lang.code && styles.langOptionSelected]}
                    onPress={() => {
                      setLanguage(lang.code);
                      setShowLangPicker(false);
                    }}
                  >
                    <Text style={styles.langNativeName}>{lang.nativeName}</Text>
                    <Text style={styles.langName}>{lang.name}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
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
