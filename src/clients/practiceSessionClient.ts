import { apiRequest } from '@/clients/apiClient';
import {
  CreatePracticeSessionRequest,
  PracticeSessionListResponse,
  PracticeSessionRecord,
  PracticeSessionTurnRecord,
} from '@/types/api';

export function createPracticeSession(token: string, body: CreatePracticeSessionRequest) {
  return apiRequest<PracticeSessionRecord>('/api/v1/practice-sessions', {
    body,
    method: 'POST',
    token,
  });
}

export function endPracticeSession(token: string, sessionId: string) {
  return apiRequest<PracticeSessionRecord>(`/api/v1/practice-sessions/${sessionId}/end`, {
    method: 'POST',
    token,
  });
}

export function fetchPracticeSession(token: string, sessionId: string) {
  return apiRequest<PracticeSessionRecord>(`/api/v1/practice-sessions/${sessionId}`, {
    token,
  });
}

export function fetchPracticeSessionTurns(token: string, sessionId: string) {
  return apiRequest<PracticeSessionTurnRecord[]>(`/api/v1/practice-sessions/${sessionId}/turns`, {
    token,
  });
}

export function fetchPracticeSessions(token: string, status?: PracticeSessionRecord['status']) {
  const search = new URLSearchParams({
    page: '0',
    size: '20',
  });

  if (status) {
    search.set('status', status);
  }

  return apiRequest<PracticeSessionListResponse>(`/api/v1/practice-sessions?${search.toString()}`, {
    token,
  });
}
