'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function TemplatesPage() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if there's an ID parameter for editing
    const templateId = searchParams.get('id');

    if (templateId) {
      // Redirect to edit page
      window.location.href = `/image/templates/edit/${templateId}`;
    } else {
      // Redirect to browse page
      window.location.href = '/image/templates/browse';
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 sm:p-6 pt-16 lg:pt-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-lg">Redirecting...</div>
        </div>
      </div>
    </div>
  );
}