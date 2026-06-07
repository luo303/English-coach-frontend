import { useEffect, useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AudioApiRealtimePlayer } from '@/audio/player';
import { AudioApiRealtimeRecorder } from '@/audio/recorder';
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
import { debugLog } from '@/utils/debugLog';

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
  const playbackQueue = useSessionStore((state) => state.playbackQueue);
  const score = useSessionStore((state) => state.score);
  const sessionId = useSessionStore((state) => state.sessionId);
  const status = useSessionStore((state) => state.status);
  const turns = useSessionStore((state) => state.turns);
  const accessToken = useAuthStore((state) => state.accessToken);
  const activeSessionIdRef = useRef<string | null>(null);
  const audioSeqRef = useRef(0);
  const playedAudioIdsRef = useRef<Set<string>>(new Set());
  const playerRef = useRef<AudioApiRealtimePlayer | null>(null);
  const recorderRef = useRef<AudioApiRealtimeRecorder | null>(null);
  const realtimeClientRef = useRef<RealtimeClient | null>(null);
  const statusRef = useRef<PracticeSessionState>(status);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRefs = useRef<ReturnType<typeof setInterval>[]>([]);
  const lastAudioFrameLogAtRef = useRef(0);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    debugLog('UI', 'transcript state', {
      partialTurn: partialTurn
        ? {
            isFinal: partialTurn.isFinal,
            speaker: partialTurn.speaker,
            text: partialTurn.text,
            textLength: partialTurn.text.length,
            turnId: partialTurn.turnId,
          }
        : null,
      sessionId,
      status,
      turnCount: turns.length,
      turns: turns.slice(-3).map((turn) => ({
        isFinal: turn.isFinal,
        speaker: turn.speaker,
        text: turn.text,
        textLength: turn.text.length,
        turnId: turn.turnId,
      })),
    });
  }, [partialTurn, sessionId, status, turns]);

  useEffect(() => {
    if (!playerRef.current) {
      playerRef.current = new AudioApiRealtimePlayer();
    }

    for (const chunk of playbackQueue) {
      if (playedAudioIdsRef.current.has(chunk.id) || !chunk.audioBase64 || chunk.format !== 'pcm16') {
        continue;
      }

      playedAudioIdsRef.current.add(chunk.id);
      debugLog('AUDIO', 'enqueue playback chunk', {
        audioBase64Length: chunk.audioBase64.length,
        id: chunk.id,
        sampleRate: chunk.sampleRate,
        sessionId,
        turnId: chunk.turnId,
      });
      void playerRef.current.enqueuePcm16(chunk.audioBase64, chunk.sampleRate).catch((error) => {
        dispatchRealtimeEvent({
          payload: {
            code: 'audio_playback_failed',
            message: error instanceof Error ? error.message : '播放 AI 音频失败。',
            recoverable: true,
          },
          type: 'local.error',
        });
        debugLog('AUDIO', 'playback failed', {
          message: error instanceof Error ? error.message : String(error),
          sessionId: sessionId ?? activeSessionIdRef.current,
        });
      });
    }
  }, [dispatchRealtimeEvent, playbackQueue, sessionId]);

  useEffect(() => {
    let cancelled = false;
    activeSessionIdRef.current = null;
    audioSeqRef.current = 0;
    lastAudioFrameLogAtRef.current = 0;
    playedAudioIdsRef.current.clear();
    debugLog('PRACTICE', 'prepare session', {
      correctionMode: scenario.correctionMode,
      personaId: scenario.defaultPersonaId,
      scenarioId: scenario.id,
    });

    dispatchRealtimeEvent({
      payload: {
        scenario,
      },
      type: 'local.prepare_session',
    });

    const elapsedTimer = setInterval(() => {
      dispatchRealtimeEvent({
        type: 'local.tick',
      });
    }, 1000);
    intervalRefs.current.push(elapsedTimer);

    if (!accessToken) {
      debugLog('PRACTICE', 'missing access token');
      dispatchRealtimeEvent({
        payload: {
          recoverable: false,
          code: 'missing_access_token',
          message: '请先完成真实登录，再进入实时练习。',
        },
        type: 'local.error',
      });
      return () => {
        cancelled = true;
        intervalRefs.current.forEach(clearInterval);
        intervalRefs.current = [];
        timerRefs.current.forEach(clearTimeout);
        timerRefs.current = [];
        void recorderRef.current?.stop();
        recorderRef.current = null;
        void playerRef.current?.close();
        playerRef.current = null;
        realtimeClientRef.current?.close();
        realtimeClientRef.current = null;
      };
    }

    void (async () => {
      try {
        debugLog('PRACTICE', 'create session start', {
          correctionMode: 'realtime',
          personaId: scenario.defaultPersonaId,
          scenarioId: scenario.id,
        });
        const session = await createPracticeSession(accessToken, {
          correctionMode: 'realtime',
          personaId: scenario.defaultPersonaId,
          scenarioId: scenario.id,
        });

        if (cancelled) {
          return;
        }

        activeSessionIdRef.current = session.sessionId;
        debugLog('PRACTICE', 'create session success', {
          reportStatus: session.reportStatus,
          sessionId: session.sessionId,
          status: session.status,
        });
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
            debugLog('PRACTICE', 'connection status', {
              connectionStatus,
              sessionId: session.sessionId,
            });
            dispatchRealtimeEvent({
              payload: {
                status: connectionStatus,
              },
              type: 'local.connection_status',
            });

            if (connectionStatus === 'connected' && !recorderRef.current) {
              const recorder = new AudioApiRealtimeRecorder();
              recorderRef.current = recorder;
              debugLog('AUDIO', 'recorder start requested', {
                sessionId: session.sessionId,
              });
              void recorder.start((frame) => {
                const activeSessionId = activeSessionIdRef.current;

                dispatchRealtimeEvent({
                  payload: {
                    level: frame.level,
                  },
                  type: 'local.audio_level',
                });

                if (!activeSessionId) {
                  return;
                }

                if (statusRef.current === 'assistant_speaking') {
                  const now = Date.now();
                  if (now - lastAudioFrameLogAtRef.current > 2000) {
                    lastAudioFrameLogAtRef.current = now;
                    debugLog('AUDIO', 'skip mic frame while assistant speaking', {
                      level: frame.level,
                      sampleRate: frame.sampleRate,
                      sessionId: activeSessionId,
                    });
                  }
                  return;
                }

                audioSeqRef.current += 1;
                const now = Date.now();
                if (now - lastAudioFrameLogAtRef.current > 2000) {
                  lastAudioFrameLogAtRef.current = now;
                  debugLog('AUDIO', 'capturing pcm frames', {
                    audioBase64Length: frame.audioBase64.length,
                    level: frame.level,
                    sampleRate: frame.sampleRate,
                    seq: audioSeqRef.current,
                    sessionId: activeSessionId,
                  });
                }
                realtimeClientRef.current?.send({
                  payload: {
                    data: frame.audioBase64,
                    format: 'pcm16',
                    sampleRate: 16000,
                    turnClientId: `${activeSessionId}-${audioSeqRef.current}`,
                  },
                  type: 'audio_chunk',
                });
              }).catch((error) => {
                recorderRef.current = null;
                debugLog('AUDIO', 'recorder start failed', {
                  message: error instanceof Error ? error.message : String(error),
                  sessionId: session.sessionId,
                });
                dispatchRealtimeEvent({
                  payload: {
                    code: 'microphone_start_failed',
                    message: error instanceof Error ? error.message : '无法启动麦克风。',
                    recoverable: false,
                  },
                  type: 'local.error',
                });
              });
            }
          },
          sessionId: session.sessionId,
          token: accessToken,
        });

        realtimeClientRef.current = client;
        client.connect();

        const pingTimer = setInterval(() => {
          client.send({
            payload: {
              clientTime: new Date().toISOString(),
            },
            type: 'ping',
          });
        }, 8000);
        intervalRefs.current.push(pingTimer);
      } catch (error) {
        if (cancelled) {
          return;
        }

        debugLog('PRACTICE', 'create session failed', {
          message: error instanceof Error ? error.message : String(error),
        });
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
      void recorderRef.current?.stop();
      recorderRef.current = null;
      void playerRef.current?.close();
      playerRef.current = null;
      realtimeClientRef.current?.close();
      realtimeClientRef.current = null;
    };
  }, [accessToken, dispatchRealtimeEvent, scenario]);

  const handleInterrupt = () => {
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
    const activeSessionId = activeSessionIdRef.current;
    if (activeSessionId) {
      debugLog('PRACTICE', 'interrupt requested', {
        sessionId: activeSessionId,
      });
    }
    playerRef.current?.clearQueue();
    dispatchRealtimeEvent({
      type: 'local.cancel_ai_speech',
    });
  };

  const handleEnd = async () => {
    const activeSessionId = activeSessionIdRef.current;
    debugLog('PRACTICE', 'end requested', {
      sessionId: activeSessionId,
    });
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
    intervalRefs.current.forEach(clearInterval);
    intervalRefs.current = [];
    void recorderRef.current?.stop();
    recorderRef.current = null;
    playerRef.current?.clearQueue();
    if (activeSessionId) {
      debugLog('PRACTICE', 'send ws end control', {
        sessionId: activeSessionId,
      });
      realtimeClientRef.current?.send({
        payload: {
          action: 'end',
        },
        type: 'session_control',
      });
    }

    if (accessToken && activeSessionId) {
      try {
        debugLog('PRACTICE', 'rest end session start', {
          sessionId: activeSessionId,
        });
        await endPracticeSession(accessToken, activeSessionId);
        debugLog('PRACTICE', 'rest end session success', {
          sessionId: activeSessionId,
        });
      } catch {
        debugLog('PRACTICE', 'rest end session failed', {
          sessionId: activeSessionId,
        });
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
