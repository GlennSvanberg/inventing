'use client';

import { useState, useRef, useEffect } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChatSideMenu } from "@/components/chat-side-menu";
import { MessageList } from "@/components/chat-message";
import { ChatInput } from "@/components/chat-input";

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  type: 'user' | 'ai';
  isStreaming?: boolean;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      timestamp: new Date(),
      type: 'user',
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Create AI message placeholder for streaming
      const aiMessageId = (Date.now() + 1).toString();
      const aiMessage: Message = {
        id: aiMessageId,
        content: '',
        timestamp: new Date(),
        type: 'ai',
        isStreaming: true,
      };

      setMessages(prev => [...prev, aiMessage]);

      // Start streaming response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream');
      }

      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === 'chunk') {
                accumulatedContent += data.content;

                setMessages(prev => prev.map(msg =>
                  msg.id === aiMessageId
                    ? { ...msg, content: accumulatedContent, isStreaming: true }
                    : msg
                ));
              } else if (data.type === 'end') {
                setMessages(prev => prev.map(msg =>
                  msg.id === aiMessageId
                    ? { ...msg, isStreaming: false }
                    : msg
                ));
              }
            } catch (e) {
              console.error('Error parsing streaming data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        type: 'ai',
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMenu = () => {
    setIsMenuExpanded(!isMenuExpanded);
  };

  return (
    <div className="flex h-screen">
      {/* Side Menu */}
      <div className="flex flex-col h-full">
        <ChatSideMenu
          isExpanded={isMenuExpanded}
          onToggle={toggleMenu}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Messages Container - Scrollable area above input */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <MessageList messages={messages} />
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input - Fixed at bottom */}
        <div className="flex-shrink-0">
          <ChatInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
            placeholder={isLoading ? "AI is thinking..." : "Type your message..."}
          />
        </div>
      </div>
    </div>
  );
}
