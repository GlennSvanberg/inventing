'use client';

import { useState } from 'react';
import { Sparkles, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Template {
  id: string;
  name: string;
  description: string;
  preview: string;
  category: string;
}

interface GenerateButtonProps {
  selectedPhotos: File[] | null;
  selectedTemplate: Template | null;
  onGenerate: (photos: File[], template: Template) => void;
}

export function GenerateButton({ selectedPhotos, selectedTemplate, onGenerate }: GenerateButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const canGenerate = selectedPhotos && selectedPhotos.length > 0 && selectedTemplate && !isGenerating;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      // Simulate AI processing (replace with actual API call later)
      await new Promise(resolve => setTimeout(resolve, 3000));

      // For now, just show the first selected photo as the "generated" result
      // In the future, this will be the AI-generated image
      const imageUrl = URL.createObjectURL(selectedPhotos[0]);
      setGeneratedImage(imageUrl);

      onGenerate(selectedPhotos, selectedTemplate);
    } catch (error) {
      console.error('Error generating image:', error);
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

        {/* Generated Image Display */}
        {generatedImage && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium mb-2">Generated Image</h3>
              <div className="relative max-w-sm mx-auto">
                <img
                  src={generatedImage}
                  alt="Generated result"
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
              <p>Click "Generate Image" to create your AI-powered photo insertion.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
