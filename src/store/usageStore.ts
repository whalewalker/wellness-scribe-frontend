import { create } from 'zustand';

interface UsageStats {
  tokensUsed: number;
  tokensLimit: number;
  messagesUsed: number;
  messagesLimit: number;
  resetDate: string;
}

interface UsageState {
  stats: UsageStats | null;
  isLoading: boolean;
  
  // Actions
  setStats: (stats: UsageStats) => void;
  incrementUsage: (tokens: number, messages: number) => void;
  setLoading: (loading: boolean) => void;
}

export const useUsageStore = create<UsageState>((set, get) => ({
  stats: null,
  isLoading: false,

  setStats: (stats) => set({ stats, isLoading: false }),

  incrementUsage: (tokens, messages) => {
    const currentStats = get().stats;
    if (currentStats) {
      set({
        stats: {
          ...currentStats,
          tokensUsed: currentStats.tokensUsed + tokens,
          messagesUsed: currentStats.messagesUsed + messages,
        }
      });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));