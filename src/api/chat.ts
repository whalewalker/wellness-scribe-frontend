import api from '../lib/axios';

export interface MessageDto {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    tokens?: number;
    model?: string;
    processingTime?: number;
  };
}

export interface ChatContextDto {
  wellnessGoals?: string[];
  healthConditions?: string[];
  medications?: string[];
  lifestyle?: string;
}

export interface SendMessageDto {
  content: string;
  chatId?: string;
  tags?: string[];
  context?: ChatContextDto;
}

export interface ChatResponseDto {
  id: string;
  title: string;
  messages: MessageDto[];
  context?: ChatContextDto;
  status: string;
  tags: string[];
  summary?: string;
  totalTokens: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatListResponseDto {
  id: string;
  title: string;
  status: string;
  tags: string[];
  summary?: string;
  totalTokens: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateChatDto {
  title?: string;
  tags?: string[];
  status?: 'active' | 'archived' | 'deleted';
}

export interface StopChatDto {
  chatId: string;
  reason?: string;
}

export interface StopGenerationDto {
  chatId: string;
}

export interface ChatMessageResponseDto {
  message: string;
}

export interface SummaryResponseDto {
  summary: string;
}

export interface Message extends MessageDto {}
export interface ChatConversation extends ChatResponseDto {}

export const chatApi = {
  sendMessage: async (data: SendMessageDto): Promise<ChatResponseDto> => {
    const response = await api.post('/chat/message', data);
    return response.data;
  },

  stopChat: async (data: StopChatDto): Promise<ChatMessageResponseDto> => {
    const response = await api.post('/chat/stop', data);
    return response.data;
  },

  stopGeneration: async (data: StopGenerationDto): Promise<ChatMessageResponseDto> => {
    const response = await api.post('/chat/stop-generation', data);
    return response.data;
  },

  getChats: async (): Promise<ChatListResponseDto[]> => {
    const response = await api.get('/chat');
    return response.data;
  },

  getChat: async (chatId: string): Promise<ChatResponseDto> => {
    const response = await api.get(`/chat/${chatId}`);
    return response.data;
  },

  updateChat: async (chatId: string, data: UpdateChatDto): Promise<ChatResponseDto> => {
    const response = await api.put(`/chat/${chatId}`, data);
    return response.data;
  },

  deleteChat: async (chatId: string): Promise<ChatMessageResponseDto> => {
    const response = await api.delete(`/chat/${chatId}`);
    return response.data;
  },

  generateSummary: async (chatId: string): Promise<SummaryResponseDto> => {
    const response = await api.post(`/chat/${chatId}/summary`);
    return response.data;
  },
};