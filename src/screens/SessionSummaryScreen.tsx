import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppPalette } from '@/constants/appPalette';
import { AbilityRadar } from '@/components/feedback/AbilityRadar';
import { SummaryCard } from '@/components/feedback/SummaryCard';
import { summaryMetrics } from '@/data/practiceMock';

type SessionSummaryScreenProps = {
  onPracticeAgain: () => void;
};

const kpis = [
  { label: '平均延迟', value: '221ms' },
  { label: '有效轮次', value: '10' },
  { label: '追问完成', value: '4/5' },
  { label: '复用表达', value: '7' },
];

export function SessionSummaryScreen({ onPracticeAgain }: SessionSummaryScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ScreenTitle eyebrow="会议场景" title="能力报告" action="↗" />
      <SummaryCard />

      <View style={styles.kpiGrid}>
        {kpis.map((item) => (
          <View key={item.label} style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>{item.label}</Text>
            <Text style={styles.kpiValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      <AbilityRadar metrics={summaryMetrics} />

      <View style={styles.nextCard}>
        <Text style={styles.nextTitle}>下一次建议</Text>
        <Text style={styles.nextText}>重点练习 “To reduce the risk...” 和 “My next step is...” 两类推进句。</Text>
      </View>

      <Pressable onPress={onPracticeAgain} style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>复练会议场景</Text>
      </Pressable>
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
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  kpiCard: {
    backgroundColor: AppPalette.card,
    borderColor: AppPalette.line,
    borderRadius: 16,
    borderWidth: 1,
    padding: 15,
    width: '48%',
  },
  kpiLabel: {
    color: AppPalette.muted,
    fontSize: 14,
    marginBottom: 8,
  },
  kpiValue: {
    color: AppPalette.ink,
    fontSize: 22,
    fontWeight: '900',
  },
  nextCard: {
    backgroundColor: AppPalette.greenSoft,
    borderColor: '#BCE7CC',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  nextTitle: {
    color: AppPalette.ink,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 8,
  },
  nextText: {
    color: AppPalette.ink,
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: AppPalette.blue,
    borderRadius: 16,
    justifyContent: 'center',
    marginTop: 18,
    minHeight: 56,
    shadowColor: AppPalette.blue,
    shadowOffset: { height: 14, width: 0 },
    shadowOpacity: 0.24,
    shadowRadius: 24,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
});
