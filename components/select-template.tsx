'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Palette, Check, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Template } from '@/lib/types';
import Link from 'next/link';

interface SelectTemplateProps {
  selectedTemplate: Template | null;
  onTemplateSelect: (template: Template | null) => void;
}

export function SelectTemplate({ selectedTemplate, onTemplateSelect }: SelectTemplateProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Fetch user templates
  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/image/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
      } else {
        console.error('Failed to fetch templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);


  // Get unique categories from user templates
  const categories = ['All', ...Array.from(new Set(templates.map(t => t.type)))];

  const filteredTemplates = selectedCategory === 'All'
    ? templates
    : templates.filter(template => template.type === selectedCategory);

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

  if (loading) {
    return (
      <Card className="w-full max-w-2xl">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Loading templates...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              My Templates
            </div>
            <Link href="/image/templates">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Category Filter */}
          {categories.length > 1 && (
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
          )}

          {/* Templates Grid */}
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Palette className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No templates found</p>
              <p className="text-sm mb-4">
                {selectedCategory === 'All'
                  ? "Create your first template to get started"
                  : `No templates in the "${selectedCategory}" category`
                }
              </p>
              <Link href="/image/templates">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Template
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className={cn(
                    "relative border-2 rounded-lg p-4 cursor-pointer transition-all hover:shadow-md group",
                    selectedTemplate?.id === template.id
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-muted hover:border-primary/50"
                  )}
                  onClick={() => onTemplateSelect(template)}
                >
                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/image/templates?id=${template.id}`}>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600"
                        title="Edit template"
                      >
                        <Edit className="w-3 h-3" />
                      </button>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Are you sure you want to delete this template? This action cannot be undone.') && template.id) {
                          // Handle delete via API call
                          fetch(`/api/image/templates/${template.id}`, {
                            method: 'DELETE',
                          }).then(response => {
                            if (response.ok) {
                              setTemplates(prev => prev.filter(t => t.id !== template.id));
                              if (selectedTemplate?.id === template.id) {
                                onTemplateSelect(null);
                              }
                              toast({
                                title: 'Success',
                                description: 'Template deleted successfully.',
                              });
                            } else {
                              toast({
                                title: 'Error',
                                description: 'Failed to delete template.',
                                variant: 'destructive',
                              });
                            }
                          }).catch(error => {
                            console.error('Error deleting template:', error);
                            toast({
                              title: 'Error',
                              description: 'Failed to delete template.',
                              variant: 'destructive',
                            });
                          });
                        }
                      }}
                      className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      title="Delete template"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Selection Indicator */}
                  {selectedTemplate?.id === template.id && (
                    <div className="absolute top-2 left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}

                  {/* Template Preview */}
                  <div className="text-center mb-3">
                    <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center text-2xl mb-2 overflow-hidden">
                      {template.template_images && template.template_images.length > 0 ? (
                        <Image
                          src={template.template_images[0].public_url}
                          alt={template.template_images[0].file_name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        getPreviewEmoji(template.type)
                      )}
                    </div>
                    <h3 className="font-medium text-sm">{template.name}</h3>
                  </div>

                  {/* Template Description */}
                  <p className="text-xs text-muted-foreground text-center line-clamp-2">
                    {template.description || template.prompt.slice(0, 60) + '...'}
                  </p>

                  {/* Type Badge */}
                  <div className="mt-2 text-center">
                    <span className="inline-block px-2 py-1 text-xs bg-muted text-muted-foreground rounded-full capitalize">
                      {template.type}
                    </span>
                  </div>

                  {/* Images Count */}
                  {template.template_images && template.template_images.length > 0 && (
                    <div className="mt-2 text-center">
                      <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        {template.template_images.length} image{template.template_images.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Selected Template Info */}
          {selectedTemplate && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-xl overflow-hidden">
                  {selectedTemplate.template_images && selectedTemplate.template_images.length > 0 ? (
                    <Image
                      src={selectedTemplate.template_images[0].public_url}
                      alt={selectedTemplate.template_images[0].file_name}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    getPreviewEmoji(selectedTemplate.type)
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{selectedTemplate.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplate.description || selectedTemplate.prompt.slice(0, 100) + '...'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-muted px-2 py-1 rounded-full capitalize">
                      {selectedTemplate.type}
                    </span>
                    {selectedTemplate.template_images && selectedTemplate.template_images.length > 0 && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        {selectedTemplate.template_images.length} image{selectedTemplate.template_images.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
  );
}
