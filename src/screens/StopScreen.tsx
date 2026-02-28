import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { TYPE_ICON } from '../constants/stopTypes';

type Props = NativeStackScreenProps<RootStackParamList, 'Stop'>;

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function StopScreen({ route }: Props) {
  const { stop, tourColor } = route.params;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: tourColor }]}>
          <Text style={styles.typeIcon}>{TYPE_ICON[stop.type] ?? '📌'}</Text>
          <Text style={styles.stopName}>{stop.name}</Text>
          <Text style={styles.stopType}>
            {stop.type.charAt(0).toUpperCase() + stop.type.slice(1)}
          </Text>
        </View>

        <View style={styles.body}>
          {/* Info cards */}
          <View style={styles.infoCard}>
            <InfoRow icon="📍" label="Address" value={stop.address} />
            <View style={styles.divider} />
            <InfoRow icon="⏱" label="Time at stop" value={`${stop.duration} minutes`} />
            <View style={styles.divider} />
            <InfoRow icon="🔢" label="Stop number" value={`Stop ${stop.order} on the tour`} />
          </View>

          {/* Description */}
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <Text style={styles.description}>{stop.description}</Text>
          </View>

          {/* Tips */}
          {stop.tips ? (
            <>
              <Text style={styles.sectionTitle}>Visitor Tips</Text>
              <View style={[styles.card, styles.tipsCard]}>
                <Text style={styles.tipsIcon}>💡</Text>
                <Text style={styles.tipsText}>{stop.tips}</Text>
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scroll: {
    paddingBottom: 40,
  },
  header: {
    padding: 28,
    paddingTop: 36,
    paddingBottom: 36,
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  stopName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
  },
  stopType: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  body: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 12,
  },
  infoIcon: {
    fontSize: 18,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: '#95A5A6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#1A1A2E',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: -16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A2E',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  description: {
    fontSize: 15,
    color: '#2C3E50',
    lineHeight: 24,
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFBF0',
    borderWidth: 1,
    borderColor: '#F9E4A0',
  },
  tipsIcon: {
    fontSize: 20,
    marginTop: 1,
  },
  tipsText: {
    flex: 1,
    fontSize: 14,
    color: '#5D4037',
    lineHeight: 22,
  },
});
