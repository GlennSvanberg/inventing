import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const resolvedParams = await params;
    const imageId = resolvedParams.id;

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // First, get the image details to ensure it belongs to the user and is a generated image
    const { data: image, error: fetchError } = await supabase
      .from('user_images')
      .select('file_path, user_id')
      .eq('id', imageId)
      .eq('user_id', user.id)
      .like('file_path', '%generated%')
      .single();

    if (fetchError || !image) {
      console.error('Image fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Generated image not found or access denied' },
        { status: 404 }
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('user-images')
      .remove([image.file_path]);

    if (storageError) {
      console.error('Storage delete error:', storageError);
      return NextResponse.json(
        { error: 'Failed to delete image from storage' },
        { status: 500 }
      );
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('user_images')
      .delete()
      .eq('id', imageId)
      .eq('user_id', user.id);

    if (dbError) {
      console.error('Database delete error:', dbError);
      return NextResponse.json(
        { error: 'Failed to delete image from database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Generated image deleted successfully',
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
