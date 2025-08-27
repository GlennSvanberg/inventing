'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message..."
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      if (!message.trim()) {
        // Reset to single line height when empty
        textarea.style.height = '36px';
        setIsExpanded(false);
      } else {
        // Auto-resize when there's content
        textarea.style.height = 'auto';
        const scrollHeight = textarea.scrollHeight;
        const maxHeight = 240; // Maximum height in pixels (doubled from 120)
        textarea.style.height = Math.min(scrollHeight, maxHeight) + 'px';

        // Update expanded state based on height
        setIsExpanded(scrollHeight > 40); // Base height of single line
      }
    }
  }, [message]);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage && !disabled) {
      onSendMessage(trimmedMessage);
      setMessage('');
      // Reset textarea height to single line
      if (textareaRef.current) {
        textareaRef.current.style.height = '36px';
      }
      setIsExpanded(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };

  return (
    <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-4xl mx-auto p-4">
        <div className={cn(
          "relative flex items-end gap-3 rounded-lg border border-border bg-background transition-all duration-200 p-2",
          isExpanded ? "min-h-[60px]" : "min-h-[52px]"
        )}>
          {/* File attachment button (future feature) */}
          <Button
            variant="ghost"
            size="sm"
            className="flex-shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-md"
            disabled={disabled}
          >
            <Paperclip size={16} />
            <span className="sr-only">Attach file</span>
          </Button>

          {/* Text input area */}
          <div className="flex-1 relative min-h-[36px] flex items-end">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "min-h-[36px] max-h-[240px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-muted-foreground/60 leading-6"
              )}
              style={{ 
                height: message ? 'auto' : '36px',
                lineHeight: '36px'
              }}
              rows={1}
            />

            {/* Character count indicator (optional) */}
            {message.length > 500 && (
              <div className="absolute -top-6 right-0 text-xs text-muted-foreground">
                {message.length}/2000
              </div>
            )}
          </div>

          {/* Send button */}
          <Button
            onClick={handleSubmit}
            disabled={!message.trim() || disabled}
            size="sm"
            className={cn(
              "flex-shrink-0 h-8 w-8 p-0 transition-all duration-200 rounded-md",
              message.trim() && !disabled
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted/50 text-muted-foreground hover:bg-muted/70"
            )}
          >
            <Send size={16} />
            <span className="sr-only">Send message</span>
          </Button>
        </div>

        {/* Input hints */}
        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground/80">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {isExpanded && (
            <span className="flex items-center gap-1">
              <span>Esc to collapse</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
