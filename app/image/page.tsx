'use client';

import { useState } from 'react';
import { UploadPhoto } from '@/components/upload-photo';
import { SelectTemplate } from '@/components/select-template';
import { GenerateButton } from '@/components/generate-button';

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: string;
}

export default function ImagePage() {
  const [selectedPhotos, setSelectedPhotos] = useState<File[] | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleGenerate = (photos: File[], template: Template) => {
    console.log('Generating image with:', {
      photos: photos.map(p => p.name),
      template: template.name
    });
    // TODO: Implement actual AI generation API call
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">AI Photo Insertion</h1>
          <p className="text-muted-foreground text-base sm:text-lg px-4">
            Upload your photo and select a template to create amazing AI-generated images
          </p>
        </div>

        {/* Main Content - Always stacked vertically and centered */}
        <div className="space-y-6 sm:space-y-8 flex flex-col items-center">
          {/* Upload Photo Section */}
          <div className="w-full max-w-2xl">
            <UploadPhoto
              selectedPhotos={selectedPhotos}
              onPhotoSelect={setSelectedPhotos}
            />
          </div>

          {/* Select Template Section */}
          <div className="w-full max-w-2xl">
            <SelectTemplate
              selectedTemplate={selectedTemplate}
              onTemplateSelect={setSelectedTemplate}
            />
          </div>

          {/* Generate Section */}
          <div className="w-full max-w-2xl">
            <GenerateButton
              selectedPhotos={selectedPhotos}
              selectedTemplate={selectedTemplate}
              onGenerate={handleGenerate}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 sm:mt-12 text-center text-sm text-muted-foreground px-4">
          <p>Powered by advanced AI image generation technology</p>
        </div>
      </div>
    </div>
  );
}
