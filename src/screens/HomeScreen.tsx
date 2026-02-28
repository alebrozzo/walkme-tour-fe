import React, { useLayoutEffect, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import tours from '../data/tours';
import { Difficulty, RootStackParamList, Tour } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  easy: '#27AE60',
  moderate: '#F39C12',
  hard: '#E74C3C',
};

interface TourCardProps {
  tour: Tour;
  onPress: () => void;
}

function TourCard({ tour, onPress }: TourCardProps) {
  const { t } = useLanguage();
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.colorBar, { backgroundColor: tour.color }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cityName}>{tour.city}</Text>
            <Text style={styles.countryName}>{tour.country}</Text>
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: DIFFICULTY_COLOR[tour.difficulty] }]}>
            <Text style={styles.difficultyText}>{t.difficulty[tour.difficulty]}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {tour.description}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>🕐</Text>
            <Text style={styles.metaText}>
              {tour.duration} {t.units.min}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📍</Text>
            <Text style={styles.metaText}>
              {tour.distance} {t.units.km}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>🏛️</Text>
            <Text style={styles.metaText}>{t.units.stops(tour.stops.length)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }: Props) {
  const { t, language, languages, setLanguage } = useLanguage();
  const [showLangPicker, setShowLangPicker] = useState(false);

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

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={tours}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t.headerTitle}</Text>
            <Text style={styles.headerSubtitle}>{t.headerSubtitle}</Text>
          </View>
        }
        renderItem={({ item }) => <TourCard tour={item} onPress={() => navigation.navigate('Tour', { tour: item })} />}
      />

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
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#7F8C8D',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  colorBar: {
    width: 6,
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cityName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  countryName: {
    fontSize: 13,
    color: '#7F8C8D',
    marginTop: 2,
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#5D6D7E',
    lineHeight: 20,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    fontSize: 14,
  },
  metaText: {
    fontSize: 13,
    color: '#7F8C8D',
    fontWeight: '500',
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
