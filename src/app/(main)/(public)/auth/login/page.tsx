"use client";

import { useEffect, useState } from "react";

import { useUser } from "@clerk/nextjs";

import { AuthFlow } from "@/components/shared/auth-flow";
import { getRedirectPath } from "@/lib/clerk-session-utils";

export default function LoginPage() {
  const [mounted, setMounted] = useState(false);
  const { user, isLoaded } = useUser();

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isLoaded && user) {
      const redirectTo = getRedirectPath(null);
      window.location.href = redirectTo;
    }
  }, [user, isLoaded]);

  // Prevent flash before hydration
  if (!mounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg-primary)]">
      <AuthFlow
        open={true}
        onOpenChange={() => {
          // Can't close on dedicated login page
        }}
        role="investor"
        mode="signin"
      />
    </div>
  );
}
