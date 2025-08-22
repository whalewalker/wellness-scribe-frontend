import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Brain, 
  Lightbulb, 
  TrendingUp, 
  Target, 
  CheckCircle, 
  XCircle,
  Clock,
  Sparkles,
  BarChart3,
  Users,
  Award,
  Trophy,
  Plus,
  Zap,
  Star,
  Rocket,
  Heart,
  Flame,
  Shield,
  ArrowUp,
  Calendar,
  Activity
} from 'lucide-react';
import { toast } from '../../hooks/use-toast';
import {
  WellnessGoal,
  getAdaptiveAdjustments,
  applyAdaptiveAdjustment,
  getGoalSuggestions,
  generateReport,
  AdaptiveAdjustment,
  GoalSuggestion,
  getCelebrations,
  Celebration,
  createGoal,
  CreateGoalRequest
} from '../../api/wellness-coaching';
import CreateGoalDialog from './CreateGoalDialog';
import { formatDistanceToNow } from 'date-fns';

interface AIInsightsProps {
  goals: WellnessGoal[];
  onGoalUpdate: () => void;
}

const AIInsights: React.FC<AIInsightsProps> = ({ goals, onGoalUpdate }) => {
  const [adaptiveAdjustments, setAdaptiveAdjustments] = useState<{ [goalId: string]: AdaptiveAdjustment[] }>({});
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([]);
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [showCreateGoalDialog, setShowCreateGoalDialog] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<GoalSuggestion | null>(null);

  useEffect(() => {
    loadInsights();
  }, [goals]);

  const loadInsights = async () => {
    try {
      setLoading(true);
      
      // Load celebrations
      const celebrationsResponse = await getCelebrations(10);
      setCelebrations(celebrationsResponse.data.celebrations);

      // Load adaptive adjustments for active goals
      const activeGoals = goals.filter(goal => goal.status === 'active');
      const adjustmentsPromises = activeGoals.map(async (goal) => {
        try {
          const response = await getAdaptiveAdjustments(goal._id);
          return { goalId: goal._id, adjustments: response.data.adjustments };
        } catch (error) {
          console.error(`Error loading adjustments for goal ${goal._id}:`, error);
          return { goalId: goal._id, adjustments: [] };
        }
      });

      const adjustmentsResults = await Promise.all(adjustmentsPromises);
      const adjustmentsMap: { [goalId: string]: AdaptiveAdjustment[] } = {};
      adjustmentsResults.forEach(({ goalId, adjustments }) => {
        adjustmentsMap[goalId] = adjustments;
      });
      setAdaptiveAdjustments(adjustmentsMap);

      // Get goal suggestions for improvement
      if (goals.length > 0) {
        const categories = [...new Set(goals.map(goal => goal.category))];
        try {
          const suggestionsResponse = await getGoalSuggestions({
            categories: categories.slice(0, 3), // Limit to avoid too many suggestions
            fitnessLevel: 'intermediate',
            availableTimePerDay: 45,
            preferredDuration: 6
          });
          setSuggestions(suggestionsResponse.data.suggestions.slice(0, 3));
        } catch (error) {
          console.error('Error loading suggestions:', error);
        }
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyAdjustment = async (goalId: string, adjustmentIndex: number, accepted: boolean) => {
    try {
      // For demo purposes, we'll use a mock adjustment ID
      const adjustmentId = `${goalId}-${adjustmentIndex}`;
      
      await applyAdaptiveAdjustment(adjustmentId, {
        accepted,
        rating: accepted ? 5 : 2,
        comments: accepted ? 'Looks good!' : 'Not suitable for me'
      });

      toast({
        title: accepted ? 'Adjustment Applied' : 'Adjustment Dismissed',
        description: accepted ? 
          'The AI suggestion has been applied to your goal' : 
          'The suggestion has been dismissed',
        variant: 'default'
      });

      // Remove the adjustment from the list
      setAdaptiveAdjustments(prev => ({
        ...prev,
        [goalId]: prev[goalId]?.filter((_, index) => index !== adjustmentIndex) || []
      }));

      if (accepted) {
        onGoalUpdate();
      }
    } catch (error) {
      console.error('Error applying adjustment:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply adjustment',
        variant: 'destructive'
      });
    }
  };

  const generateInsightReport = async () => {
    try {
      setLoading(true);
      await generateReport({
        type: 'weekly',
        includeAiInsights: true
      });

      toast({
        title: 'Report Generated',
        description: 'Your AI insights report has been generated successfully',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate insights report',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = (suggestion: GoalSuggestion) => {
    setSelectedSuggestion(suggestion);
    setShowCreateGoalDialog(true);
  };

  const handleGoalCreated = () => {
    setShowCreateGoalDialog(false);
    setSelectedSuggestion(null);
    onGoalUpdate();
    toast({
      title: 'Goal Created',
      description: 'Your new wellness goal has been created successfully!',
      variant: 'default'
    });
  };

  const getGoalInsights = (goal: WellnessGoal) => {
    const progressPercentage = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
    const daysRemaining = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const isOnTrack = progressPercentage >= (1 - (daysRemaining / 30)) * 100; // Rough calculation

    const insights = [];

    if (progressPercentage >= 90) {
      insights.push({
        type: 'success' as const,
        message: 'Excellent progress! You\'re almost at your goal.',
        icon: <Award className="h-4 w-4" />
      });
    } else if (progressPercentage >= 70) {
      insights.push({
        type: 'positive' as const,
        message: 'Great job! You\'re making solid progress.',
        icon: <TrendingUp className="h-4 w-4" />
      });
    } else if (progressPercentage < 30 && daysRemaining < 7) {
      insights.push({
        type: 'warning' as const,
        message: 'Consider adjusting your goal or timeline.',
        icon: <Clock className="h-4 w-4" />
      });
    }

    if (!isOnTrack && daysRemaining > 0) {
      insights.push({
        type: 'suggestion' as const,
        message: 'You might need to increase your daily effort to stay on track.',
        icon: <Target className="h-4 w-4" />
      });
    }

    return insights;
  };

  const getOverallInsights = () => {
    const activeGoals = goals.filter(goal => goal.status === 'active');
    const completedGoals = goals.filter(goal => goal.status === 'completed');
    const overallProgress = goals.length > 0 ? 
      goals.reduce((sum, goal) => sum + (goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0), 0) / goals.length : 0;

    const insights = [];

    if (completedGoals.length > 0) {
      insights.push({
        type: 'celebration' as const,
        title: 'Achievements Unlocked!',
        message: `You've completed ${completedGoals.length} goal${completedGoals.length > 1 ? 's' : ''}!`,
        icon: <Award className="h-5 w-5" />
      });
    }

    if (activeGoals.length > 5) {
      insights.push({
        type: 'suggestion' as const,
        title: 'Focus Your Energy',
        message: 'Consider focusing on fewer goals for better results.',
        icon: <Target className="h-5 w-5" />
      });
    }

    if (overallProgress > 80) {
      insights.push({
        type: 'success' as const,
        title: 'Excellent Progress!',
        message: 'You\'re doing amazing across all your goals.',
        icon: <Sparkles className="h-5 w-5" />
      });
    }

    return insights;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-6">
        <div className="space-y-8">
          {/* Header Skeleton */}
          <div className="animate-pulse">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12">
              <div className="flex items-center justify-between">
                <div className="space-y-4">
                  <div className="h-12 bg-white/20 rounded-lg w-80"></div>
                  <div className="h-6 bg-white/20 rounded w-96"></div>
                </div>
                <div className="h-12 bg-white/20 rounded-lg w-40"></div>
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-32 bg-gray-100 rounded-2xl"></div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="space-y-8 p-6">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
          <div className="relative z-10 p-8 md:p-12">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center lg:text-left">
                  <div className="inline-flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                        <Brain className="h-8 w-8 text-white" />
                      </div>
                    </div>
                    <div className="text-left">
                      <h1 className="text-4xl lg:text-5xl font-bold text-white mb-2">
                        AI Wellness Hub
                      </h1>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-yellow-300" />
                        <span className="text-yellow-300 font-medium">Intelligent Insights</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xl text-white/90 leading-relaxed mb-8 max-w-2xl">
                    Your personal AI companion analyzing patterns, optimizing goals, and celebrating achievements 
                    on your wellness journey.
                  </p>
                  
                  <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full border border-white/30 backdrop-blur-sm">
                      <Activity className="h-4 w-4 text-green-300" />
                      <span className="text-white/90 text-sm">Live Analytics</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full border border-white/30 backdrop-blur-sm">
                      <Zap className="h-4 w-4 text-yellow-300" />
                      <span className="text-white/90 text-sm">Smart Recommendations</span>
                    </div>
                  </div>
                </div>
                
                <div className="lg:flex-shrink-0">
                  <Button 
                    onClick={generateInsightReport} 
                    disabled={loading}
                    size="lg"
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                  >
                    <BarChart3 className="h-5 w-5 mr-3" />
                    Generate AI Report
                    <ArrowUp className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Pills */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full bg-transparent p-0 h-auto grid grid-cols-2 lg:grid-cols-4 gap-2">
                <TabsTrigger 
                  value="overview"
                  className="flex-col gap-2 p-4 rounded-xl data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-md hover:bg-gray-50 transition-all duration-200 border-0 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    <span className="font-semibold">Overview</span>
                  </div>
                  <span className="text-xs text-gray-500">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="adjustments"
                  className="flex-col gap-2 p-4 rounded-xl data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-md hover:bg-gray-50 transition-all duration-200 border-0 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    <span className="font-semibold">Smart AI</span>
                  </div>
                  <span className="text-xs text-gray-500">Optimize</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="suggestions"
                  className="flex-col gap-2 p-4 rounded-xl data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 data-[state=active]:shadow-md hover:bg-gray-50 transition-all duration-200 border-0 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    <span className="font-semibold">Discover</span>
                  </div>
                  <span className="text-xs text-gray-500">Explore</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="celebrations"
                  className="flex-col gap-2 p-4 rounded-xl data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 data-[state=active]:shadow-md hover:bg-gray-50 transition-all duration-200 border-0 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    <span className="font-semibold">Wins</span>
                  </div>
                  <span className="text-xs text-gray-500">Celebrate</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="mt-8">
                <div className="max-w-6xl mx-auto space-y-8">
                  
                  {/* Stats Overview - Bento Box Style */}
                  <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-4">
                    
                    {/* Active Goals - Large Card */}
                    <div className="md:col-span-3 lg:col-span-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-3 bg-white/20 rounded-xl">
                            <Target className="h-6 w-6" />
                          </div>
                          <span className="text-blue-100 font-medium">Active Goals</span>
                        </div>
                        <div className="text-4xl font-bold mb-2">
                          {goals.filter(goal => goal.status === 'active').length}
                        </div>
                        <p className="text-blue-100 text-sm">Currently pursuing</p>
                      </div>
                    </div>

                    {/* Completed Goals */}
                    <div className="md:col-span-2 lg:col-span-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                      <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full"></div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-emerald-100 text-sm font-medium">Completed</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">
                          {goals.filter(goal => goal.status === 'completed').length}
                        </div>
                        <p className="text-emerald-100 text-xs">Goals achieved</p>
                      </div>
                    </div>

                    {/* Progress Meter */}
                    <div className="md:col-span-3 lg:col-span-5 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm group hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-50 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">Overall Progress</h3>
                            <p className="text-sm text-gray-500">Average completion rate</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {Math.round(goals.length > 0 ? 
                              goals.reduce((sum, goal) => sum + (goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0), 0) / goals.length : 0)}%
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Progress 
                          value={Math.round(goals.length > 0 ? 
                            goals.reduce((sum, goal) => sum + (goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0), 0) / goals.length : 0)} 
                          className="h-3"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Started</span>
                          <span>Completed</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main Content Area */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* AI Insights - Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      {/* AI Insights Card */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 rounded-xl">
                              <Brain className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">AI Performance Insights</h3>
                              <p className="text-sm text-gray-600">Intelligent analysis of your progress</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <div className="space-y-4">
                            {getOverallInsights().length > 0 ? (
                              getOverallInsights().map((insight, index) => (
                                <div key={index} className={`p-4 rounded-xl border-l-4 ${
                                  insight.type === 'success' ? 'bg-emerald-50 border-emerald-400' :
                                  insight.type === 'celebration' ? 'bg-purple-50 border-purple-400' :
                                  insight.type === 'suggestion' ? 'bg-amber-50 border-amber-400' :
                                  'bg-blue-50 border-blue-400'
                                }`}>
                                  <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg ${
                                      insight.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                      insight.type === 'celebration' ? 'bg-purple-100 text-purple-600' :
                                      insight.type === 'suggestion' ? 'bg-amber-100 text-amber-600' :
                                      'bg-blue-100 text-blue-600'
                                    }`}>
                                      {insight.icon}
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                                      <p className="text-gray-700 text-sm leading-relaxed">{insight.message}</p>
                                      <div className="mt-2">
                                        <Badge 
                                          className={`text-xs ${
                                            insight.type === 'success' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                            insight.type === 'celebration' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                            insight.type === 'suggestion' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                            'bg-blue-100 text-blue-700 border-blue-200'
                                          } border`}
                                        >
                                          {insight.type}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-12">
                                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                                  <Brain className="h-10 w-10 text-indigo-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Learning Mode</h3>
                                <p className="text-gray-600 text-sm max-w-sm mx-auto leading-relaxed">
                                  Your AI assistant is analyzing patterns and building personalized insights
                                </p>
                                <div className="flex items-center justify-center gap-4 mt-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                                    <span className="text-xs text-gray-500">Analyzing</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Zap className="h-3 w-3 text-amber-500" />
                                    <span className="text-xs text-gray-500">Learning</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Sidebar - Goal Analysis */}
                    <div className="lg:col-span-1 space-y-6">
                      
                      {/* Quick Stats */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-slate-100 rounded-xl">
                            <BarChart3 className="h-5 w-5 text-slate-600" />
                          </div>
                          <h3 className="font-semibold text-gray-900">Quick Stats</h3>
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm text-gray-600">This Week</span>
                            <span className="font-semibold text-gray-900">
                              {goals.filter(goal => goal.status === 'active').length} goals
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm text-gray-600">Streak</span>
                            <span className="font-semibold text-gray-900">7 days</span>
                          </div>
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm text-gray-600">Avg Score</span>
                            <span className="font-semibold text-gray-900">
                              {Math.round(goals.length > 0 ? 
                                goals.reduce((sum, goal) => sum + (goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0), 0) / goals.length : 0)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Active Goals */}
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-xl">
                              <Target className="h-5 w-5 text-slate-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">Active Goals</h3>
                              <p className="text-sm text-gray-600">Current progress</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-6">
                          <div className="space-y-4">
                            {goals.filter(goal => goal.status === 'active').slice(0, 3).map((goal) => {
                              const progressPercentage = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
                              return (
                                <div key={goal._id} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-gray-900 text-sm truncate">{goal.title}</h4>
                                    <span className="text-sm font-semibold text-gray-700">
                                      {Math.round(progressPercentage)}%
                                    </span>
                                  </div>
                                  <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
                                  <div className="flex justify-between text-xs text-gray-500">
                                    <span>{goal.currentValue} {goal.unit}</span>
                                    <span>{goal.targetValue} {goal.unit}</span>
                                  </div>
                                </div>
                              );
                            })}

                            {goals.filter(goal => goal.status === 'active').length === 0 && (
                              <div className="text-center py-8">
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                  <Target className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-gray-600 text-sm">No active goals</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Smart Adjustments Tab */}
              <TabsContent value="adjustments" className="mt-8">
                <div className="max-w-6xl mx-auto space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Smart AI Adjustments</h2>
                    <p className="text-gray-600">AI-powered recommendations to optimize your goals</p>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-xl">
                          <TrendingUp className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Available Adjustments</h3>
                          <p className="text-sm text-gray-600">AI recommendations for your goals</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-4">
                        {Object.entries(adaptiveAdjustments).map(([goalId, adjustments]) => {
                          const goal = goals.find(g => g._id === goalId);
                          if (!goal || adjustments.length === 0) return null;

                          return (
                            <div key={goalId} className="space-y-3">
                              <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                              <div className="space-y-3">
                                {adjustments.map((adjustment, index) => (
                                  <div key={index} className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <div className="flex items-start justify-between mb-3">
                                      <div className="flex items-center gap-2">
                                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">
                                          {adjustment.type}
                                        </Badge>
                                        <Badge 
                                          variant={
                                            adjustment.impact === 'high' ? 'destructive' :
                                            adjustment.impact === 'medium' ? 'secondary' :
                                            'default'
                                          }
                                          className="text-xs"
                                        >
                                          {adjustment.impact}
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                      <div>
                                        <h5 className="font-medium text-gray-900 mb-1">
                                          {adjustment.suggestion}
                                        </h5>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                          {adjustment.reasoning}
                                        </p>
                                      </div>
                                      
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-gray-600">Confidence:</span>
                                          <Progress value={adjustment.confidence * 20} className="w-16 h-2" />
                                          <span className="text-xs font-medium text-gray-700">
                                            {Math.round(adjustment.confidence * 20)}%
                                          </span>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                          <Button
                                            size="sm"
                                            onClick={() => handleApplyAdjustment(goalId, index, true)}
                                            className="bg-emerald-600 hover:bg-emerald-700 h-8 px-3 text-xs"
                                          >
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Apply
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleApplyAdjustment(goalId, index, false)}
                                            className="h-8 px-3 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                          >
                                            <XCircle className="h-3 w-3 mr-1" />
                                            Dismiss
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}

                        {Object.values(adaptiveAdjustments).every(adjustments => adjustments.length === 0) && (
                          <div className="text-center py-12">
                            <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                              <TrendingUp className="h-10 w-10 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">All Optimized!</h3>
                            <p className="text-gray-600">
                              No adjustments needed. Your goals are perfectly on track!
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Suggestions Tab */}
              <TabsContent value="suggestions" className="mt-8">
                <div className="max-w-6xl mx-auto space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Discover New Goals</h2>
                    <p className="text-gray-600">AI-curated wellness goals tailored to your interests</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="p-2 bg-amber-50 rounded-lg">
                              <Target className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={suggestion.difficulty === 'beginner' ? 'default' : suggestion.difficulty === 'intermediate' ? 'secondary' : 'destructive'}
                                className="text-xs"
                              >
                                {suggestion.difficulty}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {suggestion.suggestedDuration}w
                              </Badge>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-bold text-gray-900 mb-2">
                            {suggestion.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4">
                            {suggestion.description}
                          </p>
                          
                          <div className="space-y-4">
                            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                              <h4 className="text-xs font-semibold text-amber-900 mb-1">Target Goal</h4>
                              <p className="text-sm font-bold text-amber-800">
                                {suggestion.targetValue} {suggestion.unit}
                              </p>
                              <p className="text-xs text-amber-700">
                                over {suggestion.suggestedDuration} weeks
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="text-xs font-semibold text-gray-700 mb-2">Benefits</h4>
                              <ul className="space-y-1">
                                {suggestion.benefits.slice(0, 2).map((benefit, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                    <div className="w-1 h-1 bg-amber-400 rounded-full mt-1.5 flex-shrink-0" />
                                    {benefit}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <Button 
                              onClick={() => handleAddGoal(suggestion)}
                              className="w-full bg-amber-600 hover:bg-amber-700"
                              size="sm"
                            >
                              <Plus className="h-3 w-3 mr-2" />
                              Add Goal
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {suggestions.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                          <Lightbulb className="h-10 w-10 text-amber-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">More Goals Coming Soon</h3>
                        <p className="text-gray-600">
                          Complete your current goals to unlock personalized recommendations
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Achievements Tab */}
              <TabsContent value="celebrations" className="mt-8">
                <div className="max-w-6xl mx-auto space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Achievements</h2>
                    <p className="text-gray-600">Celebrate your wellness journey milestones</p>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-xl">
                          <Award className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Recent Achievements</h3>
                          <p className="text-sm text-gray-600">Your wins and milestone celebrations</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="space-y-4">
                        {celebrations.map((celebration, index) => (
                          <div key={index} className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <Award className="h-4 w-4 text-purple-600" />
                              </div>
                              
                              <div className="flex-1 space-y-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{celebration.title}</h4>
                                  <p className="text-gray-700 text-sm">{celebration.message}</p>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <p className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(celebration.date), { addSuffix: true })}
                                  </p>
                                  <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">
                                    🏆 {celebration.achievement}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {celebrations.length === 0 && (
                          <div className="text-center py-12">
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                              <Award className="h-10 w-10 text-purple-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Your First Win Awaits!</h3>
                            <p className="text-gray-600">
                              Complete goals and reach milestones to unlock achievements
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Create Goal Dialog */}
        <CreateGoalDialog
          open={showCreateGoalDialog}
          onOpenChange={setShowCreateGoalDialog}
          onGoalCreated={handleGoalCreated}
          initialSuggestion={selectedSuggestion}
        />
      </div>
    </div>
  );
};

export default AIInsights;