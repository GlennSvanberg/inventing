import { MessageSquare, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <div className="flex gap-4 justify-center items-center">
        <MessageSquare className="w-12 h-12 text-primary" />
        <Sparkles className="w-8 h-8 text-primary animate-pulse" />
      </div>
      <h1 className="sr-only">Inventing - We Innovate</h1>
      <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
        Inventing -{" "}
        <span className="font-bold text-primary">We Innovate</span>
      </p>
      <p className="text-xl text-muted-foreground text-center max-w-2xl">
        Experience the future of conversation with our AI-powered chat platform.
        Connect, communicate, and innovate like never before.
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
