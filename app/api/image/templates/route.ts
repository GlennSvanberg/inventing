import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import { z } from 'zod';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's templates with their images
    const { data: templates, error: templatesError } = await supabase
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
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (templatesError) {
      console.error('Templates fetch error:', templatesError);
      return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
    }

    return NextResponse.json({ templates: templates || [] });
  } catch (error) {
    console.error('GET templates error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, prompt, type = 'custom' } = body;

    if (!name || !prompt) {
      return NextResponse.json(
        { error: 'Name and prompt are required' },
        { status: 400 }
      );
    }

    // Create the template
    const { data: template, error: templateError } = await supabase
      .from('image_templates')
      .insert({
        user_id: user.id,
        name,
        description,
        prompt,
        type,
      })
      .select()
      .single();

    if (templateError) {
      console.error('Template creation error:', templateError);
      return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
    }

    return NextResponse.json({ template }, { status: 201 });
  } catch (error) {
    console.error('POST template error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
