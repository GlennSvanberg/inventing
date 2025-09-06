'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Sparkles, Download } from 'lucide-react';
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
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const canGenerate = selectedPhotos && selectedPhotos.length > 0 && selectedTemplate && !isGenerating;

  // Cleanup progress timer on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const startProgressTimer = () => {
    setProgress(0);
    const duration = 12000; // 12 seconds
    const interval = 100; // Update every 100ms
    const steps = duration / interval;
    const increment = 100 / steps;

    let currentProgress = 0;
    progressIntervalRef.current = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        setProgress(100);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      } else {
        setProgress(Math.min(currentProgress, 95)); // Cap at 95% until actual completion
      }
    }, interval);
  };

  const stopProgressTimer = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setProgress(100);
  };

  const handleGenerate = async () => {
    if (!canGenerate || !selectedPhotos || !selectedTemplate) return;

    setIsGenerating(true);
    setGeneratedImage(null);
    setError(null);
    startProgressTimer();

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
      stopProgressTimer();

      onGenerate(selectedPhotos, selectedTemplate);

      // Show success message with processing details
      console.log('✅ Generation successful!');
      console.log('Processing ID:', data.processingId);
      console.log('Full response:', data.fullResponse);
    } catch (error) {
      console.error('Error generating image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
      setError(errorMessage);
      stopProgressTimer();
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
        {/* Generate Button or Progress */}
        <div className="flex justify-center mb-6">
          {isGenerating ? (
            <div className="w-full max-w-sm space-y-4">
              {/* Fancy Progress Bar */}
              <div className="relative">
                {/* Background circle */}
                <div className="w-32 h-32 mx-auto relative">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                    {/* Background circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted/20"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="url(#progressGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 54}`}
                      strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                      className="transition-all duration-300 ease-out"
                    />
                    {/* Gradient definition */}
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="50%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Center content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="relative">
                      <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                      <div className="absolute inset-0 animate-ping">
                        <Sparkles className="w-8 h-8 text-primary/50" />
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(progress)}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Generating...
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress stages */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className={cn(
                    "flex items-center gap-2",
                    progress >= 20 ? "text-primary" : "text-muted-foreground"
                  )}>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      progress >= 20 ? "bg-primary animate-pulse" : "bg-muted"
                    )} />
                    Analyzing template
                  </span>
                  <span className={cn(
                    progress >= 20 ? "text-primary" : "text-muted-foreground"
                  )}>
                    {progress >= 20 ? "✓" : "○"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className={cn(
                    "flex items-center gap-2",
                    progress >= 40 ? "text-primary" : "text-muted-foreground"
                  )}>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      progress >= 40 ? "bg-primary animate-pulse" : "bg-muted"
                    )} />
                    Processing images
                  </span>
                  <span className={cn(
                    progress >= 40 ? "text-primary" : "text-muted-foreground"
                  )}>
                    {progress >= 40 ? "✓" : "○"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className={cn(
                    "flex items-center gap-2",
                    progress >= 60 ? "text-primary" : "text-muted-foreground"
                  )}>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      progress >= 60 ? "bg-primary animate-pulse" : "bg-muted"
                    )} />
                    AI generation
                  </span>
                  <span className={cn(
                    progress >= 60 ? "text-primary" : "text-muted-foreground"
                  )}>
                    {progress >= 60 ? "✓" : "○"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className={cn(
                    "flex items-center gap-2",
                    progress >= 90 ? "text-primary" : "text-muted-foreground"
                  )}>
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      progress >= 90 ? "bg-primary animate-pulse" : "bg-muted"
                    )} />
                    Finalizing
                  </span>
                  <span className={cn(
                    progress >= 90 ? "text-primary" : "text-muted-foreground"
                  )}>
                    {progress >= 90 ? "✓" : "○"}
                  </span>
                </div>
              </div>

              {/* Time estimate */}
              <div className="text-center text-xs text-muted-foreground">
                {progress < 100 ? (
                  <>Estimated time: ~{Math.max(0, Math.round((12 - (progress / 100) * 12)))}s remaining</>
                ) : (
                  <>Complete! Processing final touches...</>
                )}
              </div>
            </div>
          ) : (
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              size="lg"
              className={cn(
                "w-full max-w-sm relative overflow-hidden",
                canGenerate && "animate-pulse hover:scale-105 transition-transform"
              )}
            >
              <div className="relative z-10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Image
              </div>
              {/* Animated background effect */}
              {canGenerate && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-emerald-500/20 animate-pulse" />
              )}
            </Button>
          )}
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
