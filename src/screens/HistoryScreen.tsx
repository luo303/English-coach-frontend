import { SearchField } from 'heroui-native';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView } from 'react-native';

import { fetchPracticeSessions } from '@/clients/practiceSessionClient';
import { ScoreTrend } from '@/components/feedback/ScoreTrend';
import { CardSkeletons, EmptyState, ScreenHeader } from '@/components/ui/AppLayout';
import { AppPalette } from '@/constants/appPalette';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useAuthStore } from '@/state/authStore';
import { PracticeSessionRecord } from '@/types/api';
import { HistoryRecord } from '@/types/practice';
import { debugLog } from '@/utils/debugLog';

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const rest = Math.floor(seconds % 60)
    .toString()
    .padStart(2, '0');
  return `${minutes}:${rest}`;
}

function toHistoryRecord(session: PracticeSessionRecord): HistoryRecord {
  return {
    delta: session.status,
    expression: session.turnCount,
    score: Math.round(session.overallScore ?? 0),
    time: formatDuration(session.durationSeconds),
    title: session.scenarioId,
  };
}

export function HistoryScreen() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [sessions, setSessions] = useState<PracticeSessionRecord[]>([]);
  const records = useMemo(() => {
    const nextRecords = sessions.map(toHistoryRecord);
    if (!searchValue.trim()) {
      return nextRecords;
    }
    return nextRecords.filter((record) => record.title.toLowerCase().includes(searchValue.trim().toLowerCase()));
  }, [searchValue, sessions]);
  useErrorToast({ message: error, title: '历史加载失败' });

  useEffect(() => {
    if (!accessToken) {
      setError('请先登录后查看历史会话。');
      setIsLoading(false);
      setSessions([]);
      return;
    }

    let cancelled = false;
    setError(null);
    setIsLoading(true);
    debugLog('HISTORY', 'load sessions start');

    void fetchPracticeSessions(accessToken)
      .then((response) => {
        if (!cancelled) {
          debugLog('HISTORY', 'load sessions success', {
            count: response.content.length,
            page: response.number,
            size: response.size,
            totalElements: response.totalElements,
          });
          setSessions(response.content);
          setIsLoading(false);
        }
      })
      .catch((nextError) => {
        if (!cancelled) {
          debugLog('HISTORY', 'load sessions failed', {
            message: nextError instanceof Error ? nextError.message : String(nextError),
          });
          setError(nextError instanceof Error ? nextError.message : '加载历史会话失败。');
          setIsLoading(false);
          setSessions([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  return (
    <ScrollView
      className="bg-background"
      contentContainerStyle={{ paddingBottom: 112, paddingHorizontal: 20, paddingTop: 20 }}
      contentContainerClassName="px-5 pt-5 pb-28"
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: AppPalette.background, flex: 1 }}
    >
      <ScreenHeader eyebrow="复盘" title="练习记录" subtitle="按场景回看每次对话的分数、时长和轮次。" />

      <SearchField value={searchValue} onChange={setSearchValue} className="mb-5">
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="搜索场景或会话" />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      {isLoading && sessions.length === 0 ? (
        <>
          <EmptyState title="还没有记录" />
          <CardSkeletons />
        </>
      ) : null}
      {!isLoading && sessions.length > 0 && records.length === 0 ? (
        <EmptyState title="没有匹配结果" />
      ) : null}

      {records.map((record, index) => (
        <ScoreTrend key={`${record.title}-${index}`} record={record} />
      ))}
    </ScrollView>
  );
}
