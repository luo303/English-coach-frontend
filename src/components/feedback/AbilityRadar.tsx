import { StyleSheet, Text, View } from 'react-native';

import { AppPalette } from '@/constants/appPalette';
import { Metric } from '@/types/practice';

type AbilityRadarProps = {
  metrics: Metric[];
};

export function AbilityRadar({ metrics }: AbilityRadarProps) {
  return (
    <View style={styles.metricPanel}>
      {metrics.map((metric) => (
        <View key={metric.label} style={styles.metricRow}>
          <View style={styles.metricLabelRow}>
            <Text style={styles.metricLabel}>{metric.label}</Text>
            <Text style={styles.metricValue}>{metric.value}</Text>
          </View>
          <View style={styles.metricTrack}>
            <View style={[styles.metricFill, { width: `${metric.value}%` }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  metricPanel: {
    gap: 14,
    marginBottom: 16,
  },
  metricRow: {
    gap: 7,
  },
  metricLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricLabel: {
    color: AppPalette.muted,
    fontSize: 15,
    fontWeight: '700',
  },
  metricValue: {
    color: AppPalette.muted,
    fontSize: 15,
    fontWeight: '900',
  },
  metricTrack: {
    backgroundColor: '#DDE3EC',
    borderRadius: 999,
    height: 10,
    overflow: 'hidden',
  },
  metricFill: {
    backgroundColor: AppPalette.blue,
    borderRadius: 999,
    height: '100%',
  },
});
