'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { Upload, Trash2, Save, Loader2, ArrowLeft, Palette, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Template, TemplateImage } from '@/lib/types';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const TEMPLATE_TYPES = [
  { value: 'custom', label: 'Custom' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'landscape', label: 'Landscape' },
  { value: 'action', label: 'Action' },
  { value: 'artistic', label: 'Artistic' },
  { value: 'vintage', label: 'Vintage' },
];

type ViewMode = 'list' | 'edit';

function TemplatesPageContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('id');

  const [viewMode, setViewMode] = useState<ViewMode>(templateId ? 'edit' : 'list');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(!!templateId);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Template>>({
    name: '',
    description: '',
    prompt: '',
    type: 'custom',
  });
  const [images, setImages] = useState<TemplateImage[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Get preview emoji based on template type
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

  const fetchAllTemplates = useCallback(async () => {
    try {
      setTemplatesLoading(true);
      const response = await fetch('/api/image/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
      } else {
        console.error('Failed to fetch templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load templates.',
        variant: 'destructive',
      });
    } finally {
      setTemplatesLoading(false);
    }
  }, [toast]);

  const fetchTemplate = useCallback(async (id: string) => {
    try {
      setIsFetching(true);
      const response = await fetch(`/api/image/templates/${id}`);
      if (response.ok) {
        const data = await response.json();
        const template = data.template;
        setFormData({
          id: template.id,
          name: template.name,
          description: template.description || '',
          prompt: template.prompt,
          type: template.type || 'custom',
        });
        setImages(template.template_images || []);
      } else {
        throw new Error('Failed to fetch template');
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      toast({
        title: 'Error',
        description: 'Failed to load template.',
        variant: 'destructive',
      });
    } finally {
      setIsFetching(false);
    }
  }, [toast]);

  // Initialize form when editing an existing template
  useEffect(() => {
    if (templateId) {
      setViewMode('edit');
      fetchTemplate(templateId);
    } else {
      setViewMode('list');
      fetchAllTemplates();
    }
  }, [templateId, fetchAllTemplates, fetchTemplate]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleFileUpload = useCallback(async (files: File[]) => {
    // For new templates, store images locally until template is saved
    if (!formData.id) {
      const newImages = files.map(file => ({
        id: `temp-${Date.now()}-${Math.random()}`,
        file_path: '', // Will be set after upload
        file_name: file.name,
        public_url: URL.createObjectURL(file),
        uploaded_at: new Date().toISOString(),
        file: file, // Store the actual file for later upload
      } as TemplateImage));
      setImages(prev => [...prev, ...newImages]);

      toast({
        title: 'Success',
        description: `Added ${files.length} image(s) to template. Don't forget to save!`,
      });
      return;
    }

    // For existing templates, upload immediately
    setIsUploading(true);
    const uploadPromises = files.map(async (file) => {
      const formDataObj = new FormData();
      formDataObj.append('file', file);

      const response = await fetch(`/api/image/templates/${formData.id}/images`, {
        method: 'POST',
        body: formDataObj,
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
  }, [formData.id, toast]);

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

  const uploadTemporaryImages = async (templateId: string) => {
    const tempImages = images.filter(img => img.id.startsWith('temp-'));

    if (tempImages.length === 0) return;

    const uploadPromises = tempImages.map(async (tempImage) => {
      // Type assertion for temporary images that have the file property
      const tempImageWithFile = tempImage as TemplateImage & { file: File };
      if (!tempImageWithFile.file) return null;

      const formDataObj = new FormData();
      formDataObj.append('file', tempImageWithFile.file);

      const response = await fetch(`/api/image/templates/${templateId}/images`, {
        method: 'POST',
        body: formDataObj,
      });

      if (!response.ok) {
        throw new Error(`Failed to upload ${tempImageWithFile.file_name}`);
      }

      return response.json();
    });

    try {
      const results = await Promise.all(uploadPromises.filter(Boolean));
      const uploadedImages = results.map(result => result?.image).filter(Boolean);

      // Replace temporary images with uploaded ones and clean up object URLs
      setImages(prev => {
        const newImages = prev.map(img => {
          if (img.id.startsWith('temp-')) {
            // Clean up object URL
            URL.revokeObjectURL(img.public_url);
            // Find the corresponding uploaded image
            const uploaded = uploadedImages.find(up => up.file_name === img.file_name);
            return uploaded || img;
          }
          return img;
        });
        return newImages;
      });

      toast({
        title: 'Success',
        description: `Uploaded ${uploadedImages.length} reference image(s) to template.`,
      });
    } catch (error) {
      console.error('Upload temporary images error:', error);
      toast({
        title: 'Warning',
        description: 'Template saved but some images failed to upload.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    // Handle temporary images (not yet uploaded)
    if (imageId.startsWith('temp-')) {
      setImages(prev => {
        const imageToDelete = prev.find(img => img.id === imageId);
        if (imageToDelete) {
          URL.revokeObjectURL(imageToDelete.public_url);
        }
        return prev.filter(img => img.id !== imageId);
      });
      toast({
        title: 'Success',
        description: 'Image removed successfully.',
      });
      return;
    }

    // Handle uploaded images
    if (!formData.id) return;

    try {
      const response = await fetch(
        `/api/image/templates/${formData.id}/images?imageId=${imageId}`,
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

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/image/templates/${templateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTemplates(prev => prev.filter(t => t.id !== templateId));
        toast({
          title: 'Success',
          description: 'Template deleted successfully.',
        });
      } else {
        throw new Error('Failed to delete template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template.',
        variant: 'destructive',
      });
    }
  };

  const handleCreateNew = () => {
    setFormData({
      name: '',
      description: '',
      prompt: '',
      type: 'custom',
    });
    setImages([]);
    setViewMode('edit');
  };

  const handleEditTemplate = (template: Template) => {
    setFormData({
      id: template.id,
      name: template.name,
      description: template.description || '',
      prompt: template.prompt,
      type: template.type || 'custom',
    });
    setImages(template.template_images || []);
    setViewMode('edit');
  };

  const handleBackToList = () => {
    setViewMode('list');
    fetchAllTemplates();
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
      const method = formData.id ? 'PUT' : 'POST';
      const url = formData.id
        ? `/api/image/templates/${formData.id}`
        : '/api/image/templates';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description?.trim(),
          prompt: formData.prompt.trim(),
          type: formData.type || 'custom',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const savedTemplate = data.template;

        // Update form data with the saved template
        setFormData({
          id: savedTemplate.id,
          name: savedTemplate.name,
          description: savedTemplate.description || '',
          prompt: savedTemplate.prompt,
          type: savedTemplate.type || 'custom',
        });

        // If this was a new template and there are temporary images, upload them now
        if (!formData.id && images.length > 0) {
          await uploadTemporaryImages(savedTemplate.id);
        }

        toast({
          title: 'Success',
          description: `Template ${formData.id ? 'updated' : 'created'} successfully.`,
        });
      } else {
        throw new Error(`Failed to ${formData.id ? 'update' : 'create'} template`);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: `Failed to ${formData.id ? 'update' : 'create'} template.`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isEditing = !!formData.id;

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            <span className="text-lg">Loading template...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/image">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Create
            </Button>
          </Link>
          {viewMode === 'edit' && (
            <Button variant="outline" size="sm" onClick={handleBackToList}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Palette className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">
              {viewMode === 'list' ? 'My Templates' : (isEditing ? 'Edit Template' : 'Create New Template')}
            </h1>
          </div>
        </div>

        {viewMode === 'list' ? (
          /* Templates List View */
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-muted-foreground">
                Manage your AI image generation templates
              </p>
              <Button onClick={handleCreateNew}>
                <Plus className="w-4 h-4 mr-2" />
                Create New Template
              </Button>
            </div>

            {templatesLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mr-3" />
                <span className="text-lg">Loading templates...</span>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-12">
                <Palette className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-medium mb-2">No templates yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first template to get started with AI image generation
                </p>
                <Button onClick={handleCreateNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Template
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-card border rounded-lg p-6 cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group"
                    onClick={() => handleEditTemplate(template)}
                  >
                    {/* Action Buttons */}
                    <div className="flex justify-end mb-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this template? This action cannot be undone.') && template.id) {
                            handleDeleteTemplate(template.id);
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
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Edit/Create View */
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4">Template Details</h2>
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
          </div>

          {/* Image Upload Section */}
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Reference Images</h2>

            {/* Upload Area - Always available */}
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
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
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <Upload className="w-8 h-8" />
                  )}
                </div>

                <div>
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer text-primary hover:underline text-lg font-medium"
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

            {/* Image Gallery */}
            {images.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Uploaded Images ({images.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="relative group">
                      <Image
                        src={image.public_url}
                        alt={image.file_name}
                        width={150}
                        height={150}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleBackToList} disabled={isLoading}>
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
        )}
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            <span className="text-lg">Loading...</span>
          </div>
        </div>
      </div>
    }>
      <TemplatesPageContent />
    </Suspense>
  );
}
