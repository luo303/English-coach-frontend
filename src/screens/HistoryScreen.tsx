import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppPalette } from '@/constants/appPalette';
import { ScoreTrend } from '@/components/feedback/ScoreTrend';
import { historyRecords } from '@/data/practiceMock';

export function HistoryScreen() {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ScreenTitle eyebrow="训练资产" title="历史复盘" action="≡" />

      <View style={styles.filterRow}>
        <Text style={styles.filterInput}>筛选会议 / 面试 / 点餐</Text>
        <Pressable style={styles.clearButton}>
          <Text style={styles.clearButtonText}>清除</Text>
        </Pressable>
      </View>

      {historyRecords.map((record) => (
        <ScoreTrend key={record.title} record={record} />
      ))}
    </ScrollView>
  );
}

function ScreenTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action: string }) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.eyebrow}>{eyebrow}</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      <Pressable accessibilityRole="button" style={styles.headerAction}>
        <Text style={styles.headerActionText}>{action}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 92,
    paddingHorizontal: 22,
    paddingTop: 20,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  eyebrow: {
    color: AppPalette.muted,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0,
  },
  title: {
    color: AppPalette.ink,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0,
    lineHeight: 34,
  },
  headerAction: {
    alignItems: 'center',
    backgroundColor: AppPalette.card,
    borderColor: AppPalette.line,
    borderRadius: 12,
    borderWidth: 1,
    height: 46,
    justifyContent: 'center',
    shadowColor: '#B8C2D6',
    shadowOffset: { height: 10, width: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    width: 46,
  },
  headerActionText: {
    color: AppPalette.ink,
    fontSize: 19,
    fontWeight: '900',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  filterInput: {
    backgroundColor: AppPalette.card,
    borderColor: AppPalette.line,
    borderRadius: 16,
    borderWidth: 1,
    color: AppPalette.muted,
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  clearButton: {
    alignItems: 'center',
    backgroundColor: AppPalette.card,
    borderColor: AppPalette.line,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  clearButtonText: {
    color: AppPalette.ink,
    fontSize: 16,
    fontWeight: '900',
  },
});
