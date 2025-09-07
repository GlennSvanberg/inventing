import { AuthButton } from "@/components/auth-button";
import { Hero } from "@/components/hero";
import { ThemeSwitcher } from "@/components/theme-switcher";
import PublicGallery from "@/components/public-gallery";
import { Button } from "@/components/ui/button";
import { hasEnvVars } from "@/lib/utils";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>AI Image Studio</Link>
            </div>
            <div className="flex gap-4 items-center">
              <Link href="/how-it-works" className="text-sm hover:underline">
                How It Works
              </Link>
              {!hasEnvVars ? <div>Configure environment variables</div> : <AuthButton />}
            </div>
          </div>
        </nav>
        <div className="flex-1 flex flex-col max-w-7xl mx-auto">
          <Hero />

          {/* How It Works Section */}
          <section className="py-20 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Create stunning AI images in just a few simple steps
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Choose a Template</h3>
                  <p className="text-muted-foreground">
                    Browse our collection of professionally designed AI templates or create your own
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Upload Your Photo</h3>
                  <p className="text-muted-foreground">
                    Add your photo to personalize the template and make it uniquely yours
                  </p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Generate & Download</h3>
                  <p className="text-muted-foreground">
                    Our AI creates your custom image instantly - download and share your creation
                  </p>
                </div>
              </div>
            </div>
          </section>


          {/* Community Gallery Section */}
          <section className="py-20 px-4">
            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Community Gallery</h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                  See what our community is creating and get inspired
                </p>
                {hasEnvVars && !user && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 max-w-2xl mx-auto">
                    <h3 className="font-semibold mb-2">Ready to create your own?</h3>
                    <p className="text-muted-foreground mb-4">
                      Join thousands of creators and start making amazing AI images today.
                    </p>
                    <Link href="/auth/login">
                      <Button>
                        Sign Up Free
                      </Button>
                    </Link>
                  </div>
                )}
              </div>

              <PublicGallery />
            </div>
          </section>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs py-16">
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
