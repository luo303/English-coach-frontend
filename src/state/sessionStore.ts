import { create } from 'zustand';

import {
  initialSessionRealtimeState,
  reduceRealtimeEvent,
} from '@/state/realtimeEventReducer';
import { RealtimeReducerEvent, SessionRealtimeState } from '@/types/realtime';

type SessionStore = SessionRealtimeState & {
  dispatchRealtimeEvent: (event: RealtimeReducerEvent) => void;
  resetRealtimeSession: () => void;
};

export const useSessionStore = create<SessionStore>((set) => ({
  ...initialSessionRealtimeState,
  dispatchRealtimeEvent: (event) => {
    set((state) => reduceRealtimeEvent(state, event));
  },
  resetRealtimeSession: () => {
    set(initialSessionRealtimeState);
  },
}));
