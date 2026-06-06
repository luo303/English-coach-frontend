import {
  AudioOutputChunk,
  RealtimeHint,
  RealtimeReducerEvent,
  RealtimeScoreSnapshot,
  SessionRealtimeState,
  TranscriptTurn,
} from '@/types/realtime';

export const initialRealtimeScore: RealtimeScoreSnapshot = {
  fluency: 80,
  grammar: 78,
  overall: 82,
  pronunciation: 84,
};

export const initialSessionRealtimeState: SessionRealtimeState = {
  audioLevel: 8,
  clientSeq: 0,
  connectionStatus: 'disconnected',
  elapsedSec: 0,
  hints: [],
  latencyMs: 238,
  latestServerSeq: 0,
  partialTurn: null,
  playbackQueue: [],
  scenario: null,
  score: initialRealtimeScore,
  sessionId: null,
  status: 'idle',
  turns: [],
};

function isStaleServerEvent(state: SessionRealtimeState, event: RealtimeReducerEvent) {
  return 'serverSeq' in event && event.serverSeq <= state.latestServerSeq;
}

function replaceTurn(turns: TranscriptTurn[], nextTurn: TranscriptTurn) {
  return [...turns.filter((turn) => turn.turnId !== nextTurn.turnId), nextTurn];
}

function prependHint(hints: RealtimeHint[], nextHint: RealtimeHint) {
  return [nextHint, ...hints.filter((hint) => hint.id !== nextHint.id)].slice(0, 3);
}

function appendAudioChunk(queue: AudioOutputChunk[], chunk: AudioOutputChunk) {
  return [...queue.filter((item) => item.id !== chunk.id), chunk];
}

export function reduceRealtimeEvent(
  state: SessionRealtimeState,
  event: RealtimeReducerEvent,
): SessionRealtimeState {
  if (isStaleServerEvent(state, event)) {
    return state;
  }

  const latestServerSeq = 'serverSeq' in event ? event.serverSeq : state.latestServerSeq;

  switch (event.type) {
    case 'local.reset_session':
      return {
        ...initialSessionRealtimeState,
        connectionStatus: 'connecting',
        scenario: event.payload.scenario,
        sessionId: event.payload.sessionId,
        status: 'connecting',
      };

    case 'local.audio_level':
      return {
        ...state,
        audioLevel: event.payload.level,
      };

    case 'local.cancel_ai_speech':
      return {
        ...state,
        audioLevel: 28,
        hints: prependHint(state.hints, {
          id: 'hint_interrupt',
          message: '已发送 cancel_ai_speech，本地播放队列已清空。你可以继续补充。',
          severity: 'low',
          title: '已打断 AI',
          type: 'timing',
        }),
        partialTurn: null,
        playbackQueue: [],
        status: 'interrupting',
      };

    case 'local.tick':
      return {
        ...state,
        elapsedSec: state.elapsedSec + 1,
      };

    case 'session_ready':
      return {
        ...state,
        connectionStatus: 'connected',
        latencyMs: event.payload.latencyMs ?? state.latencyMs,
        latestServerSeq,
        sessionId: event.sessionId,
        status: 'listening',
      };

    case 'pong':
      return {
        ...state,
        latencyMs: event.payload.estimatedRttMs,
        latestServerSeq,
      };

    case 'transcript_delta':
      return {
        ...state,
        latestServerSeq,
        partialTurn: event.payload,
        status: event.payload.speaker === 'user' ? 'user_speaking' : 'assistant_speaking',
      };

    case 'ai_reply_delta':
      return {
        ...state,
        latestServerSeq,
        partialTurn: event.payload,
        status: 'assistant_speaking',
      };

    case 'transcript_final':
      return {
        ...state,
        latestServerSeq,
        partialTurn: state.partialTurn?.turnId === event.payload.turnId ? null : state.partialTurn,
        status: event.payload.speaker === 'user' ? 'assistant_thinking' : 'listening',
        turns: replaceTurn(state.turns, event.payload),
      };

    case 'ai_audio_chunk':
      return {
        ...state,
        latestServerSeq,
        playbackQueue: appendAudioChunk(state.playbackQueue, event.payload),
        status: 'assistant_speaking',
      };

    case 'grammar_hint':
    case 'expression_hint':
    case 'pronunciation_hint':
      return {
        ...state,
        hints: prependHint(state.hints, event.payload),
        latestServerSeq,
      };

    case 'score_snapshot':
      return {
        ...state,
        latestServerSeq,
        score: event.payload,
      };

    case 'session_state':
      return {
        ...state,
        latestServerSeq,
        status: event.payload.status,
      };

    case 'error':
      return {
        ...state,
        connectionStatus: event.payload.recoverable ? state.connectionStatus : 'closed',
        hints: prependHint(state.hints, {
          id: `error_${event.payload.code}`,
          message: event.payload.message,
          severity: event.payload.recoverable ? 'medium' : 'high',
          title: event.payload.recoverable ? '实时链路提示' : '实时链路异常',
          type: 'system',
        }),
        latestServerSeq,
        status: event.payload.recoverable ? state.status : 'error',
      };

    default:
      return state;
  }
}
