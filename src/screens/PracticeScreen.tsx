import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { createPracticeSession, endPracticeSession } from '@/clients/practiceSessionClient';
import { RealtimeClient } from '@/clients/realtimeClient';
import { AppPalette } from '@/constants/appPalette';
import { ApiRuntimeConfig } from '@/config/runtime';
import { RealtimeControls } from '@/components/practice/RealtimeControls';
import { SpeakingStatus } from '@/components/practice/SpeakingStatus';
import { TranscriptPanel } from '@/components/practice/TranscriptPanel';
import { useAuthStore } from '@/state/authStore';
import { useSessionStore } from '@/state/sessionStore';
import { Scenario } from '@/types/practice';
import { PracticeSessionState } from '@/types/realtime';

type PracticeScreenProps = {
  scenario: Scenario;
  onEnd: (sessionId: string | null) => void;
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
  const connectionStatus = useSessionStore((state) => state.connectionStatus);
  const partialTurn = useSessionStore((state) => state.partialTurn);
  const score = useSessionStore((state) => state.score);
  const sessionId = useSessionStore((state) => state.sessionId);
  const status = useSessionStore((state) => state.status);
  const turns = useSessionStore((state) => state.turns);
  const accessToken = useAuthStore((state) => state.accessToken);
  const activeSessionIdRef = useRef<string | null>(null);
  const realtimeClientRef = useRef<RealtimeClient | null>(null);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRefs = useRef<ReturnType<typeof setInterval>[]>([]);

  useEffect(() => {
    let cancelled = false;
    activeSessionIdRef.current = null;

    dispatchRealtimeEvent({
      payload: {
        scenario,
        sessionId: `session_${Date.now()}`,
      },
      type: 'local.reset_session',
    });

    const elapsedTimer = setInterval(() => {
      dispatchRealtimeEvent({
        type: 'local.tick',
      });
    }, 1000);
    intervalRefs.current.push(elapsedTimer);

    if (!accessToken) {
      dispatchRealtimeEvent({
        payload: {
          recoverable: false,
          code: 'missing_access_token',
          message: '请先完成真实登录，再进入实时练习。',
        },
        serverSeq: 1,
        sessionId: `session_${Date.now()}`,
        type: 'error',
      });
      return () => {
        cancelled = true;
        intervalRefs.current.forEach(clearInterval);
        intervalRefs.current = [];
        timerRefs.current.forEach(clearTimeout);
        timerRefs.current = [];
        realtimeClientRef.current?.close();
        realtimeClientRef.current = null;
      };
    }

    void (async () => {
      try {
        const session = await createPracticeSession(accessToken, {
          correctionMode: scenario.correctionMode,
          personaId: scenario.defaultPersonaId,
          scenarioId: scenario.id,
        });

        if (cancelled) {
          return;
        }

        activeSessionIdRef.current = session.sessionId;
        dispatchRealtimeEvent({
          payload: {
            scenario,
            sessionId: session.sessionId,
          },
          type: 'local.reset_session',
        });

        const client = new RealtimeClient({
          onEvent: dispatchRealtimeEvent,
          onStatusChange: (connectionStatus) => {
            dispatchRealtimeEvent({
              payload: {
                status: connectionStatus,
              },
              type: 'local.connection_status',
            });
          },
          sessionId: session.sessionId,
          token: accessToken,
        });

        realtimeClientRef.current = client;
        client.connect();

        const pingTimer = setInterval(() => {
          client.send({
            clientSeq: Date.now(),
            payload: {
              clientTime: new Date().toISOString(),
            },
            sessionId: session.sessionId,
            type: 'ping',
          });
        }, 8000);
        intervalRefs.current.push(pingTimer);
      } catch (error) {
        if (cancelled) {
          return;
        }

        dispatchRealtimeEvent({
          payload: {
            recoverable: false,
            code: 'practice_session_create_failed',
            message: error instanceof Error ? error.message : '创建练习会话失败。',
          },
          serverSeq: 2,
          sessionId: `session_${Date.now()}`,
          type: 'error',
        });
      }
    })();

    return () => {
      cancelled = true;
      intervalRefs.current.forEach(clearInterval);
      intervalRefs.current = [];
      timerRefs.current.forEach(clearTimeout);
      timerRefs.current = [];
      realtimeClientRef.current?.close();
      realtimeClientRef.current = null;
    };
  }, [accessToken, dispatchRealtimeEvent, scenario]);

  const handleInterrupt = () => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
    const activeSessionId = activeSessionIdRef.current;
    if (activeSessionId) {
      realtimeClientRef.current?.send({
        clientSeq: Date.now(),
        payload: {
          action: 'cancel_ai_speech',
        },
        sessionId: activeSessionId,
        type: 'session_control',
      });
    }
    dispatchRealtimeEvent({
      type: 'local.cancel_ai_speech',
    });
  };

  const handleEnd = async () => {
    const activeSessionId = activeSessionIdRef.current;
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
    intervalRefs.current.forEach(clearInterval);
    intervalRefs.current = [];
    if (activeSessionId) {
      realtimeClientRef.current?.send({
        clientSeq: Date.now(),
        payload: {
          action: 'end',
        },
        sessionId: activeSessionId,
        type: 'session_control',
      });
    }

    if (accessToken && activeSessionId) {
      try {
        await endPracticeSession(accessToken, activeSessionId);
      } catch {
        // Keep the UI moving even if the closeout call fails.
      }
    }

    dispatchRealtimeEvent({
      payload: {
        reason: 'tap_stop',
        status: 'report_generating',
      },
      serverSeq: 999,
      sessionId: activeSessionId ?? sessionId ?? '',
      type: 'session_state',
    });
    dispatchRealtimeEvent({
      payload: {
        level: 0,
      },
      type: 'local.audio_level',
    });
    realtimeClientRef.current?.close();
    setTimeout(() => onEnd(activeSessionId), 550);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <ScreenTitle eyebrow={`${scenario.title} · 低延迟通道`} title="实时对话" action="Ⅱ" />

      <View style={styles.connectionCard}>
        <View>
          <Text style={styles.connectionTitle}>WebSocket 语音流</Text>
          <Text style={styles.connectionSubtitle}>
            {ApiRuntimeConfig.realtimeWsBaseUrl} · {statusLabel[status]} · {connectionStatus}
          </Text>
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
