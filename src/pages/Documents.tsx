import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { NavBar } from '../components/NavBar';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Activity, 
  Pill, 
  Calendar, 
  TestTube, 
  Target, 
  Edit, 
  Trash2,
  Loader2,
  Sparkles,
  TrendingUp,
  Clock,
  Tag,
  Eye,
  BarChart3
} from 'lucide-react';
import { wellnessDocumentsApi, WellnessDocument, DocumentStats } from '../api/wellness-documents';
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

export const Documents = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<WellnessDocument[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<WellnessDocument['type'] | 'all'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: '',
    content: '',
    type: 'note' as WellnessDocument['type'],
    tags: [] as string[],
  });

  useEffect(() => {
    loadDocuments();
    loadStats();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await wellnessDocumentsApi.getDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await wellnessDocumentsApi.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadDocuments();
      return;
    }

    try {
      const results = await wellnessDocumentsApi.searchDocuments({
        q: searchQuery,
        type: selectedType === 'all' ? undefined : selectedType,
      });
      setDocuments(results);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
    }
  };

  const handleCreateDocument = async () => {
    if (!newDocument.title.trim() || !newDocument.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      await wellnessDocumentsApi.createDocument(newDocument);
      toast.success('Document created successfully');
      setShowCreateForm(false);
      setNewDocument({ title: '', content: '', type: 'note', tags: [] });
      await loadDocuments();
      await loadStats();
    } catch (error) {
      console.error('Failed to create document:', error);
      toast.error('Failed to create document');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await wellnessDocumentsApi.deleteDocument(id);
      toast.success('Document deleted');
      await loadDocuments();
      await loadStats();
    } catch (error) {
      console.error('Failed to delete document:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleGenerateInsights = async (content: string, type?: WellnessDocument['type']) => {
    try {
      const insights = await wellnessDocumentsApi.generateInsights({
        content,
        type,
        context: {
          healthConditions: [],
          medications: [],
        }
      });
      toast.success('Insights generated!');
      // You could display insights in a modal
      console.log('Generated insights:', insights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
      toast.error('Failed to generate insights');
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (selectedType !== 'all' && doc.type !== selectedType) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-8">
          {/* Clean Header */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl mb-6 shadow-lg">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Wellness Documents
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Track your health journey, monitor symptoms, and maintain comprehensive wellness records
              </p>
            </div>
            <div className="pt-4">
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base font-semibold"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Document
              </Button>
            </div>
          </div>

          {/* Clean Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Documents</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalDocuments}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">All time records</p>
                  </div>
                  <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                </div>
              </Card>
              
              {Object.entries(stats.byType).slice(0, 3).map(([type, count]) => (
                <Card key={type} className="p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 capitalize">
                        {documentTypeLabels[type as keyof typeof documentTypeLabels]}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">{count}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Active records</p>
                    </div>
                    <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center">
                      {documentTypeIcons[type as keyof typeof documentTypeIcons] && 
                        React.createElement(documentTypeIcons[type as keyof typeof documentTypeIcons], {
                          className: "w-7 h-7 text-blue-600 dark:text-blue-400"
                        })
                      }
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Clean Search and Filters */}
          <Card className="p-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Search your wellness documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 text-base border-gray-300 dark:border-slate-600 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative min-w-[200px]">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value as WellnessDocument['type'] | 'all')}
                    className="w-full pl-10 pr-8 py-4 h-14 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-white appearance-none cursor-pointer focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="all">All Document Types</option>
                    <option value="note">📝 Notes</option>
                    <option value="symptom">🩺 Symptoms</option>
                    <option value="medication">💊 Medications</option>
                    <option value="appointment">📅 Appointments</option>
                    <option value="test_result">🧪 Test Results</option>
                    <option value="treatment">🏥 Treatments</option>
                    <option value="goal">🎯 Goals</option>
                  </select>
                </div>
                
                <Button 
                  onClick={handleSearch} 
                  className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </Card>

          {/* Clean Create Document Form */}
          {showCreateForm && (
            <Card className="p-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl mb-6 shadow-lg">
                  <Plus className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Create New Document</h3>
                <p className="text-lg text-gray-600 dark:text-gray-300">Document your wellness journey with detailed information</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Document Title *
                    </label>
                    <Input
                      value={newDocument.title}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter a descriptive title..."
                      className="h-14 text-base border-gray-300 dark:border-slate-600 rounded-xl focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Document Type *
                    </label>
                    <div className="relative">
                      <select
                        value={newDocument.type}
                        onChange={(e) => setNewDocument(prev => ({ ...prev, type: e.target.value as WellnessDocument['type'] }))}
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
                </div>
                
                <div>
                  <label className="block text-base font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Document Content *
                  </label>
                  <Textarea
                    value={newDocument.content}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Describe your symptoms, notes, or health information in detail..."
                    className="h-40 text-base border-gray-300 dark:border-slate-600 rounded-xl resize-none focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  onClick={handleCreateDocument}
                  disabled={isCreating}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base font-semibold"
                  size="lg"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 mr-2" />
                      Create Document
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                  className="px-10 py-4 border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 dark:border-slate-600 dark:hover:border-slate-500 dark:hover:bg-slate-700 rounded-xl text-base font-semibold"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          )}

          {/* Clean Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full flex justify-center py-20">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto">
                    <Loader2 className="w-8 h-8 animate-spin text-white" />
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-300">Loading your wellness documents...</p>
                </div>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <div className="w-24 h-24 bg-gray-200 dark:bg-slate-700 rounded-3xl flex items-center justify-center mx-auto mb-8">
                  <FileText className="w-12 h-12 text-gray-500 dark:text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No documents found</h3>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                  {searchQuery ? 'Try adjusting your search criteria or create a new document' : 'Start documenting your wellness journey by creating your first document'}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl shadow-lg font-semibold"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create First Document
                  </Button>
                )}
              </div>
            ) : (
              filteredDocuments.map((doc) => {
                const IconComponent = documentTypeIcons[doc.type];
                return (
                  <Card 
                    key={doc.id} 
                    className="group p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                    onClick={() => navigate(`/documents/${doc.id}`)}
                  >
                    {/* Document Header */}
                    <div className="flex items-start justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
                          {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
                        </div>
                        <Badge className={`${documentTypeColors[doc.type]} border font-medium px-3 py-1 rounded-full text-sm`}>
                          {documentTypeLabels[doc.type]}
                        </Badge>
                      </div>
                      
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGenerateInsights(doc.content, doc.type)}
                          className="h-10 w-10 p-0 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-xl"
                          title="Generate Insights"
                        >
                          <Sparkles className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="h-10 w-10 p-0 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl"
                          title="Delete Document"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Document Content */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-gray-900 dark:text-white text-xl leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        {doc.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                        {doc.content}
                      </p>
                    </div>
                    
                    {/* Document Footer */}
                    <div className="mt-6 pt-5 border-t border-gray-200 dark:border-slate-700">
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {doc.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-full">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium">
                          <Eye className="w-4 h-4" />
                          View Details
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 