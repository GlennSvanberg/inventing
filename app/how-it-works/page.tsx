'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Upload, Sparkles, Download, Palette } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" className="gap-2">
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">How It Works</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            See AI Magic in Action
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Watch how we transform your photos into stunning AI-generated images using our Caring Companion Portrait template
          </p>
        </div>

        {/* Main Demo Section */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {/* Step 1: Template */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                1. Choose Template
              </div>
            </div>
            <CardContent className="p-0">
              <div className="aspect-square relative bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                <Image
                  src="/demo/template-caring-companion.jpg"
                  alt="Caring Companion Portrait Template"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image doesn't exist
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk3OTdhNyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNhcmluZyBDb21wYW5pb248L3RleHQ+Cjx0ZXh0IHg9IjIwMCIgeT0iMjMwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk3OTdhNyIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNvbXBhbmlvbiBQb3J0cmFpdDwvdGV4dD4KPC9zdmc+';
                  }}
                />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-semibold text-lg mb-1">Caring Companion Portrait</h3>
                  <p className="text-white/90 text-sm">
                    A loving portrait template that creates warm, compassionate character portraits
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plus Icon */}
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>

          {/* Step 2: User Photo */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                2. Add Your Photo
              </div>
            </div>
            <CardContent className="p-0">
              <div className="aspect-square relative bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
                <Image
                  src="/demo/user-photo-example.jpg"
                  alt="User's original photo"
                  fill
                  className="object-cover"
                  onError={(e) => {
                    // Fallback to placeholder if image doesn't exist
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjZjNmNGY2Ii8+CjxjaXJjbGUgY3g9IjIwMCIgY3k9IjE1MCIgcj0iNjAiIGZpbGw9IiM5Nzk3YTciLz4KPHBhdGggZD0iTTIwMCAyMTBMMjIwIDI4MEwyMDAgMzAwTDE4MCAyODB6IiBmaWxsPSIjOTc5N2E3Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMzUwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk3OTdhNyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+WW91ciBQaG90bzwvdGV4dD4KPC9zdmc+';
                  }}
                />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-semibold text-lg mb-1">Your Original Photo</h3>
                  <p className="text-white/90 text-sm">
                    Any photo of yourself or someone you love
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Arrow to Result */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4 text-muted-foreground">
            <Sparkles className="w-6 h-6" />
            <span className="text-lg font-medium">AI Magic Happens</span>
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        {/* Step 3: Result */}
        <Card className="max-w-2xl mx-auto relative overflow-hidden mb-16">
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
              3. Final Result ✨
            </div>
          </div>
          <CardContent className="p-0">
            <div className="aspect-square relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <Image
                src="/demo/final-result-example.jpg"
                alt="AI-generated result"
                fill
                className="object-cover"
                onError={(e) => {
                  // Fallback to placeholder if image doesn't exist
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjZjNmNGY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTkwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk3OTdhNyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+QUM8L3RleHQ+Cjx0ZXh0IHg9IjIwMCIgeT0iMjIwIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk3OTdhNyIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TWFnY2FsbHkg8J+RiDwvdGV4dD4KPHRleHQgeD0iMjAwIiB5PSIyNTAiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjOTc5N2E3IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5HZW5lcmF0ZWQhPC90ZXh0Pgo8L3N2Zz4=';
                }}
              />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-semibold text-lg mb-1">AI-Generated Portrait</h3>
                <p className="text-white/90 text-sm">
                  Your photo transformed into a beautiful, caring companion character
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Process Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-primary">1</span>
            </div>
            <h3 className="font-semibold mb-2">Select Template</h3>
            <p className="text-muted-foreground text-sm">
              Choose from our library of professionally designed AI templates
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-primary">2</span>
            </div>
            <h3 className="font-semibold mb-2">Upload Your Photo</h3>
            <p className="text-muted-foreground text-sm">
              Add your photo using drag & drop, camera, or URL upload
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl font-bold text-primary">3</span>
            </div>
            <h3 className="font-semibold mb-2">Generate & Download</h3>
            <p className="text-muted-foreground text-sm">
              Our AI creates your custom image instantly - download and share
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Create Your Own?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our beta and start creating amazing AI images with templates like the Caring Companion Portrait
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login">
              <Button size="lg" className="px-8">
                <Palette className="w-5 h-5 mr-2" />
                Start Creating Now
              </Button>
            </Link>
            <Link href="/image/templates/browse">
              <Button variant="outline" size="lg" className="px-8">
                <Download className="w-5 h-5 mr-2" />
                Browse Templates
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
