'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Sparkles, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Template } from '@/lib/types';

interface GenerateButtonProps {
  selectedPhotos: string[] | null;
  selectedTemplate: Template | null;
  onGenerate: (photos: string[], template: Template) => void;
}

export function GenerateButton({ selectedPhotos, selectedTemplate, onGenerate }: GenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canGenerate = selectedPhotos && selectedPhotos.length > 0 && selectedTemplate && !isGenerating;

  const handleGenerate = async () => {
    if (!canGenerate || !selectedPhotos || !selectedTemplate) return;

    setIsGenerating(true);
    setGeneratedImage(null);
    setError(null);

    try {
      // Call the image generation API
      const response = await fetch('/api/image/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          userImageIds: selectedPhotos,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        // Handle content policy violations specially
        if (errorData.code === 'CONTENT_POLICY_VIOLATION') {
          const fullMessage = `Content Policy Violation: ${errorData.message}\n\nProcessing ID: ${errorData.processingId || 'N/A'}\n\nGemini Response: ${errorData.fullResponse || 'No response text available'}`;
          throw new Error(fullMessage);
        }

        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      setGeneratedImage(data.image.url);

      onGenerate(selectedPhotos, selectedTemplate);

      // Show success message with processing details
      console.log('✅ Generation successful!');
      console.log('Processing ID:', data.processingId);
      console.log('Full response:', data.fullResponse);
    } catch (error) {
      console.error('Error generating image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `generated-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Generate Image
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Generate Button */}
        <div className="flex justify-center mb-6">
          <Button
            onClick={handleGenerate}
            disabled={!canGenerate}
            size="lg"
            className={cn(
              "w-full max-w-sm",
              canGenerate && "animate-pulse"
            )}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Image
              </>
            )}
          </Button>
        </div>

        {/* Requirements Check */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <div className={cn(
              "w-4 h-4 rounded-full flex items-center justify-center text-xs",
              selectedPhotos && selectedPhotos.length > 0 ? "bg-green-500 text-white" : "bg-red-500 text-white"
            )}>
              {selectedPhotos && selectedPhotos.length > 0 ? "✓" : "✗"}
            </div>
            <span className={selectedPhotos && selectedPhotos.length > 0 ? "text-foreground" : "text-muted-foreground"}>
              {selectedPhotos && selectedPhotos.length > 1
                ? `${selectedPhotos.length} photos selected`
                : "Photo selected"
              }
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className={cn(
              "w-4 h-4 rounded-full flex items-center justify-center text-xs",
              selectedTemplate ? "bg-green-500 text-white" : "bg-red-500 text-white"
            )}>
              {selectedTemplate ? "✓" : "✗"}
            </div>
            <span className={selectedTemplate ? "text-foreground" : "text-muted-foreground"}>
              Template selected
            </span>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 text-destructive">⚠️</div>
              <div>
                <h4 className="font-medium text-destructive">Generation Failed</h4>
                <p className="text-sm text-destructive/80 mt-1">{error}</p>
                {error.includes('Content Policy') && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Try selecting different images that comply with Gemini&apos;s content guidelines.
                  </p>
                )}
                <Button
                  onClick={() => setError(null)}
                  variant="outline"
                  size="sm"
                  className="mt-3"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Generated Image Display */}
        {generatedImage && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium mb-2">Generated Image</h3>
              <div className="relative max-w-sm mx-auto">
                <Image
                  src={generatedImage}
                  alt="Generated result"
                  width={400}
                  height={400}
                  className="w-full rounded-lg border shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg" />
              </div>
            </div>

            <div className="flex gap-2 justify-center">
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={() => setGeneratedImage(null)} variant="outline" size="sm">
                Generate New
              </Button>
            </div>
          </div>
        )}

        {/* Info Text */}
        {!generatedImage && (
          <div className="text-center text-sm text-muted-foreground">
            {!(selectedPhotos && selectedPhotos.length > 0) || !selectedTemplate ? (
              <p>Please upload a photo and select a template to generate your image.</p>
            ) : (
              <p>Click &quot;Generate Image&quot; to create your AI-powered photo insertion.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
