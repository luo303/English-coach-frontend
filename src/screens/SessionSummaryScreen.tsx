import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { fetchPracticeSession, fetchPracticeSessionTurns } from '@/clients/practiceSessionClient';
import { fetchReport } from '@/clients/reportClient';
import { AppPalette } from '@/constants/appPalette';
import { AbilityRadar } from '@/components/feedback/AbilityRadar';
import { SummaryCard } from '@/components/feedback/SummaryCard';
import { useAuthStore } from '@/state/authStore';
import { PracticeSessionRecord, PracticeSessionTurnRecord, ReportRecord } from '@/types/api';
import { Metric } from '@/types/practice';

type SessionSummaryScreenProps = {
  sessionId: string | null;
  onPracticeAgain: () => void;
};

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const rest = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${rest}`;
}

function reportMetrics(report: ReportRecord | null): Metric[] {
  if (!report) {
    return [];
  }

  return [
    { label: '发音清晰度', value: Math.round(report.scores.pronunciation) },
    { label: '语法准确度', value: Math.round(report.scores.grammar) },
    { label: '场景完成度', value: Math.round(report.scores.scenarioCompletion) },
    { label: '流利度', value: Math.round(report.scores.fluency) },
  ];
}

export function SessionSummaryScreen({ onPracticeAgain, sessionId }: SessionSummaryScreenProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportRecord | null>(null);
  const [session, setSession] = useState<PracticeSessionRecord | null>(null);
  const [turns, setTurns] = useState<PracticeSessionTurnRecord[]>([]);
  const metrics = useMemo(() => reportMetrics(report), [report]);
  const kpis = useMemo(() => {
    return [
      { label: '平均延迟', value: `${session?.networkLatencyMs ?? 0}ms` },
      { label: '有效轮次', value: String(report?.turnCount ?? session?.turnCount ?? turns.length) },
      { label: '练习时长', value: formatDuration(report?.durationSeconds ?? session?.durationSeconds ?? 0) },
      { label: '问题数量', value: String(report?.issueCount ?? 0) },
    ];
  }, [report, session, turns.length]);
  const nextSuggestion =
    report?.recommendedSentences?.join(' / ') ||
    report?.nextTopics?.map((topic) => `${topic.title}: ${topic.reason}`).join(' / ') ||
    '暂无后端建议。';

  useEffect(() => {
    if (!accessToken || !sessionId) {
      setError('暂无可查询的真实会话报告。');
      setReport(null);
      setSession(null);
      setTurns([]);
      return;
    }

    let cancelled = false;
    setError(null);

    void Promise.all([
      fetchReport(accessToken, sessionId),
      fetchPracticeSession(accessToken, sessionId),
      fetchPracticeSessionTurns(accessToken, sessionId),
    ])
      .then(([nextReport, nextSession, nextTurns]) => {
        if (cancelled) {
          return;
        }

        setReport(nextReport);
        setSession(nextSession);
        setTurns(nextTurns);
      })
      .catch((nextError) => {
        if (cancelled) {
          return;
        }

        setError(nextError instanceof Error ? nextError.message : '加载报告失败。');
        setReport(null);
        setSession(null);
        setTurns([]);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, sessionId]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ScreenTitle eyebrow={session?.scenarioId ?? '真实会话'} title="能力报告" action="↗" />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {!error && !report ? <Text style={styles.emptyText}>正在从后端加载报告...</Text> : null}

      {report ? (
        <SummaryCard
          score={report.overallScore}
          summary={report.summary}
          title={report.status === 'completed' ? '报告已完成' : '报告生成中'}
        />
      ) : null}

      <View style={styles.kpiGrid}>
        {kpis.map((item) => (
          <View key={item.label} style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>{item.label}</Text>
            <Text style={styles.kpiValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      <AbilityRadar metrics={metrics} />

      <View style={styles.nextCard}>
        <Text style={styles.nextTitle}>下一次建议</Text>
        <Text style={styles.nextText}>{nextSuggestion}</Text>
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
  emptyText: {
    color: AppPalette.muted,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  errorText: {
    color: AppPalette.red,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 12,
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
