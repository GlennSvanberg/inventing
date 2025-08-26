'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/client";
import { LogoutButton } from "./logout-button";
import { ThemeSwitcher } from "./theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import { User, LogOut } from "lucide-react";

export function UserAccountSection() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="p-3 border-t border-border">
        <div className="flex justify-center">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!hasEnvVars) {
    return (
      <div className="p-3 border-t border-border">
        <div className="text-xs text-muted-foreground">
          Configure environment variables
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="p-3 border-t border-border space-y-3">
        {/* User Info */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User size={14} />
          <span className="truncate">{user.email}</span>
        </div>

        {/* Theme Switcher */}
        <div className="flex justify-center">
          <ThemeSwitcher />
        </div>

        {/* Logout Button */}
        <LogoutButton />
      </div>
    );
  }

  return (
    <div className="p-3 border-t border-border space-y-2">
      <Button asChild size="sm" variant="outline" className="w-full text-xs">
        <Link href="/auth/login" className="flex items-center gap-2">
          <LogOut size={12} />
          Sign in
        </Link>
      </Button>
      <Button asChild size="sm" variant="default" className="w-full text-xs">
        <Link href="/auth/sign-up" className="flex items-center gap-2">
          <User size={12} />
          Sign up
        </Link>
      </Button>
    </div>
  );
}
