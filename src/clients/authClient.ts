import { Platform } from 'react-native';

import { apiRequest } from '@/clients/apiClient';
import { ApiUser, LoginResponse } from '@/types/api';

export function loginAnonymously() {
  return apiRequest<LoginResponse>('/api/v1/auth/login', {
    body: {
      deviceId: `${Platform.OS}-${Date.now()}`,
      nickname: 'Speaking Partner',
    },
    method: 'POST',
  });
}

export function fetchCurrentUser(token: string) {
  return apiRequest<ApiUser>('/api/v1/auth/me', {
    token,
  });
}
