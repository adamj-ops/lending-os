"use client";

import { useEffect, useState } from "react";

import { useUser } from "@clerk/nextjs";

import { AuthFlow } from "@/components/shared/auth-flow";
import { getRedirectPath } from "@/lib/clerk-session-utils";

export default function BorrowerLoginPage() {
  const [mounted, setMounted] = useState(false);
  const { user, isLoaded } = useUser();

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isLoaded && user) {
      // Redirect to onboarding for borrowers
      window.location.href = "/onboarding";
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
        role="borrower"
        mode="signin"
      />
    </div>
  );
}
