import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// Configure for handling file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: NextRequest) {
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

    let file: File;
    let fileName: string;

    // Check if this is a URL upload or file upload
    const contentTypeHeader = request.headers.get('content-type');
    const isJsonRequest = contentTypeHeader?.includes('application/json');

    if (isJsonRequest) {
      // Handle URL upload
      const body = await request.json();
      const { url } = body;

      if (!url) {
        return NextResponse.json(
          { error: 'No URL provided' },
          { status: 400 }
        );
      }

      try {
        // Download image from URL
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; ImageUploadBot/1.0)',
          },
        });

        if (!response.ok) {
          return NextResponse.json(
            { error: `Failed to download image from URL: ${response.status} ${response.statusText}` },
            { status: 400 }
          );
        }

        const contentType = response.headers.get('content-type');
        if (!contentType?.startsWith('image/')) {
          return NextResponse.json(
            { error: 'URL does not point to a valid image' },
            { status: 400 }
          );
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Validate file size (10MB limit)
        if (buffer.length > 10 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'Image size must be less than 10MB' },
            { status: 400 }
          );
        }

        // Extract filename from URL or use a default
        const urlParts = url.split('/');
        const originalFileName = urlParts[urlParts.length - 1] || 'image.jpg';
        fileName = originalFileName;

        // Create File object from downloaded data
        file = new File([buffer], fileName, { type: contentType });

      } catch (error) {
        console.error('URL download error:', error);
        return NextResponse.json(
          { error: 'Failed to download image from URL' },
          { status: 400 }
        );
      }
    } else {
      // Handle file upload
      const formData = await request.formData();
      file = formData.get('file') as File;
      fileName = file.name;

      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;

    // Create user-specific folder path
    const filePath = `${user.id}/${uniqueFileName}`;

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('user-images')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload image' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-images')
      .getPublicUrl(filePath);

    // Store metadata in database
    const { data: metadataData, error: metadataError } = await supabase
      .from('user_images')
      .insert({
        id: uuidv4(),
        user_id: user.id,
        file_path: filePath,
        file_name: fileName,
        file_size: file.size,
        content_type: file.type,
        public_url: publicUrl,
        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (metadataError) {
      console.error('Metadata error:', metadataError);
      // Try to clean up the uploaded file if metadata insertion fails
      await supabase.storage
        .from('user-images')
        .remove([filePath]);

      return NextResponse.json(
        { error: 'Failed to save image metadata' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      image: {
        id: metadataData.id,
        fileName: metadataData.file_name,
        url: metadataData.public_url,
        uploadedAt: metadataData.uploaded_at,
      },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
