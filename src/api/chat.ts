import api from '../lib/axios';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  tokens?: number;
}

export interface ChatRequest {
  message: string;
  voice?: boolean;
}

export interface ChatResponse {
  reply: string;
  tokens: number;
  messageId: string;
}

export const chatApi = {
  sendMessage: async (data: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post('/chat', data);
    return response.data;
  },

  getChatHistory: async (limit = 50): Promise<Message[]> => {
    const response = await api.get(`/chat/history?limit=${limit}`);
    return response.data;
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    await api.delete(`/chat/messages/${messageId}`);
  },

  clearHistory: async (): Promise<void> => {
    await api.delete('/chat/history');
  },

  // Streaming chat (for real-time responses)
  streamMessage: (
    data: ChatRequest, 
    onChunk: (chunk: string) => void,
    onComplete: (response: ChatResponse) => void,
    onError: (error: Error) => void
  ) => {
    // This would typically use EventSource or WebSocket
    // For now, simulate streaming with setTimeout
    let fullResponse = '';
    const mockResponse = "I'm here to help you with your wellness journey. How can I assist you today?";
    
    const words = mockResponse.split(' ');
    words.forEach((word, index) => {
      setTimeout(() => {
        fullResponse += (index === 0 ? '' : ' ') + word;
        onChunk(fullResponse);
        
        if (index === words.length - 1) {
          onComplete({
            reply: fullResponse,
            tokens: words.length * 4, // rough token estimate
            messageId: Date.now().toString(),
          });
        }
      }, index * 100);
    });
  },
};