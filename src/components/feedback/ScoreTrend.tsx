import { StyleSheet, Text, View } from 'react-native';

import { AppPalette } from '@/constants/appPalette';
import { HistoryRecord } from '@/types/practice';

type ScoreTrendProps = {
  record: HistoryRecord;
};

export function ScoreTrend({ record }: ScoreTrendProps) {
  return (
    <View style={styles.historyCard}>
      <View style={styles.historyTop}>
        <Text style={styles.historyTitle}>{record.title}</Text>
        <Text style={styles.deltaBadge}>{record.delta}</Text>
      </View>
      <View style={styles.historyStats}>
        <HistoryStat label="总分" value={String(record.score)} />
        <HistoryStat label="时长" value={record.time} />
        <HistoryStat label="表达" value={String(record.expression)} />
      </View>
    </View>
  );
}

function HistoryStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.historyStat}>
      <Text style={styles.historyStatLabel}>{label}</Text>
      <Text style={styles.historyStatValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  historyCard: {
    backgroundColor: AppPalette.card,
    borderColor: AppPalette.line,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 13,
    padding: 16,
  },
  historyTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  historyTitle: {
    color: AppPalette.ink,
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
  },
  deltaBadge: {
    backgroundColor: AppPalette.blueSoft,
    borderColor: '#C8D8FF',
    borderRadius: 999,
    borderWidth: 1,
    color: AppPalette.blue,
    fontSize: 13,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  historyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyStat: {
    minWidth: 70,
  },
  historyStatLabel: {
    color: AppPalette.muted,
    fontSize: 13,
    marginBottom: 5,
  },
  historyStatValue: {
    color: AppPalette.ink,
    fontSize: 16,
    fontWeight: '800',
  },
});
