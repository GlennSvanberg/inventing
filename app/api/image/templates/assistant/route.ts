import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import OpenAI from 'openai';
import { z } from 'zod';

// Zod schema for structured template output
const TemplateSchema = z.object({
  name: z.string().describe('A clear, descriptive name for the template (3-50 characters)'),
  prompt: z.string().describe('The AI prompt that will generate the image. Should be descriptive and follow best practices for image generation'),
  type: z.enum(['custom', 'portrait', 'landscape', 'action', 'artistic', 'vintage']).describe('The template category that best fits the intended use'),
  description: z.string().describe('A brief description explaining what this template is for and how it should be used'),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userDescription, images } = body;

    if (!userDescription || typeof userDescription !== 'string') {
      return NextResponse.json(
        { error: 'User description is required and must be a string' },
        { status: 400 }
      );
    }

    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // System prompt with comprehensive prompting best practices
    const systemPrompt = `You are an expert AI assistant that creates professional image generation templates. You analyze user descriptions and reference images to create complete, high-quality templates.

## REFERENCE IMAGES INFORMATION:
${images && images.length > 0 ? `The user has uploaded ${images.length} reference image(s) for this template. These images will be automatically integrated into the generated scenes. Focus your prompts on the environment, mood, and style rather than describing specific people or objects.` : 'No reference images provided. Create a template that works with any uploaded user image.'}

## PROMPTING BEST PRACTICES YOU MUST FOLLOW:

### CORE PRINCIPLE:
- Describe the scene narratively, don't just list keywords
- Create detailed, descriptive paragraphs that paint a vivid picture

### SPECIFIC TECHNIQUES:
1. **Be Hyper-Specific**: Include exact details about lighting, camera angles, colors, textures
   - Example: Instead of "beach", use "tropical beach at golden hour with gentle turquoise waves"

2. **Provide Context and Intent**: Explain the purpose and mood of the image
   - Example: "Professional headshot for a corporate website" vs just "portrait"

3. **Use Photography Terms**: Incorporate camera techniques for precision
   - Wide-angle shot, close-up, soft lighting, dramatic shadows, rule of thirds

4. **Think Composition**: Consider visual hierarchy and framing
   - Foreground/background relationships, focal points, negative space

5. **Lighting and Atmosphere**: Always specify lighting conditions
   - Golden hour sunlight, studio softbox lighting, dramatic chiaroscuro, moody twilight

6. **Technical Details**: Include camera settings and post-processing style
   - Lens type, aperture, depth of field, color grading, film grain

### TEMPLATE TYPE SELECTION:
- **custom**: General-purpose templates
- **portrait**: Headshots, character-focused images
- **landscape**: Nature, outdoor scenes, wide vistas
- **action**: Dynamic movement, sports, high-energy scenes
- **artistic**: Creative, stylized, abstract interpretations
- **vintage**: Retro styles, classic photography looks

### PROMPT STRUCTURE:
Create prompts that follow this pattern:
"A [photographic style] [shot type] of [subject/scene description], set in [environment]. Illuminated by [lighting description], creating a [mood] atmosphere. Captured with [camera/lens details], emphasizing [key textures and visual elements]. The composition features [framing/layout details]."

## REQUIREMENTS:
- **name**: Clear, descriptive (3-50 characters)
- **prompt**: Detailed 2-3 sentence paragraph following all best practices above
- **type**: Most appropriate category from the list above
- **description**: 1-2 sentence explanation of template purpose and use case

Always prioritize quality over brevity. Create prompts that will generate professional, visually stunning results.`;

    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      input: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: `Please create an image generation template based on this description: "${userDescription}"`
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: 'template',
          schema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'A clear, descriptive name for the template (3-50 characters)',
              },
              prompt: {
                type: 'string',
                description: 'The AI prompt that will generate the image. Should be descriptive and follow best practices for image generation',
              },
              type: {
                type: 'string',
                enum: ['custom', 'portrait', 'landscape', 'action', 'artistic', 'vintage'],
                description: 'The template category that best fits the intended use',
              },
              description: {
                type: 'string',
                description: 'A brief description explaining what this template is for and how it should be used',
              },
            },
            required: ['name', 'prompt', 'type', 'description'],
            additionalProperties: false,
          },
          strict: true,
        },
      },
    });

    // Handle edge cases
    if (response.status === 'incomplete') {
      if (response.incomplete_details?.reason === 'max_output_tokens') {
        return NextResponse.json(
          { error: 'Response was too long, please try a simpler description' },
          { status: 500 }
        );
      }
      if (response.incomplete_details?.reason === 'content_filter') {
        return NextResponse.json(
          { error: 'Content filter triggered, please try a different description' },
          { status: 400 }
        );
      }
    }

    // Check for refusal
    if (response.output && response.output[0]?.type === 'message' && response.output[0]?.content?.[0]?.type === 'refusal') {
      return NextResponse.json(
        { error: 'Unable to process this request. Please try a different description.' },
        { status: 400 }
      );
    }

    // Parse the structured output
    let templateData;
    try {
      const outputText = response.output_text;
      if (!outputText) {
        throw new Error('No output text received');
      }

      templateData = JSON.parse(outputText);

      // Validate with Zod schema
      const validatedTemplate = TemplateSchema.parse(templateData);

      return NextResponse.json({
        template: validatedTemplate,
        success: true
      });

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response:', response.output_text);
      return NextResponse.json(
        { error: 'Failed to generate template. Please try again.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('AI Assistant error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
