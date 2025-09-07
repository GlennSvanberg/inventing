'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface FeaturedImage {
  id: string;
  url: string;
  name: string;
  templateTitle?: string;
}

export function Hero() {
  const [featuredImages, setFeaturedImages] = useState<FeaturedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedImages = async () => {
      try {
        const response = await fetch('/api/image/gallery/public?page=1&limit=6');
        if (response.ok) {
          const data = await response.json();
          setFeaturedImages(data.images.slice(0, 6) || []);
        }
      } catch (error) {
        console.error('Error loading featured images:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedImages();
  }, []);

  return (
    <div className="relative w-full">
      {/* Main Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Powered by AI Innovation
            </div>

            {/* Beta Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6 animate-pulse">
              <Sparkles className="w-4 h-4" />
              BETA - FREE FOR LIMITED TIME
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              Create
              <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent"> Amazing</span>
              <br />
              AI Images
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Transform your ideas into stunning visuals with our AI-powered image studio.
              Early access available now - completely free during beta.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/image/templates/browse">
                <Button size="lg" className="text-lg px-8 py-6 h-auto">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Creating
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto">
                  See How It Works
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="lg" className="text-lg px-8 py-6 h-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Featured Images Showcase */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">✨ Community Creations</h2>
              <p className="text-muted-foreground">See what our community is creating</p>
            </div>

            {!isLoading && featuredImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {featuredImages.map((image, index) => (
                  <Card key={image.id} className={`overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}>
                    <div className={`relative ${index === 0 ? 'aspect-square md:aspect-square' : 'aspect-square'} overflow-hidden bg-muted`}>
                      <Image
                        src={image.url}
                        alt={image.name}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-500"
                        sizes={index === 0 ? "(max-width: 768px) 50vw, 33vw" : "(max-width: 768px) 50vw, 16vw"}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                      {image.templateTitle && (
                        <div className="absolute bottom-2 left-2 right-2">
                          <p className="text-xs text-white bg-black/70 px-2 py-1 rounded truncate">
                            {image.templateTitle}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
