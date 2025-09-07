'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2, ChevronLeft, ChevronRight, Images, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface GeneratedImage {
  id: string;
  url: string;
  name: string;
  uploadedAt: string;
  size: number;
  type: string;
  templateId?: string;
  templateTitle?: string;
  templateDescription?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PublicGalleryProps {
  showHeader?: boolean;
  showSearch?: boolean;
  maxWidth?: string;
}

export default function PublicGallery({
  showHeader = true,
  showSearch = true,
  maxWidth = "w-full"
}: PublicGalleryProps) {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const loadImages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const response = await fetch(`/api/image/gallery/public?${params}`);
      const contentType = response.headers.get('content-type') || '';

      if (!response.ok) {
        // Try to parse JSON error, but fallback to text/HTML safely
        let message = 'Failed to load images';
        if (contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            message = errorData.error || message;
          } catch {}
        } else {
          try {
            const text = await response.text();
            if (text && text.length < 400) message = text;
          } catch {}
        }
        setError(message);
        return;
      }

      // Successful path: ensure we only parse JSON when it's JSON
      if (!contentType.includes('application/json')) {
        setError('Unexpected response from server');
        return;
      }

      const data = await response.json();
      setImages(data.images || []);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error loading images:', error);
      setError('Failed to load images');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, searchQuery]);

  useEffect(() => {
    loadImages();
  }, [pagination.page, searchQuery, loadImages]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on search
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  if (isLoading && images.length === 0) {
    return (
      <div className="py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin mr-3" />
          <span className="text-lg">Loading amazing AI-generated images...</span>
        </div>
      </div>
    );
  }

  if (error && images.length === 0) {
    return (
      <div className="py-16">
        <div className="text-center">
          <div className="text-destructive mb-4">
            <Images className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">Unable to load gallery</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
          </div>
          <Button onClick={loadImages} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={maxWidth}>
      {/* Header with Search - Only show if showHeader is true */}
      {showHeader && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <Images className="w-6 h-6" />
            Community Gallery
          </h2>
          <p className="text-muted-foreground mb-6">
            Explore amazing AI-generated images created by our community
          </p>

          {/* Search Form - Only show if showSearch is true */}
          {showSearch && (
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search images, templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="outline">
                Search
              </Button>
            </form>
          )}
        </div>
      )}

      {/* Gallery Content */}
      {images.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Images className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No images found</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? 'Try adjusting your search terms.' : 'Be the first to create amazing AI images!'}
            </p>
            <Link href="/image">
              <Button>
                Create Your First Image
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Images Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative overflow-hidden bg-muted">
                  <Image
                    src={image.url}
                    alt={image.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="mb-3">
                    {image.templateTitle && (
                      <p className="text-xs text-muted-foreground truncate" title={image.templateTitle}>
                        Template: {image.templateTitle}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {image.templateId ? (
                      <Link href={`/image/create?template=${image.templateId}`} className="flex-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-muted-foreground hover:text-foreground hover:bg-muted/50 border-0"
                          title="Create an image with you in it using this template"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Create Similar
                        </Button>
                      </Link>
                    ) : (
                      <Link href="/image" className="flex-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-muted-foreground hover:text-foreground hover:bg-muted/50 border-0"
                          title="Create your own AI image"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          Create Image
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === pagination.page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-10 h-10"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Results Summary */}
          <div className="text-center text-sm text-muted-foreground mt-4">
            Showing {images.length} of {pagination.total} images
            {pagination.totalPages > 1 && ` • Page ${pagination.page} of ${pagination.totalPages}`}
          </div>
        </>
      )}
    </div>
  );
}
