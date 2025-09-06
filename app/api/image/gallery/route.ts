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

    // Fetch user's images from database (excluding generated images)
    const { data: images, error: imagesError } = await supabase
      .from('user_images')
      .select('id, file_name, file_size, content_type, public_url, uploaded_at, file_path')
      .eq('user_id', user.id)
      .not('file_path', 'like', `${user.id}/generated/%`)
      .order('uploaded_at', { ascending: false });

    if (imagesError) {
      console.error('Gallery fetch error:', imagesError);
      return NextResponse.json(
        { error: 'Failed to fetch images' },
        { status: 500 }
      );
    }


    // Transform the data to match the expected format
    const galleryImages = images.map(image => ({
      id: image.id,
      name: image.file_name,
      url: image.public_url,
      uploadedAt: image.uploaded_at,
      size: image.file_size,
      type: image.content_type,
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
