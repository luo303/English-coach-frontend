import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';

import { AppPalette } from '@/constants/appPalette';
import { RealtimeControls } from '@/components/practice/RealtimeControls';
import { SpeakingStatus } from '@/components/practice/SpeakingStatus';
import { TranscriptPanel } from '@/components/practice/TranscriptPanel';
import { initialRealtimeScore, mockRealtimeTimeline } from '@/data/practiceMock';
import {
  PracticeSessionState,
  RealtimeHint,
  RealtimeScoreSnapshot,
  Scenario,
  TranscriptTurn,
} from '@/types/practice';

type PracticeScreenProps = {
  scenario: Scenario;
  onEnd: () => void;
};

const statusLabel: Record<PracticeSessionState, string> = {
  assistant_speaking: 'AI 说话中',
  assistant_thinking: 'AI 思考中',
  connecting: '连接中',
  ending: '结束中',
  error: '异常',
  idle: '待开始',
  interrupting: '已打断',
  listening: '监听中',
  report_generating: '生成报告',
  user_speaking: '用户说话',
};

export function PracticeScreen({ scenario, onEnd }: PracticeScreenProps) {
  const [audioLevel, setAudioLevel] = useState(8);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [hints, setHints] = useState<RealtimeHint[]>([]);
  const [latencyMs, setLatencyMs] = useState(238);
  const [partialTurn, setPartialTurn] = useState<TranscriptTurn | null>(null);
  const [score, setScore] = useState<RealtimeScoreSnapshot>(initialRealtimeScore);
  const [status, setStatus] = useState<PracticeSessionState>('connecting');
  const [turns, setTurns] = useState<TranscriptTurn[]>([]);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const elapsedTimer = setInterval(() => {
      setElapsedSec((current) => current + 1);
    }, 1000);

    mockRealtimeTimeline.forEach((step) => {
      const timeoutId = setTimeout(() => {
        setStatus(step.status);

        if (typeof step.audioLevel === 'number') {
          setAudioLevel(step.audioLevel);
        }

        if (typeof step.latencyMs === 'number') {
          setLatencyMs(step.latencyMs);
        }

        if (step.partialTurn) {
          setPartialTurn(step.partialTurn);
        }

        const finalTurn = step.finalTurn;
        if (finalTurn) {
          setTurns((currentTurns) => {
            const withoutSameTurn = currentTurns.filter((turn) => turn.turnId !== finalTurn.turnId);
            return [...withoutSameTurn, finalTurn];
          });
          setPartialTurn((currentPartial) => (currentPartial?.turnId === finalTurn.turnId ? null : currentPartial));
        }

        const hint = step.hint;
        if (hint) {
          setHints((currentHints) => {
            const withoutSameHint = currentHints.filter((currentHint) => currentHint.id !== hint.id);
            return [hint, ...withoutSameHint].slice(0, 3);
          });
        }

        if (step.score) {
          setScore(step.score);
        }
      }, step.delayMs);

      timeoutRefs.current.push(timeoutId);
    });

    return () => {
      clearInterval(elapsedTimer);
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current = [];
    };
  }, []);

  const handleInterrupt = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
    setStatus('interrupting');
    setAudioLevel(28);
    setPartialTurn(null);
    setHints((currentHints) => [
      {
        id: 'hint_interrupt',
        message: '已发送 cancel_ai_speech，本地播放队列已清空。你可以继续补充。',
        severity: 'low',
        title: '已打断 AI',
        type: 'timing',
      },
      ...currentHints,
    ]);
  };

  const handleEnd = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
    setStatus('report_generating');
    setAudioLevel(0);
    setTimeout(onEnd, 550);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ScreenTitle eyebrow={`${scenario.title} · 低延迟通道`} title="实时对话" action="Ⅱ" />

      <View style={styles.connectionCard}>
        <View>
          <Text style={styles.connectionTitle}>WebSocket 语音流</Text>
          <Text style={styles.connectionSubtitle}>mock realtime timeline · {statusLabel[status]}</Text>
        </View>
        <Text style={styles.latency}>{latencyMs}ms</Text>
      </View>

      <TranscriptPanel hints={hints} partialTurn={partialTurn} score={score} turns={turns} />
      <SpeakingStatus elapsedSec={elapsedSec} level={audioLevel} status={status} />
      <RealtimeControls onEnd={handleEnd} onInterrupt={handleInterrupt} status={status} />
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
  connectionCard: {
    alignItems: 'center',
    backgroundColor: AppPalette.card,
    borderColor: AppPalette.line,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    padding: 16,
  },
  connectionTitle: {
    color: AppPalette.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  connectionSubtitle: {
    color: AppPalette.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  latency: {
    color: AppPalette.green,
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '900',
  },
});
