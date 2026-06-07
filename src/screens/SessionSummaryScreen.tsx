import { Button, Card, Skeleton, Typography as Text } from 'heroui-native';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { fetchPracticeSession, fetchPracticeSessionTurns } from '@/clients/practiceSessionClient';
import { fetchReport } from '@/clients/reportClient';
import { AbilityRadar } from '@/components/feedback/AbilityRadar';
import { SummaryCard } from '@/components/feedback/SummaryCard';
import { MetricCard, ScreenHeader } from '@/components/ui/AppLayout';
import { AppPalette } from '@/constants/appPalette';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useAuthStore } from '@/state/authStore';
import { PracticeSessionRecord, PracticeSessionTurnRecord, ReportRecord } from '@/types/api';
import { Metric } from '@/types/practice';
import { debugLog } from '@/utils/debugLog';

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
    { label: '词汇掌握度', value: Math.round(report.scores.vocabulary) },
    { label: '表达流利度', value: Math.round(report.scores.fluency) },
  ];
}

export function SessionSummaryScreen({ onPracticeAgain, sessionId }: SessionSummaryScreenProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<ReportRecord | null>(null);
  const [session, setSession] = useState<PracticeSessionRecord | null>(null);
  const [turns, setTurns] = useState<PracticeSessionTurnRecord[]>([]);
  useErrorToast({ message: error, title: '报告加载失败' });
  const metrics = useMemo(() => reportMetrics(report), [report]);
  const kpis = useMemo(() => {
    return [
      { label: '平均延迟', value: `${session?.networkLatencyMs ?? 0}ms` },
      { label: '有效轮次', value: String(report?.turnCount ?? session?.turnCount ?? turns.length) },
      { label: '练习时长', value: formatDuration(report?.durationSeconds ?? session?.durationSeconds ?? 0) },
      { label: '问题数量', value: String(report?.mistakes?.length ?? 0) },
    ];
  }, [report, session, turns.length]);
  const nextSuggestion =
    report?.suggestions?.join(' / ') ||
    report?.mistakes?.map((mistake) => `${mistake.correction}: ${mistake.explanation}`).join(' / ') ||
    '暂无后端建议。';

  useEffect(() => {
    if (!accessToken || !sessionId) {
      setError('暂无可查询的真实会话报告。');
      setIsLoading(false);
      setReport(null);
      setSession(null);
      setTurns([]);
      return;
    }

    let cancelled = false;
    setError(null);
    setIsLoading(true);
    debugLog('REPORT', 'load report bundle start', { sessionId });

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
        setIsLoading(false);
        debugLog('REPORT', 'load report bundle success', {
          mistakeCount: nextReport.mistakes?.length ?? 0,
          score: nextReport.overallScore,
          sessionId,
          turnCount: nextTurns.length,
        });
      })
      .catch((nextError) => {
        if (cancelled) {
          return;
        }

        debugLog('REPORT', 'load report bundle failed', {
          message: nextError instanceof Error ? nextError.message : String(nextError),
          sessionId,
        });
        setError(nextError instanceof Error ? nextError.message : '加载报告失败。');
        setIsLoading(false);
        setReport(null);
        setSession(null);
        setTurns([]);
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken, sessionId]);

  return (
    <ScrollView
      className="bg-background"
      contentContainerStyle={{ paddingBottom: 112, paddingHorizontal: 20, paddingTop: 20 }}
      contentContainerClassName="px-5 pt-5 pb-28"
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: AppPalette.background, flex: 1 }}
    >
      <ScreenHeader
        action="报告"
        eyebrow={session?.scenarioId ?? '真实会话'}
        title="本次表现"
        subtitle="先看总分和关键指标，再决定下一次重点练什么。"
      />

      {isLoading && !report ? <ReportSkeleton /> : null}

      {report ? (
        <>
          <SummaryCard
            score={report.overallScore}
            summary={report.suggestions?.join(' / ') || `${report.scenarioName} 完成 ${report.turnCount} 轮练习。`}
            title={report.scenarioName}
          />

          <View className="mb-4 flex-row flex-wrap gap-3">
            {kpis.map((item) => (
              <MetricCard key={item.label} label={item.label} value={item.value} />
            ))}
          </View>

          <AbilityRadar metrics={metrics} />

          <Card className="border border-border bg-success-soft p-4" style={{ borderColor: AppPalette.border, borderRadius: 18 }}>
            <Card.Body className="gap-2">
              <Text className="text-lg font-black text-foreground">下一次建议</Text>
              <Text className="text-base leading-6 text-foreground">{nextSuggestion}</Text>
            </Card.Body>
          </Card>

          <Button className="mt-5" onPress={onPracticeAgain} size="lg" variant="primary">
            重新练习
          </Button>
        </>
      ) : null}
    </ScrollView>
  );
}

function ReportSkeleton() {
  return (
    <>
      <Card
        className="mb-4 border border-border bg-surface p-5"
        style={{ backgroundColor: AppPalette.surface, borderColor: AppPalette.border, borderRadius: 18 }}
      >
        <Card.Body className="gap-4">
          <View className="flex-row items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-2xl" />
            <View className="flex-1">
              <Skeleton className="mb-2 h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-44 rounded-lg" />
            </View>
          </View>
          <Skeleton className="h-5 w-full rounded-lg" />
          <Skeleton className="h-5 w-4/5 rounded-lg" />
        </Card.Body>
      </Card>

      <View className="mb-4 flex-row flex-wrap gap-3">
        {['平均延迟', '有效轮次', '练习时长', '问题数量'].map((label) => (
          <Card
            className="w-[48%] border border-border bg-surface p-4"
            key={label}
            style={{ backgroundColor: AppPalette.surface, borderColor: AppPalette.border, borderRadius: 18 }}
          >
            <Skeleton className="mb-3 h-4 w-20 rounded-md" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </Card>
        ))}
      </View>

      <Card className="mb-4 border border-border bg-surface p-4">
        <Card.Body className="gap-4">
          <Skeleton className="h-6 w-24 rounded-lg" />
          {[0, 1, 2, 3].map((item) => (
            <View className="gap-2" key={item}>
              <View className="flex-row items-center justify-between">
                <Skeleton className="h-5 w-24 rounded-md" />
                <Skeleton className="h-5 w-8 rounded-md" />
              </View>
              <View className="h-2.5 overflow-hidden rounded-full bg-surface-tertiary">
                <Skeleton className="h-full w-full rounded-full" />
              </View>
            </View>
          ))}
        </Card.Body>
      </Card>

      <Card className="border border-border bg-success-soft p-4" style={{ borderColor: AppPalette.border, borderRadius: 18 }}>
        <Card.Body className="gap-2">
          <Skeleton className="h-6 w-24 rounded-lg" />
          <Skeleton className="h-5 w-full rounded-lg" />
          <Skeleton className="h-5 w-5/6 rounded-lg" />
        </Card.Body>
      </Card>

      <Skeleton className="mt-5 h-12 w-full rounded-full" />
    </>
  );
}
