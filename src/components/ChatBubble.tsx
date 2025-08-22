import { formatDate } from '../lib/utils';
import { User, Copy, ThumbsUp, ThumbsDown, RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface ChatBubbleMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  tokens?: number;
}

interface ChatBubbleProps {
  message: ChatBubbleMessage;
  isStreaming?: boolean;
  onCopy?: (content: string) => void;
  onRegenerate?: (messageId: string) => void;
  onFeedback?: (messageId: string, type: 'like' | 'dislike') => void;
}

export const ChatBubble = ({ 
  message, 
  isStreaming, 
  onCopy, 
  onRegenerate, 
  onFeedback 
}: ChatBubbleProps) => {
  const isUser = message.role === 'user';
  const [feedbackGiven, setFeedbackGiven] = useState<'like' | 'dislike' | null>(null);

  const handleCopy = () => {
    onCopy?.(message.content);
    toast.success('Copied to clipboard!');
  };

  const handleFeedback = (type: 'like' | 'dislike') => {
    setFeedbackGiven(type);
    onFeedback?.(message.id, type);
  };

  return (
    <div className={cn("group flex gap-3 mb-4", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 max-w-lg inline-block",
            isUser
              ? "bg-blue-500 text-white rounded-br-md"
              : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-md",
            isStreaming ? "min-h-[2rem]" : ""
          )}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed break-words">
              {message.content}
              {isStreaming && (
                <motion.span 
                  className="inline-block w-0.5 h-4 bg-current ml-1 rounded-full"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ 
                    duration: 0.8, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </p>
          ) : (
            <div className="text-sm leading-relaxed">
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-semibold mb-2 text-gray-900 dark:text-gray-100">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100">{children}</h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">{children}</h4>
                  ),
                  h5: ({ children }) => (
                    <h5 className="text-xs font-medium mb-2 text-gray-900 dark:text-gray-100">{children}</h5>
                  ),
                  h6: ({ children }) => (
                    <h6 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">{children}</h6>
                  ),
                  p: ({ children }) => (
                    <p className="mb-2 last:mb-0">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc mb-2 space-y-1 pl-4">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal mb-2 space-y-1 pl-4">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-sm">{children}</li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-500/30 pl-4 italic text-gray-600 dark:text-gray-400 mb-2 bg-blue-50/50 dark:bg-blue-900/10 py-2 rounded-r">
                      {children}
                    </blockquote>
                  ),
                  code: ({ children, className }) => {
                    const isInline = !className;
                    return isInline ? (
                      <code className="bg-gray-200 dark:bg-gray-600 px-1 py-0.5 rounded text-xs font-mono">
                        {children}
                      </code>
                    ) : (
                      <pre className="bg-gray-200 dark:bg-gray-600 p-2 rounded text-xs font-mono overflow-x-auto mb-2">
                        <code>{children}</code>
                      </pre>
                    );
                  },
                  strong: ({ children }) => (
                    <strong className="font-bold text-gray-900 dark:text-gray-100">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic">{children}</em>
                  ),
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
                  hr: () => (
                    <hr className="border-gray-300 dark:border-gray-600 my-3" />
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-2">
                      <table className="min-w-full border border-gray-300 dark:border-gray-600">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-gray-100 dark:bg-gray-700">{children}</thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody>{children}</tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="border-b border-gray-200 dark:border-gray-600">{children}</tr>
                  ),
                  th: ({ children }) => (
                    <th className="px-3 py-2 text-left text-xs font-semibold text-gray-900 dark:text-gray-100 border-r border-gray-300 dark:border-gray-600">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300 border-r border-gray-300 dark:border-gray-600">
                      {children}
                    </td>
                  ),
                }}>
                {message.content}
              </ReactMarkdown>
              {isStreaming && (
                <motion.span 
                  className="inline-block w-0.5 h-4 bg-gray-600 dark:bg-gray-400 ml-1 rounded-full"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ 
                    duration: 0.8, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </div>
          )}
        </div>

        {!isUser && !isStreaming && (
          <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onRegenerate?.(message.id)}
              className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleFeedback('like')}
              className={cn(
                "h-6 w-6 p-0 rounded",
                feedbackGiven === 'like' 
                  ? "bg-blue-100 text-blue-600" 
                  : "hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              <ThumbsUp className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleFeedback('dislike')}
              className={cn(
                "h-6 w-6 p-0 rounded",
                feedbackGiven === 'dislike' 
                  ? "bg-red-100 text-red-600" 
                  : "hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              <ThumbsDown className="w-3 h-3" />
            </Button>
          </div>
        )}

        <div className={cn("text-xs text-gray-500 dark:text-gray-400 mt-1", isUser ? "text-right" : "text-left")}>
          <span>{formatDate(message.timestamp)}</span>
        </div>
      </div>
      
      {isUser && (
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
};