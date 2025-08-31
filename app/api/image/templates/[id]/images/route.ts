import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;

    // Verify template ownership
    const { data: template, error: templateError } = await supabase
      .from('image_templates')
      .select('id')
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single();

    if (templateError || !template) {
      return NextResponse.json({ error: 'Template not found or access denied' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size too large (max 10MB)' }, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;
    const filePath = `${user.id}/${resolvedParams.id}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('template-images')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('template-images')
      .getPublicUrl(filePath);

    // Save to database
    const { data: imageRecord, error: dbError } = await supabase
      .from('template_images')
      .insert({
        template_id: resolvedParams.id,
        user_id: user.id,
        file_path: filePath,
        file_name: file.name,
        file_size: file.size,
        content_type: file.type,
        public_url: publicUrl,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      // Try to cleanup uploaded file
      await supabase.storage.from('template-images').remove([filePath]);
      return NextResponse.json({ error: 'Failed to save image record' }, { status: 500 });
    }

    return NextResponse.json({ image: imageRecord }, { status: 201 });
  } catch (error) {
    console.error('POST template image error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const url = new URL(request.url);
    const imageId = url.searchParams.get('imageId');

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
    }

    // Get image record
    const { data: image, error: fetchError } = await supabase
      .from('template_images')
      .select('file_path')
      .eq('id', imageId)
      .eq('template_id', resolvedParams.id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !image) {
      return NextResponse.json({ error: 'Image not found or access denied' }, { status: 404 });
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('template-images')
      .remove([image.file_path]);

    if (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with database deletion even if storage cleanup fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('template_images')
      .delete()
      .eq('id', imageId)
      .eq('template_id', resolvedParams.id)
      .eq('user_id', user.id);

    if (dbError) {
      console.error('Database deletion error:', dbError);
      return NextResponse.json({ error: 'Failed to delete image record' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE template image error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
