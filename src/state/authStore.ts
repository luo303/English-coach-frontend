import { create } from 'zustand';

import { fetchCurrentUser, loginAnonymously } from '@/clients/authClient';
import { ApiUser } from '@/types/api';
import { debugLog } from '@/utils/debugLog';

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

export const useAuthStore = create<AuthStore>((set, get) => ({
  accessToken: null,
  error: null,
  login: async () => {
    set({ error: null, status: 'loading' });
    debugLog('AUTH', 'anonymous login start');

    try {
      const response = await loginAnonymously();
      debugLog('AUTH', 'anonymous login success', {
        expiresAt: response.expiresAt,
        tokenType: response.tokenType,
        userId: response.user.userId,
      });
      set({
        accessToken: response.accessToken,
        error: null,
        status: 'authenticated',
        user: response.user,
      });
    } catch (error) {
      debugLog('AUTH', 'anonymous login failed', {
        message: error instanceof Error ? error.message : String(error),
      });
      set({
        error: error instanceof Error ? error.message : 'Login failed.',
        status: 'error',
      });
    }
  },
  loginWithBackend: async () => {
    set({ error: null, status: 'loading' });
    debugLog('AUTH', 'backend login start');

    try {
      const response = await loginAnonymously();
      debugLog('AUTH', 'backend login success', {
        expiresAt: response.expiresAt,
        tokenType: response.tokenType,
        userId: response.user.userId,
      });
      set({
        accessToken: response.accessToken,
        error: null,
        status: 'authenticated',
        user: response.user,
      });
    } catch (error) {
      debugLog('AUTH', 'backend login failed', {
        message: error instanceof Error ? error.message : String(error),
      });
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
    debugLog('AUTH', 'refresh current user start');

    try {
      const user = await fetchCurrentUser(token);
      debugLog('AUTH', 'refresh current user success', {
        userId: user.userId,
      });
      set({
        error: null,
        status: 'authenticated',
        user,
      });
    } catch (error) {
      debugLog('AUTH', 'refresh current user failed', {
        message: error instanceof Error ? error.message : String(error),
      });
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
