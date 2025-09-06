'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Trash2, Download, Loader2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { TemplateImage } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadSectionProps {
  images: TemplateImage[];
  onImagesChange: (images: TemplateImage[]) => void;
  isUploading: boolean;
  onFileUpload: (files: File[]) => Promise<void>;
  urlInput: string;
  onUrlInputChange: (value: string) => void;
  isDownloadingUrl: boolean;
  onUrlDownload: () => Promise<void>;
  showCamera?: boolean;
  onCameraToggle?: () => void;
  isCameraActive?: boolean;
  cameraVideoRef?: React.RefObject<HTMLVideoElement>;
  cameraCanvasRef?: React.RefObject<HTMLCanvasElement>;
  onCameraCapture?: () => Promise<void>;
  title?: string;
  description?: string;
}

export function ImageUploadSection({
  images,
  onImagesChange,
  isUploading,
  onFileUpload,
  urlInput,
  onUrlInputChange,
  isDownloadingUrl,
  onUrlDownload,
  showCamera = true,
  onCameraToggle,
  isCameraActive = false,
  cameraVideoRef,
  cameraCanvasRef,
  onCameraCapture,
  title = "Upload Reference Images",
  description = "Upload images that will be used as reference for your template."
}: ImageUploadSectionProps) {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    await onFileUpload(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await onFileUpload(files);
    // Reset input
    e.target.value = '';
  };

  const handleDeleteImage = (imageId: string) => {
    // Handle temporary images (not yet uploaded)
    if (imageId.startsWith('temp-')) {
      onImagesChange(images.filter(img => {
        if (img.id === imageId) {
          // Clean up object URL
          URL.revokeObjectURL(img.public_url);
          return false;
        }
        return true;
      }));
    }
    toast({
      title: 'Success',
      description: 'Image removed successfully.',
    });
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    // Handle paste events for both binary images and URLs
    const items = e.clipboardData?.items;
    if (!items) return;

    // Check for binary images first
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          try {
            await onFileUpload([file]);
            onUrlInputChange(''); // Clear the paste area
          } catch (error) {
            console.error('Failed to handle pasted image:', error);
            toast({
              title: 'Error',
              description: 'Failed to process pasted image.',
              variant: 'destructive',
            });
          }
        }
        return;
      }
    }
  };

  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <p className="text-muted-foreground mb-6">{description}</p>

      {/* Show camera view if active */}
      {isCameraActive ? (
        <div className="space-y-4">
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <video
              ref={cameraVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <canvas ref={cameraCanvasRef} className="hidden" />
          </div>
          <div className="flex gap-3 justify-center">
            <Button onClick={onCameraCapture}>
              <Camera className="w-4 h-4 mr-2" />
              Take Photo
            </Button>
            <Button variant="outline" onClick={onCameraToggle}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Upload Controls */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isUploading}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex-1"
              >
                <Upload className="w-4 h-4 mr-2" />
                Browse Files
              </Button>
              {showCamera && onCameraToggle && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCameraToggle}
                  className="flex-1"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo
                </Button>
              )}
            </div>

            {/* Compact Paste Area */}
            <div className="space-y-2">
              <textarea
                value={urlInput}
                onChange={(e) => onUrlInputChange(e.target.value)}
                placeholder="Paste image or URL..."
                className="w-full px-3 py-2 text-sm border rounded-md bg-background resize-none focus:border-primary focus:outline-none"
                rows={1}
                disabled={isDownloadingUrl}
                onPaste={handlePaste}
              />
              {urlInput.trim() && (
                <Button
                  onClick={onUrlDownload}
                  disabled={isDownloadingUrl}
                  size="sm"
                  className="w-full"
                >
                  {isDownloadingUrl ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="w-3 h-3 mr-1" />
                      Download URL
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Drag and Drop Area */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer",
                dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
                isUploading && "opacity-50 pointer-events-none"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-2">
                <div className="mx-auto w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                </div>
                <div className="text-sm">
                  <span className="text-primary hover:underline font-medium">
                    Drop files here
                  </span>
                  <span className="text-muted-foreground"> or click to browse</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Image Gallery */}
      {images.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Uploaded Images ({images.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <Image
                  src={image.public_url}
                  alt={image.file_name}
                  width={150}
                  height={150}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
