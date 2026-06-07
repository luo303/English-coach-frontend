export type TabKey = 'practice' | 'conversation' | 'summary' | 'history' | 'audio';

export type Scenario = {
  correctionMode: string;
  defaultPersonaId: string;
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
};
