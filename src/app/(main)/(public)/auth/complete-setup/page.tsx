"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CompleteSetupPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);

  const bootstrap = async () => {
    setError(null);
    setRetrying(true);

    try {
      const response = await fetch("/api/auth/bootstrap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        // Bootstrap successful, redirect to organization setup
        router.push("/auth/setup-organization");
      } else {
        const data = await response.json();
        setError(data.details || "Failed to complete setup. Please try again.");
        setRetrying(false);
      }
    } catch (err) {
      console.error("Bootstrap error:", err);
      setError("An error occurred. Please try again.");
      setRetrying(false);
    }
  };

  useEffect(() => {
    // Auto-run bootstrap on mount
    bootstrap();
  }, []);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Setup Error</h1>
            <p className="text-destructive">{error}</p>
          </div>

          <Button
            onClick={bootstrap}
            disabled={retrying}
            className="w-full"
          >
            {retrying ? "Retrying..." : "Try Again"}
          </Button>

          <div>
            <Button
              variant="ghost"
              onClick={() => {
                // Sign out and return to login
                window.location.href = "/auth/login";
              }}
            >
              Return to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-border border-t-foreground" />
          <h1 className="text-3xl font-bold text-foreground">
            Completing Your Account Setup
          </h1>
          <p className="text-muted-foreground">
            Please wait while we set up your account...
          </p>
        </div>
      </div>
    </div>
  );
}
