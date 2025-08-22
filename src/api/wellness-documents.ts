import api from '../lib/axios';

export type DocumentType = 'note' | 'symptom' | 'medication' | 'appointment' | 'test_result' | 'treatment' | 'goal';
export type DocumentStatus = 'draft' | 'published' | 'archived';
export type SeverityLevel = 'low' | 'medium' | 'high';
export type SentimentType = 'positive' | 'negative' | 'neutral';
export type EvidenceLevel = 'high' | 'medium' | 'low';

export interface DocumentMetadata {
  severity?: SeverityLevel;
  category?: string;
  date?: string | Date;
  location?: string;
  duration?: string;
  intensity?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  confidenceScore?: number;
  sourceReliability?: EvidenceLevel;
  followUpRequired?: boolean;
  relatedConditions?: string[];
  medicalCodes?: {
    icd10?: string;
    cpt?: string;
    snomed?: string;
  };
}

export interface DocumentAttachment {
  id?: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  uploadedAt?: string | Date;
  checksum?: string;
  thumbnailUrl?: string;
}

export interface AIInsights {
  summary?: string;
  recommendations?: string[];
  riskFactors?: string[];
  keywords?: string[];
  sentiment?: SentimentType;
  confidence?: number;
  processingTime?: number;
  model?: string;
  lastGenerated?: string | Date;
  flags?: {
    requiresAttention?: boolean;
    potentialEmergency?: boolean;
    medicationInteraction?: boolean;
  };
}

export interface WellnessDocument {
  id: string;
  title: string;
  content: string;
  type: DocumentType;
  metadata?: DocumentMetadata;
  tags: string[];
  aiInsights?: AIInsights;
  attachments: DocumentAttachment[];
  status: DocumentStatus;
  wordCount: number;
  characterCount?: number;
  readingTime?: number;
  version?: number;
  lastModifiedAt?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  userId?: string;
  sharedWith?: string[];
  isTemplate?: boolean;
  templateId?: string;
}

export interface CreateDocumentRequest {
  title: string;
  content: string;
  type: DocumentType;
  metadata?: DocumentMetadata;
  tags?: string[];
  attachments?: DocumentAttachment[];
  status?: DocumentStatus;
  generateInsights?: boolean;
  isTemplate?: boolean;
  templateId?: string;
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
  type?: DocumentType;
  metadata?: DocumentMetadata;
  tags?: string[];
  status?: DocumentStatus;
  aiInsights?: AIInsights;
  attachments?: DocumentAttachment[];
  version?: number;
}

export interface DocumentStats {
  totalDocuments: number;
  totalWords: number;
  totalCharacters?: number;
  averageWordsPerDocument?: number;
  byType: Record<DocumentType, number>;
  byStatus: Record<DocumentStatus, number>;
  bySeverity?: Record<SeverityLevel, number>;
  byTimeRange?: {
    lastWeek: number;
    lastMonth: number;
    lastYear: number;
  };
  insights?: {
    mostCommonTags: Array<{ tag: string; count: number }>;
    averageReadingTime: number;
    documentsNeedingAttention: number;
  };
}

export interface SearchParams {
  q?: string;
  type?: DocumentType | DocumentType[];
  status?: DocumentStatus | DocumentStatus[];
  tags?: string | string[];
  severity?: SeverityLevel | SeverityLevel[];
  dateFrom?: string | Date;
  dateTo?: string | Date;
  hasAttachments?: boolean;
  hasInsights?: boolean;
  requiresAttention?: boolean;
  category?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'wordCount' | 'relevance';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
}

export interface GenerateInsightsRequest {
  content: string;
  type?: DocumentType;
  context?: {
    healthConditions?: string[];
    medications?: string[];
    allergies?: string[];
    age?: number;
    gender?: string;
    medicalHistory?: string[];
    currentSymptoms?: string[];
    lifestyle?: {
      smokingStatus?: 'never' | 'former' | 'current';
      alcoholConsumption?: 'none' | 'occasional' | 'moderate' | 'heavy';
      exerciseFrequency?: 'none' | 'light' | 'moderate' | 'intensive';
      dietType?: string;
    };
  };
  options?: {
    includeRecommendations?: boolean;
    includeRiskFactors?: boolean;
    includeSentiment?: boolean;
    generateKeywords?: boolean;
    detailLevel?: 'basic' | 'detailed' | 'comprehensive';
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  metadata?: {
    searchTime?: number;
    filters?: SearchParams;
  };
}

export interface DocumentValidationError {
  field: string;
  message: string;
  code: string;
}

export interface BatchOperationResult {
  successful: string[];
  failed: Array<{
    id: string;
    error: string;
  }>;
  total: number;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  description?: string;
  type: DocumentType;
  template: {
    title: string;
    content: string;
    metadata?: DocumentMetadata;
    tags?: string[];
  };
  isPublic: boolean;
  createdAt: string | Date;
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'docx';
  includeAttachments?: boolean;
  includeInsights?: boolean;
  dateRange?: {
    from: string | Date;
    to: string | Date;
  };
  filters?: SearchParams;
}

export class DocumentApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public validationErrors?: DocumentValidationError[]
  ) {
    super(message);
    this.name = 'DocumentApiError';
  }
}

const handleApiError = (error: any): never => {
  if (error.response) {
    const { status, data } = error.response;
    throw new DocumentApiError(
      data.message || 'An error occurred',
      data.code || 'UNKNOWN_ERROR',
      status,
      data.validationErrors
    );
  }
  throw new DocumentApiError(
    error.message || 'Network error',
    'NETWORK_ERROR'
  );
};

const validateDocumentData = (data: CreateDocumentRequest | UpdateDocumentRequest): void => {
  const errors: DocumentValidationError[] = [];
  
  if ('title' in data && data.title !== undefined) {
    if (typeof data.title !== 'string' || data.title.trim().length === 0) {
      errors.push({ field: 'title', message: 'Title is required and must be a non-empty string', code: 'INVALID_TITLE' });
    } else if (data.title.length > 200) {
      errors.push({ field: 'title', message: 'Title must be 200 characters or less', code: 'TITLE_TOO_LONG' });
    }
  }
  
  if ('content' in data && data.content !== undefined) {
    if (typeof data.content !== 'string' || data.content.trim().length === 0) {
      errors.push({ field: 'content', message: 'Content is required and must be a non-empty string', code: 'INVALID_CONTENT' });
    } else if (data.content.length > 50000) {
      errors.push({ field: 'content', message: 'Content must be 50,000 characters or less', code: 'CONTENT_TOO_LONG' });
    }
  }
  
  if (errors.length > 0) {
    throw new DocumentApiError('Validation failed', 'VALIDATION_ERROR', 400, errors);
  }
};

const transformDocumentResponse = (doc: any): WellnessDocument => {
  return {
    ...doc,
    createdAt: typeof doc.createdAt === 'string' ? doc.createdAt : doc.createdAt.toISOString(),
    updatedAt: typeof doc.updatedAt === 'string' ? doc.updatedAt : doc.updatedAt.toISOString(),
    lastModifiedAt: doc.lastModifiedAt 
      ? (typeof doc.lastModifiedAt === 'string' ? doc.lastModifiedAt : doc.lastModifiedAt.toISOString())
      : undefined,
  };
};

export const wellnessDocumentsApi = {
  createDocument: async (data: CreateDocumentRequest): Promise<WellnessDocument> => {
    try {
      validateDocumentData(data);
    const response = await api.post('/wellness-documents', data);
      return transformDocumentResponse(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getDocuments: async (params?: SearchParams): Promise<WellnessDocument[]> => {
    try {
    const response = await api.get('/wellness-documents', { params });
      return response.data.map(transformDocumentResponse);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getDocumentsPaginated: async (params?: SearchParams): Promise<PaginatedResponse<WellnessDocument>> => {
    try {
      const response = await api.get('/wellness-documents/paginated', { params });
      return {
        ...response.data,
        data: response.data.data.map(transformDocumentResponse)
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  searchDocuments: async (params: SearchParams): Promise<WellnessDocument[]> => {
    try {
    const response = await api.get('/wellness-documents/search', { params });
      return response.data.map(transformDocumentResponse);
    } catch (error) {
      return handleApiError(error);
    }
  },

  searchDocumentsPaginated: async (params: SearchParams): Promise<PaginatedResponse<WellnessDocument>> => {
    try {
      const response = await api.get('/wellness-documents/search/paginated', { params });
      return {
        ...response.data,
        data: response.data.data.map(transformDocumentResponse)
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getStats: async (params?: { dateRange?: { from: string | Date; to: string | Date } }): Promise<DocumentStats> => {
    try {
      const response = await api.get('/wellness-documents/stats', { params });
    return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getDocument: async (id: string): Promise<WellnessDocument> => {
    try {
      if (!id || typeof id !== 'string') {
        throw new DocumentApiError('Document ID is required', 'INVALID_ID', 400);
      }
    const response = await api.get(`/wellness-documents/${id}`);
      return transformDocumentResponse(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateDocument: async (id: string, data: UpdateDocumentRequest): Promise<WellnessDocument> => {
    try {
      if (!id || typeof id !== 'string') {
        throw new DocumentApiError('Document ID is required', 'INVALID_ID', 400);
      }
      validateDocumentData(data);
    const response = await api.put(`/wellness-documents/${id}`, data);
      return transformDocumentResponse(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  patchDocument: async (id: string, data: Partial<UpdateDocumentRequest>): Promise<WellnessDocument> => {
    try {
      if (!id || typeof id !== 'string') {
        throw new DocumentApiError('Document ID is required', 'INVALID_ID', 400);
      }
      const response = await api.patch(`/wellness-documents/${id}`, data);
      return transformDocumentResponse(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteDocument: async (id: string): Promise<{ message: string }> => {
    try {
      if (!id || typeof id !== 'string') {
        throw new DocumentApiError('Document ID is required', 'INVALID_ID', 400);
      }
      const response = await api.delete(`/wellness-documents/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  batchDeleteDocuments: async (ids: string[]): Promise<BatchOperationResult> => {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new DocumentApiError('Document IDs array is required', 'INVALID_IDS', 400);
      }
      const response = await api.delete('/wellness-documents/batch', { data: { ids } });
    return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  duplicateDocument: async (id: string, options?: { title?: string; status?: DocumentStatus }): Promise<WellnessDocument> => {
    try {
      if (!id || typeof id !== 'string') {
        throw new DocumentApiError('Document ID is required', 'INVALID_ID', 400);
      }
      const response = await api.post(`/wellness-documents/${id}/duplicate`, options);
      return transformDocumentResponse(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  generateInsights: async (data: GenerateInsightsRequest): Promise<AIInsights> => {
    try {
      if (!data.content || typeof data.content !== 'string' || data.content.trim().length === 0) {
        throw new DocumentApiError('Content is required for insight generation', 'INVALID_CONTENT', 400);
      }
    const response = await api.post('/wellness-documents/generate-insights', data);
    return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  saveInsights: async (documentId: string, insights: AIInsights): Promise<WellnessDocument> => {
    try {
      if (!documentId || typeof documentId !== 'string') {
        throw new DocumentApiError('Document ID is required', 'INVALID_ID', 400);
      }
      const response = await api.post(`/wellness-documents/${documentId}/insights`, insights);
      return transformDocumentResponse(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getTemplates: async (): Promise<DocumentTemplate[]> => {
    try {
      const response = await api.get('/wellness-documents/templates');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  createFromTemplate: async (templateId: string, overrides?: Partial<CreateDocumentRequest>): Promise<WellnessDocument> => {
    try {
      if (!templateId || typeof templateId !== 'string') {
        throw new DocumentApiError('Template ID is required', 'INVALID_TEMPLATE_ID', 400);
      }
      const response = await api.post(`/wellness-documents/templates/${templateId}/create`, overrides);
      return transformDocumentResponse(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  exportDocuments: async (options: ExportOptions): Promise<Blob> => {
    try {
      const response = await api.post('/wellness-documents/export', options, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  uploadAttachment: async (documentId: string, file: File): Promise<DocumentAttachment> => {
    try {
      if (!documentId || typeof documentId !== 'string') {
        throw new DocumentApiError('Document ID is required', 'INVALID_ID', 400);
      }
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post(`/wellness-documents/${documentId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  deleteAttachment: async (documentId: string, attachmentId: string): Promise<{ message: string }> => {
    try {
      if (!documentId || !attachmentId) {
        throw new DocumentApiError('Document ID and attachment ID are required', 'INVALID_IDS', 400);
      }
      const response = await api.delete(`/wellness-documents/${documentId}/attachments/${attachmentId}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getDocumentHistory: async (id: string): Promise<Array<{ version: number; changedAt: string; changes: any }>> => {
    try {
      if (!id || typeof id !== 'string') {
        throw new DocumentApiError('Document ID is required', 'INVALID_ID', 400);
      }
      const response = await api.get(`/wellness-documents/${id}/history`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  revertToVersion: async (id: string, version: number): Promise<WellnessDocument> => {
    try {
      if (!id || typeof id !== 'string' || typeof version !== 'number') {
        throw new DocumentApiError('Document ID and version number are required', 'INVALID_PARAMS', 400);
      }
      const response = await api.post(`/wellness-documents/${id}/revert`, { version });
      return transformDocumentResponse(response.data);
    } catch (error) {
      return handleApiError(error);
    }
  },

  shareDocument: async (id: string, userIds: string[], permissions?: ('read' | 'write')[]): Promise<{ message: string }> => {
    try {
      if (!id || !Array.isArray(userIds) || userIds.length === 0) {
        throw new DocumentApiError('Document ID and user IDs are required', 'INVALID_PARAMS', 400);
      }
      const response = await api.post(`/wellness-documents/${id}/share`, { userIds, permissions });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  unshareDocument: async (id: string, userIds: string[]): Promise<{ message: string }> => {
    try {
      if (!id || !Array.isArray(userIds) || userIds.length === 0) {
        throw new DocumentApiError('Document ID and user IDs are required', 'INVALID_PARAMS', 400);
      }
      const response = await api.delete(`/wellness-documents/${id}/share`, { data: { userIds } });
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getSharedDocuments: async (): Promise<WellnessDocument[]> => {
    try {
      const response = await api.get('/wellness-documents/shared');
      return response.data.map(transformDocumentResponse);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getRecentDocuments: async (limit: number = 10): Promise<WellnessDocument[]> => {
    try {
      const response = await api.get('/wellness-documents/recent', { params: { limit } });
      return response.data.map(transformDocumentResponse);
    } catch (error) {
      return handleApiError(error);
    }
  },

  getFavoriteDocuments: async (): Promise<WellnessDocument[]> => {
    try {
      const response = await api.get('/wellness-documents/favorites');
      return response.data.map(transformDocumentResponse);
    } catch (error) {
      return handleApiError(error);
    }
  },

  addToFavorites: async (id: string): Promise<{ message: string }> => {
    try {
      if (!id || typeof id !== 'string') {
        throw new DocumentApiError('Document ID is required', 'INVALID_ID', 400);
      }
      const response = await api.post(`/wellness-documents/${id}/favorite`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  removeFromFavorites: async (id: string): Promise<{ message: string }> => {
    try {
      if (!id || typeof id !== 'string') {
        throw new DocumentApiError('Document ID is required', 'INVALID_ID', 400);
      }
      const response = await api.delete(`/wellness-documents/${id}/favorite`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getTags: async (): Promise<Array<{ tag: string; count: number }>> => {
    try {
      const response = await api.get('/wellness-documents/tags');
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  getRelatedDocuments: async (id: string, limit: number = 5): Promise<WellnessDocument[]> => {
    try {
      if (!id || typeof id !== 'string') {
        throw new DocumentApiError('Document ID is required', 'INVALID_ID', 400);
      }
      const response = await api.get(`/wellness-documents/${id}/related`, { params: { limit } });
      return response.data.map(transformDocumentResponse);
    } catch (error) {
      return handleApiError(error);
    }
  }
}; 