export type ApiTimestamp = {
  nanos: number;
  seconds: number;
};

export type ApiResponse<T> = {
  code: number;
  data: T;
  info: string;
  requestId: string;
};

export type ApiUser = {
  createdAt: ApiTimestamp;
  level: string;
  loginType: 'anonymous';
  nickname: string;
  updatedAt: ApiTimestamp;
  userId: string;
};

export type LoginResponse = {
  accessToken: string;
  expiresAt: ApiTimestamp;
  tokenType: 'Bearer';
  user: ApiUser;
};

export type CreatePracticeSessionRequest = {
  correctionMode?: 'immediate' | 'light_live_correction' | 'strict_live_correction' | 'report_only';
  personaId: string;
  scenarioId: string;
};

export type PersonaRecord = {
  personaId: string;
  name: string;
  nameZh: string;
  rolePrompt: string;
  replyStyle: string;
  maxReplyWords: number;
};

export type ScenarioRecord = {
  scenarioId: string;
  name: string;
  nameZh: string;
  difficulty: 'easy' | 'medium' | 'hard' | string;
  icon: string;
  description: string;
  defaultPersonaId: string;
  maxReplyWords: number;
  maxDurationMinutes: number;
  correctionMode: PracticeSessionMode;
};

export type ScenarioDetailRecord = ScenarioRecord & {
  targetSkills: string[];
  defaultPersona: PersonaRecord;
  openingPrompt: string;
};

export type PracticeSessionStatus = 'active' | 'completed';

export type PracticeSessionMode = 'immediate' | 'light_live_correction' | 'strict_live_correction' | 'report_only';

export type PracticeSessionRecord = {
  correctionMode: PracticeSessionMode;
  durationSeconds: number;
  endedAt: ApiTimestamp | null;
  firstVoiceLatencyMs: number | null;
  networkLatencyMs: number | null;
  overallScore: number | null;
  personaId: string;
  reportStatus: 'pending' | 'completed';
  scenarioId: string;
  sessionId: string;
  startedAt: ApiTimestamp;
  status: PracticeSessionStatus;
  turnCount: number;
  createdAt: ApiTimestamp;
  updatedAt: ApiTimestamp;
};

export type PracticeSessionTurnRecord = {
  turnId: string;
  sessionId: string;
  speaker: 'user' | 'assistant';
  transcript: string;
  audioUrl: string;
  startMs: number;
  endMs: number;
  seq: number;
  createdAt: ApiTimestamp;
};

export type PracticeSessionListResponse = {
  page: {
    content: PracticeSessionRecord[];
    pageable: unknown;
    total: number;
  };
};

export type ReportIssue = {
  word?: string;
  original?: string;
  corrected?: string;
  better?: string;
  issue?: string;
  explanation?: string;
  practiceText?: string;
  reason?: string;
};

export type ReportRecord = {
  reportId: string;
  sessionId: string;
  status: 'pending' | 'completed' | string;
  generatedAt: ApiTimestamp;
  overallScore: number;
  durationSeconds: number;
  turnCount: number;
  issueCount: number;
  scores: {
    pronunciation: number;
    fluency: number;
    grammar: number;
    scenarioCompletion: number;
  };
  scoreFormula: string;
  summary: string;
  dataSources: string[];
  conversationHighlights: {
    speaker: 'user' | 'assistant';
    quote: string;
    comment: string;
  }[];
  pronunciationIssues: ReportIssue[];
  grammarIssues: ReportIssue[];
  expressionUpgrades: ReportIssue[];
  recommendedSentences: string[];
  nextTopics: {
    scenarioId: string;
    title: string;
    difficulty: string;
    reason: string;
  }[];
  mock?: boolean;
};
