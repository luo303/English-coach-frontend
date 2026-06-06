import { create } from 'zustand';

import { fetchCurrentUser, loginAnonymously } from '@/clients/authClient';
import { ApiUser } from '@/types/api';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error';

type AuthStore = {
  accessToken: string | null;
  error: string | null;
  login: () => Promise<void>;
  loginWithBackend: () => Promise<void>;
  refreshMe: () => Promise<void>;
  reset: () => void;
  status: AuthStatus;
  user: ApiUser | null;
};

function createMockUser(): ApiUser {
  const now = Math.floor(Date.now() / 1000);

  return {
    createdAt: {
      nanos: 0,
      seconds: now,
    },
    level: 'beginner',
    loginType: 'anonymous',
    nickname: 'Mock Speaker',
    updatedAt: {
      nanos: 0,
      seconds: now,
    },
    userId: `mock-user-${now}`,
  };
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  accessToken: null,
  error: null,
  login: async () => {
    set({ error: null, status: 'loading' });

    await new Promise((resolve) => {
      setTimeout(resolve, 350);
    });

    set({
      accessToken: `mock-token-${Date.now()}`,
      error: null,
      status: 'authenticated',
      user: createMockUser(),
    });
  },
  loginWithBackend: async () => {
    set({ error: null, status: 'loading' });

    try {
      const response = await loginAnonymously();
      set({
        accessToken: response.accessToken,
        error: null,
        status: 'authenticated',
        user: response.user,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed.',
        status: 'error',
      });
    }
  },
  refreshMe: async () => {
    const token = get().accessToken;

    if (!token) {
      return;
    }

    set({ error: null, status: 'loading' });

    try {
      const user = await fetchCurrentUser(token);
      set({
        error: null,
        status: 'authenticated',
        user,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to refresh current user.',
        status: 'error',
      });
    }
  },
  reset: () => {
    set({
      accessToken: null,
      error: null,
      status: 'idle',
      user: null,
    });
  },
  status: 'idle',
  user: null,
}));
