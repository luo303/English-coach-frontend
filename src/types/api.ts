export type ApiResponse<T> = {
  code: number;
  data: T;
  info?: string;
  requestId?: string;
};

export type IsoTimestamp = string;

export type ApiUser = {
  avatar: string | null;
  nickname: string;
  userId: string;
};

export type LoginResponse = {
  accessToken: string;
  expiresAt: IsoTimestamp;
  tokenType: 'Bearer';
  user: ApiUser;
};

export type PracticeSessionMode = 'realtime';

export type CreatePracticeSessionRequest = {
  correctionMode: 'realtime';
  personaId: string;
  scenarioId: string;
};

export type PersonaRecord = {
  avatar?: string | null;
  description?: string;
  name: string;
  nameZh: string;
  personaId: string;
};

export type ScenarioRecord = {
  correctionMode: PracticeSessionMode;
  defaultPersonaId: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | string;
  icon: string;
  maxDurationMinutes: number;
  maxReplyWords: number;
  name: string;
  nameZh: string;
  scenarioId: string;
};

export type ScenarioDetailRecord = ScenarioRecord & {
  personas: PersonaRecord[];
};

export type PracticeSessionStatus = 'active' | 'completed' | string;

export type PracticeSessionRecord = {
  correctionMode: PracticeSessionMode;
  createdAt: IsoTimestamp;
  durationSeconds: number;
  endedAt: IsoTimestamp | null;
  firstVoiceLatencyMs: number | null;
  networkLatencyMs: number | null;
  overallScore: number | null;
  personaId: string;
  reportStatus: 'pending' | 'completed' | string;
  scenarioId: string;
  sessionId: string;
  startedAt: IsoTimestamp;
  status: PracticeSessionStatus;
  turnCount: number;
  updatedAt: IsoTimestamp;
};

export type PracticeSessionTurnRecord = {
  aiText: string;
  createdAt: IsoTimestamp;
  sessionId: string;
  turnId: string;
  userScore: number;
  userText: string;
};

export type PracticeSessionListResponse = {
  content: PracticeSessionRecord[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type ReportMistake = {
  category: 'grammar' | 'pronunciation' | 'vocabulary' | string;
  correction: string;
  explanation: string;
  id: string;
  original: string;
};

export type ReportRecord = {
  createdAt: IsoTimestamp;
  durationSeconds: number;
  mistakes: ReportMistake[];
  overallScore: number;
  scenarioName: string;
  scores: {
    fluency: number;
    grammar: number;
    pronunciation: number;
    vocabulary: number;
  };
  sessionId: string;
  suggestions: string[];
  turnCount: number;
};

export type ProfileRecord = {
  [key: string]: unknown;
};

export type UpdatePreferencesRequest = {
  correctionMode?: PracticeSessionMode;
  preferredDifficulty?: string;
};

export type QuotaRecord = {
  dailyLimit: number;
  remaining: number;
  resetAt: IsoTimestamp;
  usedToday: number;
};

export type RecommendationTopic = {
  [key: string]: unknown;
};

export type ReviewMistake = {
  [key: string]: unknown;
};

export type ReviewSentence = {
  [key: string]: unknown;
};
