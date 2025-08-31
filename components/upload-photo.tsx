'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, Camera, X, Image as ImageIcon, Check, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface UploadedPhoto {
  id: string;
  url: string;
  name: string;
  uploadedAt: string;
  size?: number;
  type?: string;
}

interface UploadPhotoProps {
  onPhotoSelect: (imageIds: string[] | null) => void;
  selectedPhotos: string[] | null;
}

export function UploadPhoto({ onPhotoSelect, selectedPhotos }: UploadPhotoProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<UploadedPhoto[]>([]);
  const [selectedGalleryPhotos, setSelectedGalleryPhotos] = useState<string[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load gallery photos on component mount
  useEffect(() => {
    loadGalleryPhotos();
  }, []);

  const loadGalleryPhotos = async () => {
    try {
      setIsLoadingGallery(true);
      const response = await fetch('/api/image/gallery');
      if (response.ok) {
        const data = await response.json();
        setUploadedPhotos(data.images || []);
      } else {
        console.error('Failed to load gallery photos');
      }
    } catch (error) {
      console.error('Error loading gallery photos:', error);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/image/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Reload gallery to show the new image
        await loadGalleryPhotos();
        return data.image;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = async (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      try {
        // Upload the file first and get the image ID
        const uploadedImage = await uploadFile(file);
        // Clear gallery selection when uploading new
        setSelectedGalleryPhotos([]);
        onPhotoSelect([uploadedImage.id]);
      } catch (error) {
        // Error is already handled in uploadFile
        console.error('File upload failed:', error);
      }
    }
  };

  const handleGalleryPhotoToggle = async (photo: UploadedPhoto) => {
    setSelectedGalleryPhotos(prev => {
      const isSelected = prev.includes(photo.id);
      let newSelection;

      if (isSelected) {
        // Remove from selection
        newSelection = prev.filter(id => id !== photo.id);
      } else {
        // Add to selection
        newSelection = [...prev, photo.id];
      }

      onPhotoSelect(newSelection.length > 0 ? newSelection : null);
      return newSelection;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemovePhoto = () => {
    onPhotoSelect(null);
    setSelectedGalleryPhotos([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get selected photos for display
  const getSelectedPhotos = () => {
    if (!selectedPhotos || selectedPhotos.length === 0) return [];
    return uploadedPhotos.filter(photo => selectedPhotos.includes(photo.id));
  };

  const hasUploadedPhotos = !isLoadingGallery && uploadedPhotos.length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          {selectedPhotos && selectedPhotos.length > 0 ? 'Selected Photos' : 'Upload Your Photo'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {uploadError && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{uploadError}</p>
          </div>
        )}

        {selectedPhotos && selectedPhotos.length > 0 ? (
          // Selected photos view
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                {selectedPhotos.length === 1 ? 'Selected Photo' : `${selectedPhotos.length} Selected Photos`}
              </h4>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemovePhoto}
              >
                <X className="w-4 h-4 mr-2" />
                Clear Selection
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getSelectedPhotos().slice(0, 4).map((photo, index) => (
                <div key={photo.id} className="relative">
                  <img
                    src={photo.url}
                    alt={`Selected photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>

            {selectedPhotos && selectedPhotos.length > 4 && (
              <p className="text-sm text-muted-foreground">
                And {selectedPhotos.length - 4} more photos...
              </p>
            )}
          </div>
        ) : isLoadingGallery ? (
          // Loading state for gallery
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading your photos...</span>
          </div>
        ) : hasUploadedPhotos ? (
          // Gallery view with upload section
          <div className="space-y-6">
            {/* Photo Gallery - Takes most space */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Select from your photos</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {uploadedPhotos.map((photo) => {
                  const isSelected = selectedGalleryPhotos.includes(photo.id);
                  return (
                    <div
                      key={photo.id}
                      className={cn(
                        "relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                        isSelected
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-muted hover:border-primary/50"
                      )}
                    >
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => handleGalleryPhotoToggle(photo)}
                      />

                      {/* Checkbox */}
                      <div className="absolute top-2 right-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleGalleryPhotoToggle(photo)}
                          className="bg-background/80 backdrop-blur-sm border-2 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                      </div>

                      {/* Selection overlay */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center pointer-events-none">
                          <Check className="w-6 h-6 text-white drop-shadow-lg" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upload Section - Smaller at bottom */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                Or upload a new photo
                {isUploading && <Loader2 className="w-4 h-4 animate-spin inline ml-2" />}
              </h4>
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer",
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <Plus className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">
                      Drop photo here or <span className="text-primary">browse</span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, WebP (max 10MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Upload only view (when no existing photos)
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  Drop your photo here, or{' '}
                  <span className="text-primary">browse</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports JPG, PNG, WebP (max 10MB)
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />
      </CardContent>
    </Card>
  );
}
