import { ApiRuntimeConfig } from '@/config/runtime';
import {
  AudioOutputChunk,
  ClientRealtimeEvent,
  RealtimeConnectionStatus,
  RealtimeHint,
  RealtimeReducerEvent,
  RealtimeScoreSnapshot,
  ServerRealtimeEvent,
  TranscriptTurn,
} from '@/types/realtime';

type RealtimeChannel = 'dialogue' | 'pronunciation' | 'correction';

type RealtimeClientOptions = {
  onEvent: (event: RealtimeReducerEvent) => void;
  onStatusChange?: (status: RealtimeConnectionStatus) => void;
  sessionId: string;
  token: string;
};

type ChannelSocket = {
  channel: RealtimeChannel;
  id: string;
  socket: WebSocket;
};

const EOL = '\n';
const BODY_SEPARATOR = '\n\n';
const NULL_CHAR = '\0';

function realtimeUrl(sessionId: string, channel: RealtimeChannel) {
  const base = ApiRuntimeConfig.realtimeWsBaseUrl.replace(/\/$/, '');
  return `${base}/practice-sessions/${sessionId}/${channel}`;
}

function stompFrame(command: string, headers: Record<string, string> = {}, body = '') {
  const headerLines = Object.keys(headers).map((key) => `${key}:${headers[key]}`);
  const headerBlock = headerLines.length ? `${EOL}${headerLines.join(EOL)}` : '';
  return `${command}${headerBlock}${BODY_SEPARATOR}${body}${NULL_CHAR}`;
}

function parseStompFrame(raw: string) {
  const trimmed = raw.replace(/\0+$/, '');
  const separatorIndex = trimmed.indexOf(BODY_SEPARATOR);

  if (separatorIndex < 0) {
    return null;
  }

  const headLines = trimmed.slice(0, separatorIndex).split(EOL);
  const command = headLines.shift() ?? '';
  const headers: Record<string, string> = {};

  for (const line of headLines) {
    const index = line.indexOf(':');
    if (index > 0) {
      headers[line.slice(0, index)] = line.slice(index + 1);
    }
  }

  return {
    body: trimmed.slice(separatorIndex + BODY_SEPARATOR.length),
    command,
    headers,
  };
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

function normalizeTurn(payload: unknown, speakerFallback: 'user' | 'assistant', isFinalFallback: boolean): TranscriptTurn {
  const nextPayload = isObject(payload) ? payload : {};

  return {
    isFinal: asBoolean(nextPayload.isFinal, isFinalFallback),
    speaker: nextPayload.speaker === 'assistant' ? 'assistant' : speakerFallback,
    text: asText(nextPayload.text),
    turnId: asText(nextPayload.turnId, asText(nextPayload.turnClientId, `${speakerFallback}-${Date.now()}`)),
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
    audioBase64: asText(nextPayload.data, asText(nextPayload.audioBase64)),
    format,
    id: asText(nextPayload.id, `audio-${serverSeq}-${asNumber(nextPayload.seq, 0)}`),
    sampleRate: asNumber(nextPayload.sampleRate, 24000),
    turnId: asText(nextPayload.turnId, `assistant-${serverSeq}`),
  };
}

function normalizeServerEvent(event: ServerRealtimeEvent): RealtimeReducerEvent {
  const payload = 'payload' in event ? event.payload : {};

  switch (event.type) {
    case 'transcript_delta':
      return {
        ...event,
        payload: normalizeTurn(payload, 'user', false),
      };
    case 'transcript_final':
      return {
        ...event,
        payload: normalizeTurn(payload, 'user', true),
      };
    case 'ai_reply_delta':
      return {
        ...event,
        payload: normalizeTurn(payload, 'assistant', false),
      };
    case 'ai_audio_chunk':
      return {
        ...event,
        payload: normalizeAudioChunk(payload, event.serverSeq),
      };
    case 'pronunciation_hint':
      return {
        ...event,
        payload: normalizeHint('pronunciation', payload, `pronunciation-${event.serverSeq}`),
      };
    case 'grammar_hint':
      return {
        ...event,
        payload: normalizeHint('grammar', payload, `grammar-${event.serverSeq}`),
      };
    case 'expression_hint':
      return {
        ...event,
        payload: normalizeHint('expression', payload, `expression-${event.serverSeq}`),
      };
    case 'score_snapshot':
      return {
        ...event,
        payload: normalizeScore(payload),
      };
    default:
      return event;
  }
}

function withSentAt(event: ClientRealtimeEvent): ClientRealtimeEvent {
  return {
    ...event,
    sentAt: event.sentAt ?? new Date().toISOString(),
  } as ClientRealtimeEvent;
}

function parseServerEvent(rawBody: string): RealtimeReducerEvent | null {
  try {
    const event = JSON.parse(rawBody) as ServerRealtimeEvent;
    if (!event || typeof event !== 'object' || !('type' in event)) {
      return null;
    }
    return normalizeServerEvent(event);
  } catch {
    return null;
  }
}

function logWsResponse(channel: RealtimeChannel, command: string, headers: Record<string, string>, body: string) {
  console.log('[WS response]', {
    body,
    channel,
    command,
    headers,
  });
}

function logWsSend(channel: RealtimeChannel, command: string, headers: Record<string, string>, body = '') {
  console.log('[WS send]', {
    body,
    channel,
    command,
    headers,
  });
}

export class RealtimeClient {
  private sockets = new Map<RealtimeChannel, ChannelSocket>();
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private closedByUser = false;
  private retryCount = 0;
  private handshakeOpenChannels = 0;
  private connectedReported = false;

  constructor(private readonly options: RealtimeClientOptions) {}

  connect() {
    this.closedByUser = false;
    this.handshakeOpenChannels = 0;
    this.connectedReported = false;
    this.options.onStatusChange?.('connecting');
    this.openChannel('dialogue');
    this.openChannel('pronunciation');
    this.openChannel('correction');
  }

  close() {
    this.closedByUser = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    for (const { socket } of this.sockets.values()) {
      try {
        socket.send(stompFrame('DISCONNECT', { receipt: `disc-${Date.now()}` }));
      } catch {}

      try {
        socket.close();
      } catch {}
    }

    this.sockets.clear();
    this.options.onStatusChange?.('closed');
  }

  send(event: ClientRealtimeEvent) {
    const socket = this.sockets.get('dialogue')?.socket;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.log('[WS send skipped]', {
        event,
        readyState: socket?.readyState,
      });
      return false;
    }

    const sendHeaders = {
      'content-type': 'application/json',
      destination: `/app/practice-sessions/${this.options.sessionId}/dialogue`,
    };
    const body = JSON.stringify(withSentAt(event));
    logWsSend('dialogue', 'SEND', sendHeaders, body);
    socket.send(
      stompFrame(
        'SEND',
        sendHeaders,
        body,
      ),
    );

    return true;
  }

  private openChannel(channel: RealtimeChannel) {
    const socket = new WebSocket(realtimeUrl(this.options.sessionId, channel));
    const subscriptionId = `${channel}-${Date.now()}-${Math.random().toString(16).slice(2)}`;

    this.sockets.set(channel, {
      channel,
      id: subscriptionId,
      socket,
    });

    socket.onopen = () => {
      console.log('[WS open]', {
        channel,
        url: realtimeUrl(this.options.sessionId, channel),
      });
      const connectHeaders: Record<string, string> = {
        'accept-version': '1.2',
        Authorization: `Bearer ${this.options.token}`,
        host: 'localhost',
      };
      connectHeaders['heart-beat'] = '10000,10000';

      logWsSend(channel, 'CONNECT', connectHeaders);
      socket.send(
        stompFrame('CONNECT', connectHeaders),
      );
    };

    socket.onmessage = (message) => {
      const text = String(message.data);
      const frame = parseStompFrame(text);

      if (!frame) {
        console.log('[WS raw response]', {
          body: text,
          channel,
        });
        return;
      }

      logWsResponse(channel, frame.command, frame.headers, frame.body);

      if (frame.command === 'CONNECTED') {
        this.handshakeOpenChannels += 1;

        const subscribeHeaders = {
          ack: 'auto',
          destination: `/topic/practice-sessions/${this.options.sessionId}/${channel}`,
          id: subscriptionId,
        };
        logWsSend(channel, 'SUBSCRIBE', subscribeHeaders);
        socket.send(
          stompFrame('SUBSCRIBE', subscribeHeaders),
        );

        if (!this.connectedReported && this.handshakeOpenChannels >= 3) {
          this.connectedReported = true;
          this.retryCount = 0;
          this.options.onStatusChange?.('connected');

          this.send({
            clientSeq: 1,
            payload: {
              grammarVisible: true,
              pronunciationVisible: true,
            },
            sessionId: this.options.sessionId,
            type: 'recording_start',
          });
        }

        return;
      }

      if (frame.command === 'MESSAGE') {
        const event = parseServerEvent(frame.body);
        if (event) {
          this.options.onEvent(event);
        }
        return;
      }

      if (frame.command === 'ERROR') {
        this.scheduleReconnect(channel);
      }
    };

    socket.onerror = () => {
      console.log('[WS error]', {
        channel,
        readyState: socket.readyState,
      });
      this.options.onStatusChange?.('reconnecting');
    };

    socket.onclose = () => {
      console.log('[WS close]', {
        channel,
        readyState: socket.readyState,
      });
      this.sockets.delete(channel);

      if (this.closedByUser) {
        return;
      }

      this.scheduleReconnect(channel);
    };
  }

  private scheduleReconnect(channel: RealtimeChannel) {
    if (this.closedByUser || this.reconnectTimer) {
      return;
    }

    this.options.onStatusChange?.('reconnecting');
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.retryCount += 1;
      this.openChannel(channel);
    }, Math.min(5000, 700 * Math.max(1, this.retryCount + 1)));
  }
}
