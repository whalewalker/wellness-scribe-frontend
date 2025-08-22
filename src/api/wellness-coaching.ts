import { api } from '../lib/axios';

// Types
export interface SmartCriteria {
  specific: string;
  measurable: string;
  achievable: string;
  relevant: string;
  timeBound: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  targetDate: Date;
  completed: boolean;
  completedAt?: Date;
  reward?: string;
}

export interface ProgressEntry {
  id: string;
  value: number;
  date: Date;
  notes?: string;
  mood?: number;
  confidence?: number;
  challenges?: string[];
}

export interface WellnessGoal {
  _id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  smartCriteria: SmartCriteria;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: Date;
  targetDate: Date;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'abandoned';
  milestones: Milestone[];
  progressEntries: ProgressEntry[];
  aiInsights: {
    suggestions: string[];
    predictions: {
      likelihood: number;
      timeframe: string;
      factors: string[];
    };
    adaptiveAdjustments: Array<{
      date: Date;
      type: string;
      originalValue: any;
      newValue: any;
      reason: string;
    }>;
  };
  tags: string[];
  isActive: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGoalRequest {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  smartCriteria: SmartCriteria;
  targetValue: number;
  unit: string;
  startDate: Date;
  targetDate: Date;
  tags?: string[];
}

export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  targetValue?: number;
  targetDate?: Date;
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'abandoned';
  tags?: string[];
}

export interface AddProgressRequest {
  value: number;
  date: Date;
  notes?: string;
  mood?: number;
  confidence?: number;
  challenges?: string[];
}

export interface AddMilestoneRequest {
  title: string;
  description: string;
  targetValue: number;
  targetDate: Date;
  reward?: string;
}

export interface DashboardFilters {
  statuses?: string[];
  categories?: string[];
  priorities?: string[];
  startDate?: Date;
  endDate?: Date;
}

export interface DashboardMetrics {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  overallProgress: number;
  streakDays: number;
  averageConfidence: number;
  averageMood: number;
  upcomingMilestones: number;
}

export interface CategoryProgress {
  category: string;
  goals: number;
  completedGoals: number;
  completionRate: number;
  averageProgress: number;
  trend: 'improving' | 'declining' | 'stable';
}

export interface GoalProgress {
  goalId: string;
  title: string;
  category: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  progressPercentage: number;
  daysRemaining: number;
  onTrack: boolean;
  recentTrend: 'positive' | 'negative' | 'stable';
  nextMilestone?: {
    title: string;
    targetValue: number;
    daysUntilTarget: number;
  };
}

export interface ProgressChart {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    type?: string;
  }>;
}

export interface Insight {
  type: 'success' | 'warning' | 'info' | 'celebration';
  title: string;
  message: string;
  actionable?: boolean;
  action?: string;
  goalId?: string;
}

export interface UpcomingDeadline {
  goalId: string;
  title: string;
  type: 'goal' | 'milestone';
  daysRemaining: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

export interface RecentAchievement {
  type: 'goal_completed' | 'milestone_reached' | 'streak_achieved' | 'improvement';
  title: string;
  date: Date;
  goalId?: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  categoryProgress: CategoryProgress[];
  goalProgress: GoalProgress[];
  progressCharts: {
    overall: ProgressChart;
    byCategory: ProgressChart;
    mood: ProgressChart;
    confidence: ProgressChart;
  };
  insights: Insight[];
  upcomingDeadlines: UpcomingDeadline[];
  recentAchievements: RecentAchievement[];
}

export interface GoalSuggestion {
  title: string;
  description: string;
  category: string;
  smartCriteria: SmartCriteria;
  targetValue: number;
  unit: string;
  suggestedDuration: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  benefits: string[];
  prerequisites: string[];
  aiReasoning: string;
}

export interface AdaptiveAdjustment {
  id: string;
  goalId: string;
  type: 'timeline' | 'target' | 'approach' | 'milestone';
  suggestion: string;
  reasoning: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  urgency: 'recommended' | 'suggested' | 'optional';
  implementation: {
    difficulty: 'easy' | 'medium' | 'hard';
    timeRequired: string;
    steps: string[];
  };
  aiAnalysis: {
    successProbability: number;
    riskFactors: string[];
    benefits: string[];
  };
  userFeedback?: {
    accepted: boolean;
    rating: number;
    comments: string;
    appliedDate: Date;
  };
  createdAt: Date;
}

export interface Celebration {
  id: string;
  type: string;
  title: string;
  message: string;
  achievement: string;
  goalId?: string;
  date: Date;
  personalizedMessage: string;
  encouragementLevel: 'gentle' | 'enthusiastic' | 'motivational';
  rewards: {
    badges: string[];
    points: number;
    suggestions: string[];
  };
  shareableContent: {
    text: string;
    hashtags: string[];
    image?: string;
  };
  createdAt: Date;
}

export interface CategoryAnalytics {
  category: string;
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  completionRate: number;
  averageProgress: number;
  averageCompletionTime: number;
  trendsOverTime: {
    labels: string[];
    completionRates: number[];
    progressRates: number[];
  };
  commonChallenges: string[];
  successFactors: string[];
  recommendations: string[];
}

export interface StreakAnalysis {
  currentStreak: {
    days: number;
    startDate: Date;
    category?: string;
    type: 'overall' | 'category' | 'goal';
  };
  longestStreak: {
    days: number;
    startDate: Date;
    endDate: Date;
    category?: string;
    type: 'overall' | 'category' | 'goal';
  };
  streakHistory: Array<{
    days: number;
    startDate: Date;
    endDate: Date;
    category?: string;
    goalId?: string;
  }>;
  insights: {
    streakFrequency: number;
    averageStreakLength: number;
    breakPatterns: string[];
    recommendations: string[];
  };
}

export interface ComparisonReport {
  current: {
    period: { start: Date; end: Date };
    metrics: {
      goalsCompleted: number;
      goalsInProgress: number;
      averageProgress: number;
      consistencyScore: number;
      averageMood: number;
      averageConfidence: number;
    };
  };
  previous: {
    period: { start: Date; end: Date };
    metrics: {
      goalsCompleted: number;
      goalsInProgress: number;
      averageProgress: number;
      consistencyScore: number;
      averageMood: number;
      averageConfidence: number;
    };
  };
  comparison: {
    goalsCompletedChange: number;
    progressChange: number;
    consistencyChange: number;
    moodChange: number;
    confidenceChange: number;
    overallImprovement: number;
  };
  insights: {
    improvements: string[];
    concerns: string[];
    recommendations: string[];
    aiSummary: string;
  };
  chartData: {
    labels: string[];
    currentPeriod: number[];
    previousPeriod: number[];
  };
}

export interface WellnessReport {
  _id: string;
  userId: string;
  type: string;
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    goalsCompleted: number;
    goalsInProgress: number;
    goalsOverdue: number;
    totalProgressPoints: number;
    averageConfidence: number;
    averageMood: number;
    consistencyScore: number;
    improvementRate: number;
  };
  insights: {
    achievements: string[];
    challenges: string[];
    patterns: string[];
    recommendations: string[];
    aiSummary: string;
  };
  categoryBreakdown: Array<{
    category: string;
    goalsCount: number;
    completionRate: number;
    averageProgress: number;
    trends: string[];
  }>;
  celebrations: Array<{
    type: string;
    title: string;
    description: string;
    date: Date;
    goalId?: string;
  }>;
  generatedAt: Date;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Response interfaces to match API specification
export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}

export interface GoalsResponse {
  goals: WellnessGoal[];
  count: number;
}

export interface GoalResponse {
  goal: WellnessGoal;
}

export interface CreateGoalResponse {
  goal: WellnessGoal;
  celebrations: Celebration[];
}

export interface ProgressResponse {
  goal: WellnessGoal;
  celebrations: Celebration[];
  adaptiveAdjustments: AdaptiveAdjustment[];
}

export interface MilestoneResponse {
  goal: WellnessGoal;
}

export interface GoalSuggestionsResponse {
  suggestions: GoalSuggestion[];
}

export interface AdaptiveAdjustmentsResponse {
  adjustments: AdaptiveAdjustment[];
}

export interface CelebrationsResponse {
  celebrations: Celebration[];
}

export interface ReportsResponse {
  reports: WellnessReport[];
}

export interface CategoriesResponse {
  categories: string[];
}

export interface ProgressChartResponse {
  chart: ProgressChart;
}

// API Functions

// Goal Management
export const createGoal = async (goalData: CreateGoalRequest): Promise<ApiResponse<CreateGoalResponse>> => {
  const response = await api.post('/wellness-coaching/goals', goalData);
  return response.data;
};

export const getGoals = async (filters?: { status?: string; category?: string }): Promise<ApiResponse<GoalsResponse>> => {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.category) params.append('category', filters.category);
  
  const response = await api.get(`/wellness-coaching/goals?${params.toString()}`);
  return response.data;
};

export const getGoal = async (goalId: string): Promise<ApiResponse<GoalResponse>> => {
  const response = await api.get(`/wellness-coaching/goals/${goalId}`);
  return response.data;
};

export const updateGoal = async (goalId: string, updateData: UpdateGoalRequest): Promise<ApiResponse<GoalResponse>> => {
  const response = await api.put(`/wellness-coaching/goals/${goalId}`, updateData);
  return response.data;
};

export const deleteGoal = async (goalId: string): Promise<ApiResponse<{}>> => {
  const response = await api.delete(`/wellness-coaching/goals/${goalId}`);
  return response.data;
};

// Progress Tracking
export const addProgress = async (goalId: string, progressData: AddProgressRequest): Promise<ApiResponse<ProgressResponse>> => {
  const response = await api.post(`/wellness-coaching/goals/${goalId}/progress`, progressData);
  return response.data;
};

export const addMilestone = async (goalId: string, milestoneData: AddMilestoneRequest): Promise<ApiResponse<MilestoneResponse>> => {
  const response = await api.post(`/wellness-coaching/goals/${goalId}/milestones`, milestoneData);
  return response.data;
};

// Dashboard and Analytics
export const getDashboard = async (filters?: DashboardFilters): Promise<ApiResponse<DashboardData>> => {
  const response = await api.get('/wellness-coaching/dashboard', { params: filters });
  return response.data;
};

export const getProgressChart = async (goalId?: string, timeframe?: 'week' | 'month' | 'quarter' | 'year'): Promise<ApiResponse<ProgressChartResponse>> => {
  const params = new URLSearchParams();
  if (goalId) params.append('goalId', goalId);
  if (timeframe) params.append('timeframe', timeframe);
  
  const response = await api.get(`/wellness-coaching/analytics/progress-chart?${params.toString()}`);
  return response.data;
};

export const getCategoryAnalytics = async (category: string): Promise<ApiResponse<CategoryAnalytics>> => {
  const response = await api.get(`/wellness-coaching/analytics/category/${category}`);
  return response.data;
};

export const getStreakAnalysis = async (): Promise<ApiResponse<StreakAnalysis>> => {
  const response = await api.get('/wellness-coaching/analytics/streaks');
  return response.data;
};

// AI-Powered Features
export const getGoalSuggestions = async (params: {
  categories: string[];
  healthConditions?: string[];
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  availableTimePerDay?: number;
  preferredDuration?: number;
}): Promise<ApiResponse<GoalSuggestionsResponse>> => {
  const response = await api.post('/wellness-coaching/ai/goal-suggestions', params);
  return response.data;
};

export const getAdaptiveAdjustments = async (goalId: string): Promise<ApiResponse<AdaptiveAdjustmentsResponse>> => {
  const response = await api.get(`/wellness-coaching/ai/adaptive-adjustments/${goalId}`);
  return response.data;
};

export const applyAdaptiveAdjustment = async (adjustmentId: string, data: {
  accepted: boolean;
  rating?: number;
  comments?: string;
}): Promise<ApiResponse<GoalResponse>> => {
  const response = await api.post(`/wellness-coaching/ai/adaptive-adjustments/${adjustmentId}/apply`, data);
  return response.data;
};

// Celebrations and Rewards
export const getCelebrations = async (limit?: number): Promise<ApiResponse<CelebrationsResponse>> => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  
  const response = await api.get(`/wellness-coaching/celebrations?${params.toString()}`);
  return response.data;
};

export const triggerCelebration = async (goalId: string, data: {
  type: string;
  achievement: string;
}): Promise<ApiResponse<{ celebration: Celebration }>> => {
  const response = await api.post(`/wellness-coaching/celebrations/${goalId}`, data);
  return response.data;
};

// Reports and Insights
export const generateReport = async (data: {
  type: 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';
  startDate?: Date;
  endDate?: Date;
  includeAiInsights?: boolean;
  categories?: string[];
}): Promise<ApiResponse<{ report: WellnessReport }>> => {
  const response = await api.post('/wellness-coaching/reports/generate', data);
  return response.data;
};

export const getReports = async (limit?: number): Promise<ApiResponse<ReportsResponse>> => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  
  const response = await api.get(`/wellness-coaching/reports?${params.toString()}`);
  return response.data;
};

export const getReport = async (reportId: string): Promise<ApiResponse<{ report: WellnessReport }>> => {
  const response = await api.get(`/wellness-coaching/reports/${reportId}`);
  return response.data;
};

export const generateWeeklyReport = async (): Promise<ApiResponse<{ report: WellnessReport }>> => {
  const response = await api.post('/wellness-coaching/reports/weekly');
  return response.data;
};

export const generateMonthlyReport = async (): Promise<ApiResponse<{ report: WellnessReport }>> => {
  const response = await api.post('/wellness-coaching/reports/monthly');
  return response.data;
};

export const generateComparisonReport = async (data: {
  current: { start: Date; end: Date };
  previous: { start: Date; end: Date };
}): Promise<ApiResponse<ComparisonReport>> => {
  const response = await api.post('/wellness-coaching/reports/comparison', data);
  return response.data;
};

// Utility
export const getGoalCategories = async (): Promise<ApiResponse<CategoriesResponse>> => {
  const response = await api.get('/wellness-coaching/categories');
  return response.data;
};

export const healthCheck = async (): Promise<ApiResponse<{ timestamp: string }>> => {
  const response = await api.get('/wellness-coaching/health-check');
  return response.data;
};

// Constants
export const GOAL_CATEGORIES = [
  'physical_activity',
  'nutrition',
  'sleep',
  'mental_health',
  'stress_management',
  'weight_management',
  'medical_adherence',
  'habits',
  'mindfulness',
  'social_wellness',
  'preventive_care',
  'recovery'
] as const;

export const GOAL_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
export const GOAL_STATUSES = ['draft', 'active', 'paused', 'completed', 'abandoned'] as const;

export const CATEGORY_LABELS = {
  physical_activity: 'Physical Activity',
  nutrition: 'Nutrition',
  sleep: 'Sleep',
  mental_health: 'Mental Health',
  stress_management: 'Stress Management',
  weight_management: 'Weight Management',
  medical_adherence: 'Medical Adherence',
  habits: 'Habits',
  mindfulness: 'Mindfulness',
  social_wellness: 'Social Wellness',
  preventive_care: 'Preventive Care',
  recovery: 'Recovery'
};

export const PRIORITY_COLORS = {
  low: 'text-blue-600 bg-blue-100',
  medium: 'text-yellow-600 bg-yellow-100',
  high: 'text-orange-600 bg-orange-100',
  critical: 'text-red-600 bg-red-100'
};

export const STATUS_COLORS = {
  draft: 'text-gray-600 bg-gray-100',
  active: 'text-green-600 bg-green-100',
  paused: 'text-yellow-600 bg-yellow-100',
  completed: 'text-blue-600 bg-blue-100',
  abandoned: 'text-red-600 bg-red-100'
};
