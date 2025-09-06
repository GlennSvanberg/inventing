'use client';

import { useState } from 'react';
import { ImageSideMenu } from '@/components/image-side-menu';

export default function ImageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);

  const toggleMenu = () => {
    setIsMenuExpanded(!isMenuExpanded);
  };

  return (
    <div className="min-h-screen flex">
      {/* Side Menu */}
      <ImageSideMenu
        onToggle={toggleMenu}
      />

      {/* Main Content - Adjusts based on sidebar state */}
      <div className="flex-1 min-w-0 lg:ml-0">
        <div className="min-h-screen flex flex-col">
          {/* Main Content - Allow natural scrolling */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
