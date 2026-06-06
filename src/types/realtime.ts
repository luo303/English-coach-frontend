import { Scenario } from '@/types/practice';

export type PracticeSessionState =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'user_speaking'
  | 'assistant_thinking'
  | 'assistant_speaking'
  | 'interrupting'
  | 'ending'
  | 'report_generating'
  | 'summary_ready'
  | 'error';

export type RealtimeConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'closed';

export type TranscriptSpeaker = 'user' | 'assistant';

export type TranscriptTurn = {
  turnId: string;
  speaker: TranscriptSpeaker;
  text: string;
  isFinal: boolean;
};

export type RealtimeHintType = 'grammar' | 'pronunciation' | 'expression' | 'timing' | 'system';

export type RealtimeHint = {
  id: string;
  type: RealtimeHintType;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  turnId?: string;
};

export type RealtimeScoreSnapshot = {
  overall: number;
  pronunciation: number;
  grammar: number;
  fluency: number;
};

export type AudioOutputChunk = {
  id: string;
  turnId: string;
  audioBase64: string;
  format: 'pcm16' | 'mp3' | 'aac';
  sampleRate: number;
};

export type ClientRealtimeEvent =
  | {
      type: 'recording_start';
      clientSeq: number;
      sessionId: string;
      sentAt?: string;
      payload: {
        pronunciationVisible: boolean;
        grammarVisible: boolean;
      };
    }
  | {
      type: 'audio_chunk';
      clientSeq: number;
      sessionId: string;
      sentAt?: string;
      payload: {
        turnClientId: string;
        seq: number;
        audioFormat: 'pcm_s16le';
        sampleRate: 16000;
        channels: 1;
        isFinal: boolean;
        data: string;
      };
    }
  | {
      type: 'user_turn_end';
      clientSeq: number;
      sessionId: string;
      sentAt?: string;
      payload: {
        turnClientId: string;
        transcript: string;
        pronunciationVisible: boolean;
        grammarVisible: boolean;
        startMs: number;
        endMs: number;
      };
    }
  | {
      type: 'session_control';
      clientSeq: number;
      sessionId: string;
      sentAt?: string;
      payload: {
        action: 'pause' | 'resume' | 'end' | 'cancel_ai_speech';
      };
    }
  | {
      type: 'ping';
      clientSeq: number;
      sessionId: string;
      sentAt?: string;
      payload: {
        clientTime: string;
      };
    };

export type ServerRealtimeEvent =
  | {
      type: 'session_ready';
      serverSeq: number;
      sessionId: string;
      payload: {
        latencyMs?: number;
      };
    }
  | {
      type: 'pong';
      serverSeq: number;
      sessionId: string;
      payload: {
        estimatedRttMs: number;
      };
    }
  | {
      type: 'transcript_delta';
      serverSeq: number;
      sessionId: string;
      payload: TranscriptTurn;
    }
  | {
      type: 'transcript_final';
      serverSeq: number;
      sessionId: string;
      payload: TranscriptTurn;
    }
  | {
      type: 'ai_reply_delta';
      serverSeq: number;
      sessionId: string;
      payload: TranscriptTurn;
    }
  | {
      type: 'audio_chunk_ack';
      serverSeq: number;
      sessionId: string;
      payload: {
        accepted: boolean;
        chunkBytes: number;
        finalChunk: boolean;
        seq: number;
        totalBytes: number;
        turnClientId: string;
      };
    }
  | {
      type: 'ai_audio_chunk';
      serverSeq: number;
      sessionId: string;
      payload: AudioOutputChunk;
    }
  | {
      type: 'grammar_hint' | 'expression_hint' | 'pronunciation_hint';
      serverSeq: number;
      sessionId: string;
      payload: RealtimeHint;
    }
  | {
      type: 'score_snapshot';
      serverSeq: number;
      sessionId: string;
      payload: RealtimeScoreSnapshot;
    }
  | {
      type: 'session_state';
      serverSeq: number;
      sessionId: string;
      payload: {
        status: PracticeSessionState;
        reason?: string;
      };
    }
  | {
      type: 'error';
      serverSeq: number;
      sessionId: string;
      payload: {
        code: string;
        message: string;
        recoverable: boolean;
      };
    };

export type LocalRealtimeEvent =
  | {
      type: 'local.reset_session';
      payload: {
        scenario: Scenario;
        sessionId: string;
      };
    }
  | {
      type: 'local.audio_level';
      payload: {
        level: number;
      };
    }
  | {
      type: 'local.cancel_ai_speech';
    }
  | {
      type: 'local.connection_status';
      payload: {
        status: RealtimeConnectionStatus;
      };
    }
  | {
      type: 'local.tick';
    };

export type RealtimeReducerEvent = ServerRealtimeEvent | LocalRealtimeEvent;

export type SessionRealtimeState = {
  audioLevel: number;
  clientSeq: number;
  connectionStatus: RealtimeConnectionStatus;
  elapsedSec: number;
  hints: RealtimeHint[];
  latencyMs: number;
  latestServerSeq: number;
  partialTurn: TranscriptTurn | null;
  playbackQueue: AudioOutputChunk[];
  scenario: Scenario | null;
  score: RealtimeScoreSnapshot;
  sessionId: string | null;
  status: PracticeSessionState;
  turns: TranscriptTurn[];
};

export type MockRealtimeStep = {
  delayMs: number;
  event: RealtimeReducerEvent;
};
