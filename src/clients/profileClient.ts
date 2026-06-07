import { apiRequest } from '@/clients/apiClient';
import { ProfileRecord, UpdatePreferencesRequest } from '@/types/api';

export function fetchProfile(token: string) {
  return apiRequest<ProfileRecord>('/api/v1/profiles/me', {
    token,
  });
}

export function updateProfilePreferences(token: string, body: UpdatePreferencesRequest) {
  return apiRequest<ProfileRecord>('/api/v1/profiles/me/preferences', {
    body,
    method: 'PATCH',
    token,
  });
}
