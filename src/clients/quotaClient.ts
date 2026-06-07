import { apiRequest } from '@/clients/apiClient';
import { QuotaRecord } from '@/types/api';

export function fetchTodayQuota(token: string) {
  return apiRequest<QuotaRecord>('/api/v1/quotas/me', {
    token,
  });
}
