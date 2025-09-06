'use client';

import Image from 'next/image';
import { Palette, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { TemplateImage } from '@/lib/types';

interface AITemplateGeneratorProps {
  aiAssistantText: string;
  onAiAssistantTextChange: (value: string) => void;
  images: TemplateImage[];
  isGeneratingTemplate: boolean;
  onGenerateTemplate: () => Promise<void>;
}

export function AITemplateGenerator({
  aiAssistantText,
  onAiAssistantTextChange,
  images,
  isGeneratingTemplate,
  onGenerateTemplate,
}: AITemplateGeneratorProps) {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      {/* Show uploaded images if any */}
      {images.length > 0 && (
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium mb-2">Reference Images ({images.length})</p>
          <div className="flex gap-2 overflow-x-auto">
            {images.map((image) => (
              <div key={image.id} className="flex-shrink-0">
                <Image
                  src={image.public_url}
                  alt={image.file_name}
                  width={60}
                  height={60}
                  className="w-15 h-15 object-cover rounded border"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border rounded-lg p-4">
        <Label htmlFor="ai-assistant" className="text-sm font-medium mb-3 block">
          Describe Your Template Idea
        </Label>
        <Textarea
          id="ai-assistant"
          value={aiAssistantText}
          onChange={(e) => onAiAssistantTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onGenerateTemplate();
            }
          }}
          placeholder="Describe what you want your template to do, and AI will help fill in the details..."
          className="auto-grow-textarea mb-4"
          disabled={isGeneratingTemplate}
        />
        <div className="flex justify-end">
          <Button
            onClick={onGenerateTemplate}
            disabled={isGeneratingTemplate || !aiAssistantText.trim() || images.length === 0}
            size="sm"
          >
            {isGeneratingTemplate ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Palette className="w-3 h-3 mr-1" />
                Generate Template
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
