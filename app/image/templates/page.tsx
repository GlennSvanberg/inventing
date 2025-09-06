'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import Image from 'next/image';
import { Upload, Trash2, Save, Loader2, ArrowLeft, Palette, Plus, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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

function PromptingBestPracticesDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="w-4 h-4 mr-2" />
          Prompting Tips
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            AI Prompting Best Practices
          </DialogTitle>
          <DialogDescription>
            Learn how to write effective prompts for better image generation results
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🎯 Core Principle</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Describe the scene, don't just list keywords.</strong> A narrative, descriptive paragraph will almost always produce better, more coherent results than disconnected words.
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">👤 Important: User Image Integration</h3>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Your templates will always include one uploaded user image (usually a person). The AI will automatically integrate this person into your described scene. Focus your prompt on the setting, mood, and style rather than describing the person.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Prompt Templates for Different Styles</h3>

            <div className="grid gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2 text-green-700 dark:text-green-300">📸 Photorealistic Scenes</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  For realistic results, use photography terms and be specific about technical details.
                </p>
                <div className="bg-muted p-3 rounded text-sm font-mono">
                  "A photorealistic [shot type] of [subject/scene], set in [environment]. Illuminated by [lighting], creating a [mood] atmosphere. Captured with [camera details], emphasizing [key details]."
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Example: "A photorealistic close-up portrait in a cozy coffee shop interior, softly lit by warm morning light, creating a welcoming atmosphere."
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2 text-purple-700 dark:text-purple-300">🎨 Stylized & Artistic</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  For creative styles, be explicit about the artistic approach.
                </p>
                <div className="bg-muted p-3 rounded text-sm font-mono">
                  "A [art style] rendering of [subject/scene] featuring [key characteristics] with a [color palette]. [Additional style details]."
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Example: "A watercolor painting of a mountain landscape with soft brushstrokes and a cool blue color palette, in the style of traditional landscape art."
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2 text-orange-700 dark:text-orange-300">🏷️ Text in Images</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  For images with text, be clear about typography and placement.
                </p>
                <div className="bg-muted p-3 rounded text-sm font-mono">
                  "Create [image type] with the text '[your text]' in [font style description]. Design should be [style], with [colors]."
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Example: "Create a motivational poster with the text 'Dream Big' in bold, modern sans-serif font. Design should be minimalist with black text on white background."
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2 text-teal-700 dark:text-teal-300">📐 Minimalist Design</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Perfect for clean, professional results with negative space.
                </p>
                <div className="bg-muted p-3 rounded text-sm font-mono">
                  "A minimalist composition featuring [subject] positioned in [frame position]. Background is [color/description], with significant negative space."
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Example: "A minimalist composition featuring a single flower in the center-right of the frame. Background is pure white, creating clean negative space."
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">💡 Best Practices</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Be Hyper-Specific:</strong> More detail = more control. Instead of "beach," say "tropical beach at sunset with palm trees and gentle waves."</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Provide Context:</strong> Explain the purpose or mood. "Professional headshot for a corporate website" vs just "portrait."</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Iterate Gradually:</strong> Make small refinements rather than complete rewrites. Start with the basic scene, then adjust lighting, colors, etc.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Use Photography Terms:</strong> Words like "wide-angle," "close-up," "soft lighting," "dramatic shadows" give precise control.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Think Composition:</strong> Consider foreground/background, rule of thirds, focal points, and visual hierarchy.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">⚠️ Things to Keep in Mind</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span><strong>User Image Focus:</strong> The uploaded person photo will be automatically integrated. Describe the scene around them.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span><strong>Style Consistency:</strong> If using reference images, the AI will match their style, lighting, and composition.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span><strong>Detail Preservation:</strong> For important elements (faces, logos), describe them specifically to maintain quality.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span><strong>Positive Descriptions:</strong> Focus on what you want rather than what you don't want. Say "sunny day" instead of "not cloudy."</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
  const [aiAssistantText, setAiAssistantText] = useState('');
  const [isGeneratingTemplate, setIsGeneratingTemplate] = useState(false);

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

  const handleGenerateTemplate = async () => {
    if (!aiAssistantText.trim()) {
      toast({
        title: 'Error',
        description: 'Please describe what you want your template to do.',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingTemplate(true);
    try {
      const response = await fetch('/api/image/templates/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userDescription: aiAssistantText.trim(),
          images: images.map(img => ({
            id: img.id,
            file_name: img.file_name,
            public_url: img.public_url
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate template');
      }

      const data = await response.json();
      const { template } = data;

      // Update form with generated template
      setFormData({
        ...formData,
        name: template.name,
        description: template.description,
        prompt: template.prompt,
        type: template.type,
      });

      // Clear AI assistant text
      setAiAssistantText('');

      toast({
        title: 'Success',
        description: 'Template generated successfully! Review and adjust as needed.',
      });
    } catch (error) {
      console.error('Template generation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate template. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingTemplate(false);
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
              <div className="flex gap-3">
                <PromptingBestPracticesDialog />
                <Button onClick={handleCreateNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Template
                </Button>
              </div>
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
            {/* Image Upload Section - Moved to top */}
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

            {/* AI Assistant Section */}
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">AI</span>
                </div>
                AI Assistant
              </h2>

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

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor="ai-assistant" className="text-sm font-medium text-purple-700 dark:text-purple-300">
                    Describe Your Template Idea
                  </Label>
                  <Button
                    onClick={handleGenerateTemplate}
                    disabled={isGeneratingTemplate || !aiAssistantText.trim()}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white"
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
                <Textarea
                  id="ai-assistant"
                  value={aiAssistantText}
                  onChange={(e) => setAiAssistantText(e.target.value)}
                  placeholder="Describe what you want your template to do, and AI will help fill in the details..."
                  rows={3}
                  className="bg-white dark:bg-gray-900 border-purple-300 dark:border-purple-600 focus:border-purple-500"
                  disabled={isGeneratingTemplate}
                />
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-purple-400 rounded-full"></span>
                  AI will analyze your reference images and create a professional template following best practices
                </p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-card rounded-lg p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold">Template Details</h2>
                <PromptingBestPracticesDialog />
              </div>
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
            </div>
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
