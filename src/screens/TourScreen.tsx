import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, Stop } from '../types';
import { TYPE_ICON } from '../constants/stopTypes';
import { useLanguage } from '../contexts/LanguageContext';

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

export default function TourScreen({ navigation, route }: Props) {
  const { tour } = route.params;
  const { t, language } = useLanguage();

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        style={{ direction: language.isRTL ? 'rtl' : 'ltr' }}
        data={tour.stops}
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
                <Text style={styles.heroMetaItem}>🏛️ {t.units.stops(tour.stops.length)}</Text>
              </View>
            </View>
            <Text style={styles.sectionTitle}>{t.tour.stopsSection}</Text>
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
});
