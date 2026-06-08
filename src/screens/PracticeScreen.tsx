import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Chip, Surface, Typography } from 'heroui-native';
import { View } from 'react-native';

import { AudioApiRealtimePlayer } from '@/audio/player';
import { AudioApiRealtimeRecorder } from '@/audio/recorder';
import { createPracticeSession, endPracticeSession } from '@/clients/practiceSessionClient';
import { RealtimeClient } from '@/clients/realtimeClient';
import { RealtimeControls } from '@/components/practice/RealtimeControls';
import { TranscriptPanel } from '@/components/practice/TranscriptPanel';
import { AppPalette } from '@/constants/appPalette';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useAuthStore } from '@/state/authStore';
import { useSessionStore } from '@/state/sessionStore';
import { Scenario } from '@/types/practice';
import { PracticeSessionState, RealtimeReducerEvent } from '@/types/realtime';
import { debugLog } from '@/utils/debugLog';

type PracticeScreenProps = {
  scenario: Scenario;
  onEnd: (sessionId: string | null) => void;
};

const statusLabel: Record<PracticeSessionState, string> = {
  assistant_speaking: 'AI 说话中',
  assistant_thinking: 'AI 思考中',
  completed: '已完成',
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

const callRoom = {
  background: '#06110F',
  border: '#21342F',
  ink: '#F4FBF8',
  muted: '#9FB8B0',
  panel: '#0B1714',
  panelSoft: '#10211D',
};

export function PracticeScreen({ scenario, onEnd }: PracticeScreenProps) {
  const dispatchRealtimeEvent = useSessionStore((state) => state.dispatchRealtimeEvent);
  const hints = useSessionStore((state) => state.hints);
  const latencyMs = useSessionStore((state) => state.latencyMs);
  const connectionStatus = useSessionStore((state) => state.connectionStatus);
  const latestSystemHint = hints.find((hint) => hint.type === 'system') ?? null;
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
  const turnClientIdRef = useRef<string | null>(null);
  const turnIndexRef = useRef(1);
  const timerRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const intervalRefs = useRef<ReturnType<typeof setInterval>[]>([]);
  const lastAudioFrameLogAtRef = useRef(0);
  useErrorToast({ message: latestSystemHint?.message, title: latestSystemHint?.title ?? '实时链路异常' });

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
    turnClientIdRef.current = null;
    turnIndexRef.current = 1;
    debugLog('PRACTICE', 'prepare session', {
      correctionMode: scenario.correctionMode,
      personaId: scenario.defaultPersonaId,
      scenarioId: scenario.id,
    });

    dispatchRealtimeEvent({
      payload: { scenario },
      type: 'local.prepare_session',
    });

    const elapsedTimer = setInterval(() => {
      dispatchRealtimeEvent({ type: 'local.tick' });
    }, 1000);
    intervalRefs.current.push(elapsedTimer);

    if (!accessToken) {
      debugLog('PRACTICE', 'missing access token');
      dispatchRealtimeEvent({
        payload: {
          recoverable: false,
          code: 'missing_access_token',
          message: '请先完成登录，再进入实时练习。',
        },
        type: 'local.error',
      });
      return () => {
        cancelled = true;
        cleanupRealtimeResources(intervalRefs, timerRefs, recorderRef, playerRef, realtimeClientRef);
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
        turnClientIdRef.current = createTurnClientId(session.sessionId, turnIndexRef.current);
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

        const handleRealtimeEvent = (event: RealtimeReducerEvent) => {
          dispatchRealtimeEvent(event);

          if (event.type === 'transcript_final' && event.payload.speaker === 'user') {
            turnIndexRef.current += 1;
            turnClientIdRef.current = createTurnClientId(session.sessionId, turnIndexRef.current);
            debugLog('PRACTICE', 'rotate turn client id after user transcript final', {
              nextTurnClientId: turnClientIdRef.current,
              sessionId: session.sessionId,
              turnId: event.payload.turnId,
            });
          }
        };

        const client = new RealtimeClient({
          onEvent: handleRealtimeEvent,
          onStatusChange: (nextConnectionStatus) => {
            debugLog('PRACTICE', 'connection status', {
              connectionStatus: nextConnectionStatus,
              sessionId: session.sessionId,
            });
            dispatchRealtimeEvent({
              payload: { status: nextConnectionStatus },
              type: 'local.connection_status',
            });

            if (nextConnectionStatus === 'connected' && !recorderRef.current) {
              const recorder = new AudioApiRealtimeRecorder();
              recorderRef.current = recorder;
              debugLog('AUDIO', 'recorder start requested', {
                sessionId: session.sessionId,
              });
              void recorder
                .start((frame) => {
                  const activeSessionId = activeSessionIdRef.current;

                  dispatchRealtimeEvent({
                    payload: { level: frame.level },
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
                  const turnClientId =
                    turnClientIdRef.current ?? createTurnClientId(activeSessionId, turnIndexRef.current);
                  turnClientIdRef.current = turnClientId;
                  const now = Date.now();
                  if (now - lastAudioFrameLogAtRef.current > 2000) {
                    lastAudioFrameLogAtRef.current = now;
                    debugLog('AUDIO', 'capturing pcm frames', {
                      audioBase64Length: frame.audioBase64.length,
                      level: frame.level,
                      sampleRate: frame.sampleRate,
                      seq: audioSeqRef.current,
                      sessionId: activeSessionId,
                      turnClientId,
                    });
                  }
                  realtimeClientRef.current?.send({
                    payload: {
                      channels: 1,
                      data: frame.audioBase64,
                      format: 'pcm16',
                      sampleRate: 16000,
                      turnClientId,
                    },
                    type: 'audio_chunk',
                  });
                })
                .catch((error) => {
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
      cleanupRealtimeResources(intervalRefs, timerRefs, recorderRef, playerRef, realtimeClientRef);
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
    dispatchRealtimeEvent({ type: 'local.cancel_ai_speech' });
  };

  const handleEnd = async () => {
    const activeSessionId = activeSessionIdRef.current;
    debugLog('PRACTICE', 'end requested', {
      sessionId: activeSessionId,
    });
    intervalRefs.current.forEach(clearInterval);
    intervalRefs.current = [];
    timerRefs.current.forEach(clearTimeout);
    timerRefs.current = [];
    void recorderRef.current?.stop();
    recorderRef.current = null;
    playerRef.current?.clearQueue();

    if (activeSessionId) {
      realtimeClientRef.current?.send({
        payload: { action: 'end' },
        type: 'session_control',
      });
    }

    if (accessToken && activeSessionId) {
      try {
        await endPracticeSession(accessToken, activeSessionId);
      } catch {
        debugLog('PRACTICE', 'rest end session failed', {
          sessionId: activeSessionId,
        });
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
      payload: { level: 0 },
      type: 'local.audio_level',
    });
    realtimeClientRef.current?.close();
    setTimeout(() => onEnd(activeSessionId), 550);
  };

  return (
    <View
      className="flex-1 px-4 pt-4"
      style={{ backgroundColor: callRoom.background, flex: 1, paddingBottom: 18 }}
    >
      <StatusBar backgroundColor={callRoom.background} style="light" />
      <Surface
        className="mb-3 border px-4 py-3"
        style={{ backgroundColor: callRoom.panel, borderColor: callRoom.border, borderRadius: 22 }}
      >
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Typography className="text-lg font-black" numberOfLines={1} style={{ color: callRoom.ink }}>
              {scenario.title}
            </Typography>
            <View className="mt-2 flex-row items-center gap-2">
              <View
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: status === 'error' ? AppPalette.danger : AppPalette.primary }}
              />
              <Typography className="text-xs font-semibold" numberOfLines={1} style={{ color: callRoom.muted }}>
                {statusLabel[status]} / {connectionStatus} / {latencyMs}ms
              </Typography>
            </View>
          </View>
          <Chip color={status === 'error' ? 'danger' : 'accent'} size="sm" variant="soft">
            Live
          </Chip>
        </View>
      </Surface>

      <View className="flex-1">
        <TranscriptPanel hints={hints} partialTurn={partialTurn} score={score} turns={turns} />
        <View className="absolute bottom-8 right-3">
          <RealtimeControls
            onEnd={handleEnd}
            onInterrupt={handleInterrupt}
            status={status}
          />
        </View>
      </View>
    </View>
  );
}

function createTurnClientId(sessionId: string, index: number) {
  return `cturn_${sessionId}_${Date.now()}_${index}`;
}

function cleanupRealtimeResources(
  intervalRefs: MutableRefObject<ReturnType<typeof setInterval>[]>,
  timerRefs: MutableRefObject<ReturnType<typeof setTimeout>[]>,
  recorderRef: MutableRefObject<AudioApiRealtimeRecorder | null>,
  playerRef: MutableRefObject<AudioApiRealtimePlayer | null>,
  realtimeClientRef: MutableRefObject<RealtimeClient | null>,
) {
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
}
