'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { Plus, Palette, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Template } from '@/lib/types';
import { TemplateCard } from '@/components/templates/template-card';
import { PromptingBestPracticesDialog } from '@/components/templates/prompting-best-practices-dialog';

function BrowseTemplatesContent() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

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

  useEffect(() => {
    fetchAllTemplates();
  }, [fetchAllTemplates]);

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

  const handleEditTemplate = (template: Template) => {
    // Navigate to edit page
    window.location.href = `/image/templates/edit/${template.id}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6 pt-16 lg:pt-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Palette className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">Templates</h1>
          </div>
        </div>

        {/* Templates List View */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">
              Manage your AI image generation templates
            </p>
            <div className="flex gap-3">
              <PromptingBestPracticesDialog />
              <Link href="/image/templates/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Template
                </Button>
              </Link>
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
              <Link href="/image/templates/create">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Template
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onEdit={handleEditTemplate}
                  onDelete={handleDeleteTemplate}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BrowseTemplatesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6 pt-16 lg:pt-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-3" />
            <span className="text-lg">Loading...</span>
          </div>
        </div>
      </div>
    }>
      <BrowseTemplatesContent />
    </Suspense>
  );
}
