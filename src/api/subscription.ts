import api from '../lib/axios';

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  tokensLimit: number;
  messagesLimit: number;
  popular?: boolean;
}

export interface Subscription {
  id: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string;
}

export const subscriptionApi = {
  getPlans: async (): Promise<Plan[]> => {
    const response = await api.get('/subscription/plans');
    return response.data;
  },

  getCurrentSubscription: async (): Promise<Subscription | null> => {
    const response = await api.get('/subscription/current');
    return response.data;
  },

  createCheckoutSession: async (planId: string): Promise<{ url: string }> => {
    const response = await api.post('/subscription/checkout', { planId });
    return response.data;
  },

  createPortalSession: async (): Promise<{ url: string }> => {
    const response = await api.post('/subscription/portal');
    return response.data;
  },

  cancelSubscription: async (): Promise<void> => {
    await api.post('/subscription/cancel');
  },
};