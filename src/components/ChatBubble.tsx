import { formatDate } from '../lib/utils';
import { Message } from '../api/chat';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Heart, User } from 'lucide-react';
import { cn } from '../lib/utils';

interface ChatBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export const ChatBubble = ({ message, isStreaming }: ChatBubbleProps) => {
  const isUser = message.role === 'user';

  return (
    <div className={cn("flex gap-3 max-w-4xl", isUser ? "ml-auto flex-row-reverse" : "mr-auto")}>
      <Avatar className={cn("w-8 h-8 flex-shrink-0", isUser ? "bg-primary/10" : "bg-wellness/10")}>
        <AvatarFallback>
          {isUser ? (
            <User className="w-4 h-4 text-primary" />
          ) : (
            <Heart className="w-4 h-4 text-wellness" />
          )}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex flex-col gap-1 min-w-0 flex-1", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-3 max-w-[80%] break-words",
            isUser
              ? "bg-gradient-to-r from-primary to-wellness text-white"
              : "bg-card border shadow-sm"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-current ml-1 animate-pulse" />
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
          {formatDate(message.timestamp)}
          {message.tokens && (
            <>
              <span>•</span>
              <span>{message.tokens} tokens</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};