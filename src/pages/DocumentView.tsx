import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { NavBar } from '../components/NavBar';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Sparkles, 
  FileText, 
  Activity, 
  Pill, 
  Calendar, 
  TestTube, 
  Target,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Tag,
  Eye,
  BarChart3,
  CalendarDays,
  FileArchive,
  TrendingUp
} from 'lucide-react';
import { wellnessDocumentsApi, WellnessDocument } from '../api/wellness-documents';
import { toast } from 'sonner';

const documentTypeIcons = {
  note: FileText,
  symptom: Activity,
  medication: Pill,
  appointment: Calendar,
  test_result: TestTube,
  treatment: Activity,
  goal: Target,
};

const documentTypeColors = {
  note: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  symptom: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
  medication: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
  appointment: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
  test_result: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
  treatment: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
  goal: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950 dark:text-pink-300 dark:border-pink-800',
};

const documentTypeLabels = {
  note: 'Notes',
  symptom: 'Symptoms',
  medication: 'Medications',
  appointment: 'Appointments',
  test_result: 'Test Results',
  treatment: 'Treatments',
  goal: 'Goals',
};

export const DocumentView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<WellnessDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [editedDocument, setEditedDocument] = useState<Partial<WellnessDocument>>({});
  const [insights, setInsights] = useState<WellnessDocument['aiInsights'] | null>(null);

  useEffect(() => {
    if (id) {
      loadDocument();
    }
  }, [id]);

  const loadDocument = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const doc = await wellnessDocumentsApi.getDocument(id);
      setDocument(doc);
      setEditedDocument({
        title: doc.title,
        content: doc.content,
        type: doc.type,
        tags: doc.tags,
        status: doc.status,
        metadata: doc.metadata,
      });
      setInsights(doc.aiInsights || null);
    } catch (error) {
      console.error('Failed to load document:', error);
      toast.error('Failed to load document');
      navigate('/documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id || !editedDocument.title?.trim() || !editedDocument.content?.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const updatedDoc = await wellnessDocumentsApi.updateDocument(id, editedDocument);
      setDocument(updatedDoc);
      setIsEditing(false);
      toast.success('Document updated successfully');
    } catch (error) {
      console.error('Failed to update document:', error);
      toast.error('Failed to update document');
    }
  };

  const handleGenerateInsights = async () => {
    if (!document) return;

    try {
      setIsGeneratingInsights(true);
      const generatedInsights = await wellnessDocumentsApi.generateInsights({
        content: document.content,
        type: document.type,
        context: {
          healthConditions: [],
          medications: [],
        }
      });

      // Store insights locally without updating the document
      setInsights(generatedInsights);
      toast.success('AI insights generated successfully!');
    } catch (error) {
      console.error('Failed to generate insights:', error);
      toast.error('Failed to generate insights');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const handleSaveInsights = async () => {
    if (!id || !insights) return;

    try {
      // Prepare insights with required properties
      const insightsToSave = {
        summary: insights.summary || '',
        recommendations: insights.recommendations || [],
        riskFactors: insights.riskFactors || [],
        keywords: insights.keywords || [],
        sentiment: insights.sentiment || 'neutral' as const,
      };

      // Try to save insights using the dedicated insights endpoint
      const updatedDoc = await wellnessDocumentsApi.saveInsights(id, insightsToSave);
      setDocument(updatedDoc);
      toast.success('Insights saved successfully!');
    } catch (error) {
      console.error('Failed to save insights:', error);
      
      // Fallback: Try to save without aiInsights property
      try {
        const updatedDoc = await wellnessDocumentsApi.updateDocument(id, {
          title: document?.title,
          content: document?.content,
          type: document?.type,
          tags: document?.tags,
          status: document?.status,
          metadata: document?.metadata,
        });
        setDocument(updatedDoc);
        toast.success('Document updated successfully!');
      } catch (fallbackError) {
        console.error('Fallback save also failed:', fallbackError);
        toast.error('Failed to save insights. Insights are stored locally.');
      }
    }
  };

  const handleCancelEdit = () => {
    if (document) {
      setEditedDocument({
        title: document.title,
        content: document.content,
        type: document.type,
        tags: document.tags,
        status: document.status,
        metadata: document.metadata,
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <NavBar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex justify-center items-center py-20">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
              <p className="text-lg text-gray-600 dark:text-gray-300">Loading your document...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
        <NavBar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-red-100 dark:bg-red-900/30 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Document Not Found</h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
              The document you're looking for doesn't exist or has been deleted.
            </p>
            <Button 
              onClick={() => navigate('/documents')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl shadow-lg font-semibold"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Documents
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const IconComponent = documentTypeIcons[document.type];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Clean Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                onClick={() => navigate('/documents')}
                className="h-14 w-14 p-0 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-xl transition-all duration-200"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
                  {IconComponent && <IconComponent className="w-10 h-10 text-white" />}
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                    {document.title}
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    {documentTypeLabels[document.type]} • Last updated {new Date(document.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              {!isEditing ? (
                <>
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="outline"
                    className="h-12 px-6 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:border-slate-600 dark:hover:border-slate-500 dark:hover:bg-slate-700 rounded-xl font-semibold"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Document
                  </Button>
                  <Button
                    onClick={handleGenerateInsights}
                    disabled={isGeneratingInsights}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                  >
                    {isGeneratingInsights ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Generate Insights
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="px-8 py-3 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:border-slate-600 dark:hover:border-slate-500 dark:hover:bg-slate-700 rounded-xl font-semibold"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Document Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Document Header Card */}
              <Card className="p-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <Badge className={`${documentTypeColors[document.type]} border font-medium px-4 py-2 rounded-full text-sm`}>
                      {documentTypeLabels[document.type]}
                    </Badge>
                    <Badge variant={document.status === 'published' ? 'default' : 'secondary'} className="px-4 py-2 rounded-full">
                      {document.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Updated {new Date(document.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                {isEditing ? (
                  <div className="space-y-8">
                    <div>
                      <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        Document Title *
                      </label>
                      <Input
                        value={editedDocument.title || ''}
                        onChange={(e) => setEditedDocument(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter a descriptive title..."
                        className="h-14 text-base border-gray-300 dark:border-slate-600 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        Document Type *
                      </label>
                      <div className="relative">
                        <select
                          value={editedDocument.type || document.type}
                          onChange={(e) => setEditedDocument(prev => ({ ...prev, type: e.target.value as WellnessDocument['type'] }))}
                          className="w-full h-14 pl-4 pr-10 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white appearance-none cursor-pointer focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="note">📝 Notes</option>
                          <option value="symptom">🩺 Symptoms</option>
                          <option value="medication">💊 Medications</option>
                          <option value="appointment">📅 Appointments</option>
                          <option value="test_result">🧪 Test Results</option>
                          <option value="treatment">🏥 Treatments</option>
                          <option value="goal">🎯 Goals</option>
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-4">
                        Document Content *
                      </label>
                      <Textarea
                        value={editedDocument.content || ''}
                        onChange={(e) => setEditedDocument(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Describe your symptoms, notes, or health information in detail..."
                        className="min-h-[300px] text-base border-gray-300 dark:border-slate-600 rounded-xl resize-none focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="prose prose-lg max-w-none dark:prose-invert">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{children}</h3>,
                          p: ({ children }) => <p className="mb-4 last:mb-0 text-gray-700 dark:text-gray-300 leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc mb-4 space-y-2 pl-6 text-gray-700 dark:text-gray-300">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal mb-4 space-y-2 pl-6 text-gray-700 dark:text-gray-300">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-blue-500/30 pl-6 italic text-gray-600 dark:text-gray-400 mb-4 bg-blue-50/50 dark:bg-blue-950/10 py-4 rounded-r-lg">
                              {children}
                            </blockquote>
                          ),
                          code: ({ children, className }) => {
                            const isInline = !className;
                            return isInline ? (
                              <code className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded text-sm font-mono text-blue-600 dark:text-blue-400">
                                {children}
                              </code>
                            ) : (
                              <pre className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-4 rounded-xl overflow-x-auto mb-4">
                                <code className="text-sm font-mono text-gray-800 dark:text-gray-200">{children}</code>
                              </pre>
                            );
                          },
                          strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                          em: ({ children }) => <em className="italic text-gray-600 dark:text-gray-400">{children}</em>,
                          a: ({ children, href }) => (
                            <a 
                              href={href} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {document.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                )}
              </Card>

              {/* AI Insights */}
              {insights && (
                <Card className="p-8 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 shadow-lg">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Insights</h3>
                        <p className="text-lg text-gray-600 dark:text-gray-300">AI-powered analysis of your wellness document</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleSaveInsights}
                      disabled={!insights}
                      className="px-8 py-3 border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 dark:border-blue-700 dark:hover:border-blue-600 dark:hover:bg-blue-900/30 rounded-xl font-semibold"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Insights
                    </Button>
                  </div>
                  
                  <div className="space-y-8">
                    {insights.summary && (
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-blue-200 dark:border-blue-800/30 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                          <FileText className="w-6 h-6 text-blue-600" />
                          <h4 className="font-bold text-xl text-gray-900 dark:text-white">Summary</h4>
                        </div>
                        <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="list-disc space-y-2 mb-3 pl-6">{children}</ul>,
                              ol: ({ children }) => <ol className="list-decimal space-y-2 mb-3 pl-6">{children}</ol>,
                              li: ({ children }) => <li>{children}</li>,
                              strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                              em: ({ children }) => <em className="italic">{children}</em>,
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-blue-500/30 pl-4 italic text-gray-600 dark:text-gray-400 mb-3 bg-blue-50/50 dark:bg-blue-950/10 py-3 rounded-r-lg">
                                  {children}
                                </blockquote>
                              ),
                            }}
                          >
                            {insights.summary}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                    
                    {insights.recommendations && insights.recommendations.length > 0 && (
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-blue-200 dark:border-blue-800/30 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <h4 className="font-bold text-xl text-gray-900 dark:text-white">Recommendations</h4>
                        </div>
                        <ul className="space-y-3">
                          {insights.recommendations.map((rec, index) => (
                            <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start gap-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="leading-relaxed">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {insights.riskFactors && insights.riskFactors.length > 0 && (
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-blue-200 dark:border-blue-800/30 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                          <AlertCircle className="w-6 h-6 text-orange-500" />
                          <h4 className="font-bold text-xl text-gray-900 dark:text-white">Risk Factors</h4>
                        </div>
                        <ul className="space-y-3">
                          {insights.riskFactors.map((risk, index) => (
                            <li key={index} className="text-gray-700 dark:text-gray-300 flex items-start gap-3">
                              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="leading-relaxed">{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {insights.keywords && insights.keywords.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-blue-200 dark:border-blue-800/30 shadow-sm">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-6 h-6 bg-blue-500 rounded-lg" />
                            <h4 className="font-bold text-xl text-gray-900 dark:text-white">Keywords</h4>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {insights.keywords.map((keyword) => (
                              <Badge key={keyword} variant="secondary" className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {insights.sentiment && (
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-blue-200 dark:border-blue-800/30 shadow-sm">
                          <div className="flex items-center gap-3 mb-6">
                            <div className="w-6 h-6 bg-purple-500 rounded-lg" />
                            <h4 className="font-bold text-xl text-gray-900 dark:text-white">Sentiment</h4>
                          </div>
                          <Badge 
                            variant={
                              insights.sentiment === 'positive' ? 'default' : 
                              insights.sentiment === 'negative' ? 'destructive' : 'secondary'
                            }
                            className="px-4 py-2 text-sm font-medium"
                          >
                            {insights.sentiment.charAt(0).toUpperCase() + insights.sentiment.slice(1)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Clean Sidebar */}
            <div className="space-y-8">
              {/* Document Info */}
              <Card className="p-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Document Info</h3>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                      <span className="text-base text-gray-600 dark:text-gray-400">Word Count</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white text-base">{document.wordCount || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="w-5 h-5 text-gray-500" />
                      <span className="text-base text-gray-600 dark:text-gray-400">Created</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white text-base">
                      {new Date(document.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <span className="text-base text-gray-600 dark:text-gray-400">Modified</span>
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white text-base">
                      {new Date(document.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  {document.metadata && (
                    <>
                      {document.metadata.severity && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                          <span className="text-base text-gray-600 dark:text-gray-400">Severity</span>
                          <Badge variant={
                            document.metadata.severity === 'high' ? 'destructive' :
                            document.metadata.severity === 'medium' ? 'default' :
                            'secondary'
                          } className="px-4 py-2 text-sm">
                            {document.metadata.severity}
                          </Badge>
                        </div>
                      )}
                      
                      {document.metadata.category && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                          <span className="text-base text-gray-600 dark:text-gray-400">Category</span>
                          <span className="font-semibold text-gray-900 dark:text-white text-base">{document.metadata.category}</span>
                        </div>
                      )}
                      
                      {document.metadata.location && (
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                          <span className="text-base text-gray-600 dark:text-gray-400">Location</span>
                          <span className="font-semibold text-gray-900 dark:text-white text-base">{document.metadata.location}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>

              {/* Tags */}
              {document.tags && document.tags.length > 0 && (
                <Card className="p-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <Tag className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {document.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {/* Attachments */}
              {document.attachments && document.attachments.length > 0 && (
                <Card className="p-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg">
                  <div className="flex items-center gap-4 mb-6">
                    <FileArchive className="w-6 h-6 text-purple-600" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Attachments</h3>
                  </div>
                  <div className="space-y-4">
                    {document.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-500" />
                          <span className="text-base font-medium text-gray-900 dark:text-white">{attachment.filename}</span>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg">
                          {(attachment.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 