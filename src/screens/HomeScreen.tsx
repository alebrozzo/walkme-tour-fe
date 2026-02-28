import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import tours from '../data/tours';
import { Difficulty, RootStackParamList, Tour } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  easy: 'Easy',
  moderate: 'Moderate',
  hard: 'Hard',
};

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
  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: tour.color }]} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.colorBar, { backgroundColor: tour.color }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.cityName}>{tour.city}</Text>
            <Text style={styles.countryName}>{tour.country}</Text>
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: DIFFICULTY_COLOR[tour.difficulty] }]}>
            <Text style={styles.difficultyText}>{DIFFICULTY_LABEL[tour.difficulty]}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {tour.description}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>🕐</Text>
            <Text style={styles.metaText}>{tour.duration} min</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>📍</Text>
            <Text style={styles.metaText}>{tour.distance} km</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>🏛️</Text>
            <Text style={styles.metaText}>{tour.stops.length} stops</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={tours}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Walking Tours</Text>
            <Text style={styles.headerSubtitle}>Explore the world one step at a time</Text>
          </View>
        }
        renderItem={({ item }) => <TourCard tour={item} onPress={() => navigation.navigate('Tour', { tour: item })} />}
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
    overflow: 'hidden',
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
});
