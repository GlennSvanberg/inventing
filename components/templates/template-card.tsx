'use client';

import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Template } from '@/lib/types';

interface TemplateCardProps {
  template: Template;
  onEdit: (template: Template) => void;
  onDelete: (templateId: string) => void;
}

export function TemplateCard({ template, onEdit, onDelete }: TemplateCardProps) {
  const getPreviewEmoji = (type: string) => {
    const emojiMap: { [key: string]: string } = {
      custom: '🎨',
      portrait: '👤',
      landscape: '🏞️',
      action: '⚡',
      artistic: '🎭',
      vintage: '📻',
    };
    return emojiMap[type] || '📄';
  };

  return (
    <div
      className="bg-card border rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group"
      onClick={() => onEdit(template)}
    >
      {/* Action Buttons */}
      <div className="flex justify-end mb-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm('Are you sure you want to delete this template? This action cannot be undone.') && template.id) {
              onDelete(template.id);
            }
          }}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Template Preview */}
      <div className="text-center mb-4">
        <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center text-3xl mb-3 overflow-hidden">
          {template.template_images && template.template_images.length > 0 ? (
            <Image
              src={template.template_images[0].public_url}
              alt={template.template_images[0].file_name}
              width={80}
              height={80}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            getPreviewEmoji(template.type)
          )}
        </div>
        <h3 className="font-semibold text-lg">{template.name}</h3>
      </div>

      {/* Template Description */}
      <p className="text-sm text-muted-foreground text-center mb-4 line-clamp-3">
        {template.description || template.prompt.slice(0, 100) + '...'}
      </p>

      {/* Template Metadata */}
      <div className="flex flex-wrap gap-2 justify-center">
        <span className="inline-block px-3 py-1 text-xs bg-muted text-muted-foreground rounded-full capitalize">
          {template.type}
        </span>
        {template.template_images && template.template_images.length > 0 && (
          <span className="inline-block px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full">
            {template.template_images.length} image{template.template_images.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}
