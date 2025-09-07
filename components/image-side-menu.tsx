'use client';
import { useState, useEffect } from 'react';
import { Menu, Plus, Images, Palette, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAccountSection } from '@/components/user-account-section';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ImageSideMenuProps {
  onToggle?: () => void;
}

interface MenuItem {
  id: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  href: string;
  badge?: number;
}

export function ImageSideMenu({ onToggle }: ImageSideMenuProps) {
  const pathname = usePathname();
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024); // lg breakpoint
    };

    // Check initial screen size
    checkScreenSize();

    // Add resize listener
    window.addEventListener('resize', checkScreenSize);

    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const isExpanded = isLargeScreen || isManuallyExpanded;

  const handleToggle = () => {
    if (!isLargeScreen) {
      setIsManuallyExpanded(!isManuallyExpanded);
    }
    onToggle?.();
  };

  const menuItems: MenuItem[] = [
    {
      id: 'create',
      icon: Plus,
      label: 'Create Image',
      href: '/image',
    },
    {
      id: 'gallery',
      icon: Images,
      label: 'My Gallery',
      href: '/image/gallery',
      badge: 0, // Could be updated with actual count
    },
    {
      id: 'public-gallery',
      icon: Images,
      label: 'Public Gallery',
      href: '/image/gallery/public',
    },
    {
      id: 'templates',
      icon: Palette,
      label: 'Templates',
      href: '/image/templates',
    },
    {
      id: 'profile',
      icon: User,
      label: 'Profile',
      href: '/auth/profile', // Assuming profile page exists
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Settings',
      href: '/settings', // Assuming settings page exists
    },
  ];

  const getActiveItem = () => {
    if (pathname === '/image') return 'create';
    if (pathname === '/image/gallery') return 'gallery';
    if (pathname === '/image/gallery/public') return 'public-gallery';
    if (pathname === '/image/templates') return 'templates';
    return '';
  };

  const activeItem = getActiveItem();

  // If collapsed on small screens, only show hamburger icon
  if (!isLargeScreen && !isManuallyExpanded) {
    return (
      <div className="fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="h-10 w-10 rounded-full border border-border bg-background p-0 shadow-md"
        >
          <Menu size={20} />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn(
      "relative bg-card border-r border-border transition-all duration-300 ease-in-out h-full flex flex-col",
      isExpanded ? "w-64" : "w-12"
    )}>
      {/* Toggle Button - Only show on small screens when expanded */}
      {!isLargeScreen && isManuallyExpanded && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="absolute -right-3 top-4 z-10 h-8 w-8 rounded-full border border-border bg-background p-0 shadow-md"
        >
          <Menu size={16} />
        </Button>
      )}

      {/* Menu Header */}
      <div className={cn(
        "flex h-16 items-center border-b border-border px-2 flex-shrink-0",
        isExpanded ? "justify-start" : "justify-center"
      )}>
        {isExpanded ? (
          <h2 className="text-lg font-semibold">Image Studio</h2>
        ) : (
          <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
            <Menu size={16} className="text-primary" />
          </div>
        )}
      </div>

      {/* Menu Items - Scrollable */}
      <nav className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto min-h-0">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <Link key={item.id} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-10 flex-shrink-0",
                  isExpanded ? "w-full px-3 justify-start" : "w-8 px-0 justify-center",
                  isActive && "bg-secondary"
                )}
              >
                <div className={cn(
                  "flex items-center",
                  isExpanded ? "gap-3 justify-start" : "justify-center"
                )}>
                  <Icon
                    size={isExpanded ? 18 : 16}
                    className={cn(
                      "flex-shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  {isExpanded && (
                    <>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground flex-shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Account Section - Always at bottom */}
      <div className="flex-shrink-0 border-t border-border">
        {isExpanded ? (
          <UserAccountSection />
        ) : (
          <div className="p-2 flex justify-center">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
          </div>
        )}
      </div>
    </div>
  );
}
