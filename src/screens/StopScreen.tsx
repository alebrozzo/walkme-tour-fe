import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
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
  onPress?: () => void;
  accessibilityHint?: string;
  isRTL?: boolean;
}

function InfoRow({ icon, label, value, onPress, accessibilityHint, isRTL }: InfoRowProps) {
  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [styles.infoRow, pressed && styles.infoRowPressed]}
        onPress={onPress}
        accessibilityRole="link"
        accessibilityLabel={`${label}: ${value}`}
        accessibilityHint={accessibilityHint}
      >
        <Text style={styles.infoIcon}>{icon}</Text>
        <View style={styles.infoRowContent}>
          <Text style={styles.infoLabel}>{label}</Text>
          <Text style={[styles.infoValue, styles.infoValueLink]}>{value}</Text>
        </View>
        <Text style={styles.infoRowChevron}>{isRTL ? '‹' : '›'}</Text>
      </Pressable>
    );
  }
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoRowContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function StopScreen({ route }: Props) {
  const { stop } = route.params;
  const { t, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
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

  const handleOpenMaps = useCallback(async () => {
    if (Platform.OS === 'ios') {
      const { latitude, longitude } = stop.coordinate;
      const appleUrl = `maps://?ll=${latitude},${longitude}&q=${encodeURIComponent(stop.name)}`;
      try {
        await Linking.openURL(appleUrl);
        return;
      } catch {
        if (__DEV__) {
          console.warn('Failed to open Apple Maps, falling back to Google Maps');
        }
      }
    }
    let googleUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(stop.name)}`;
    if (stop.googlePlaceId) {
      googleUrl += `&query_place_id=${stop.googlePlaceId}`;
    }
    try {
      await Linking.openURL(googleUrl);
    } catch {
      if (__DEV__) {
        console.warn('Failed to open Google Maps URL');
      }
    }
  }, [stop.coordinate, stop.name, stop.googlePlaceId]);

  useEffect(
    () => () => {
      cancelRef.current?.();
    },
    [],
  );

  useEffect(() => {
    setImageLoadError(false);
    setImageModalVisible(false);
  }, [stop.imageUrl]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={{ direction: language.isRTL ? 'rtl' : 'ltr' }} contentContainerStyle={styles.scroll}>
        {/* Header */}
        {stop.imageUrl && !imageLoadError ? (
          <Pressable
            style={styles.heroImageWrapper}
            onPress={() => setImageModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel={`${stop.name}, ${stopTypeLabel}. ${t.stop.viewFullScreen}`}
          >
            <Image
              source={{ uri: stop.imageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
              onError={() => {
                setImageLoadError(true);
                setImageModalVisible(false);
              }}
            />
            <View style={styles.heroOverlay} />
            <View style={styles.heroTextOverlay}>
              <Text style={styles.heroStopName}>{stop.name}</Text>
              <Text style={styles.heroStopType}>{stopTypeLabel}</Text>
            </View>
          </Pressable>
        ) : (
          <View style={styles.heroNoImage}>
            <View style={styles.typeIconBubble}>
              <Text style={styles.typeIcon}>{TYPE_ICON[stop.type] ?? '📌'}</Text>
            </View>
            <Text style={styles.stopName}>{stop.name}</Text>
            <Text style={styles.stopType}>{stopTypeLabel}</Text>
          </View>
        )}

        {/* Full-screen image modal */}
        {stop.imageUrl && !imageLoadError && (
          <Modal
            visible={imageModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setImageModalVisible(false)}
            statusBarTranslucent
          >
            <StatusBar backgroundColor="rgba(0,0,0,0.95)" barStyle="light-content" />
            <View style={styles.modalBackdrop}>
              <Image source={{ uri: stop.imageUrl }} style={styles.modalImage} resizeMode="contain" />
              <Pressable
                style={[
                  styles.modalCloseButton,
                  { top: insets.top + 16 },
                  language.isRTL ? styles.modalCloseButtonRTL : styles.modalCloseButtonLTR,
                ]}
                onPress={() => setImageModalVisible(false)}
                accessibilityRole="button"
                accessibilityLabel={t.stop.closeImage}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>
          </Modal>
        )}

        <View style={styles.body}>
          {/* Info cards */}
          <View style={styles.infoCard}>
            <InfoRow
              icon="📍"
              label={t.stop.address}
              value={stop.address}
              onPress={handleOpenMaps}
              accessibilityHint={t.stop.openInMaps}
              isRTL={language.isRTL}
            />
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
    backgroundColor: '#F0F4FF',
  },
  scroll: {
    paddingBottom: 40,
  },
  heroImageWrapper: {
    height: 280,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: 280,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 130,
    backgroundColor: 'rgba(15,23,42,0.72)',
  },
  heroTextOverlay: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
  },
  heroStopName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  heroStopType: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroNoImage: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  typeIconBubble: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  typeIcon: {
    fontSize: 44,
  },
  stopName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  stopType: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  body: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 12,
  },
  infoRowPressed: {
    opacity: 0.6,
  },
  infoRowContent: {
    flex: 1,
  },
  infoRowChevron: {
    fontSize: 18,
    color: '#94A3B8',
    alignSelf: 'center',
  },
  infoIcon: {
    fontSize: 18,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },
  infoValueLink: {
    color: '#4F46E5',
    textDecorationLine: 'underline',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginHorizontal: -16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  description: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 26,
  },
  tipsCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  tipsIcon: {
    fontSize: 20,
    marginTop: 1,
  },
  tipsText: {
    flex: 1,
    fontSize: 14,
    color: '#92400E',
    lineHeight: 22,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalCloseButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButtonLTR: {
    right: 20,
  },
  modalCloseButtonRTL: {
    left: 20,
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
