import React, { useLayoutEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { DistanceUnit, useSettings } from '../contexts/SettingsContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const { t, language, languages, setLanguage } = useLanguage();
  const { distanceUnit, setDistanceUnit } = useSettings();
  const isRTL = language.isRTL;

  useLayoutEffect(() => {
    navigation.setOptions({ title: t.settings.title });
  }, [navigation, t]);

  const distanceOptions: { value: DistanceUnit; label: string }[] = [
    { value: 'km', label: t.settings.km },
    { value: 'mi', label: t.settings.mi },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={{ direction: isRTL ? 'rtl' : 'ltr' }} contentContainerStyle={styles.content}>
        {/* Language */}
        <Text style={styles.sectionTitle}>{t.settings.language}</Text>
        <View style={styles.optionGroup}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[styles.optionRow, language.code === lang.code && styles.optionRowSelected]}
              onPress={() => setLanguage(lang.code)}
              activeOpacity={0.7}
            >
              <View style={styles.optionLabelGroup}>
                <Text style={styles.optionPrimary}>{lang.nativeName}</Text>
                <Text style={styles.optionSecondary}>{t.languageNames[lang.code]}</Text>
              </View>
              {language.code === lang.code && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Distance unit */}
        <Text style={styles.sectionTitle}>{t.settings.distanceUnit}</Text>
        <View style={styles.optionGroup}>
          {distanceOptions.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.optionRow, distanceUnit === opt.value && styles.optionRowSelected]}
              onPress={() => setDistanceUnit(opt.value)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionPrimary}>{opt.label}</Text>
              {distanceUnit === opt.value && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
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
  content: {
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  optionGroup: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
  },
  optionRowSelected: {
    backgroundColor: '#EEF2FF',
  },
  optionLabelGroup: {
    gap: 2,
  },
  optionPrimary: {
    fontSize: 16,
    color: '#1A1A2E',
  },
  optionSecondary: {
    fontSize: 13,
    color: '#666',
  },
  checkmark: {
    fontSize: 16,
    color: '#2C3E8C',
    fontWeight: '700',
  },
});
