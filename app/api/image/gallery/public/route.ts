import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface PublicImageRow {
  image_id: string;
  file_name: string;
  public_url: string;
  uploaded_at: string;
  file_size: number;
  content_type: string;
  template_id?: string;
  template_title?: string;
  template_description?: string;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';


    // Use security definer functions to bypass RLS for public read
    const { data: items, error: itemsError } = await supabase
      .rpc('get_public_generated_images', { page, page_size: limit, search });

    const { data: totalCountData, error: countError } = await supabase
      .rpc('get_public_generated_images_count', { search });

    if (itemsError || countError) {
      console.error('Public gallery fetch error:', { itemsError, countError });
      return NextResponse.json({
        error: 'Failed to fetch generated images',
        details: {
          itemsError: itemsError?.message || null,
          countError: countError?.message || null,
        }
      }, { status: 500 });
    }

    const galleryImages = (items || []).map((row: PublicImageRow) => ({
      id: row.image_id,
      name: row.file_name,
      url: row.public_url,
      uploadedAt: row.uploaded_at,
      size: row.file_size,
      type: row.content_type,
      templateId: row.template_id || null,
      templateTitle: row.template_title || null,
      templateDescription: row.template_description || null,
    }));

    const total = typeof totalCountData === 'number'
      ? totalCountData
      : (Array.isArray(totalCountData) && totalCountData.length > 0 ? totalCountData[0] : 0);

    return NextResponse.json({
      success: true,
      images: galleryImages,
      pagination: {
        page,
        limit,
        total: total || 0,
        totalPages: Math.ceil(((total || 0)) / limit),
      },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: (error as Error).message,
    }, { status: 500 });
  }
}
