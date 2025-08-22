import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Slider } from '../ui/slider';
import { 
  Edit, 
  Plus, 
  Calendar, 
  Target, 
  TrendingUp, 
  Clock,
  Award,
  Brain,
  MoreHorizontal,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  XCircle
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from '../../hooks/use-toast';
import {
  WellnessGoal,
  addProgress,
  addMilestone,
  updateGoal,
  AddProgressRequest,
  AddMilestoneRequest,
  CATEGORY_LABELS,
  PRIORITY_COLORS,
  STATUS_COLORS
} from '../../api/wellness-coaching';

interface GoalCardProps {
  goal: WellnessGoal;
  onUpdate: () => void;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal, onUpdate }) => {
  const [showAddProgress, setShowAddProgress] = useState(false);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  const [progressData, setProgressData] = useState<AddProgressRequest>({
    value: 0,
    date: new Date(),
    notes: '',
    mood: 3,
    confidence: 3,
    challenges: []
  });

  const [milestoneData, setMilestoneData] = useState<AddMilestoneRequest>({
    title: '',
    description: '',
    targetValue: 0,
    targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    reward: ''
  });

  const progressPercentage = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
  const daysRemaining = Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysRemaining < 0;
  const isCompleted = goal.status === 'completed';

  const handleAddProgress = async () => {
    try {
      setLoading(true);
      await addProgress(goal._id, progressData);
      
      toast({
        title: 'Progress Added',
        description: 'Your progress has been recorded successfully!',
        variant: 'default'
      });

      setProgressData({
        value: 0,
        date: new Date(),
        notes: '',
        mood: 3,
        confidence: 3,
        challenges: []
      });
      setShowAddProgress(false);
      onUpdate();
    } catch (error) {
      console.error('Error adding progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to add progress',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMilestone = async () => {
    try {
      setLoading(true);
      await addMilestone(goal._id, milestoneData);
      
      toast({
        title: 'Milestone Added',
        description: 'New milestone has been created!',
        variant: 'default'
      });

      setMilestoneData({
        title: '',
        description: '',
        targetValue: 0,
        targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        reward: ''
      });
      setShowAddMilestone(false);
      onUpdate();
    } catch (error) {
      console.error('Error adding milestone:', error);
      toast({
        title: 'Error',
        description: 'Failed to add milestone',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      setLoading(true);
      await updateGoal(goal._id, { status: newStatus as any });
      
      toast({
        title: 'Status Updated',
        description: `Goal status changed to ${newStatus}`,
        variant: 'default'
      });

      onUpdate();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update goal status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    switch (goal.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'active':
        return <PlayCircle className="h-4 w-4 text-blue-600" />;
      case 'paused':
        return <PauseCircle className="h-4 w-4 text-yellow-600" />;
      case 'abandoned':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNextMilestone = () => {
    return goal.milestones
      .filter(m => !m.completed)
      .sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())[0];
  };

  const nextMilestone = getNextMilestone();

  return (
    <>
      <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isCompleted ? 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200' : 
        isOverdue ? 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200' : 
        'bg-gradient-to-br from-white to-slate-50/30 border-slate-200 hover:border-slate-300'
      }`}>
        
        {/* Status Indicator Bar */}
        <div className={`h-1 w-full ${
          goal.status === 'completed' ? 'bg-gradient-to-r from-emerald-400 to-green-500' :
          goal.status === 'active' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
          goal.status === 'paused' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
          'bg-gradient-to-r from-gray-400 to-slate-500'
        }`} />
        
        <CardHeader className="pb-6 pt-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-xl ${
                  goal.status === 'completed' ? 'bg-emerald-100' :
                  goal.status === 'active' ? 'bg-blue-100' :
                  goal.status === 'paused' ? 'bg-yellow-100' :
                  'bg-gray-100'
                }`}>
                  {getStatusIcon()}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-bold text-gray-900 leading-tight mb-1">
                    {goal.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 leading-relaxed">
                    {goal.description}
                  </CardDescription>
                </div>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full hover:bg-white/80">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setShowDetails(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {goal.status !== 'completed' && (
                  <>
                    <DropdownMenuItem onClick={() => handleStatusChange('active')}>
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Activate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('paused')}>
                      <PauseCircle className="h-4 w-4 mr-2" />
                      Pause
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark Complete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Tags Row */}
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="secondary" 
              className={`text-xs font-medium px-3 py-1 ${
                goal.priority === 'high' ? 'bg-red-100 text-red-700 border-red-200' :
                goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                'bg-green-100 text-green-700 border-green-200'
              }`}
            >
              {goal.priority} priority
            </Badge>
            <Badge variant="outline" className="text-xs font-medium px-3 py-1 bg-white/80">
              {CATEGORY_LABELS[goal.category as keyof typeof CATEGORY_LABELS]}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-6 space-y-6">
          {/* Progress Section */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50">
            <div className="flex justify-between items-center mb-3">
              <div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {Math.round(progressPercentage)}%
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {goal.currentValue} / {goal.targetValue} {goal.unit}
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full ${
                  isOverdue ? 'bg-red-100 text-red-700' : 
                  daysRemaining <= 7 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                }`}>
                  <Clock className="h-3 w-3" />
                  {isOverdue ? `${Math.abs(daysRemaining)}d overdue` :
                   daysRemaining === 0 ? 'Due today' :
                   daysRemaining === 1 ? 'Due tomorrow' :
                   `${daysRemaining}d left`}
                </div>
              </div>
            </div>
            <div className="relative">
              <Progress 
                value={Math.min(progressPercentage, 100)} 
                className="h-3 bg-gray-200/80"
              />
            </div>
          </div>

          {/* Next Milestone */}
          {nextMilestone && (
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-amber-100 rounded-lg">
                  <Award className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-sm font-semibold text-amber-800">Next Milestone</span>
              </div>
              <p className="text-sm font-medium text-amber-900 mb-1">{nextMilestone.title}</p>
              <p className="text-xs text-amber-700">
                Target: {nextMilestone.targetValue} {goal.unit} by {format(new Date(nextMilestone.targetDate), 'MMM d, yyyy')}
              </p>
            </div>
          )}

          {/* Recent Activity */}
          {goal.progressEntries.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Last updated {formatDistanceToNow(new Date(goal.progressEntries[goal.progressEntries.length - 1].date), { addSuffix: true })}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              size="sm"
              onClick={() => setShowAddProgress(true)}
              disabled={goal.status === 'completed' || goal.status === 'abandoned'}
              className="flex-1 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Log Progress
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddMilestone(true)}
              disabled={goal.status === 'completed' || goal.status === 'abandoned'}
              className="h-10 px-4 bg-white/80 backdrop-blur-sm border-slate-300 hover:bg-white hover:border-slate-400 font-medium transition-all duration-200"
            >
              <Award className="h-4 w-4 mr-2" />
              Milestone
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDetails(true)}
              className="h-10 px-4 hover:bg-white/60 font-medium transition-all duration-200"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Progress Dialog */}
      <Dialog open={showAddProgress} onOpenChange={setShowAddProgress}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="text-center pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-900">Log Progress</DialogTitle>
            <DialogDescription className="text-lg text-gray-600">
              Record your progress for <span className="font-semibold text-gray-900">{goal.title}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="progress-value" className="text-base font-semibold text-gray-900">
                Progress Value *
              </Label>
              <Input
                id="progress-value"
                type="number"
                value={progressData.value}
                onChange={(e) => setProgressData(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                placeholder={`Enter value in ${goal.unit}`}
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="progress-notes" className="text-base font-semibold text-gray-900">
                Reflection Notes
              </Label>
              <Textarea
                id="progress-notes"
                value={progressData.notes}
                onChange={(e) => setProgressData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="How did it go? Any observations, challenges, or wins..."
                rows={4}
                className="text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900">Mood (1-5)</Label>
                <div className="space-y-3">
                  <Slider
                    value={[progressData.mood || 3]}
                    onValueChange={(value) => setProgressData(prev => ({ ...prev, mood: value[0] }))}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-lg">
                    <span>😢</span>
                    <span>😐</span>
                    <span>😊</span>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700">
                      Current: {progressData.mood || 3}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-semibold text-gray-900">Confidence (1-5)</Label>
                <div className="space-y-3">
                  <Slider
                    value={[progressData.confidence || 3]}
                    onValueChange={(value) => setProgressData(prev => ({ ...prev, confidence: value[0] }))}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                  </div>
                  <div className="text-center">
                    <span className="text-sm font-medium text-gray-700">
                      Current: {progressData.confidence || 3}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-100">
              <Button 
                variant="outline" 
                onClick={() => setShowAddProgress(false)}
                className="flex-1 h-12 text-base"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddProgress} 
                disabled={loading}
                className="flex-1 h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? 'Logging...' : 'Log Progress'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Milestone Dialog */}
      <Dialog open={showAddMilestone} onOpenChange={setShowAddMilestone}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader className="text-center pb-6">
            <DialogTitle className="text-2xl font-bold text-gray-900">Add Milestone</DialogTitle>
            <DialogDescription className="text-lg text-gray-600">
              Create a milestone for <span className="font-semibold text-gray-900">{goal.title}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="milestone-title" className="text-base font-semibold text-gray-900">
                Milestone Title *
              </Label>
              <Input
                id="milestone-title"
                value={milestoneData.title}
                onChange={(e) => setMilestoneData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Complete first week of consistent exercise"
                className="h-12 text-lg"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="milestone-description" className="text-base font-semibold text-gray-900">
                Description
              </Label>
              <Textarea
                id="milestone-description"
                value={milestoneData.description}
                onChange={(e) => setMilestoneData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what needs to be achieved for this milestone..."
                rows={3}
                className="text-base"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="milestone-target" className="text-base font-semibold text-gray-900">
                  Target Value *
                </Label>
                <Input
                  id="milestone-target"
                  type="number"
                  value={milestoneData.targetValue}
                  onChange={(e) => setMilestoneData(prev => ({ ...prev, targetValue: parseFloat(e.target.value) || 0 }))}
                  placeholder={`Value in ${goal.unit}`}
                  className="h-12 text-lg"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="milestone-date" className="text-base font-semibold text-gray-900">
                  Target Date *
                </Label>
                <Input
                  id="milestone-date"
                  type="date"
                  value={format(milestoneData.targetDate, 'yyyy-MM-dd')}
                  onChange={(e) => setMilestoneData(prev => ({ ...prev, targetDate: new Date(e.target.value) }))}
                  className="h-12 text-lg"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="milestone-reward" className="text-base font-semibold text-gray-900">
                Reward (Optional)
              </Label>
              <Input
                id="milestone-reward"
                value={milestoneData.reward}
                onChange={(e) => setMilestoneData(prev => ({ ...prev, reward: e.target.value }))}
                placeholder="Treat yourself when you reach this milestone"
                className="h-12 text-lg"
              />
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-100">
              <Button 
                variant="outline" 
                onClick={() => setShowAddMilestone(false)}
                className="flex-1 h-12 text-base"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddMilestone} 
                disabled={loading}
                className="flex-1 h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? 'Creating...' : 'Add Milestone'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Goal Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col bg-gradient-to-br from-white via-gray-50/20 to-blue-50/10">
          <DialogHeader className="relative pb-4 border-b border-gray-100 flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/3 via-purple-600/3 to-emerald-600/3 rounded-t-lg" />
            <div className="relative">
              <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-gray-900 mb-1">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg blur opacity-15 scale-105" />
                  <div className="relative p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg">
              {getStatusIcon()}
                  </div>
                </div>
                <span className="bg-gradient-to-r from-blue-700 via-purple-700 to-emerald-700 bg-clip-text text-transparent">
              {goal.title}
                </span>
            </DialogTitle>
              <DialogDescription className="text-base text-gray-600">
                Track your wellness goal progress
            </DialogDescription>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-6 min-h-0">
            {/* Hero Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border border-blue-200/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-blue-500/10 rounded-lg">
                    <Target className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-blue-800">Progress</span>
                </div>
                <div className="text-2xl font-bold text-blue-900 mb-1">
                  {Math.round((goal.currentValue / goal.targetValue) * 100)}%
                </div>
                <div className="text-xs text-blue-700">
                  {goal.currentValue} / {goal.targetValue} {goal.unit}
                </div>
                <Progress 
                  value={(goal.currentValue / goal.targetValue) * 100} 
                  className="mt-2 h-1.5"
                />
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-xl p-4 border border-emerald-200/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                    <Calendar className="h-4 w-4 text-emerald-600" />
                  </div>
                  <span className="text-xs font-semibold text-emerald-800">Timeline</span>
                </div>
                <div className="text-2xl font-bold text-emerald-900 mb-1">
                  {Math.max(0, Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                </div>
                <div className="text-xs text-emerald-700">Days left</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-4 border border-purple-200/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-purple-500/10 rounded-lg">
                    <Award className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-xs font-semibold text-purple-800">Milestones</span>
                </div>
                <div className="text-2xl font-bold text-purple-900 mb-1">
                  {goal.milestones.filter(m => m.completed).length}
                </div>
                <div className="text-xs text-purple-700">
                  of {goal.milestones.length} done
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl p-4 border border-orange-200/50">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-orange-500/10 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                  </div>
                  <span className="text-xs font-semibold text-orange-800">Entries</span>
                </div>
                <div className="text-2xl font-bold text-orange-900 mb-1">
                  {goal.progressEntries.length}
                </div>
                <div className="text-xs text-orange-700">Progress logs</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-5">
                {/* Goal Overview */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-md border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-xs">1</span>
                    </div>
                    Goal Overview
                  </h3>
                  
                                    <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-gray-600 block mb-1">Description</label>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {goal.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Category</label>
                        <div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                            {CATEGORY_LABELS[goal.category as keyof typeof CATEGORY_LABELS]}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Priority</label>
                        <div>
                          <Badge 
                            variant="outline" 
                            className={`${PRIORITY_COLORS[goal.priority as keyof typeof PRIORITY_COLORS]} border-current text-xs`}
                          >
                            {goal.priority.charAt(0).toUpperCase() + goal.priority.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Start Date</label>
                        <div className="text-sm text-gray-700">
                          {format(new Date(goal.startDate), 'MMM d, yyyy')}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-xs font-semibold text-gray-600 block mb-1">Target Date</label>
                        <div className="text-sm text-gray-700">
                          {format(new Date(goal.targetDate), 'MMM d, yyyy')}
                        </div>
                      </div>
                </div>
              </div>
            </div>

            {/* SMART Criteria */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-5 shadow-md border border-indigo-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <div className="w-5 h-5 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Brain className="h-3 w-3 text-indigo-600" />
                    </div>
                    SMART Criteria
                  </h3>
                  
                  <div className="space-y-3">
                {goal.smartCriteria.specific && (
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full text-xs font-bold flex items-center justify-center">S</span>
                          <span className="font-semibold text-gray-800 text-sm">Specific</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-sm">{goal.smartCriteria.specific}</p>
                  </div>
                )}
                    
                {goal.smartCriteria.measurable && (
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full text-xs font-bold flex items-center justify-center">M</span>
                          <span className="font-semibold text-gray-800 text-sm">Measurable</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-sm">{goal.smartCriteria.measurable}</p>
                  </div>
                )}
                    
                {goal.smartCriteria.achievable && (
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 bg-yellow-100 text-yellow-600 rounded-full text-xs font-bold flex items-center justify-center">A</span>
                          <span className="font-semibold text-gray-800 text-sm">Achievable</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-sm">{goal.smartCriteria.achievable}</p>
                  </div>
                )}
                    
                {goal.smartCriteria.relevant && (
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full text-xs font-bold flex items-center justify-center">R</span>
                          <span className="font-semibold text-gray-800 text-sm">Relevant</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-sm">{goal.smartCriteria.relevant}</p>
                  </div>
                )}
                    
                {goal.smartCriteria.timeBound && (
                      <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full text-xs font-bold flex items-center justify-center">T</span>
                          <span className="font-semibold text-gray-800 text-sm">Time-bound</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed text-sm">{goal.smartCriteria.timeBound}</p>
                  </div>
                )}
                  </div>
              </div>
            </div>

              {/* Right Column */}
              <div className="space-y-5">
            {/* Milestones */}
            {goal.milestones.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-md border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-5 h-5 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Award className="h-3 w-3 text-emerald-600" />
                      </div>
                      Milestones
                    </h3>
                    
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-2">
                      {goal.milestones.map((milestone, index) => (
                    <div
                      key={milestone.id}
                          className={`relative p-3 rounded-lg border transition-all duration-200 ${
                            milestone.completed 
                              ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' 
                              : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <div className={`p-1 rounded-full ${
                                  milestone.completed 
                                    ? 'bg-emerald-100 text-emerald-600' 
                                    : 'bg-gray-100 text-gray-400'
                                }`}>
                        {milestone.completed ? (
                                    <CheckCircle className="h-3 w-3" />
                        ) : (
                                    <Clock className="h-3 w-3" />
                        )}
                      </div>
                                <h4 className="font-semibold text-gray-900 text-sm">{milestone.title}</h4>
                              </div>
                              
                              <p className="text-gray-600 mb-2 leading-relaxed text-xs">{milestone.description}</p>
                              
                              <div className="flex items-center gap-3 text-xs">
                                <div className="flex items-center gap-1">
                                  <Target className="h-3 w-3 text-blue-500" />
                                  <span className="text-gray-700 font-medium">
                                    {milestone.targetValue} {goal.unit}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-purple-500" />
                                  <span className="text-gray-700">
                                    {format(new Date(milestone.targetDate), 'MMM d')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {milestone.completed && (
                              <div className="absolute top-1 right-1">
                                <div className="p-0.5 bg-emerald-500 rounded-full">
                                  <CheckCircle className="h-2.5 w-2.5 text-white" />
                                </div>
                              </div>
                            )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Progress */}
            {goal.progressEntries.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 shadow-md border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                        <TrendingUp className="h-3 w-3 text-blue-600" />
                      </div>
                      Recent Progress
                      <Badge variant="outline" className="ml-auto text-xs">
                        {goal.progressEntries.length}
                      </Badge>
                    </h3>
                    
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-2">
                      {goal.progressEntries.slice(-6).reverse().map((entry, index) => (
                        <div key={entry.id} className="group p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200 hover:border-blue-200 bg-gradient-to-r from-white to-gray-50/30">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                <Target className="h-3 w-3 text-blue-600" />
                              </div>
              <div>
                                <span className="text-lg font-bold text-gray-900">{entry.value}</span>
                                <span className="text-gray-600 ml-1 text-sm">{goal.unit}</span>
                              </div>
                            </div>
                            <span className="text-xs text-gray-500 font-medium">
                              {format(new Date(entry.date), 'MMM d')}
                        </span>
                      </div>
                          
                      {entry.notes && (
                            <p className="text-gray-700 mb-2 leading-relaxed bg-gray-50/50 p-2 rounded text-xs">
                              {entry.notes}
                            </p>
                          )}
                          
                          {(entry.mood || entry.confidence) && (
                            <div className="flex gap-3">
                              {entry.mood && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-600">Mood:</span>
                                  <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <div
                                        key={star}
                                        className={`w-2 h-2 rounded-full ${
                                          star <= entry.mood! ? 'bg-yellow-400' : 'bg-gray-200'
                                        }`}
                                      />
                                    ))}
                      </div>
                    </div>
                              )}
                              {entry.confidence && (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-gray-600">Confidence:</span>
                                  <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <div
                                        key={star}
                                        className={`w-2 h-2 rounded-full ${
                                          star <= entry.confidence! ? 'bg-green-400' : 'bg-gray-200'
                                        }`}
                                      />
                  ))}
                </div>
              </div>
            )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Insights */}
                {goal.aiInsights && (goal.aiInsights.suggestions.length > 0 || goal.aiInsights.adaptiveAdjustments.length > 0) && (
                  <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-5 shadow-md border border-violet-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <div className="w-5 h-5 bg-violet-100 rounded-lg flex items-center justify-center">
                        <Brain className="h-3 w-3 text-violet-600" />
                      </div>
                      AI Insights
                    </h3>
                    
                    {goal.aiInsights.suggestions.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Suggestions</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                          {goal.aiInsights.suggestions.slice(0, 3).map((suggestion, index) => (
                            <div key={index} className="bg-white/70 backdrop-blur-sm rounded-lg p-2.5 border border-white/50">
                              <p className="text-gray-700 leading-relaxed text-xs">{suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {goal.aiInsights.predictions && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Success Prediction</h4>
                        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-white/50">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl font-bold text-violet-700">
                              {Math.round(goal.aiInsights.predictions.likelihood * 100)}%
                            </span>
                            <span className="text-gray-700 text-sm">success likelihood</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            Timeframe: {goal.aiInsights.predictions.timeframe}
                          </p>
                          {goal.aiInsights.predictions.factors.length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-gray-700">Key factors:</span>
                              <ul className="text-xs text-gray-600 list-disc list-inside mt-1">
                                {goal.aiInsights.predictions.factors.slice(0, 2).map((factor, index) => (
                                  <li key={index}>{factor}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GoalCard;
