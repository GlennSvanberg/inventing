import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const status = url.searchParams.get('status'); // Optional status filter

    // Build query
    let query = supabase
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
        image_templates (
          id,
          name,
          description
        ),
        user_images (
          id,
          file_name,
          public_url
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add status filter if provided
    if (status) {
      query = query.eq('status', status);
    }

    const { data: processingRecords, error: processingError } = await query;

    if (processingError) {
      console.error('Processing records fetch error:', processingError);
      return NextResponse.json({ error: 'Failed to fetch processing history' }, { status: 500 });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('image_processing')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (status) {
      countQuery = countQuery.eq('status', status);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Count query error:', countError);
    }

    // Transform the data for frontend
    const processedRecords = processingRecords.map(record => ({
      id: record.id,
      template: record.image_templates,
      userImages: record.user_images || [],
      prompt: record.prompt,
      status: record.status,
      errorMessage: record.error_message,
      errorCode: record.error_code,
      fullResponseText: record.full_response_text,
      processingTimeMs: record.processing_time_ms,
      createdAt: record.created_at,
    }));

    return NextResponse.json({
      success: true,
      records: processedRecords,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit
      }
    });

  } catch (error) {
    console.error('Processing history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
