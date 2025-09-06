'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Template } from '@/lib/types';
import { PromptingBestPracticesDialog } from './prompting-best-practices-dialog';

interface TemplateFormProps {
  formData: Partial<Template>;
  onFormDataChange: (data: Partial<Template>) => void;
}

const TEMPLATE_TYPES = [
  { value: 'custom', label: 'Custom' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'action', label: 'Action' },
  { value: 'artistic', label: 'Artistic' },
  { value: 'vintage', label: 'Vintage' },
];

export function TemplateForm({ formData, onFormDataChange }: TemplateFormProps) {
  return (
    <div className="bg-card rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold">
          {formData.id ? 'Edit Template' : 'Review & Edit Template'}
        </h2>
        <PromptingBestPracticesDialog />
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Template Name *</Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            placeholder="Enter template name"
            required
          />
        </div>

        <div>
          <Label htmlFor="prompt">AI Prompt *</Label>
          <Textarea
            id="prompt"
            value={formData.prompt || ''}
            onChange={(e) => onFormDataChange({ ...formData, prompt: e.target.value })}
            placeholder="Enter the AI prompt for image generation"
            required
            className="auto-grow-textarea"
          />
        </div>

        <div>
          <Label htmlFor="type">Template Type</Label>
          <Select
            value={formData.type || 'custom'}
            onValueChange={(value) => onFormDataChange({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select template type" />
            </SelectTrigger>
            <SelectContent>
              {TEMPLATE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
            placeholder="Enter template description (optional)"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
