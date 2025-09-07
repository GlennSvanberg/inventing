'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UploadPhoto } from '@/components/upload-photo';
import { GenerateButton } from '@/components/generate-button';
import { Template } from '@/lib/types';

function CreateImageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const templateId = searchParams.get('template');

  // Fetch template data based on query param
  useEffect(() => {
    const fetchTemplate = async () => {
      if (!templateId) {
        setError('No style specified. Please select a style first.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/image/templates/${templateId}`);
        if (response.ok) {
          const data = await response.json();
          setSelectedTemplate(data.template);
        } else {
          setError('Style not found. Please select a valid style.');
        }
      } catch (error) {
        console.error('Error fetching template:', error);
        setError('Failed to load style. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [templateId]);

  const handleGenerate = (photos: string[], template: Template) => {
    console.log('Generating image with:', {
      photoIds: photos,
      template: template.name,
      prompt: template.prompt,
      templateImages: template.template_images?.length || 0
    });
    // Image generation is handled in the GenerateButton component
  };

  const handleBackToTemplates = () => {
    router.push('/image/templates');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading style...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !selectedTemplate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-xl font-semibold mb-2">Style Not Found</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={handleBackToTemplates}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Choose Different Style
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6 pt-16 lg:pt-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="outline"
            onClick={handleBackToTemplates}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Choose Different Style
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">Create Image</h1>
          <p className="text-muted-foreground text-base sm:text-lg px-4">
            Transform your photos into amazing images
          </p>
        </div>

        {/* Template Display */}
        <div className="mb-6 sm:mb-8">
          <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center text-xl overflow-hidden flex-shrink-0 mt-1">
                  {selectedTemplate.template_images && selectedTemplate.template_images.length > 0 ? (
                    <Image
                      src={selectedTemplate.template_images[0].public_url}
                      alt={selectedTemplate.template_images[0].file_name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    (() => {
                      const emojiMap: { [key: string]: string } = {
                        custom: '🎨',
                        portrait: '👤',
                        landscape: '🏞️',
                        action: '⚡',
                        artistic: '🎭',
                        vintage: '📻',
                      };
                      return emojiMap[selectedTemplate.type] || '📄';
                    })()
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">{selectedTemplate.name}</h2>
                  <p className="text-muted-foreground mb-3 leading-relaxed">
                    {selectedTemplate.description || selectedTemplate.prompt.slice(0, 150) + '...'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-block px-3 py-1 text-xs bg-muted text-muted-foreground rounded-full capitalize">
                      {selectedTemplate.type}
                    </span>
                    {selectedTemplate.template_images && selectedTemplate.template_images.length > 0 && (
                      <span className="inline-block px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        {selectedTemplate.template_images.length} image{selectedTemplate.template_images.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Always stacked vertically and centered */}
        <div className="space-y-6 sm:space-y-8 flex flex-col items-center">
          {/* Photo Selection Section */}
          <div className="w-full max-w-2xl">
            <UploadPhoto
              selectedPhotos={selectedPhotos}
              onPhotoSelect={setSelectedPhotos}
              title="Select Your Photo"
            />
          </div>

          {/* Generate Section */}
          <div className="w-full max-w-2xl">
            <GenerateButton
              selectedPhotos={selectedPhotos}
              selectedTemplate={selectedTemplate}
              onGenerate={handleGenerate}
              title=""
              buttonText="Generate"
            />
          </div>
        </div>

      </div>
    </div>
  );
}

export default function CreateImagePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </div>
      </div>
    }>
      <CreateImageContent />
    </Suspense>
  );
}
