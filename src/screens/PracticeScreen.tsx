import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';

import { AppPalette } from '@/constants/appPalette';
import { RealtimeControls } from '@/components/practice/RealtimeControls';
import { SpeakingStatus } from '@/components/practice/SpeakingStatus';
import { TranscriptPanel } from '@/components/practice/TranscriptPanel';
import { mockRealtimeTimeline } from '@/data/practiceMock';
import { useSessionStore } from '@/state/sessionStore';
import { Scenario } from '@/types/practice';
import { PracticeSessionState } from '@/types/realtime';

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
  summary_ready: '报告已生成',
  user_speaking: '用户说话',
};

export function PracticeScreen({ scenario, onEnd }: PracticeScreenProps) {
  const audioLevel = useSessionStore((state) => state.audioLevel);
  const dispatchRealtimeEvent = useSessionStore((state) => state.dispatchRealtimeEvent);
  const elapsedSec = useSessionStore((state) => state.elapsedSec);
  const hints = useSessionStore((state) => state.hints);
  const latencyMs = useSessionStore((state) => state.latencyMs);
  const partialTurn = useSessionStore((state) => state.partialTurn);
  const score = useSessionStore((state) => state.score);
  const sessionId = useSessionStore((state) => state.sessionId);
  const status = useSessionStore((state) => state.status);
  const turns = useSessionStore((state) => state.turns);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    dispatchRealtimeEvent({
      payload: {
        scenario,
        sessionId: 'mock_session_001',
      },
      type: 'local.reset_session',
    });

    const elapsedTimer = setInterval(() => {
      dispatchRealtimeEvent({
        type: 'local.tick',
      });
    }, 1000);

    mockRealtimeTimeline.forEach((step) => {
      const timeoutId = setTimeout(() => {
        dispatchRealtimeEvent(step.event);
      }, step.delayMs);

      timeoutRefs.current.push(timeoutId);
    });

    return () => {
      clearInterval(elapsedTimer);
      timeoutRefs.current.forEach(clearTimeout);
      timeoutRefs.current = [];
    };
  }, [dispatchRealtimeEvent, scenario]);

  const handleInterrupt = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
    dispatchRealtimeEvent({
      type: 'local.cancel_ai_speech',
    });
  };

  const handleEnd = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
    dispatchRealtimeEvent({
      payload: {
        reason: 'user_tap_end',
        status: 'report_generating',
      },
      serverSeq: 999,
      sessionId: sessionId ?? 'mock_session_001',
      type: 'session_state',
    });
    dispatchRealtimeEvent({
      payload: {
        level: 0,
      },
      type: 'local.audio_level',
    });
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
