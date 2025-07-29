import { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { NavBar } from '../components/NavBar';
import { ChatBubble } from '../components/ChatBubble';
import { VoiceRecorder } from '../components/VoiceRecorder';
import { Send, Trash2, Loader2 } from 'lucide-react';
import { chatApi, Message } from '../api/chat';
import { useUsageStore } from '../store/usageStore';
import { debounce } from '../lib/utils';
import { toast } from 'sonner';

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { incrementUsage } = useUsageStore();

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const history = await chatApi.getChatHistory();
      setMessages(history);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const handleSendMessage = async (messageText: string, isVoice = false) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingMessage('');

    try {
      // Use streaming for better UX
      chatApi.streamMessage(
        { message: messageText, voice: isVoice },
        (chunk) => {
          setStreamingMessage(chunk);
        },
        (response) => {
          const assistantMessage: Message = {
            id: response.messageId,
            content: response.reply,
            role: 'assistant',
            timestamp: new Date(),
            tokens: response.tokens,
          };

          setMessages(prev => [...prev, assistantMessage]);
          setStreamingMessage('');
          setIsStreaming(false);
          setIsLoading(false);

          // Update usage stats
          incrementUsage(response.tokens, 1);
        },
        (error) => {
          console.error('Chat error:', error);
          toast.error('Failed to send message. Please try again.');
          setIsLoading(false);
          setIsStreaming(false);
          setStreamingMessage('');
        }
      );
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message. Please try again.');
      setIsLoading(false);
      setIsStreaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  const handleVoiceRecording = (audioBlob: Blob) => {
    // In a real app, you'd send this to a speech-to-text service
    // For demo purposes, we'll simulate voice input
    const simulatedTranscript = "This is a simulated voice message about my wellness goals.";
    handleSendMessage(simulatedTranscript, true);
    toast.success('Voice message processed!');
  };

  const clearHistory = async () => {
    try {
      await chatApi.clearHistory();
      setMessages([]);
      toast.success('Chat history cleared');
    } catch (error) {
      toast.error('Failed to clear history');
    }
  };

  // Debounced input handler
  const debouncedSetInput = debounce((value: string) => {
    setInput(value);
  }, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/10">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Chat with WellnessAI</h1>
              <p className="text-muted-foreground">
                Your personal AI wellness assistant is here to help
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              className="gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </Button>
          </div>

          {/* Chat Messages */}
          <Card className="border-0 shadow-soft">
            <div className="h-[60vh] overflow-y-auto p-6 space-y-6">
              {messages.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-wellness rounded-full flex items-center justify-center mx-auto">
                    <span className="text-2xl text-white">🌟</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Welcome to WellnessAI!</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      I'm here to support your wellness journey. Ask me about mental health, 
                      nutrition, exercise, sleep, or any wellness-related topics.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      "How can I improve my sleep?",
                      "Suggest a healthy meal plan",
                      "Help me manage stress",
                      "Create a workout routine"
                    ].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendMessage(suggestion)}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <ChatBubble key={message.id} message={message} />
                  ))}
                  
                  {/* Streaming message */}
                  {isStreaming && streamingMessage && (
                    <ChatBubble
                      message={{
                        id: 'streaming',
                        content: streamingMessage,
                        role: 'assistant',
                        timestamp: new Date(),
                      }}
                      isStreaming={true}
                    />
                  )}
                  
                  {/* Typing indicator */}
                  {isLoading && !streamingMessage && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-wellness/10 rounded-full flex items-center justify-center">
                        <Loader2 className="w-4 h-4 text-wellness animate-spin" />
                      </div>
                      <div className="bg-card border rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <div className="flex-1">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything about wellness..."
                    disabled={isLoading}
                    className="h-12"
                  />
                </div>
                
                <VoiceRecorder
                  onRecordingComplete={handleVoiceRecording}
                  isDisabled={isLoading}
                />
                
                <Button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="h-12 px-6 bg-gradient-to-r from-primary to-wellness hover:opacity-90"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};