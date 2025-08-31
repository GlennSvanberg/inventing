import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
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

    // Get template with images
    const { data: template, error: templateError } = await supabase
      .from('image_templates')
      .select(`
        id,
        name,
        description,
        prompt,
        type,
        created_at,
        updated_at,
        template_images (
          id,
          file_path,
          file_name,
          public_url,
          uploaded_at
        )
      `)
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .single();

    if (templateError) {
      if (templateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      console.error('Template fetch error:', templateError);
      return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('GET template error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
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
    const body = await request.json();
    const { name, description, prompt, type } = body;

    if (!name || !prompt) {
      return NextResponse.json(
        { error: 'Name and prompt are required' },
        { status: 400 }
      );
    }

    // Update the template
    const { data: template, error: templateError } = await supabase
      .from('image_templates')
      .update({
        name,
        description,
        prompt,
        type,
        updated_at: new Date().toISOString(),
      })
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (templateError) {
      if (templateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      console.error('Template update error:', templateError);
      return NextResponse.json({ error: 'Failed to update template' }, { status: 500 });
    }

    return NextResponse.json({ template });
  } catch (error) {
    console.error('PUT template error:', error);
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

    // First, get all template images to delete from storage
    const { data: templateImages, error: imagesError } = await supabase
      .from('template_images')
      .select('file_path')
      .eq('template_id', resolvedParams.id)
      .eq('user_id', user.id);

    if (imagesError) {
      console.error('Template images fetch error:', imagesError);
      return NextResponse.json({ error: 'Failed to fetch template images' }, { status: 500 });
    }

    // Delete images from storage
    if (templateImages && templateImages.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('template-images')
        .remove(templateImages.map(img => img.file_path));

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue with deletion even if storage cleanup fails
      }
    }

    // Delete the template (this will cascade to template_images due to foreign key)
    const { error: templateError } = await supabase
      .from('image_templates')
      .delete()
      .eq('id', resolvedParams.id)
      .eq('user_id', user.id);

    if (templateError) {
      console.error('Template deletion error:', templateError);
      return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE template error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
