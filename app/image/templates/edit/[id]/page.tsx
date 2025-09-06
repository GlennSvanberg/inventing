'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Template, TemplateImage } from '@/lib/types';
import { ImageUploadSection } from '@/components/templates/image-upload-section';
import { TemplateForm } from '@/components/templates/template-form';

function EditTemplateContent() {
  const params = useParams();
  const templateId = params.id as string;
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState<Partial<Template>>({
    name: '',
    description: '',
    prompt: '',
    type: 'custom',
  });
  const [images, setImages] = useState<TemplateImage[]>([]);
  const [urlInput, setUrlInput] = useState('');
  const [isDownloadingUrl, setIsDownloadingUrl] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const cameraCanvasRef = useRef<HTMLCanvasElement>(null);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const fetchTemplate = useCallback(async (id: string) => {
    try {
      setIsFetching(true);
      const response = await fetch(`/api/image/templates/${id}`);
      if (response.ok) {
        const data = await response.json();
        const template = data.template;
        setFormData({
          id: template.id,
          name: template.name,
          description: template.description || '',
          prompt: template.prompt,
          type: template.type || 'custom',
        });
        setImages(template.template_images || []);
      } else {
        throw new Error('Failed to fetch template');
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      toast({
        title: 'Error',
        description: 'Failed to load template.',
        variant: 'destructive',
      });
    } finally {
      setIsFetching(false);
    }
  }, [toast]);

  useEffect(() => {
    if (templateId) {
      fetchTemplate(templateId);
    }
  }, [templateId, fetchTemplate]);

  const handleFileUpload = async (files: File[]) => {
    setIsUploading(true);
    const uploadPromises = files.map(async (file) => {
      const formDataObj = new FormData();
      formDataObj.append('file', file);

      const response = await fetch(`/api/image/templates/${templateId}/images`, {
        method: 'POST',
        body: formDataObj,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${file.name}`);
      }

      return response.json();
    });

    try {
      const results = await Promise.all(uploadPromises);
      const newImages = results.map(result => result.image);
      setImages(prev => [...prev, ...newImages]);

      toast({
        title: 'Success',
        description: `Uploaded ${files.length} image(s) successfully.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload some images.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlDownload = async () => {
    if (!urlInput.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid URL',
        variant: 'destructive',
      });
      return;
    }

    setIsDownloadingUrl(true);
    try {
      const response = await fetch('/api/image/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: urlInput.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add the downloaded image to our images array
        const newImage: TemplateImage = {
          id: data.image.id,
          file_path: data.image.file_path,
          file_name: data.image.file_name,
          public_url: data.image.url,
          uploaded_at: new Date().toISOString(),
        };
        setImages(prev => [...prev, newImage]);
        setUrlInput('');
        toast({
          title: 'Success',
          description: 'Image downloaded from URL successfully.',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to download image from URL');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to download image';
      toast({
        title: 'Error',
        description: `Unable to load image from URL: ${errorMessage}`,
        variant: 'destructive',
      });
    } finally {
      setIsDownloadingUrl(false);
    }
  };

  const handleCameraToggle = async () => {
    if (isCameraActive) {
      // Stop camera
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
      }
      setIsCameraActive(false);
    } else {
      // Start camera
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' }
        });
        setCameraStream(stream);
        setIsCameraActive(true);

        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Unable to access camera. Please check permissions.',
          variant: 'destructive',
        });
        console.error('Camera access error:', error);
      }
    }
  };

  const handleCameraCapture = async () => {
    if (!cameraVideoRef.current || !cameraCanvasRef.current) return;

    const video = cameraVideoRef.current;
    const canvas = cameraCanvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
        try {
          await handleFileUpload([file]);
          handleCameraToggle(); // Close camera after capture
        } catch {
          toast({
            title: 'Error',
            description: 'Failed to capture and upload photo',
            variant: 'destructive',
          });
        }
      }
    }, 'image/jpeg', 0.8);
  };

  const handleDeleteTemplate = async () => {
    if (!confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/image/templates/${templateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Template deleted successfully.',
        });
        // Redirect to browse page
        window.location.href = '/image/templates/browse';
      } else {
        throw new Error('Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.prompt?.trim()) {
      toast({
        title: 'Error',
        description: 'Name and prompt are required.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/image/templates/${templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description?.trim(),
          prompt: formData.prompt.trim(),
          type: formData.type || 'custom',
        }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Template updated successfully.',
        });
        // Redirect to browse page
        window.location.href = '/image/templates/browse';
      } else {
        throw new Error('Failed to update template');
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update template.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6 pt-16 lg:pt-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            <span className="text-lg">Loading template...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6 pt-16 lg:pt-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/image/templates/browse">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Edit Template</h1>
          </div>
          <div className="ml-auto">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteTemplate}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Template
            </Button>
          </div>
        </div>

        <div className="space-y-8">
          <TemplateForm
            formData={formData}
            onFormDataChange={setFormData}
            isEditing={true}
          />

          {/* Reference Images Section */}
          <ImageUploadSection
            images={images}
            onImagesChange={(newImages) => {
              // Override the default delete handler to use our API delete
              setImages(newImages);
            }}
            isUploading={isUploading}
            onFileUpload={handleFileUpload}
            urlInput={urlInput}
            onUrlInputChange={setUrlInput}
            isDownloadingUrl={isDownloadingUrl}
            onUrlDownload={handleUrlDownload}
            showCamera={true}
            onCameraToggle={handleCameraToggle}
            isCameraActive={isCameraActive}
            cameraVideoRef={cameraVideoRef}
            cameraCanvasRef={cameraCanvasRef}
            onCameraCapture={handleCameraCapture}
            title="Reference Images"
            description="Manage reference images for your template. These images help provide context for AI generation."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t mt-8">
          <div></div>
          <div className="flex gap-3">
            <Link href="/image/templates/browse">
              <Button variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </Link>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Template
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditTemplatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6 pt-16 lg:pt-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            <span className="text-lg">Loading...</span>
          </div>
        </div>
      </div>
    }>
      <EditTemplateContent />
    </Suspense>
  );
}
