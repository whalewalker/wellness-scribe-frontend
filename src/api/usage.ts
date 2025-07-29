import api from '../lib/axios';

export interface UsageStats {
  tokensUsed: number;
  tokensLimit: number;
  messagesUsed: number;
  messagesLimit: number;
  resetDate: string;
}

export const usageApi = {
  getUsage: async (): Promise<UsageStats> => {
    const response = await api.get('/usage');
    return response.data;
  },

  getUsageHistory: async (days = 30): Promise<any[]> => {
    const response = await api.get(`/usage/history?days=${days}`);
    return response.data;
  },
};