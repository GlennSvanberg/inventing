import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { GoogleGenAI } from '@google/genai';
import mime from 'mime';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  let generatedImageData: { data: string; mimeType: string } | null = null;
  const startTime = Date.now();
  const supabase = await createClient();
  const processingRecord: {
    id?: string;
    user_id: string;
    template_id: string;
    user_image_ids: string[];
    prompt: string;
    status: string;
    error_message: string;
    error_code: string;
    full_response_text: string;
    generated_image_id?: string | null;
    processing_time_ms: number;
    created_at: string;
  } = {
    user_id: '',
    template_id: '',
    user_image_ids: [],
    prompt: '',
    status: 'failed',
    error_message: '',
    error_code: '',
    full_response_text: '',
    generated_image_id: null,
    processing_time_ms: 0,
    created_at: new Date().toISOString()
  };

  try {

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { templateId, userImageIds }: { templateId: string; userImageIds: string[] } = body;

    // Update processing record with request data
    processingRecord.user_id = user.id;
    processingRecord.template_id = templateId;
    processingRecord.user_image_ids = userImageIds;

    if (!templateId || !userImageIds || userImageIds.length === 0) {
      return NextResponse.json(
        { error: 'Template ID and at least one user image ID are required' },
        { status: 400 }
      );
    }

    // Fetch template with prompt and template images
    const { data: template, error: templateError } = await supabase
      .from('image_templates')
      .select(`
        id,
        name,
        prompt,
        template_images (
          id,
          file_path,
          file_name,
          public_url,
          content_type
        )
      `)
      .eq('id', templateId)
      .eq('user_id', user.id)
      .single();

    if (templateError || !template) {
      console.error('Template fetch error:', templateError);
      processingRecord.error_message = 'Template not found';
      processingRecord.error_code = 'TEMPLATE_NOT_FOUND';
      await saveProcessingRecord(supabase, processingRecord);
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Update processing record with template data
    processingRecord.prompt = template.prompt;

    // Fetch user images
    const { data: userImages, error: imagesError } = await supabase
      .from('user_images')
      .select('id, file_path, file_name, public_url, content_type')
      .eq('user_id', user.id)
      .in('id', userImageIds);

    if (imagesError || !userImages || userImages.length === 0) {
      console.error('User images fetch error:', imagesError);
      processingRecord.error_message = 'User images not found';
      processingRecord.error_code = 'USER_IMAGES_NOT_FOUND';
      await saveProcessingRecord(supabase, processingRecord);
      return NextResponse.json({ error: 'User images not found' }, { status: 404 });
    }

    // Initialize Gemini AI
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY environment variable is not set');
      return NextResponse.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    console.log('Initializing Gemini AI with API key present:', !!apiKey);
    const ai = new GoogleGenAI({
      apiKey,
    });

    const model = 'gemini-2.5-flash-image-preview';

    // Prepare the content parts for Gemini
    // First, fetch all template images as base64
    const templateImageParts = await Promise.all(
      template.template_images.map(async (img: { content_type: string; public_url: string }) => ({
        inlineData: {
          mimeType: img.content_type,
          data: await fetchImageAsBase64(img.public_url),
        },
      }))
    );

    // Then, fetch all user images as base64
    const userImageParts = await Promise.all(
      userImages.map(async (img: { content_type: string; public_url: string }) => ({
        inlineData: {
          mimeType: img.content_type,
          data: await fetchImageAsBase64(img.public_url),
        },
      }))
    );

    // Include images in the request as shown in the working example
    console.log('Template prompt:', template.prompt);
    console.log('Template images count:', templateImageParts.length);
    console.log('User images count:', userImageParts.length);

    // Debug: Check if images are properly encoded
    if (templateImageParts.length > 0) {
      console.log('First template image data length:', templateImageParts[0].inlineData.data.length);
    }
    if (userImageParts.length > 0) {
      console.log('First user image data length:', userImageParts[0].inlineData.data.length);
    }

    // Include images but handle content policy violations gracefully
    console.log('📸 Including images in request...');

    const contents = [
      {
        role: 'user' as const,
        parts: [
          {
            text: template.prompt,
          },
          // Add template images as inline data
          ...templateImageParts,
          // Add user images as inline data (this might trigger content policies)
          ...userImageParts,
        ],
      },
    ];

    const config = {
      responseModalities: [
        'IMAGE',
        'TEXT',
      ],
    };

    // Generate content with Gemini
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    // Process the streaming response and collect full text
    let fileIndex = 0;
    let chunkCount = 0;
    let fullResponseText = '';

    console.log('Starting to process streaming response...');

    for await (const chunk of response) {
      chunkCount++;
      console.log(`\n--- Processing chunk ${chunkCount} ---`);

      // Collect all text responses
      if (chunk.candidates && chunk.candidates[0] && chunk.candidates[0].content && chunk.candidates[0].content.parts) {
        const parts = chunk.candidates[0].content.parts;
        parts.forEach((part, index) => {
          if (part.text) {
            fullResponseText += part.text;
            console.log(`Part ${index} text:`, part.text);
          }

          // Check for inline data (image)
          if (part.inlineData) {
            console.log(`Found inlineData in part ${index}! Processing...`);
            const fileName = `generated-${fileIndex++}`;
            const inlineData = part.inlineData;
            const fileExtension = mime.getExtension(inlineData.mimeType || '');
            const buffer = Buffer.from(inlineData.data || '', 'base64');

                              generatedImageData = {
          data: inlineData.data || '',
          mimeType: inlineData.mimeType || 'image/png',
        };

            console.log(`✅ SUCCESS: Generated image ${fileName} with extension .${fileExtension}, size: ${buffer.length} bytes`);
          }
        });
      }

      // Check finish reason
      if (chunk.candidates && chunk.candidates[0].finishReason) {
        const finishReason = chunk.candidates[0].finishReason;
        console.log('Finish reason:', finishReason);

        if (finishReason === 'PROHIBITED_CONTENT') {
          console.log('🚫 Content policy violation detected!');
          processingRecord.status = 'prohibited_content';
          processingRecord.error_message = 'Content violates Gemini\'s policies';
          processingRecord.error_code = 'CONTENT_POLICY_VIOLATION';
          processingRecord.full_response_text = fullResponseText;
          processingRecord.processing_time_ms = Date.now() - startTime;

          await saveProcessingRecord(supabase, processingRecord);

          return NextResponse.json({
            error: 'Content Policy Violation',
            message: 'The uploaded images contain content that violates Gemini\'s content policies. Please try different images that comply with the platform\'s guidelines.',
            code: 'CONTENT_POLICY_VIOLATION',
            fullResponse: fullResponseText,
            processingId: processingRecord.id
          }, { status: 400 });
        }

        if (finishReason !== 'STOP') {
          console.log('⚠️  Unusual finish reason:', finishReason);
        }
      }

      // Break if we found an image
      if (generatedImageData) {
        console.log('✅ Image data found, breaking from loop');
        break;
      }
    }

    console.log(`\n--- Processing complete ---`);
    console.log(`Total chunks processed: ${chunkCount}`);
    console.log(`Generated image data:`, generatedImageData ? 'YES' : 'NO');

    if (!generatedImageData) {
      // Save failed processing record
      processingRecord.status = 'failed';
      processingRecord.error_message = 'No image data generated';
      processingRecord.error_code = 'NO_IMAGE_DATA';
      processingRecord.full_response_text = fullResponseText;
      processingRecord.processing_time_ms = Date.now() - startTime;

      await saveProcessingRecord(supabase, processingRecord);

      return NextResponse.json({
        error: 'Image Generation Failed',
        message: 'Gemini did not generate an image. This might be due to content restrictions or API limitations.',
        fullResponse: fullResponseText,
        processingId: processingRecord.id
      }, { status: 500 });
    }

    // Update processing record for successful generation
    processingRecord.status = 'success';
    processingRecord.full_response_text = fullResponseText;
    processingRecord.processing_time_ms = Date.now() - startTime;

    // Convert base64 to buffer
    if (!generatedImageData) {
      throw new Error('No image data available');
    }

    // Type assertion after null check
    const imageData = generatedImageData as { data: string; mimeType: string };
    const buffer = Buffer.from(imageData.data, 'base64');

    // Get file extension
    const fileExtension = mime.getExtension(imageData.mimeType) || 'png';

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `generated-${timestamp}.${fileExtension}`;

    // Upload to Supabase storage in generated folder
    const filePath = `${user.id}/generated/${fileName}`;
    console.log(`Uploading generated image to: ${filePath}`);
    console.log(`File size: ${buffer.length} bytes, MIME type: ${imageData.mimeType}`);

    const { error: uploadError } = await supabase.storage
      .from('user-images')
      .upload(filePath, buffer, {
        contentType: imageData.mimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      console.error('Upload error details:', JSON.stringify(uploadError, null, 2));

      // Update processing record with storage failure
      processingRecord.status = 'failed';
      processingRecord.error_message = `Storage upload failed: ${uploadError.message}`;
      processingRecord.error_code = 'STORAGE_UPLOAD_ERROR';
      await saveProcessingRecord(supabase, processingRecord);

      return NextResponse.json({
        error: 'Failed to save generated image',
        details: uploadError.message,
        processingId: processingRecord.id
      }, { status: 500 });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('user-images')
      .getPublicUrl(filePath);

    console.log('✅ Storage upload successful');
    console.log(`Generated public URL: ${publicUrlData.publicUrl}`);

    // Save to user_images table with generated image metadata
    console.log('Saving image metadata to database...');
    const { data: savedImage, error: saveError } = await supabase
      .from('user_images')
      .insert({
        user_id: user.id,
        file_path: filePath,
        file_name: fileName,
        file_size: buffer.length,
        content_type: imageData.mimeType,
        public_url: publicUrlData.publicUrl,
        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (saveError) {
      console.error('Database save error:', saveError);
      console.error('Database error details:', JSON.stringify(saveError, null, 2));

      // Update processing record with database failure
      processingRecord.status = 'failed';
      processingRecord.error_message = `Database save failed: ${saveError.message}`;
      processingRecord.error_code = 'DATABASE_SAVE_ERROR';
      await saveProcessingRecord(supabase, processingRecord);

      // Try to clean up the uploaded file
      console.log('Cleaning up uploaded file due to database error...');
      await supabase.storage.from('user-images').remove([filePath]);
      return NextResponse.json({
        error: 'Failed to save image metadata',
        details: saveError.message,
        processingId: processingRecord.id
      }, { status: 500 });
    }

    console.log('✅ Database save successful');
    console.log(`Saved image with ID: ${savedImage.id}`);

    // Verify the image is accessible
    console.log('Verifying image accessibility...');
    try {
      const { data: verifyData, error: verifyError } = await supabase.storage
        .from('user-images')
        .list(user.id, {
          limit: 1,
          search: fileName
        });

      if (verifyError) {
        console.warn('Image verification warning:', verifyError.message);
      } else if (verifyData && verifyData.length > 0) {
        console.log('✅ Image verified in storage');
      } else {
        console.warn('⚠️  Image not found in storage listing');
      }
    } catch (verifyError) {
      console.warn('Image verification failed:', verifyError);
    }

    // Update processing record with success
    processingRecord.generated_image_id = savedImage.id;
    await saveProcessingRecord(supabase, processingRecord);

    // Final summary
    console.log('\n🎉 IMAGE GENERATION COMPLETE');
    console.log('================================');
    console.log(`User ID: ${user.id}`);
    console.log(`Template: ${template.name}`);
    console.log(`Processing ID: ${processingRecord.id}`);
    console.log(`Generated Image ID: ${savedImage.id}`);
    console.log(`File: ${fileName}`);
    console.log(`Size: ${buffer.length} bytes`);
    console.log(`Public URL: ${publicUrlData.publicUrl}`);
    console.log(`Processing Time: ${Date.now() - startTime}ms`);
    console.log('================================\n');

    return NextResponse.json({
      success: true,
      image: {
        id: savedImage.id,
        url: publicUrlData.publicUrl,
        name: fileName,
        size: buffer.length,
        type: imageData.mimeType,
        uploadedAt: savedImage.uploaded_at,
      },
      processingId: processingRecord.id,
      fullResponse: fullResponseText,
      summary: {
        templateUsed: template.name,
        processingTime: Date.now() - startTime,
        imageSize: buffer.length,
        fileName: fileName
      }
    });

  } catch (error) {
    console.error('Image generation error:', error);

    // Update processing record for unexpected errors
    processingRecord.status = 'failed';
    processingRecord.error_message = error instanceof Error ? error.message : 'Unknown error';
    processingRecord.error_code = 'UNEXPECTED_ERROR';
    processingRecord.processing_time_ms = Date.now() - startTime;

    try {
      await saveProcessingRecord(supabase, processingRecord);
    } catch (saveError) {
      console.error('Failed to save processing record:', saveError);
    }

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('CONTENT_POLICY_VIOLATION')) {
        return NextResponse.json({
          error: 'Content Policy Violation',
          message: 'The uploaded images contain content that violates Gemini\'s content policies. Please try different images that comply with the platform\'s guidelines.',
          code: 'CONTENT_POLICY_VIOLATION',
          processingId: processingRecord.id
        }, { status: 400 });
      }
    }

    return NextResponse.json({
      error: 'Internal server error',
      processingId: processingRecord.id
    }, { status: 500 });
  }
}

// Helper function to fetch image as base64
async function fetchImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer.toString('base64');
  } catch (error) {
    console.error('Error fetching image as base64:', error);
    throw error;
  }
}

// Helper function to save processing record to database
async function saveProcessingRecord(supabase: SupabaseClient, record: {
  id?: string;
  user_id: string;
  template_id: string;
  user_image_ids: string[];
  prompt: string;
  status: string;
  error_message: string;
  error_code: string;
  full_response_text: string;
      generated_image_id?: string | null;
  processing_time_ms: number;
  created_at: string;
}): Promise<void> {
  try {
    const { data, error } = await supabase
      .from('image_processing')
      .insert({
        id: record.id || crypto.randomUUID(),
        user_id: record.user_id,
        template_id: record.template_id,
        user_image_ids: record.user_image_ids,
        prompt: record.prompt,
        status: record.status,
        error_message: record.error_message,
        error_code: record.error_code,
        full_response_text: record.full_response_text,
        generated_image_id: record.generated_image_id,
        processing_time_ms: record.processing_time_ms,
        created_at: record.created_at
      })
      .select('id');

    if (error) {
      console.error('Failed to save processing record:', error);
    } else {
      console.log('✅ Processing record saved with ID:', record.id || data?.[0]?.id);
      // Update the record ID if it wasn't set
      if (!record.id && data?.[0]?.id) {
        record.id = data[0].id;
      }
    }
  } catch (error) {
    console.error('Error saving processing record:', error);
  }
}
