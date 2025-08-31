import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const processingId = resolvedParams.id;

    // Get processing record with related data
    const { data: processingRecord, error: processingError } = await supabase
      .from('image_processing')
      .select(`
        id,
        template_id,
        user_image_ids,
        prompt,
        status,
        error_message,
        error_code,
        full_response_text,
        processing_time_ms,
        created_at,
        generated_image_id,
        image_templates (
          id,
          name,
          description,
          prompt as template_prompt
        ),
        user_images!inner (
          id,
          file_name,
          public_url,
          file_size,
          content_type
        )
      `)
      .eq('id', processingId)
      .eq('user_id', user.id)
      .single();

    if (processingError || !processingRecord) {
      console.error('Processing record fetch error:', processingError);
      return NextResponse.json({ error: 'Processing record not found' }, { status: 404 });
    }

    // Get generated image if it exists
    let generatedImage = null;
    if (processingRecord.generated_image_id) {
      const { data: imageData } = await supabase
        .from('user_images')
        .select('id, file_name, public_url, file_size, content_type')
        .eq('id', processingRecord.generated_image_id)
        .single();

      generatedImage = imageData;
    }

    // Verify generated image accessibility if it exists
    let imageVerification = null;
    if (generatedImage) {
      try {
        // Test if the image URL is accessible
        const response = await fetch(generatedImage.public_url, { method: 'HEAD' });
        imageVerification = {
          accessible: response.ok,
          status: response.status,
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length')
        };
      } catch (error) {
        imageVerification = {
          accessible: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return NextResponse.json({
      success: true,
      record: {
        id: processingRecord.id,
        template: processingRecord.image_templates,
        userImages: processingRecord.user_images || [],
        prompt: processingRecord.prompt,
        status: processingRecord.status,
        errorMessage: processingRecord.error_message,
        errorCode: processingRecord.error_code,
        fullResponseText: processingRecord.full_response_text,
        processingTimeMs: processingRecord.processing_time_ms,
        createdAt: processingRecord.created_at,
        generatedImage: generatedImage,
        imageVerification
      }
    });

  } catch (error) {
    console.error('Processing detail error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
