import { StyleSheet, Text, View } from 'react-native';

import { AppPalette } from '@/constants/appPalette';

const selectors = [
  { label: '难度', value: 'B1-B2', active: true },
  { label: '口音', value: '美式', active: false },
  { label: '目标', value: '流利', active: false },
];

export function DifficultySelector() {
  return (
    <View style={styles.selectorRow}>
      {selectors.map((item) => (
        <View key={item.label} style={[styles.segment, item.active && styles.segmentActive]}>
          <Text style={styles.segmentLabel}>{item.label}</Text>
          <Text style={[styles.segmentValue, item.active && styles.segmentValueActive]}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  segment: {
    backgroundColor: AppPalette.card,
    borderColor: AppPalette.line,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  segmentActive: {
    backgroundColor: AppPalette.blueSoft,
    borderColor: '#BFD2FF',
  },
  segmentLabel: {
    color: AppPalette.faint,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  segmentValue: {
    color: AppPalette.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  segmentValueActive: {
    color: AppPalette.blue,
  },
});
