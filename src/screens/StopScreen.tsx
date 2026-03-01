import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Speech from 'expo-speech';
import { RootStackParamList } from '../types';
import { TYPE_ICON } from '../constants/stopTypes';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { t, language } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const cancelRef = useRef<(() => void) | null>(null);

  const stopTypeLabel = t.stopTypes[stop.type] ?? stop.type.charAt(0).toUpperCase() + stop.type.slice(1);

  const handleListen = useCallback(async () => {
    if (isSpeaking) {
      cancelRef.current?.();
      cancelRef.current = null;
      await Speech.stop();
      setIsSpeaking(false);
      return;
    }

    let cancelled = false;
    cancelRef.current = () => {
      cancelled = true;
      Speech.stop();
    };

    setIsSpeaking(true);
    try {
      Speech.speak(stop.description, {
        language: language.code,
        onDone: () => {
          if (!cancelled) setIsSpeaking(false);
        },
        onStopped: () => {
          if (!cancelled) setIsSpeaking(false);
        },
        onError: () => {
          if (!cancelled) setIsSpeaking(false);
        },
      });
    } catch {
      if (!cancelled) setIsSpeaking(false);
    }
  }, [isSpeaking, stop.description, language.code]);

  useEffect(
    () => () => {
      cancelRef.current?.();
    },
    [],
  );

  useEffect(() => {
    setImageLoadError(false);
  }, [stop.imageUrl]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={{ direction: language.isRTL ? 'rtl' : 'ltr' }} contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: tourColor }]}>
          {stop.imageUrl && !imageLoadError ? (
            <Image
              source={{ uri: stop.imageUrl }}
              style={styles.stopImage}
              resizeMode="cover"
              onError={() => setImageLoadError(true)}
            />
          ) : (
            <Text style={styles.typeIcon}>{TYPE_ICON[stop.type] ?? '📌'}</Text>
          )}
          <Text style={styles.stopName}>{stop.name}</Text>
          <Text style={styles.stopType}>{stopTypeLabel}</Text>
        </View>

        <View style={styles.body}>
          {/* Info cards */}
          <View style={styles.infoCard}>
            <InfoRow icon="📍" label={t.stop.address} value={stop.address} />
            <View style={styles.divider} />
            <InfoRow icon="⏱" label={t.stop.timeAtStop} value={t.units.minutes(stop.duration)} />
            {stop.price ? (
              <>
                <View style={styles.divider} />
                <InfoRow icon="💰" label={t.stop.price} value={stop.price} />
              </>
            ) : null}
          </View>

          {/* Description */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.stop.about}</Text>
            <Pressable
              style={[styles.listenButton, isSpeaking && styles.listenButtonActive]}
              onPress={handleListen}
              accessibilityRole="button"
              accessibilityLabel={isSpeaking ? t.stop.stopListening : t.stop.listenAbout}
            >
              <Text style={styles.listenButtonIcon}>{isSpeaking ? '⏹' : '🔊'}</Text>
              <Text style={[styles.listenButtonText, isSpeaking && styles.listenButtonTextActive]}>
                {isSpeaking ? t.stop.stopListening : t.stop.listenAbout}
              </Text>
            </Pressable>
          </View>
          <View style={styles.card}>
            <Text style={styles.description}>{stop.description}</Text>
          </View>

          {/* Tips */}
          {stop.tips ? (
            <>
              <Text style={styles.sectionTitle}>{t.stop.visitorTips}</Text>
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
  stopImage: {
    width: 92,
    height: 92,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  listenButtonActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  listenButtonIcon: {
    fontSize: 14,
  },
  listenButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
  },
  listenButtonTextActive: {
    color: '#DC2626',
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
