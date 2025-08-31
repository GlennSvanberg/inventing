'use client';

import { useState, useEffect, useCallback } from 'react';
import { Upload, Trash2, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface TemplateImage {
  id: string;
  file_path: string;
  file_name: string;
  public_url: string;
  uploaded_at: string;
}

interface Template {
  id?: string;
  name: string;
  description?: string;
  prompt: string;
  type: string;
  template_images?: TemplateImage[];
}

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: Template | null;
  onSave: (template: Template) => void;
}

const TEMPLATE_TYPES = [
  { value: 'custom', label: 'Custom' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'action', label: 'Action' },
  { value: 'artistic', label: 'Artistic' },
  { value: 'vintage', label: 'Vintage' },
];

export function TemplateDialog({ open, onOpenChange, template, onSave }: TemplateDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<Template>>({
    name: '',
    description: '',
    prompt: '',
    type: 'custom',
  });
  const [images, setImages] = useState<TemplateImage[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Initialize form when template changes
  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        description: template.description || '',
        prompt: template.prompt,
        type: template.type || 'custom',
      });
      setImages(template.template_images || []);
    } else {
      setFormData({
        name: '',
        description: '',
        prompt: '',
        type: 'custom',
      });
      setImages([]);
    }
  }, [template]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    await handleFileUpload(files);
  }, [handleFileUpload]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await handleFileUpload(files);
    // Reset input
    e.target.value = '';
  };

  const handleFileUpload = useCallback(async (files: File[]) => {
    if (!template?.id) {
      toast({
        title: 'Error',
        description: 'Please save the template first before adding images.',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/image/templates/${template.id}/images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${file.name}`);
      }

      return response.json();
    });

    try {
      const results = await Promise.all(uploadPromises);
      const newImages = results.map(result => result.image);
      setImages(prev => [...prev, ...newImages]);

      toast({
        title: 'Success',
        description: `Uploaded ${files.length} image(s) successfully.`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload some images.',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  }, [template?.id, toast, setImages]);

  const handleDeleteImage = async (imageId: string) => {
    if (!template?.id) return;

    try {
      const response = await fetch(
        `/api/image/templates/${template.id}/images?imageId=${imageId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }

      setImages(prev => prev.filter(img => img.id !== imageId));
      toast({
        title: 'Success',
        description: 'Image deleted successfully.',
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete image.',
        variant: 'destructive',
      });
    }
  };

  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.prompt?.trim()) {
      toast({
        title: 'Error',
        description: 'Name and prompt are required.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const templateData: Template = {
        id: template?.id,
        name: formData.name.trim(),
        description: formData.description?.trim(),
        prompt: formData.prompt.trim(),
        type: formData.type || 'custom',
        template_images: images,
      };

      await onSave(templateData);
      onOpenChange(false);

      toast({
        title: 'Success',
        description: `Template ${template ? 'updated' : 'created'} successfully.`,
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: `Failed to ${template ? 'update' : 'create'} template.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isEditing = !!template;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Template' : 'Create New Template'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Template Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
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
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter template description (optional)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="prompt">AI Prompt *</Label>
              <Textarea
                id="prompt"
                value={formData.prompt}
                onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="Enter the AI prompt for image generation"
                rows={4}
                required
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label>Template Images</Label>

            {!isEditing ? (
              /* Show message for new templates */
              <div className="border-2 border-dashed rounded-lg p-6 text-center bg-muted/20">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Upload className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Save your template first to add images
                </p>
                <p className="text-xs text-muted-foreground">
                  You can add reference images after creating the template
                </p>
              </div>
            ) : (
              /* Upload Area for existing templates */
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
                  dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                  isUploading && "opacity-50 pointer-events-none"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  disabled={isUploading}
                />

                <div className="space-y-4">
                  <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer text-primary hover:underline"
                    >
                      Click to upload
                    </label>
                    <span className="text-muted-foreground"> or drag and drop</span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    PNG, JPG, GIF, WebP up to 10MB
                  </p>
                </div>
              </div>
            )}

            {/* Image Gallery */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.public_url}
                      alt={image.file_name}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update' : 'Create'} Template
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
