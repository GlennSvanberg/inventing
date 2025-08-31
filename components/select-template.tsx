'use client';

import { useState } from 'react';
import { Palette, Check } from 'lucide-react';
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

const templates: Template[] = [
  {
    id: 'beach',
    name: 'Beach Scene',
    description: 'Relaxing beach with palm trees and ocean waves',
    preview: '🏖️',
    category: 'Nature'
  },
  {
    id: 'city',
    name: 'City Street',
    description: 'Urban cityscape with buildings and street life',
    preview: '🏙️',
    category: 'Urban'
  },
  {
    id: 'mountain',
    name: 'Mountain Peak',
    description: 'Majestic mountain landscape with stunning views',
    preview: '⛰️',
    category: 'Nature'
  },
  {
    id: 'studio',
    name: 'Professional Studio',
    description: 'Clean studio setup with professional lighting',
    preview: '📸',
    category: 'Studio'
  },
  {
    id: 'space',
    name: 'Space Explorer',
    description: 'Futuristic space scene with stars and planets',
    preview: '🚀',
    category: 'Sci-Fi'
  },
  {
    id: 'vintage',
    name: 'Vintage Portrait',
    description: 'Classic vintage style with retro elements',
    preview: '📻',
    category: 'Classic'
  }
];

interface SelectTemplateProps {
  selectedTemplate: Template | null;
  onTemplateSelect: (template: Template) => void;
}

export function SelectTemplate({ selectedTemplate, onTemplateSelect }: SelectTemplateProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];

  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter(template => template.category === selectedCategory);

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Select Template
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className={cn(
                "relative border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md",
                selectedTemplate?.id === template.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-muted hover:border-primary/50"
              )}
              onClick={() => onTemplateSelect(template)}
            >
              {/* Selection Indicator */}
              {selectedTemplate?.id === template.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}

              {/* Template Preview */}
              <div className="text-center mb-3">
                <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center text-2xl mb-2">
                  {template.preview}
                </div>
                <h3 className="font-medium text-sm">{template.name}</h3>
              </div>

              {/* Template Description */}
              <p className="text-xs text-muted-foreground text-center">
                {template.description}
              </p>

              {/* Category Badge */}
              <div className="mt-2 text-center">
                <span className="inline-block px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full">
                  {template.category}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Template Info */}
        {selectedTemplate && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-xl">
                {selectedTemplate.preview}
              </div>
              <div>
                <h4 className="font-medium">{selectedTemplate.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
