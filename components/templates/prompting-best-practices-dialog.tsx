'use client';

import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export function PromptingBestPracticesDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <HelpCircle className="w-4 h-4 mr-2" />
          Prompting Tips
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5" />
            AI Prompting Best Practices
          </DialogTitle>
          <DialogDescription>
            Learn how to write effective prompts for better image generation results
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">🎯 Core Principle</h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Describe the scene, don't just list keywords.</strong> A narrative, descriptive paragraph will almost always produce better, more coherent results than disconnected words.
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">👤 Important: User Image Integration</h3>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Your templates will always include one uploaded user image (usually a person). The AI will automatically integrate this person into your described scene. Focus your prompt on the setting, mood, and style rather than describing the person.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Prompt Templates for Different Styles</h3>

            <div className="grid gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2 text-green-700 dark:text-green-300">📸 Photorealistic Scenes</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  For realistic results, use photography terms and be specific about technical details.
                </p>
                <div className="bg-muted p-3 rounded text-sm font-mono">
                  "A photorealistic [shot type] of [subject/scene], set in [environment]. Illuminated by [lighting], creating a [mood] atmosphere. Captured with [camera details], emphasizing [key details]."
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Example: "A photorealistic close-up portrait in a cozy coffee shop interior, softly lit by warm morning light, creating a welcoming atmosphere."
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2 text-purple-700 dark:text-purple-300">🎨 Stylized & Artistic</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  For creative styles, be explicit about the artistic approach.
                </p>
                <div className="bg-muted p-3 rounded text-sm font-mono">
                  "A [art style] rendering of [subject/scene] featuring [key characteristics] with a [color palette]. [Additional style details]."
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Example: "A watercolor painting of a mountain landscape with soft brushstrokes and a cool blue color palette, in the style of traditional landscape art."
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2 text-orange-700 dark:text-orange-300">🏷️ Text in Images</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  For images with text, be clear about typography and placement.
                </p>
                <div className="bg-muted p-3 rounded text-sm font-mono">
                  "Create [image type] with the text '[your text]' in [font style description]. Design should be [style], with [colors]."
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Example: "Create a motivational poster with the text 'Dream Big' in bold, modern sans-serif font. Design should be minimalist with black text on white background."
                </p>
              </div>

              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2 text-teal-700 dark:text-teal-300">📐 Minimalist Design</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Perfect for clean, professional results with negative space.
                </p>
                <div className="bg-muted p-3 rounded text-sm font-mono">
                  "A minimalist composition featuring [subject] positioned in [frame position]. Background is [color/description], with significant negative space."
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Example: "A minimalist composition featuring a single flower in the center-right of the frame. Background is pure white, creating clean negative space."
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">💡 Best Practices</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Be Hyper-Specific:</strong> More detail = more control. Instead of "beach," say "tropical beach at sunset with palm trees and gentle waves."</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Provide Context:</strong> Explain the purpose or mood. "Professional headshot for a corporate website" vs just "portrait."</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Iterate Gradually:</strong> Make small refinements rather than complete rewrites. Start with the basic scene, then adjust lighting, colors, etc.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Use Photography Terms:</strong> Words like "wide-angle," "close-up," "soft lighting," "dramatic shadows" give precise control.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-500 mt-1">•</span>
                <span><strong>Think Composition:</strong> Consider foreground/background, rule of thirds, focal points, and visual hierarchy.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-lg">⚠️ Things to Keep in Mind</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span><strong>User Image Focus:</strong> The uploaded person photo will be automatically integrated. Describe the scene around them.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span><strong>Style Consistency:</strong> If using reference images, the AI will match their style, lighting, and composition.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span><strong>Detail Preservation:</strong> For important elements (faces, logos), describe them specifically to maintain quality.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-500 mt-1">•</span>
                <span><strong>Positive Descriptions:</strong> Focus on what you want rather than what you don't want. Say "sunny day" instead of "not cloudy."</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
