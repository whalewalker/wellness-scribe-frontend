import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar, 
  Award, 
  Clock, 
  Brain,
  Activity,
  Heart,
  Star,
  AlertCircle,
  CheckCircle,
  Trophy,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Sparkles
} from 'lucide-react';
import { toast } from '../hooks/use-toast';
import {
  getDashboard,
  getGoals,
  DashboardData,
  WellnessGoal,
  DashboardFilters,
  CATEGORY_LABELS,
  PRIORITY_COLORS,
  STATUS_COLORS,
  GOAL_CATEGORIES,
  GOAL_PRIORITIES,
  GOAL_STATUSES
} from '../api/wellness-coaching';
import { formatDistanceToNow, format } from 'date-fns';

// Components
import { NavBar } from '../components/NavBar';
import CreateGoalDialog from '../components/wellness/CreateGoalDialog';
import AIInsights from '../components/wellness/AIInsights';
import GoalCard from '../components/wellness/GoalCard';
import ProgressChart from '../components/wellness/ProgressChart';

const WellnessCoaching: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [goals, setGoals] = useState<WellnessGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<DashboardFilters>({});
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateGoal, setShowCreateGoal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [filters]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardResponse, goalsResponse] = await Promise.all([
        getDashboard(filters),
        getGoals()
      ]);
      
      setDashboardData(dashboardResponse.data);
      setGoals(goalsResponse.data.goals);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wellness dashboard',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoalCreated = () => {
    loadDashboardData();
    setShowCreateGoal(false);
    toast({
      title: 'Success',
      description: 'Goal created successfully!',
      variant: 'default'
    });
  };

  const handleGoalUpdated = () => {
    loadDashboardData();
  };

  const filteredGoals = goals.filter(goal =>
    goal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    goal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    goal.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'active':
        return <Activity className="h-4 w-4 text-blue-600" />;
      case 'paused':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'abandoned':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <TrendingUp className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <Target className="h-4 w-4 text-yellow-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50">
      <NavBar />
      <div className="container mx-auto px-6 py-12 space-y-12">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
              Wellness Coaching
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Transform your wellness journey with personalized goal tracking and AI-powered insights
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 text-lg"
            >
              <Filter className="h-5 w-5" />
              Filters
            </Button>
            <Button
              onClick={() => setShowCreateGoal(true)}
              className="flex items-center gap-2 px-8 py-3 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              Create New Goal
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="backdrop-blur-sm bg-white/80 shadow-xl border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Filter Your Goals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <Select
                    value={filters.statuses?.[0] || ''}
                    onValueChange={(value) => setFilters({ ...filters, statuses: value ? [value] : undefined })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      {GOAL_STATUSES.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <Select
                    value={filters.categories?.[0] || ''}
                    onValueChange={(value) => setFilters({ ...filters, categories: value ? [value] : undefined })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Categories</SelectItem>
                      {GOAL_CATEGORIES.map(category => (
                        <SelectItem key={category} value={category}>
                          {CATEGORY_LABELS[category]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <Select
                    value={filters.priorities?.[0] || ''}
                    onValueChange={(value) => setFilters({ ...filters, priorities: value ? [value] : undefined })}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="All Priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Priorities</SelectItem>
                      {GOAL_PRIORITIES.map(priority => (
                        <SelectItem key={priority} value={priority}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Actions</label>
                  <Button
                    variant="outline"
                    onClick={() => setFilters({})}
                    className="w-full h-11"
                  >
                    Clear All Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="inline-flex bg-gray-100 rounded-lg p-1 border">
              <TabsTrigger 
                value="dashboard" 
                className="px-6 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="goals"
                className="px-6 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900"
              >
                Goals
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="px-6 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900"
              >
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="insights"
                className="px-6 py-2 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900"
              >
                AI Insights
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-12">
            {dashboardData && (
              <>
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <Card className="group hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100/50 border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                      <CardTitle className="text-lg font-semibold text-blue-900">Total Goals</CardTitle>
                      <div className="p-3 bg-blue-200/50 rounded-xl group-hover:bg-blue-200 transition-colors">
                        <Target className="h-6 w-6 text-blue-600" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-4xl font-bold text-blue-900 mb-2">{dashboardData.metrics.totalGoals}</div>
                      <p className="text-blue-700/80 font-medium">
                        {dashboardData.metrics.activeGoals} currently active
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100/50 border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                      <CardTitle className="text-lg font-semibold text-green-900">Completed Goals</CardTitle>
                      <div className="p-3 bg-green-200/50 rounded-xl group-hover:bg-green-200 transition-colors">
                        <Trophy className="h-6 w-6 text-green-600" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-4xl font-bold text-green-900 mb-2">{dashboardData.metrics.completedGoals}</div>
                      <p className="text-green-700/80 font-medium">
                        {dashboardData.metrics.totalGoals > 0 
                          ? Math.round((dashboardData.metrics.completedGoals / dashboardData.metrics.totalGoals) * 100)
                          : 0}% completion rate
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                      <CardTitle className="text-lg font-semibold text-yellow-900">Streak Days</CardTitle>
                      <div className="p-3 bg-yellow-200/50 rounded-xl group-hover:bg-yellow-200 transition-colors">
                        <Star className="h-6 w-6 text-yellow-600" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-4xl font-bold text-yellow-900 mb-2">{dashboardData.metrics.streakDays}</div>
                      <p className="text-yellow-700/80 font-medium">
                        Amazing consistency! 🔥
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100/50 border-0 shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                      <CardTitle className="text-lg font-semibold text-purple-900">Overall Progress</CardTitle>
                      <div className="p-3 bg-purple-200/50 rounded-xl group-hover:bg-purple-200 transition-colors">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-4xl font-bold text-purple-900 mb-4">{Math.round(dashboardData.metrics.overallProgress)}%</div>
                      <Progress 
                        value={dashboardData.metrics.overallProgress} 
                        className="h-3 bg-purple-200"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Dashboard Grid Layout */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* Left Column - AI Insights */}
                  <div className="xl:col-span-2 space-y-8">
                    {/* AI Insights & Recommendations */}
                {dashboardData.insights.length > 0 && (
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 rounded-3xl blur-xl opacity-60" />
                        <Card className="relative bg-white/70 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-purple-50/30 to-fuchsia-50/50" />
                          
                          <CardHeader className="relative pb-6 pt-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400 to-purple-500 rounded-xl blur-md opacity-30 scale-110" />
                                  <div className="relative p-3 bg-gradient-to-r from-violet-100 to-purple-100 rounded-xl">
                                    <Brain className="h-6 w-6 text-violet-700" />
                                  </div>
                        </div>
                                <div>
                                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-violet-700 via-purple-700 to-fuchsia-700 bg-clip-text text-transparent">
                        AI Insights & Recommendations
                      </CardTitle>
                                  <CardDescription className="text-sm text-violet-600/80 mt-1">
                                    Personalized insights powered by AI
                      </CardDescription>
                      </div>
                              </div>
                              <div className="hidden md:flex items-center gap-2">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-100 to-purple-100 rounded-full border border-violet-200">
                                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                  <span className="text-xs font-medium text-violet-700">Active</span>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="relative">
                            <div className="space-y-4">
                              {dashboardData.insights.slice(0, 3).map((insight, index) => (
                                <div
                                  key={index}
                                  className={`relative group overflow-hidden rounded-xl border-0 shadow-md hover:shadow-lg transition-all duration-300 ${
                                    insight.type === 'success' ? 'bg-gradient-to-r from-emerald-50 to-green-50' :
                                    insight.type === 'warning' ? 'bg-gradient-to-r from-amber-50 to-yellow-50' :
                                    insight.type === 'celebration' ? 'bg-gradient-to-r from-pink-50 to-rose-50' :
                                    'bg-gradient-to-r from-blue-50 to-cyan-50'
                                  }`}
                                >
                                  <div className="relative p-4">
                                    <div className="flex items-start gap-3">
                                      <div className={`p-2 rounded-lg ${
                                        insight.type === 'success' ? 'bg-emerald-100' :
                                        insight.type === 'warning' ? 'bg-amber-100' :
                                        insight.type === 'celebration' ? 'bg-pink-100' :
                                        'bg-blue-100'
                                      }`}>
                                        <AlertCircle className={`h-4 w-4 ${
                                          insight.type === 'success' ? 'text-emerald-600' :
                                          insight.type === 'warning' ? 'text-amber-600' :
                                          insight.type === 'celebration' ? 'text-pink-600' :
                                          'text-blue-600'
                                        }`} />
                                      </div>
                                      
                                      <div className="flex-1">
                                        <h3 className={`text-sm font-bold mb-1 ${
                                          insight.type === 'success' ? 'text-emerald-900' :
                                          insight.type === 'warning' ? 'text-amber-900' :
                                          insight.type === 'celebration' ? 'text-pink-900' :
                                          'text-blue-900'
                                        }`}>
                                          {insight.title}
                                        </h3>
                                        <p className={`text-xs leading-relaxed ${
                                          insight.type === 'success' ? 'text-emerald-700' :
                                          insight.type === 'warning' ? 'text-amber-700' :
                                          insight.type === 'celebration' ? 'text-pink-700' :
                                          'text-blue-700'
                                        }`}>
                                          {insight.message}
                                        </p>
                                      </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                      </div>
                    )}

              {/* Upcoming Deadlines */}
              {dashboardData.upcomingDeadlines.length > 0 && (
                      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                        <CardHeader className="pb-6">
                          <CardTitle className="flex items-center gap-3 text-xl font-bold text-gray-900">
                            <div className="p-3 bg-red-100 rounded-xl">
                              <Calendar className="h-6 w-6 text-red-600" />
                            </div>
                      Upcoming Deadlines
                    </CardTitle>
                          <CardDescription className="text-lg text-gray-600">
                            Stay on track with your wellness goals
                          </CardDescription>
                  </CardHeader>
                  <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dashboardData.upcomingDeadlines.slice(0, 6).map((deadline, index) => (
                              <div key={index} className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 border border-red-100 hover:shadow-md transition-all duration-300">
                    <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-semibold text-gray-900">{deadline.title}</h4>
                            <Badge 
                              variant={
                                deadline.urgency === 'critical' ? 'destructive' :
                                deadline.urgency === 'high' ? 'secondary' :
                                'outline'
                              }
                                      className="font-semibold"
                            >
                              {deadline.daysRemaining === 0 ? 'Today' : 
                               deadline.daysRemaining === 1 ? 'Tomorrow' :
                                       `${deadline.daysRemaining}d`}
                            </Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs px-2 py-1">
                                      {deadline.type === 'goal' ? 'Goal' : 'Milestone'}
                                    </Badge>
                                    <span className="text-xs text-gray-600">deadline</span>
                                  </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
                  </div>

                                    {/* Right Column - Recent Achievements */}
                  <div className="space-y-6">
              {/* Recent Achievements */}
              {dashboardData.recentAchievements.length > 0 && (
                      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <Award className="h-4 w-4 text-green-600" />
                            </div>
                      Recent Achievements
                    </CardTitle>
                          <CardDescription className="text-sm text-gray-600">
                            Celebrate your wins
                          </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {dashboardData.recentAchievements.slice(0, 5).map((achievement, index) => (
                              <div key={index} className="relative bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100 hover:shadow-md transition-all duration-300 group">
                                <div className="flex items-center space-x-3">
                                  <div className="p-1.5 bg-green-100 rounded-lg">
                                    <Trophy className="h-3 w-3 text-green-600" />
                                  </div>
                          <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-green-900 mb-0.5">{achievement.title}</h4>
                                    <p className="text-xs text-green-700">
                              {formatDistanceToNow(new Date(achievement.date), { addSuffix: true })}
                            </p>
                                  </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
                  </div>
                </div>
            </>
          )}
        </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-10">
            <div className="max-w-2xl mx-auto">
              <Input
                placeholder="Search your wellness goals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-14 text-lg px-6 rounded-2xl border-0 bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal._id}
                  goal={goal}
                  onUpdate={handleGoalUpdated}
                />
              ))}
            </div>

            {filteredGoals.length === 0 && (
              <div className="text-center py-20">
                <div className="max-w-md mx-auto space-y-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto">
                    <Target className="h-12 w-12 text-blue-600" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-gray-900">No goals found</h3>
                    <p className="text-lg text-gray-600 leading-relaxed">
                      {searchTerm ? 'Try adjusting your search terms or browse all goals' : 'Start your wellness journey by creating your first goal and begin tracking your progress'}
                    </p>
                  </div>
                  <Button 
                    onClick={() => setShowCreateGoal(true)}
                    className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Goal
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-10">
            {dashboardData && (
              <div className="space-y-8">
                <div className="text-center space-y-3">
                  <h2 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h2>
                  <p className="text-xl text-gray-600">Deep insights into your wellness journey</p>
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader className="pb-6">
                      <CardTitle className="flex items-center gap-3 text-xl font-bold">
                        <div className="p-2 bg-blue-100 rounded-xl">
                          <LineChart className="h-6 w-6 text-blue-600" />
                        </div>
                        Overall Progress Trends
                      </CardTitle>
                      <CardDescription className="text-base text-gray-600">
                        Track your wellness journey over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ProgressChart data={dashboardData.progressCharts.overall} height={350} />
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader className="pb-6">
                      <CardTitle className="flex items-center gap-3 text-xl font-bold">
                        <div className="p-2 bg-green-100 rounded-xl">
                          <PieChart className="h-6 w-6 text-green-600" />
                        </div>
                        Progress by Category
                      </CardTitle>
                      <CardDescription className="text-base text-gray-600">
                        See how you're progressing in different wellness areas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ProgressChart data={dashboardData.progressCharts.byCategory} type="pie" height={350} />
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader className="pb-6">
                      <CardTitle className="flex items-center gap-3 text-xl font-bold">
                        <div className="p-2 bg-pink-100 rounded-xl">
                          <Heart className="h-6 w-6 text-pink-600" />
                        </div>
                        Mood Trends
                      </CardTitle>
                      <CardDescription className="text-base text-gray-600">
                        Monitor your emotional wellness journey
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ProgressChart data={dashboardData.progressCharts.mood} height={350} />
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader className="pb-6">
                      <CardTitle className="flex items-center gap-3 text-xl font-bold">
                        <div className="p-2 bg-purple-100 rounded-xl">
                          <TrendingUp className="h-6 w-6 text-purple-600" />
                        </div>
                        Confidence Levels
                      </CardTitle>
                      <CardDescription className="text-base text-gray-600">
                        Track your growing confidence over time
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ProgressChart data={dashboardData.progressCharts.confidence} height={350} />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-10">
            <AIInsights goals={goals} onGoalUpdate={handleGoalUpdated} />
          </TabsContent>
        </Tabs>

        {/* Create Goal Dialog */}
        <CreateGoalDialog
          open={showCreateGoal}
          onOpenChange={setShowCreateGoal}
          onGoalCreated={handleGoalCreated}
        />
      </div>
    </div>
  );
};

export default WellnessCoaching;
