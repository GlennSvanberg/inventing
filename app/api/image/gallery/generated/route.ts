import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch user's generated images from database
    // We need to join with image_processing to get template info
    const { data: images, error: imagesError } = await supabase
      .from('user_images')
      .select(`
        id,
        file_name,
        file_size,
        content_type,
        public_url,
        uploaded_at,
        file_path,
        image_processing (
          template_id,
          image_templates (
            name
          )
        )
      `)
      .eq('user_id', user.id)
      .like('file_path', `${user.id}/generated/%`) // Only get images in the generated folder
      .order('uploaded_at', { ascending: false });

    if (imagesError) {
      console.error('Generated gallery fetch error:', imagesError);
      return NextResponse.json(
        { error: 'Failed to fetch generated images' },
        { status: 500 }
      );
    }

    console.log('Generated gallery API - Found images in generated folder:', images?.length || 0);
    if (images && images.length > 0) {
      console.log('Sample generated image paths:', images.slice(0, 3).map(img => ({
        id: img.id,
        file_path: img.file_path,
        file_name: img.file_name,
        has_processing: !!img.image_processing?.length
      })));
    }

    // Transform the data to match the expected format
    const galleryImages = images.map(image => ({
      id: image.id,
      name: image.file_name,
      url: image.public_url,
      uploadedAt: image.uploaded_at,
      size: image.file_size,
      type: image.content_type,
      templateName: image.image_processing?.[0]?.image_templates?.[0]?.name || 'Unknown Template',
    }));

    return NextResponse.json({
      success: true,
      images: galleryImages,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
