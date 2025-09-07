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
    // We need to join through image_processing to get template info
    const { data: processingRecords, error: imagesError } = await supabase
      .from('image_processing')
      .select(`
        generated_image_id,
        user_images!inner (
          id,
          file_name,
          file_size,
          content_type,
          public_url,
          uploaded_at,
          file_path
        ),
        image_templates (
          id
        )
      `)
      .eq('user_id', user.id)
      .not('generated_image_id', 'is', null) // Only get records with generated images
      .order('created_at', { ascending: false });

    if (imagesError) {
      console.error('Generated gallery fetch error:', imagesError);
      return NextResponse.json(
        { error: 'Failed to fetch generated images' },
        { status: 500 }
      );
    }

    // Transform the data to match the expected format
    const galleryImages = processingRecords.map(record => {
      // Handle user_images as array (due to Supabase join behavior) and take first element
      const userImage = Array.isArray(record.user_images) ? record.user_images[0] : record.user_images;

      if (!userImage) {
        console.warn('No user image found for processing record:', record.generated_image_id);
        return null;
      }

      // Handle image_templates as potentially being an array
      const template = Array.isArray(record.image_templates) ? record.image_templates[0] : record.image_templates;

      return {
        id: userImage.id,
        name: userImage.file_name,
        url: userImage.public_url,
        uploadedAt: userImage.uploaded_at,
        size: userImage.file_size,
        type: userImage.content_type,
        templateId: template?.id,
      };
    }).filter(Boolean); // Remove null entries

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
