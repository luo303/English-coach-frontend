import { ApiRuntimeConfig } from '@/config/runtime';
import {
  AudioOutputChunk,
  ClientRealtimeEvent,
  PracticeSessionState,
  RealtimeConnectionStatus,
  RealtimeHint,
  RealtimeReducerEvent,
  RealtimeScoreSnapshot,
  TranscriptTurn,
} from '@/types/realtime';
import { debugLog } from '@/utils/debugLog';

type RealtimeClientOptions = {
  onEvent: (event: RealtimeReducerEvent) => void;
  onStatusChange?: (status: RealtimeConnectionStatus) => void;
  sessionId: string;
  token: string;
};

type RawServerRealtimeEvent = {
  payload?: unknown;
  serverSeq?: number;
  sessionId?: string;
  type?: string;
};

function realtimeUrl(sessionId: string, token: string) {
  const base = ApiRuntimeConfig.realtimeWsBaseUrl.replace(/\/$/, '');
  return `${base}/practice-sessions/${sessionId}/dialogue?token=${encodeURIComponent(token)}`;
}

function realtimeLogUrl(sessionId: string) {
  const base = ApiRuntimeConfig.realtimeWsBaseUrl.replace(/\/$/, '');
  return `${base}/practice-sessions/${sessionId}/dialogue?token=<redacted>`;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function asText(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asBoolean(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback;
}

function pickText(payload: Record<string, unknown>, keys: string[], fallback = '') {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return fallback;
}

function eventPayload(raw: RawServerRealtimeEvent): Record<string, unknown> {
  return isObject(raw.payload) ? raw.payload : raw;
}

function normalizeTurn(payload: unknown, speakerFallback: 'user' | 'assistant', isFinalFallback: boolean): TranscriptTurn {
  const nextPayload = isObject(payload) ? payload : {};
  const rawSpeaker = pickText(nextPayload, ['speaker', 'role', 'source', 'from']).toLowerCase();
  const speaker =
    rawSpeaker === 'assistant' || rawSpeaker === 'ai' || rawSpeaker === 'bot' || rawSpeaker === 'coach'
      ? 'assistant'
      : rawSpeaker === 'user'
        ? 'user'
        : speakerFallback;

  return {
    isFinal: asBoolean(nextPayload.isFinal, isFinalFallback),
    speaker,
    text: pickText(nextPayload, [
      'text',
      'transcript',
      'content',
      'delta',
      'message',
      'userText',
      'aiText',
      'sentence',
      'utterance',
    ]),
    turnId: pickText(nextPayload, ['turnId', 'turnClientId', 'id'], `${speaker}-${Date.now()}`),
  };
}

function normalizeHint(type: RealtimeHint['type'], payload: unknown, idFallback: string): RealtimeHint {
  const nextPayload = isObject(payload) ? payload : {};
  const title =
    type === 'pronunciation'
      ? asText(nextPayload.word, '发音建议')
      : type === 'grammar'
        ? asText(nextPayload.quickFix, '语法建议')
        : '表达建议';
  const message =
    asText(nextPayload.message) ||
    asText(nextPayload.explanation) ||
    asText(nextPayload.reason) ||
    asText(nextPayload.practiceText) ||
    title;
  const severity = nextPayload.severity === 'high' || nextPayload.severity === 'medium' ? nextPayload.severity : 'low';

  return {
    id: asText(nextPayload.id, idFallback),
    message,
    severity,
    title,
    turnId: asText(nextPayload.turnId, undefined as unknown as string),
    type,
  };
}

function normalizeScore(payload: unknown): RealtimeScoreSnapshot {
  const nextPayload = isObject(payload) ? payload : {};
  return {
    fluency: asNumber(nextPayload.fluency),
    grammar: asNumber(nextPayload.grammar, asNumber(nextPayload.grammarScore)),
    overall: asNumber(nextPayload.overall, asNumber(nextPayload.overallScore)),
    pronunciation: asNumber(nextPayload.pronunciation),
  };
}

function normalizeAudioChunk(payload: unknown, serverSeq: number): AudioOutputChunk {
  const nextPayload = isObject(payload) ? payload : {};
  const rawFormat = asText(nextPayload.format);
  const format: AudioOutputChunk['format'] = rawFormat === 'mp3' || rawFormat === 'aac' ? rawFormat : 'pcm16';

  return {
    audioBase64: pickText(nextPayload, ['data', 'audioBase64', 'audioData', 'base64', 'chunk']),
    format,
    id: pickText(nextPayload, ['id', 'chunkId'], `audio-${serverSeq}-${asNumber(nextPayload.seq, 0)}`),
    isFinal: asBoolean(nextPayload.isFinal),
    sampleRate: asNumber(nextPayload.sampleRate, 24000),
    turnId: pickText(nextPayload, ['turnId', 'turnClientId'], `assistant-${serverSeq}`),
  };
}

function normalizeServerEvent(raw: RawServerRealtimeEvent, sessionId: string, serverSeq: number): RealtimeReducerEvent | null {
  const payload = eventPayload(raw);

  switch (raw.type) {
    case 'session.connected':
      return {
        payload: {
          status: 'connected',
        },
        type: 'local.connection_status',
      };

    case 'session.ready':
    case 'session_ready':
      return {
        payload: {
          latencyMs: asNumber(isObject(payload) ? payload.latencyMs : undefined),
        },
        serverSeq,
        sessionId,
        type: 'session_ready',
      };

    case 'pong':
      return {
        payload: {
          estimatedRttMs: asNumber(isObject(payload) ? payload.estimatedRttMs : undefined),
        },
        serverSeq,
        sessionId,
        type: 'pong',
      };

    case 'transcript.partial':
    case 'transcript_delta':
      return {
        payload: normalizeTurn(payload, 'user', false),
        serverSeq,
        sessionId,
        type: 'transcript_delta',
      };

    case 'transcript.final':
    case 'transcript_final':
      return {
        payload: normalizeTurn(payload, 'user', true),
        serverSeq,
        sessionId,
        type: 'transcript_final',
      };

    case 'audio.output':
    case 'ai_audio_chunk': {
      const chunk = normalizeAudioChunk(payload, serverSeq);

      if (!chunk.audioBase64) {
        if (chunk.isFinal) {
          return {
            payload: {
              reason: 'empty_audio_output_final',
              status: 'listening',
            },
            serverSeq,
            sessionId,
            type: 'session_state',
          };
        }

        return null;
      }

      return {
        payload: chunk,
        serverSeq,
        sessionId,
        type: 'ai_audio_chunk',
      };
    }

    case 'audio_chunk_ack':
      return {
        payload: {
          accepted: asBoolean(isObject(payload) ? payload.accepted : undefined, true),
          chunkBytes: asNumber(isObject(payload) ? payload.chunkBytes : undefined),
          finalChunk: asBoolean(isObject(payload) ? payload.finalChunk : undefined),
          seq: asNumber(isObject(payload) ? payload.seq : undefined),
          totalBytes: asNumber(isObject(payload) ? payload.totalBytes : undefined),
          turnClientId: asText(isObject(payload) ? payload.turnClientId : undefined),
        },
        serverSeq,
        sessionId,
        type: 'audio_chunk_ack',
      };

    case 'pronunciation_hint':
      return {
        payload: normalizeHint('pronunciation', payload, `pronunciation-${serverSeq}`),
        serverSeq,
        sessionId,
        type: 'pronunciation_hint',
      };

    case 'grammar_hint':
      return {
        payload: normalizeHint('grammar', payload, `grammar-${serverSeq}`),
        serverSeq,
        sessionId,
        type: 'grammar_hint',
      };

    case 'score_snapshot':
      return {
        payload: normalizeScore(payload),
        serverSeq,
        sessionId,
        type: 'score_snapshot',
      };

    case 'session_state':
      return {
        payload: {
          reason: asText(isObject(payload) ? payload.reason : undefined),
          status: asText(isObject(payload) ? payload.status : undefined, 'listening') as PracticeSessionState,
        },
        serverSeq,
        sessionId,
        type: 'session_state',
      } as RealtimeReducerEvent;

    case 'error':
      return {
        payload: {
          code: asText(isObject(payload) ? payload.code : undefined, 'realtime_error'),
          message: asText(isObject(payload) ? payload.message : undefined, '实时通话异常。'),
          recoverable: asBoolean(isObject(payload) ? payload.recoverable : undefined),
        },
        serverSeq,
        sessionId,
        type: 'error',
      };

    default:
      return null;
  }
}

function parseServerEvent(rawBody: string, sessionId: string, serverSeq: number): RealtimeReducerEvent | null {
  try {
    const raw = JSON.parse(rawBody) as RawServerRealtimeEvent;
    if (!raw || typeof raw !== 'object' || !raw.type) {
      return null;
    }
    return normalizeServerEvent(raw, raw.sessionId ?? sessionId, raw.serverSeq ?? serverSeq);
  } catch {
    return null;
  }
}

function summarizeClientEvent(event: ClientRealtimeEvent) {
  if (event.type === 'audio_chunk') {
    return {
      audioBase64Length: event.payload.data.length,
      format: event.payload.format,
      sampleRate: event.payload.sampleRate,
      turnClientId: event.payload.turnClientId,
      type: event.type,
    };
  }

  return {
    payload: event.payload,
    type: event.type,
  };
}

function summarizeServerBody(rawBody: string) {
  try {
    const raw = JSON.parse(rawBody) as RawServerRealtimeEvent;
    const payload = eventPayload(raw);
    const data = pickText(payload, ['data', 'audioBase64', 'audioData', 'base64', 'chunk']);
    const text = pickText(payload, [
      'text',
      'transcript',
      'content',
      'delta',
      'message',
      'userText',
      'aiText',
      'sentence',
      'utterance',
    ]);

    return {
      audioBase64Length: data ? data.length : undefined,
      audioFields: {
        hasAudioBase64: Boolean(payload.audioBase64),
        hasAudioData: Boolean(payload.audioData),
        hasBase64: Boolean(payload.base64),
        hasChunk: Boolean(payload.chunk),
        hasData: Boolean(payload.data),
        sampleRate: payload.sampleRate,
      },
      rawLength: rawBody.length,
      rootKeys: Object.keys(raw as Record<string, unknown>),
      payloadKeys: Object.keys(payload),
      serverSeq: raw.serverSeq,
      sessionId: raw.sessionId,
      speakerFields: {
        from: payload.from,
        role: payload.role,
        source: payload.source,
        speaker: payload.speaker,
      },
      text,
      textFields: {
        aiText: payload.aiText,
        content: payload.content,
        delta: payload.delta,
        message: payload.message,
        text: payload.text,
        transcript: payload.transcript,
        userText: payload.userText,
      },
      type: raw.type,
    };
  } catch {
    return {
      rawLength: rawBody.length,
      type: 'unparseable',
    };
  }
}

function summarizeReducerEvent(event: RealtimeReducerEvent) {
  switch (event.type) {
    case 'transcript_delta':
    case 'transcript_final':
      return {
        isFinal: event.payload.isFinal,
        speaker: event.payload.speaker,
        text: event.payload.text,
        textLength: event.payload.text.length,
        turnId: event.payload.turnId,
        type: event.type,
      };

    case 'ai_audio_chunk':
      return {
        audioBase64Length: event.payload.audioBase64.length,
        format: event.payload.format,
        isFinal: event.payload.isFinal,
        sampleRate: event.payload.sampleRate,
        turnId: event.payload.turnId,
        type: event.type,
      };

    case 'audio_chunk_ack':
      return {
        accepted: event.payload.accepted,
        seq: event.payload.seq,
        turnClientId: event.payload.turnClientId,
        type: event.type,
      };

    case 'local.connection_status':
      return {
        status: event.payload.status,
        type: event.type,
      };

    default:
      return {
        type: event.type,
      };
  }
}

export class RealtimeClient {
  private closedByUser = false;
  private lastAudioSendLogAt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private retryCount = 0;
  private serverSeq = 0;
  private socket: WebSocket | null = null;

  constructor(private readonly options: RealtimeClientOptions) {}

  connect() {
    this.closedByUser = false;
    this.options.onStatusChange?.('connecting');
    this.openSocket();
  }

  close() {
    this.closedByUser = true;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    try {
      this.socket?.close();
    } catch {}

    this.socket = null;
    this.options.onStatusChange?.('closed');
  }

  send(event: ClientRealtimeEvent) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      debugLog('WS', 'send skipped', {
        event: summarizeClientEvent(event),
        readyState: this.socket?.readyState,
      });
      return false;
    }

    const body = JSON.stringify(event);
    const now = Date.now();
    if (event.type !== 'audio_chunk' || now - this.lastAudioSendLogAt > 2000) {
      if (event.type === 'audio_chunk') {
        this.lastAudioSendLogAt = now;
      }

      debugLog('WS', 'send', {
        event: summarizeClientEvent(event),
        url: realtimeLogUrl(this.options.sessionId),
      });
    }
    this.socket.send(body);
    return true;
  }

  private sendRecordingStart() {
    this.send({
      payload: {
        grammarVisible: true,
        pronunciationVisible: true,
      },
      type: 'recording_start',
    });
  }

  private openSocket() {
    const socket = new WebSocket(realtimeUrl(this.options.sessionId, this.options.token));
    this.socket = socket;

    socket.onopen = () => {
      debugLog('WS', 'open', {
        sessionId: this.options.sessionId,
        url: realtimeLogUrl(this.options.sessionId),
      });
      this.retryCount = 0;
    };

    socket.onmessage = (message) => {
      const body = String(message.data);
      debugLog('WS', 'response', {
        event: summarizeServerBody(body),
      });

      this.serverSeq += 1;
      const event = parseServerEvent(body, this.options.sessionId, this.serverSeq);

      if (!event) {
        return;
      }

      debugLog('WS', 'dispatch normalized event', summarizeReducerEvent(event));

      this.options.onEvent(event);

      if ('type' in event && event.type === 'local.connection_status' && event.payload.status === 'connected') {
        this.options.onStatusChange?.('connected');
        this.sendRecordingStart();
      }
    };

    socket.onerror = () => {
      debugLog('WS', 'error', {
        readyState: socket.readyState,
        sessionId: this.options.sessionId,
      });
      this.options.onStatusChange?.('reconnecting');
    };

    socket.onclose = () => {
      debugLog('WS', 'close', {
        readyState: socket.readyState,
        sessionId: this.options.sessionId,
      });

      if (this.closedByUser) {
        return;
      }

      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (this.closedByUser || this.reconnectTimer) {
      return;
    }

    this.options.onStatusChange?.('reconnecting');
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.retryCount += 1;
      this.openSocket();
    }, Math.min(5000, 700 * Math.max(1, this.retryCount + 1)));
  }
}
