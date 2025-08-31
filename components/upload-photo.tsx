'use client';

import { useState, useRef } from 'react';
import { Upload, Camera, X, Image as ImageIcon, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

// Mock uploaded photos - in real app this would come from storage/API
const mockUploadedPhotos = [
  { id: '1', url: 'https://picsum.photos/200/200?random=1', name: 'portrait-1.jpg', uploadedAt: '2024-01-15' },
  { id: '2', url: 'https://picsum.photos/200/200?random=2', name: 'selfie-1.jpg', uploadedAt: '2024-01-14' },
  { id: '3', url: 'https://picsum.photos/200/200?random=3', name: 'profile-pic.jpg', uploadedAt: '2024-01-13' },
  { id: '4', url: 'https://picsum.photos/200/200?random=4', name: 'vacation-photo.jpg', uploadedAt: '2024-01-12' },
  { id: '5', url: 'https://picsum.photos/200/200?random=5', name: 'family-pic.jpg', uploadedAt: '2024-01-11' },
  { id: '6', url: 'https://picsum.photos/200/200?random=6', name: 'graduation.jpg', uploadedAt: '2024-01-10' },
];

interface UploadedPhoto {
  id: string;
  url: string;
  name: string;
  uploadedAt: string;
}

interface UploadPhotoProps {
  onPhotoSelect: (files: File[] | null) => void;
  selectedPhotos: File[] | null;
}

export function UploadPhoto({ onPhotoSelect, selectedPhotos }: UploadPhotoProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedPhotos] = useState<UploadedPhoto[]>(mockUploadedPhotos);
  const [selectedGalleryPhotos, setSelectedGalleryPhotos] = useState<UploadedPhoto[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (file && file.type.startsWith('image/')) {
      // Clear gallery selection when uploading new
      setSelectedGalleryPhotos([]);
      onPhotoSelect([file]);
    }
  };

  const handleGalleryPhotoToggle = (photo: UploadedPhoto) => {
    setSelectedGalleryPhotos(prev => {
      const isSelected = prev.some(p => p.id === photo.id);
      let newSelection;

      if (isSelected) {
        // Remove from selection
        newSelection = prev.filter(p => p.id !== photo.id);
      } else {
        // Add to selection
        newSelection = [...prev, photo];
      }

      // Convert gallery photos to File objects for compatibility
      if (newSelection.length > 0) {
        Promise.all(
          newSelection.map(async (p) => {
            const res = await fetch(p.url);
            const blob = await res.blob();
            return new File([blob], p.name, { type: 'image/jpeg' });
          })
        ).then(files => onPhotoSelect(files));
      } else {
        onPhotoSelect(null);
      }

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

  const hasUploadedPhotos = uploadedPhotos.length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          {selectedPhotos && selectedPhotos.length > 0 ? 'Selected Photos' : 'Upload Your Photo'}
        </CardTitle>
      </CardHeader>
      <CardContent>
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
              {selectedPhotos.slice(0, 4).map((photo, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Selected photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>

            {selectedPhotos.length > 4 && (
              <p className="text-sm text-muted-foreground">
                And {selectedPhotos.length - 4} more photos...
              </p>
            )}
          </div>
        ) : hasUploadedPhotos ? (
          // Gallery view with upload section
          <div className="space-y-6">
            {/* Photo Gallery - Takes most space */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Select from your photos</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {uploadedPhotos.map((photo) => {
                  const isSelected = selectedGalleryPhotos.some(p => p.id === photo.id);
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
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Or upload a new photo</h4>
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
