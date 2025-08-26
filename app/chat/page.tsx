import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MessageSquare } from "lucide-react";

export default async function ChatPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <MessageSquare size="16" strokeWidth={2} />
          Welcome to Inventing Chat! This is your personal chat interface.
        </div>
      </div>
      <div className="flex flex-col gap-8 items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h1 className="font-bold text-3xl mb-4">Hello World!</h1>
          <p className="text-muted-foreground text-lg">
            Your chat application is ready to be built.
          </p>
        </div>
      </div>
    </div>
  );
}
