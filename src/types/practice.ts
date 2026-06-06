export type TabKey = 'practice' | 'conversation' | 'summary' | 'history';

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
  | 'error';

export type Scenario = {
  id: string;
  title: string;
  subtitle: string;
  level: string;
  focus: string[];
  minutes: number;
};

export type Metric = {
  label: string;
  value: number;
};

export type HistoryRecord = {
  title: string;
  score: number;
  delta: string;
  time: string;
  expression: number;
};

export type TabItem = {
  key: TabKey;
  label: string;
  icon: string;
};

export type TranscriptSpeaker = 'user' | 'assistant';

export type TranscriptTurn = {
  turnId: string;
  speaker: TranscriptSpeaker;
  text: string;
  isFinal: boolean;
};

export type RealtimeHintType = 'grammar' | 'pronunciation' | 'expression' | 'timing';

export type RealtimeHint = {
  id: string;
  type: RealtimeHintType;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
};

export type RealtimeScoreSnapshot = {
  overall: number;
  pronunciation: number;
  grammar: number;
  fluency: number;
};

export type MockRealtimeStep = {
  delayMs: number;
  status: PracticeSessionState;
  latencyMs?: number;
  audioLevel?: number;
  partialTurn?: TranscriptTurn;
  finalTurn?: TranscriptTurn;
  hint?: RealtimeHint;
  score?: RealtimeScoreSnapshot;
};
