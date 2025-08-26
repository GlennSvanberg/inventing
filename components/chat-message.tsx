'use client';

import { useState, useEffect } from 'react';
import { Bot, User, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageProps {
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  type: 'user' | 'ai';
}

export function ChatMessage({ content, timestamp, isStreaming, type }: MessageProps) {
  const [copied, setCopied] = useState(false);
  const [displayContent, setDisplayContent] = useState(content);
  const [isTyping, setIsTyping] = useState(false);

  // Handle streaming content updates
  useEffect(() => {
    if (isStreaming && type === 'ai') {
      setIsTyping(true);
      setDisplayContent(content);
    } else {
      setIsTyping(false);
      setDisplayContent(content);
    }
  }, [content, isStreaming, type]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (type === 'user') {
    return (
      <div className="flex justify-end mb-4">
        <div className="flex items-start gap-3 max-w-[70%]">
          <div className="flex flex-col items-end gap-2 flex-1">
            <div className="bg-primary text-primary-foreground rounded-lg px-4 py-3 shadow-sm">
              <p className="text-sm whitespace-pre-wrap break-words">{content}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatTime(timestamp)}</span>
              <User size={12} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-4">
      <div className="flex items-start gap-3 max-w-[80%]">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot size={16} className="text-primary" />
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="bg-muted rounded-lg px-4 py-3 shadow-sm">
            <div className="relative">
              <p className="text-sm whitespace-pre-wrap break-words">
                {displayContent}
                {isTyping && isStreaming && (
                  <span className="inline-block w-2 h-4 bg-primary/60 animate-pulse ml-1"></span>
                )}
              </p>
              {!isStreaming && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="absolute top-0 right-0 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copied ? (
                    <Check size={12} className="text-green-600" />
                  ) : (
                    <Copy size={12} />
                  )}
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Bot size={12} />
            <span>{formatTime(timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface MessageListProps {
  messages: Array<{
    id: string;
    content: string;
    timestamp: Date;
    type: 'user' | 'ai';
    isStreaming?: boolean;
  }>;
}

export function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <Bot size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Start a conversation</p>
            <p className="text-sm">Send a message to begin chatting with the AI.</p>
          </div>
        </div>
      ) : (
        messages.map((message) => (
          <div key={message.id} className="group">
            <ChatMessage
              content={message.content}
              timestamp={message.timestamp}
              isStreaming={message.isStreaming}
              type={message.type}
            />
          </div>
        ))
      )}
    </div>
  );
}
