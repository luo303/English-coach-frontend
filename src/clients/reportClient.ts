import { apiRequest } from '@/clients/apiClient';
import { ReportMistake, ReportRecord } from '@/types/api';

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function normalizeMistake(value: unknown, categoryFallback: string): ReportMistake {
  const item = isObject(value) ? value : {};

  return {
    category: asString(item.category, categoryFallback),
    correction: asString(item.correction, asString(item.corrected, asString(item.better))),
    explanation: asString(item.explanation, asString(item.reason, asString(item.issue))),
    id: asString(item.id, `${categoryFallback}-${asString(item.word, asString(item.original, Date.now().toString()))}`),
    original: asString(item.original, asString(item.word)),
  };
}

function normalizeReport(raw: unknown, sessionId: string): ReportRecord {
  const report = isObject(raw) ? raw : {};
  const scores = isObject(report.scores) ? report.scores : {};
  const documentMistakes = asArray(report.mistakes).map((item) => normalizeMistake(item, 'grammar'));
  const fallbackMistakes = [
    ...asArray(report.pronunciationIssues).map((item) => normalizeMistake(item, 'pronunciation')),
    ...asArray(report.grammarIssues).map((item) => normalizeMistake(item, 'grammar')),
    ...asArray(report.expressionUpgrades).map((item) => normalizeMistake(item, 'vocabulary')),
  ];
  const suggestions = asArray(report.suggestions)
    .map((item) => asString(item))
    .filter(Boolean);
  const fallbackSuggestions = asArray(report.recommendedSentences)
    .map((item) => asString(item))
    .filter(Boolean);

  return {
    createdAt: asString(report.createdAt, asString(report.generatedAt)),
    durationSeconds: asNumber(report.durationSeconds),
    mistakes: documentMistakes.length ? documentMistakes : fallbackMistakes,
    overallScore: asNumber(report.overallScore),
    scenarioName: asString(report.scenarioName, asString(report.sessionId, sessionId)),
    scores: {
      fluency: asNumber(scores.fluency),
      grammar: asNumber(scores.grammar),
      pronunciation: asNumber(scores.pronunciation),
      vocabulary: asNumber(scores.vocabulary, asNumber(scores.scenarioCompletion)),
    },
    sessionId: asString(report.sessionId, sessionId),
    suggestions: suggestions.length ? suggestions : fallbackSuggestions,
    turnCount: asNumber(report.turnCount),
  };
}

export async function fetchReport(token: string, sessionId: string) {
  const report = await apiRequest<unknown>(`/api/v1/reports/${sessionId}`, {
    token,
  });

  return normalizeReport(report, sessionId);
}

export async function regenerateReport(token: string, sessionId: string) {
  const report = await apiRequest<unknown>(`/api/v1/reports/${sessionId}/regenerate`, {
    method: 'POST',
    token,
  });

  return normalizeReport(report, sessionId);
}
