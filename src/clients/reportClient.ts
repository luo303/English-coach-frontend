import { apiRequest } from '@/clients/apiClient';
import { ReportRecord } from '@/types/api';

export function fetchReport(token: string, sessionId: string) {
  return apiRequest<ReportRecord>(`/api/v1/reports/${sessionId}`, {
    token,
  });
}

export function regenerateReport(token: string, sessionId: string, reason: string) {
  return apiRequest<ReportRecord>(`/api/v1/reports/${sessionId}/regenerate`, {
    body: {
      reason,
    },
    method: 'POST',
    token,
  });
}
