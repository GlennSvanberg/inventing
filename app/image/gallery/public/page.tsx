'use client';

import { ArrowLeft, Images } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import PublicGallery from '@/components/public-gallery';

export default function PublicGalleryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/image">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Creation
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
            <Images className="w-8 h-8" />
            Public Gallery
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            Explore amazing AI-generated images created by our community
          </p>
        </div>

        {/* Public Gallery Component */}
        <PublicGallery
          showHeader={false}
          showSearch={true}
          maxWidth="w-full"
        />
      </div>
    </div>
  );
}
