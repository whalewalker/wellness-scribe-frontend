import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Lightbulb, Target } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { toast } from '../../hooks/use-toast';
import {
  createGoal,
  getGoalSuggestions,
  CreateGoalRequest,
  GoalSuggestion,
  GOAL_CATEGORIES,
  GOAL_PRIORITIES,
  CATEGORY_LABELS
} from '../../api/wellness-coaching';

interface CreateGoalDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGoalCreated: () => void;
  initialSuggestion?: GoalSuggestion | null;
}

const CreateGoalDialog: React.FC<CreateGoalDialogProps> = ({
  open,
  onOpenChange,
  onGoalCreated,
  initialSuggestion
}) => {
  const [step, setStep] = useState<'form' | 'suggestions'>('form');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<GoalSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<GoalSuggestion | null>(null);
  
  const [formData, setFormData] = useState<CreateGoalRequest>({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    smartCriteria: {
      specific: '',
      measurable: '',
      achievable: '',
      relevant: '',
      timeBound: ''
    },
    targetValue: 0,
    unit: '',
    startDate: new Date(),
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    tags: []
  });

  useEffect(() => {
    if (initialSuggestion && open) {
      setFormData({
        title: initialSuggestion.title,
        description: initialSuggestion.description,
        category: initialSuggestion.category,
        priority: 'medium',
        smartCriteria: initialSuggestion.smartCriteria,
        targetValue: initialSuggestion.targetValue,
        unit: initialSuggestion.unit,
        startDate: new Date(),
        targetDate: new Date(Date.now() + initialSuggestion.suggestedDuration * 7 * 24 * 60 * 60 * 1000),
        tags: []
      });
      setSelectedSuggestion(initialSuggestion);
    }
  }, [initialSuggestion, open]);

  const handleInputChange = (field: keyof CreateGoalRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSmartCriteriaChange = (field: keyof typeof formData.smartCriteria, value: string) => {
    setFormData(prev => ({
      ...prev,
      smartCriteria: {
        ...prev.smartCriteria,
        [field]: value
      }
    }));
  };

  const getSuggestions = async () => {
    if (!formData.category) {
      toast({
        title: 'Category Required',
        description: 'Please select a category to get AI suggestions',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await getGoalSuggestions({
        categories: [formData.category],
        fitnessLevel: 'beginner',
        availableTimePerDay: 30,
        preferredDuration: 4
      });
      
      setSuggestions(response.data.suggestions);
      setStep('suggestions');
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to get AI suggestions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = (suggestion: GoalSuggestion) => {
    setFormData(prev => ({
      ...prev,
      title: suggestion.title,
      description: suggestion.description,
      category: suggestion.category,
      smartCriteria: suggestion.smartCriteria,
      targetValue: suggestion.targetValue,
      unit: suggestion.unit,
      targetDate: new Date(Date.now() + suggestion.suggestedDuration * 7 * 24 * 60 * 60 * 1000)
    }));
    setSelectedSuggestion(suggestion);
    setStep('form');
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.title || !formData.description || !formData.category) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.unit || formData.unit.trim() === '') {
      toast({
        title: 'Unit Required',
        description: 'Please specify a unit of measurement (e.g., steps, minutes, kg, etc.)',
        variant: 'destructive'
      });
      return;
    }

    if (formData.targetValue <= 0) {
      toast({
        title: 'Target Value Required',
        description: 'Please enter a valid target value greater than 0',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.smartCriteria.specific || !formData.smartCriteria.measurable) {
      toast({
        title: 'SMART Criteria Required',
        description: 'Please complete at least the Specific and Measurable criteria',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);
      await createGoal(formData);
      
      toast({
        title: 'Success',
        description: 'Goal created successfully!',
        variant: 'default'
      });
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 'medium',
        smartCriteria: {
          specific: '',
          measurable: '',
          achievable: '',
          relevant: '',
          timeBound: ''
        },
        targetValue: 0,
        unit: '',
        startDate: new Date(),
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        tags: []
      });
      setStep('form');
      setSelectedSuggestion(null);
      onGoalCreated();
    } catch (error: any) {
      console.error('Error creating goal:', error);
      
      // Handle specific API validation errors
      if (error.response?.data?.message) {
        const errorMessage = Array.isArray(error.response.data.message) 
          ? error.response.data.message.join(', ')
          : error.response.data.message;
        
        toast({
          title: 'Validation Error',
          description: errorMessage,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create goal. Please check all required fields.',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep('form');
    setSelectedSuggestion(null);
    setSuggestions([]);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => { onOpenChange(open); if (!open) resetForm(); }}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50/50">
        <DialogHeader className="text-center pb-8">
          <DialogTitle className="flex items-center justify-center gap-3 text-3xl font-bold text-gray-900">
            <div className="p-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            {step === 'form' ? 'Create Your Wellness Goal' : 'AI-Powered Goal Suggestions'}
          </DialogTitle>
          <DialogDescription className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            {step === 'form' 
              ? 'Design a SMART wellness goal that will transform your journey and help you achieve lasting success'
              : 'Discover personalized goal suggestions crafted by AI to match your wellness aspirations'
            }
          </DialogDescription>
        </DialogHeader>

        {step === 'form' ? (
          <div className="space-y-10">
            {/* Basic Information Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                Basic Information
              </h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="title" className="text-lg font-semibold text-gray-900">
                      Goal Title *
                    </Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Walk 10,000 steps daily"
                      className="h-14 text-lg"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="category" className="text-lg font-semibold text-gray-900">
                      Category *
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleInputChange('category', value)}
                    >
                      <SelectTrigger className="h-14 text-lg">
                        <SelectValue placeholder="Select wellness category" />
                      </SelectTrigger>
                      <SelectContent>
                        {GOAL_CATEGORIES.map(category => (
                          <SelectItem key={category} value={category} className="text-lg py-3">
                            {CATEGORY_LABELS[category]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-lg font-semibold text-gray-900">
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your goal and why it's important to you. What will achieving this goal mean for your wellness journey?"
                    rows={4}
                    className="text-lg leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Goal Details Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold">2</span>
                </div>
                Goal Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="targetValue" className="text-lg font-semibold text-gray-900">
                    Target Value *
                  </Label>
                  <Input
                    id="targetValue"
                    type="number"
                    value={formData.targetValue}
                    onChange={(e) => handleInputChange('targetValue', parseFloat(e.target.value) || 0)}
                    placeholder="10000"
                    min="0.01"
                    step="0.01"
                    className={`h-14 text-lg ${formData.targetValue <= 0 ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                  {formData.targetValue <= 0 && (
                    <p className="text-sm text-red-600 font-medium">Target value must be greater than 0</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="unit" className="text-lg font-semibold text-gray-900">
                    Unit of Measurement *
                  </Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    placeholder="steps, minutes, kg, etc."
                    className={`h-14 text-lg ${!formData.unit.trim() ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                  {!formData.unit.trim() && (
                    <p className="text-sm text-red-600 font-medium">Unit is required (e.g., steps, minutes, kg)</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label htmlFor="priority" className="text-lg font-semibold text-gray-900">
                    Priority Level
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOAL_PRIORITIES.map(priority => (
                        <SelectItem key={priority} value={priority} className="text-lg py-3">
                          {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 font-bold">3</span>
                </div>
                Timeline
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-gray-900">Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-14 text-lg",
                          !formData.startDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5" />
                        {formData.startDate ? format(formData.startDate, "PPP") : "Pick start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.startDate}
                        onSelect={(date) => handleInputChange('startDate', date || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-3">
                  <Label className="text-lg font-semibold text-gray-900">Target Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-14 text-lg",
                          !formData.targetDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-3 h-5 w-5" />
                        {formData.targetDate ? format(formData.targetDate, "PPP") : "Pick target date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.targetDate}
                        onSelect={(date) => handleInputChange('targetDate', date || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            {/* SMART Criteria Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 shadow-lg border border-indigo-100">
              <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <span className="text-indigo-600 font-bold">4</span>
                </div>
                SMART Criteria
              </h3>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Make your goal <span className="font-semibold text-indigo-700">Specific, Measurable, Achievable, Relevant,</span> and <span className="font-semibold text-indigo-700">Time-bound</span>
              </p>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="specific" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full text-sm font-bold flex items-center justify-center">S</span>
                      Specific *
                    </Label>
                    <Textarea
                      id="specific"
                      value={formData.smartCriteria.specific}
                      onChange={(e) => handleSmartCriteriaChange('specific', e.target.value)}
                      placeholder="What exactly will you accomplish? Be clear and detailed about your goal."
                      rows={3}
                      className="text-base leading-relaxed"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="measurable" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full text-sm font-bold flex items-center justify-center">M</span>
                      Measurable *
                    </Label>
                    <Textarea
                      id="measurable"
                      value={formData.smartCriteria.measurable}
                      onChange={(e) => handleSmartCriteriaChange('measurable', e.target.value)}
                      placeholder="How will you measure progress? What metrics will you track?"
                      rows={3}
                      className="text-base leading-relaxed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="achievable" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full text-sm font-bold flex items-center justify-center">A</span>
                      Achievable
                    </Label>
                    <Textarea
                      id="achievable"
                      value={formData.smartCriteria.achievable}
                      onChange={(e) => handleSmartCriteriaChange('achievable', e.target.value)}
                      placeholder="Is this goal realistic and attainable given your current situation?"
                      rows={3}
                      className="text-base leading-relaxed"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="relevant" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full text-sm font-bold flex items-center justify-center">R</span>
                      Relevant
                    </Label>
                    <Textarea
                      id="relevant"
                      value={formData.smartCriteria.relevant}
                      onChange={(e) => handleSmartCriteriaChange('relevant', e.target.value)}
                      placeholder="Why is this goal important to you? How does it align with your values?"
                      rows={3}
                      className="text-base leading-relaxed"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="timeBound" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-sm font-bold flex items-center justify-center">T</span>
                    Time-bound
                  </Label>
                  <Textarea
                    id="timeBound"
                    value={formData.smartCriteria.timeBound}
                    onChange={(e) => handleSmartCriteriaChange('timeBound', e.target.value)}
                    placeholder="What's your deadline and timeline? How will you track time-based progress?"
                    rows={3}
                    className="text-base leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {selectedSuggestion && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-sm text-blue-800">AI Suggestion Applied</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-700">{selectedSuggestion.aiReasoning}</p>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {suggestions.length === 0 ? (
              <div className="text-center py-8">
                <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No suggestions available. Try selecting a different category.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {suggestions.map((suggestion, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{suggestion.title}</CardTitle>
                          <CardDescription>{suggestion.description}</CardDescription>
                        </div>
                        <Badge variant="outline">
                          {suggestion.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium mb-1">Target:</p>
                          <p className="text-sm text-gray-600">
                            {suggestion.targetValue} {suggestion.unit} over {suggestion.suggestedDuration} weeks
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-sm font-medium mb-1">Benefits:</p>
                          <ul className="text-xs text-gray-600 list-disc list-inside">
                            {suggestion.benefits.slice(0, 3).map((benefit, i) => (
                              <li key={i}>{benefit}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="text-sm font-medium mb-1">AI Reasoning:</p>
                          <p className="text-xs text-gray-600">{suggestion.aiReasoning}</p>
                        </div>

                        <Button
                          onClick={() => applySuggestion(suggestion)}
                          className="w-full"
                        >
                          Use This Suggestion
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-gray-200">
          {step === 'form' ? (
            <>
              <Button
                variant="outline"
                onClick={getSuggestions}
                disabled={loading || !formData.category}
                className="flex items-center gap-2 h-14 text-lg px-8 border-2"
              >
                <Lightbulb className="h-5 w-5" />
                Get AI Suggestions
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={loading}
                className="h-14 text-lg px-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {loading ? 'Creating Your Goal...' : 'Create Wellness Goal'}
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                onClick={() => setStep('form')}
                className="h-12 text-base px-8 border-2"
              >
                Back to Form
              </Button>
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="h-12 text-base px-8 border-2"
              >
                Cancel
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGoalDialog;
