'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Images, ArrowLeft, Download, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

interface GeneratedImage {
  id: string;
  url: string;
  name: string;
  uploadedAt: string;
  size: number;
  type: string;
  templateName?: string;
}

export default function GeneratedGalleryPage() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadGeneratedImages();
  }, []);

  const loadGeneratedImages = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/image/gallery/generated');
      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load generated images');
      }
    } catch (error) {
      console.error('Error loading generated images:', error);
      setError('Failed to load generated images');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = image.name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Download started",
        description: `${image.name} is being downloaded.`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Failed to download the image.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (image: GeneratedImage) => {
    if (!confirm(`Are you sure you want to delete "${image.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/image/gallery/generated/${image.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setImages(prev => prev.filter(img => img.id !== image.id));
        toast({
          title: "Image deleted",
          description: `${image.name} has been deleted.`,
        });
      } else {
        const errorData = await response.json();
        toast({
          title: "Delete failed",
          description: errorData.error || "Failed to delete the image.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete the image.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            <span className="text-lg">Loading your generated images...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="text-destructive mb-4">
              <Images className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h2 className="text-xl font-semibold mb-2">Failed to load gallery</h2>
              <p className="text-muted-foreground">{error}</p>
            </div>
            <Button onClick={loadGeneratedImages} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/image">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Generation
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
            <Images className="w-8 h-8" />
            Generated Images Gallery
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg">
            View and manage all your AI-generated images
          </p>
        </div>

        {/* Gallery Content */}
        {images.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Images className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No generated images yet</h3>
              <p className="text-muted-foreground mb-6">
                Start creating amazing AI images using your photos and templates.
              </p>
              <Link href="/image">
                <Button>
                  Create Your First Image
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium text-sm truncate" title={image.name}>
                        {image.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(image.uploadedAt)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {formatFileSize(image.size)}
                      </Badge>
                      {image.templateName && (
                        <Badge variant="outline" className="text-xs">
                          {image.templateName}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(image)}
                        className="flex-1"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(image)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 sm:mt-12 text-center text-sm text-muted-foreground">
          <p>Manage your AI-generated images with ease</p>
        </div>
      </div>
    </div>
  );
}
