'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, MessageSquare, Settings, History, User, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAccountSection } from '@/components/user-account-section';
import { cn } from '@/lib/utils';

interface ChatSideMenuProps {
  isExpanded: boolean;
  onToggle: () => void;
}

interface MenuItem {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  action?: () => void;
  badge?: number;
}

export function ChatSideMenu({ isExpanded, onToggle }: ChatSideMenuProps) {
  const [activeItem, setActiveItem] = useState('chat');

  const menuItems: MenuItem[] = [
    {
      id: 'chat',
      icon: MessageSquare,
      label: 'New Chat',
    },
    {
      id: 'history',
      icon: History,
      label: 'Chat History',
      badge: 3, // Mock unread count
    },
    {
      id: 'profile',
      icon: User,
      label: 'Profile',
    },
    {
      id: 'appearance',
      icon: Palette,
      label: 'Appearance',
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Settings',
    },
  ];

  return (
    <div className={cn(
      "relative bg-card border-r border-border transition-all duration-300 ease-in-out h-full flex flex-col",
      isExpanded ? "w-64" : "w-16"
    )}>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="absolute -right-3 top-4 z-10 h-6 w-6 rounded-full border border-border bg-background p-0 shadow-md"
      >
        {isExpanded ? (
          <ChevronLeft size={14} />
        ) : (
          <ChevronRight size={14} />
        )}
      </Button>

      {/* Menu Header */}
      <div className="flex h-16 items-center justify-center border-b border-border px-4 flex-shrink-0">
        {isExpanded ? (
          <h2 className="text-lg font-semibold">Menu</h2>
        ) : (
          <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
            <MessageSquare size={16} className="text-primary" />
          </div>
        )}
      </div>

      {/* Menu Items - Scrollable */}
      <nav className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto min-h-0">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              size="sm"
              onClick={() => {
                setActiveItem(item.id);
                item.action?.();
              }}
              className={cn(
                "justify-start h-10 px-3 flex-shrink-0",
                isExpanded ? "w-full" : "w-10 px-0",
                isActive && "bg-secondary"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  size={18}
                  className={cn(
                    "flex-shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {isExpanded && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge && item.badge > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground flex-shrink-0">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </div>
            </Button>
          );
        })}
      </nav>

      {/* User Account Section - Always at bottom */}
      <div className="flex-shrink-0">
        {isExpanded ? (
          <UserAccountSection />
        ) : (
          <div className="p-3 border-t border-border flex justify-center">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}
