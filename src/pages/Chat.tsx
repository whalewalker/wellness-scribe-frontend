import { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { NavBar } from '../components/NavBar';
import { ChatBubble } from '../components/ChatBubble';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { Send, Trash2, Loader2, Plus, X, FileText, Search, MessageSquare, Sparkles, Clock, Heart, Square } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { chatApi, Message, type ChatConversation } from '../api/chat';
import { useUsageStore } from '../store/usageStore';
import { debounce } from '../lib/utils';
import { toast } from 'sonner';

// Compatibility interface for ChatBubble
interface ChatBubbleMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  tokens?: number;
}



export const Chat = () => {
  const [chats, setChats] = useState<ChatConversation[]>([]);
  const [currentChat, setCurrentChat] = useState<ChatConversation | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isStopping, setIsStopping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { incrementUsage } = useUsageStore();

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120; // max-h-[120px] = 120px
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  // Effect to adjust textarea height when input changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      // Use requestAnimationFrame to ensure smooth scrolling
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      });
    }
  };

  useEffect(() => {
    // Only scroll if there are messages and we're not in the middle of streaming
    if (currentChat?.messages && currentChat.messages.length > 0) {
      scrollToBottom();
    }
  }, [currentChat?.messages]);

  // Separate effect for streaming to prevent excessive scrolling
  useEffect(() => {
    if (isStreaming && streamingMessage) {
      // Throttle scrolling during streaming
      const timeoutId = setTimeout(scrollToBottom, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [streamingMessage, isStreaming]);

  // Load chats on mount
  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const chatList = await chatApi.getChats();
      const validatedChats: ChatConversation[] = chatList.map(chat => ({
        id: chat.id,
        title: chat.title,
        status: chat.status,
        tags: chat.tags,
        summary: chat.summary,
        totalTokens: chat.totalTokens,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        messages: []
      }));
      setChats(validatedChats);
      
      if (!currentChat && validatedChats.length > 0) {
        await selectChat(validatedChats[0].id);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
      toast.error('Failed to load chat history');
    }
  };

  const createNewChat = () => {
    setCurrentChat(null);
    toast.success('Ready to start a new chat!');
  };

  const selectChat = async (chatId: string) => {
    try {
      const chat = await chatApi.getChat(chatId);
      setCurrentChat(chat);
      

    } catch (error) {
      console.error('Failed to load chat:', error);
      toast.error('Failed to load chat');
    }
  };

  const handleSendMessage = async (messageText: string, isVoice = false) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    const isNewChat = !currentChat;

    // For existing chats, add the user message immediately to the UI
    if (currentChat) {
      setCurrentChat(prev => prev ? {
        ...prev,
        messages: [...(prev.messages || []), userMessage]
      } : null);
    }

    setInput('');
    setIsLoading(true);
    setStreamingMessage('');
    
    // Show typing indicator first
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsStreaming(true);

    try {
      const messageData = {
        content: messageText,
        chatId: currentChat?.id,
        tags: ['wellness', 'chat'],
        context: {
          wellnessGoals: ['general wellness support'],
          lifestyle: 'seeking wellness guidance'
        }
      };

      const response = await chatApi.sendMessage(messageData);

      // Find the latest assistant message
      const assistantMessage = response.messages?.filter(msg => msg.role === 'assistant').pop();
      
      if (assistantMessage) {
        if (isNewChat) {
          // For new chats, first set the chat with title and user message to show them
          setCurrentChat({
            ...response,
            messages: response.messages?.filter(msg => msg.role === 'user') || []
          });
          
          // Update the chats list with the new chat and its title
          setChats(prevChats => {
            const existingChat = prevChats.find(c => c.id === response.id);
            if (!existingChat) {
              return [...prevChats, response];
            }
            return prevChats.map(chat => 
              chat.id === response.id 
                ? { ...chat, title: response.title }
                : chat
            );
          });
          
          // Small delay to show the user message and title first
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Simulate realistic typing effect for the assistant response
        const fullText = assistantMessage.content;
        const words = fullText.split(' ');
        let currentText = '';
        
        for (let i = 0; i < words.length; i++) {
          const word = words[i];
          currentText += (i > 0 ? ' ' : '') + word;
          setStreamingMessage(currentText);
          
          // Variable delay based on word length and punctuation
          let delay = 80 + Math.random() * 60; // Base typing speed
          
          // Longer pause after punctuation
          if (word.includes('.') || word.includes('!') || word.includes('?')) {
            delay += 200;
          } else if (word.includes(',') || word.includes(';')) {
            delay += 100;
          }
          
          // Shorter delay for short words
          if (word.length <= 3) {
            delay *= 0.7;
          }
          
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        // Small pause before finishing
        await new Promise(resolve => setTimeout(resolve, 300));

        setIsStreaming(false);
        setStreamingMessage('');
        setCurrentChat(response);

        if (response.totalTokens) {
          incrementUsage(response.totalTokens, 1);
        }
      }

      await loadChats();
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      setStreamingMessage('');
      setIsStopping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleVoiceRecording = (audioBlob: Blob) => {
    const simulatedTranscript = "This is a simulated voice message about my wellness goals.";
    handleSendMessage(simulatedTranscript, true);
    toast.success('Voice message processed!');
  };

  const handleStopGeneration = async () => {
    if (!currentChat?.id || !isStreaming) return;

    try {
      setIsStopping(true);
      await chatApi.stopGeneration({ chatId: currentChat.id });
      
      // Stop the streaming immediately
      setIsStreaming(false);
      setIsLoading(false);
      setStreamingMessage('');
      
      // If there was a partial message, add it to the chat
      if (streamingMessage.trim()) {
        const partialMessage: Message = {
          role: 'assistant',
          content: streamingMessage + ' [Generation stopped]',
          timestamp: new Date(),
        };

        setCurrentChat(prev => prev ? {
          ...prev,
          messages: [...(prev.messages || []), partialMessage]
        } : null);
      }
      
      toast.success('Generation stopped successfully');
    } catch (error) {
      console.error('Failed to stop generation:', error);
      toast.error('Failed to stop generation');
    } finally {
      setIsStopping(false);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      await chatApi.deleteChat(chatId);
      setChats(prev => (prev || []).filter(chat => chat.id !== chatId));
      
      if (currentChat?.id === chatId) {
        const remainingChats = (chats || []).filter(chat => chat.id !== chatId);
        if (remainingChats.length > 0) {
          await selectChat(remainingChats[0].id);
        } else {
          setCurrentChat(null);
        }
      }
      
      toast.success('Chat deleted');
    } catch (error) {
      toast.error('Failed to delete chat');
    }
  };

  const generateSummary = async (chatId: string) => {
    try {
      setIsGeneratingSummary(true);
      const summaryResponse = await chatApi.generateSummary(chatId);
      setSummary(summaryResponse.summary);
      setShowSummary(true);
      toast.success('Summary generated successfully!');
    } catch (error) {
      console.error('Failed to generate summary:', error);
      toast.error('Failed to generate summary');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const filteredChats = chats.filter(chat =>
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages?.some(msg => 
      msg.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const suggestionPrompts = [
    { text: "Improve my sleep quality", icon: "🌙" },
    { text: "Create a healthy meal plan", icon: "🥗" },
    { text: "Build a meditation routine", icon: "🧘" },
    { text: "Learn stress management", icon: "😌" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <NavBar />
      
      <div className="h-[calc(100vh-4rem)] flex">
        <div className="flex w-full max-w-7xl mx-auto">
          {/* Sidebar - Chat List */}
          <div className={`w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${!isSidebarOpen ? 'hidden lg:block' : ''}`}>
            <div className="h-full flex flex-col">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-gray-900 dark:text-white">
                    Messages
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={createNewChat}
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search conversations"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg"
                  />
                </div>
              </div>
              
              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {filteredChats.map((chat, index) => (
                  <div
                    key={chat.id}
                    className={`group px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      currentChat?.id === chat.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-r-blue-500'
                        : ''
                    }`}
                    onClick={() => selectChat(chat.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {chat.title || 'New Chat'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            <span suppressHydrationWarning>
                              {new Date(chat.updatedAt).toLocaleString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(chat.id);
                          }}
                          className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!chats || chats.length === 0) && (
                  <div className="text-center py-12 px-4">
                    <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No conversations yet
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Start your first chat!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 min-h-0">
              {currentChat ? (
                <>
                  {/* Chat Header */}
                  <div className="border-b border-gray-200 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <Heart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            Wellness AI
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Online • AI Assistant
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => generateSummary(currentChat.id)}
                        disabled={isGeneratingSummary}
                        className="gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {isGeneratingSummary ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                        Summary
                      </Button>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-6">
                    {(!currentChat.messages || currentChat.messages.length === 0) ? (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center space-y-6 max-w-md">
                          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                            <Heart className="w-8 h-8 text-white" />
                          </div>
                          
                          <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                              Welcome to WellnessAI!
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300">
                              Your personal wellness assistant. How can I help you today?
                            </p>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-3">
                            {suggestionPrompts.map((suggestion, index) => (
                              <Button
                                key={suggestion.text}
                                variant="outline"
                                onClick={() => handleSendMessage(suggestion.text)}
                                className="h-auto p-3 text-left justify-start hover:bg-gray-50 dark:hover:bg-gray-700"
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{suggestion.icon}</span>
                                  <span className="text-sm">{suggestion.text}</span>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {currentChat.messages.map((message, index) => {
                          // Only show user and assistant messages, skip system messages
                          if (message.role === 'system') return null;
                          
                          const bubbleMessage: ChatBubbleMessage = {
                            id: index.toString(),
                            content: message.content,
                            role: message.role as 'user' | 'assistant',
                            timestamp: new Date(message.timestamp),
                            tokens: message.metadata?.tokens
                          };
                          return (
                            <ChatBubble 
                              key={index} 
                              message={bubbleMessage}
                              onCopy={(content) => {
                                navigator.clipboard.writeText(content);
                                toast.success('Copied to clipboard!');
                              }}
                              onRegenerate={(messageId) => {
                                // Implement regeneration logic
                                toast.info('Regeneration feature coming soon!');
                              }}
                              onFeedback={(messageId, type) => {
                                toast.success(`Feedback ${type} recorded!`);
                              }}
                            />
                          );
                        })}
                        
                        {/* Streaming message */}
                        {isStreaming && streamingMessage && (
                          <div key="streaming-message">
                            <ChatBubble 
                              message={{
                                id: 'streaming',
                                content: streamingMessage,
                                role: 'assistant',
                                timestamp: new Date(),
                              }}
                              isStreaming={true}
                            />
                          </div>
                        )}
                        
                        {/* Typing indicator */}
                        {isLoading && !isStreaming && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Sparkles className="w-4 h-4 text-white" />
                            </div>
                            <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3 max-w-xs">
                              <div className="flex items-center gap-2">
                                <div className="flex gap-1">
                                  {[0, 1, 2].map((i) => (
                                    <div
                                      key={i}
                                      className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"
                                      style={{ animationDelay: `${i * 0.2}s` }}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">Typing...</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input Form */}
                  <div className="border-t border-gray-200 dark:border-gray-700 p-6 pb-8 bg-white dark:bg-gray-800">
                    <form onSubmit={handleSubmit} className="flex items-end gap-3">
                      <div className="flex-1">
                        <Textarea
                          ref={textareaRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Type a message..."
                          disabled={isLoading}
                          className="min-h-[40px] max-h-[120px] rounded-2xl bg-gray-100 dark:bg-gray-700 border-0 px-4 py-2 resize-none overflow-y-auto"
                          rows={1}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmit(e);
                            }
                          }}
                        />
                      </div>
                      
                      <VoiceRecorder
                        onRecordingComplete={handleVoiceRecording}
                        isDisabled={isLoading}
                      />
                      
                      {isStreaming ? (
                        <Button
                          type="button"
                          onClick={handleStopGeneration}
                          disabled={isStopping}
                          size="sm"
                          className="h-10 w-10 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white"
                        >
                          {isStopping ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={!input.trim() || isLoading}
                          size="sm"
                          className="h-10 w-10 p-0 rounded-full bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 dark:disabled:bg-gray-600"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </form>
                  </div>
                </>
              ) : (
                <>
                  {/* Welcome Area when no chat is selected */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-6">
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center space-y-6 max-w-md">
                        <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
                          <Heart className="w-8 h-8 text-white" />
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Welcome to WellnessAI!
                          </h3>
                          <p className="text-gray-600 dark:text-gray-300">
                            Your personal wellness assistant. How can I help you today?
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-3">
                          {suggestionPrompts.map((suggestion, index) => (
                            <Button
                              key={suggestion.text}
                              variant="outline"
                              onClick={() => handleSendMessage(suggestion.text)}
                              className="h-auto p-3 text-left justify-start hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{suggestion.icon}</span>
                                <span className="text-sm">{suggestion.text}</span>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Form - Always available */}
                  <div className="border-t border-gray-200 dark:border-gray-700 p-6 pb-8 bg-white dark:bg-gray-800">
                    <form onSubmit={handleSubmit} className="flex items-end gap-3">
                      <div className="flex-1">
                        <Textarea
                          ref={textareaRef}
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          placeholder="Type a message..."
                          disabled={isLoading}
                          className="min-h-[40px] max-h-[120px] rounded-2xl bg-gray-100 dark:bg-gray-700 border-0 px-4 py-2 resize-none overflow-y-auto"
                          rows={1}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmit(e);
                            }
                          }}
                        />
                      </div>
                      
                      <VoiceRecorder
                        onRecordingComplete={handleVoiceRecording}
                        isDisabled={isLoading}
                      />
                      
                      {isStreaming ? (
                        <Button
                          type="button"
                          onClick={handleStopGeneration}
                          disabled={isStopping}
                          size="sm"
                          className="h-10 w-10 p-0 rounded-full bg-red-500 hover:bg-red-600 text-white"
                        >
                          {isStopping ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={!input.trim() || isLoading}
                          size="sm"
                          className="h-10 w-10 p-0 rounded-full bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 dark:disabled:bg-gray-600"
                        >
                          {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                    </form>
                  </div>
                </>
              )}
          </div>
        </div>
      </div>

      {/* Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-3xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              Chat Summary
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl p-6 border border-blue-200/50 dark:border-blue-800/50">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-semibold mb-2 text-gray-900 dark:text-white">{children}</h3>,
                  p: ({ children }) => <p className="mb-3 last:mb-0 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700 dark:text-gray-300">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-700 dark:text-gray-300">{children}</ol>,
                  li: ({ children }) => <li className="text-sm">{children}</li>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-500/30 pl-4 italic text-gray-600 dark:text-gray-400 mb-3 bg-blue-50/50 dark:bg-blue-900/10 py-2 rounded-r-lg">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-gray-200 dark:bg-slate-700 px-2 py-1 rounded text-xs font-mono text-blue-600 dark:text-blue-400">
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-4 rounded-xl overflow-x-auto mb-3">
                        <code className="text-xs font-mono text-gray-800 dark:text-gray-200">{children}</code>
                      </pre>
                    );
                  },
                  strong: ({ children }) => <strong className="font-semibold text-gray-900 dark:text-white">{children}</strong>,
                  em: ({ children }) => <em className="italic text-gray-700 dark:text-gray-300">{children}</em>,
                  a: ({ children, href }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {summary}
              </ReactMarkdown>
            </div>
            <div className="flex justify-end gap-3">
              <div>
                <Button
                  variant="outline"
                  onClick={() => setShowSummary(false)}
                  className="rounded-xl border-2"
                >
                  Close
                </Button>
              </div>
              <div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(summary);
                    toast.success('Summary copied to clipboard!');
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl"
                >
                  Copy Summary
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};