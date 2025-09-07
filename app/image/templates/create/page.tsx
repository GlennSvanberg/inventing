'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { TemplateImage } from '@/lib/types';
import { ImageUploadSection } from '@/components/templates/image-upload-section';
import { AITemplateGenerator } from '@/components/templates/ai-template-generator';

function CreateTemplateContent() {
  const { toast } = useToast();
  const [images, setImages] = useState<TemplateImage[]>([]);
  const [aiAssistantText, setAiAssistantText] = useState('');
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

  const handleFileUpload = async (files: File[]) => {
    // For new templates, store images locally until template is saved
    const newImages = files.map(file => ({
      id: `temp-${Date.now()}-${Math.random()}`,
      file_path: '',
      file_name: file.name,
      public_url: URL.createObjectURL(file),
      uploaded_at: new Date().toISOString(),
      file: file, // Store the actual file for later upload
    } as TemplateImage));
    setImages(prev => [...prev, ...newImages]);

    toast({
      title: 'Success',
      description: `Added ${files.length} image(s) to template. Don't forget to save!`,
    });
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

  const uploadTemporaryImages = async (templateId: string) => {
    const tempImages = images.filter(img => img.id.startsWith('temp-'));

    if (tempImages.length === 0) return;

    setIsUploading(true);
    const uploadPromises = tempImages.map(async (tempImage) => {
      // Type assertion for temporary images that have the file property
      const tempImageWithFile = tempImage as TemplateImage & { file: File };
      if (!tempImageWithFile.file) return null;

      const formDataObj = new FormData();
      formDataObj.append('file', tempImageWithFile.file);

      const response = await fetch(`/api/image/templates/${templateId}/images`, {
        method: 'POST',
        body: formDataObj,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${tempImageWithFile.file_name}`);
      }

      return response.json();
    });

    try {
      const results = await Promise.all(uploadPromises.filter(Boolean));
      const uploadedImages = results.map(result => result?.image).filter(Boolean);

      // Replace temporary images with uploaded ones and clean up object URLs
      setImages(prev => {
        const newImages = prev.map(img => {
          if (img.id.startsWith('temp-')) {
            // Clean up object URL
            URL.revokeObjectURL(img.public_url);
            // Find the corresponding uploaded image
            const uploaded = uploadedImages.find(up => up.file_name === img.file_name);
            return uploaded || img;
          }
          return img;
        });
        return newImages;
      });

      toast({
        title: 'Success',
        description: `Uploaded ${uploadedImages.length} reference image(s) to template.`,
      });
    } catch (error) {
      console.error('Upload temporary images error:', error);
      toast({
        title: 'Warning',
        description: 'Template saved but some images failed to upload.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateTemplate = async () => {
    if (!aiAssistantText.trim()) {
      toast({
        title: 'Error',
        description: 'Please describe what you want your template to do.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingTemplate(true);
    try {
      const response = await fetch('/api/image/templates/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userDescription: aiAssistantText.trim(),
          images: images.map(img => ({
            id: img.id,
            file_name: img.file_name,
            public_url: img.public_url
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate template');
      }

      const data = await response.json();
      const { template } = data;

      // Create the template automatically
      const createResponse = await fetch('/api/image/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          prompt: template.prompt,
          type: template.type,
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create template');
      }

      const createData = await createResponse.json();
      const savedTemplate = createData.template;

      // If there are temporary images, upload them now
      if (images.length > 0) {
        await uploadTemporaryImages(savedTemplate.id);
      }

      // Clear AI assistant text
      setAiAssistantText('');

      toast({
        title: 'Success',
        description: 'Template created successfully!',
      });

      // Redirect to browse page
      window.location.href = '/image/templates/browse';
    } catch (error) {
      console.error('Template generation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingTemplate(false);
    }
  };


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
            <h1 className="text-3xl font-bold">Create New Template</h1>
          </div>
        </div>

        <div className="space-y-8">
          {/* Image Upload Section */}
          <ImageUploadSection
            images={images}
            onImagesChange={setImages}
            isUploading={isUploading}
            onFileUpload={handleFileUpload}
            urlInput={urlInput}
            onUrlInputChange={setUrlInput}
            isDownloadingUrl={isDownloadingUrl}
            onUrlDownload={handleUrlDownload}
            showCamera={true}
            onCameraToggle={handleCameraToggle}
            isCameraActive={isCameraActive}
            cameraVideoRef={cameraVideoRef as React.RefObject<HTMLVideoElement>}
            cameraCanvasRef={cameraCanvasRef as React.RefObject<HTMLCanvasElement>}
            onCameraCapture={handleCameraCapture}
            title="Upload Reference Images"
            description="Upload one or more images that will be used as reference for your template when generating images"
          />

          {/* AI Assistant Section */}
          <AITemplateGenerator
            aiAssistantText={aiAssistantText}
            onAiAssistantTextChange={setAiAssistantText}
            images={images}
            isGeneratingTemplate={isGeneratingTemplate}
            onGenerateTemplate={handleGenerateTemplate}
          />
        </div>

      </div>
    </div>
  );
}

export default function CreateTemplatePage() {
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
      <CreateTemplateContent />
    </Suspense>
  );
}
