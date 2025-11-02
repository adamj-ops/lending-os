"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignUp, useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  safeSetActive, 
  handleSessionError, 
  getRedirectPath 
} from "@/lib/clerk-session-utils";

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { user, isLoaded: isUserLoaded } = useUser();
  
  const [code, setCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    // Get email from URL or sessionStorage
    const emailParam = searchParams.get("email");
    const storedEmail = sessionStorage.getItem('pendingVerificationEmail');
    setEmail(emailParam || storedEmail || "");
  }, [searchParams]);

  // Redirect if already signed in - prevent showing verification form
  useEffect(() => {
    if (isUserLoaded && user) {
      // User is already signed in, redirect to dashboard
      const redirectTo = getRedirectPath(null);
      window.location.href = redirectTo;
    }
  }, [user, isUserLoaded]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent verification if already authenticated
    if (user) {
      const redirectTo = getRedirectPath(null);
      window.location.href = redirectTo;
      return;
    }

    if (!isLoaded || !signUp) {
      return;
    }

    // Prevent duplicate submissions
    if (isVerifying) {
      return;
    }

    setIsVerifying(true);

    try {
      // Attempt email address verification
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        if (!completeSignUp.createdSessionId) {
          throw new Error("No session created");
        }
        
        // Use safe setActive to prevent session conflicts
        const { success, error } = await safeSetActive(
          setActive,
          completeSignUp.createdSessionId,
          {
            onConflict: () => {
              // Session already active - redirect to dashboard
              console.log("Session already active during email verification");
              const redirectTo = getRedirectPath(null);
              window.location.href = redirectTo;
            },
            onError: (err) => {
              console.error("setActive error during verification:", err);
            }
          }
        );

        if (!success && error) {
          // If setActive failed, handle the error
          handleSessionError(error, {
            onConflict: () => {
              const redirectTo = getRedirectPath(null);
              window.location.href = redirectTo;
            },
            onOtherError: (message) => {
              toast.error("Verification error", {
                description: message,
              });
              setIsVerifying(false);
            }
          });
          return;
        }

        // Bootstrap user in DB
        try {
          await fetch("/api/auth/bootstrap", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });
        } catch (error) {
          console.error("Bootstrap failed:", error);
          // Continue anyway - defensive bootstrap will catch it
        }

        // Clear stored email
        sessionStorage.removeItem('pendingVerificationEmail');

        toast.success("Email verified successfully", {
          description: "Redirecting to organization setup...",
        });

        // Redirect to organization setup
        setTimeout(() => {
          window.location.href = "/auth/setup-organization";
        }, 1000);
      } else {
        toast.error("Verification incomplete", {
          description: "Please try again or contact support.",
        });
        setIsVerifying(false);
      }
    } catch (error: any) {
      console.error("Verification error:", error);
      
      // Handle session conflicts and other errors
      handleSessionError(error, {
        onConflict: () => {
          // User is already signed in, redirect to dashboard
          toast.info("Already signed in", {
            description: "Redirecting to dashboard...",
          });
          const redirectTo = getRedirectPath(null);
          setTimeout(() => {
            window.location.href = redirectTo;
          }, 500);
        },
        onNetworkError: () => {
          toast.error("Network error", {
            description: "Please check your connection and try again.",
          });
          setIsVerifying(false);
        },
        onOtherError: (message) => {
          toast.error("Verification failed", {
            description: message || "Invalid verification code. Please try again.",
          });
          setIsVerifying(false);
        }
      });
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || !signUp) {
      return;
    }

    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      toast.success("Verification code resent", {
        description: "Please check your email for a new code.",
      });
    } catch (error: any) {
      console.error("Resend error:", error);
      toast.error("Failed to resend code", {
        description: error?.errors?.[0]?.message || "Please try again.",
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Verify your email</h1>
          <p className="text-muted-foreground">
            We sent a verification code to {email}
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              type="text"
              placeholder="Enter 6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              required
              autoFocus
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isVerifying || code.length < 6}
          >
            {isVerifying ? "Verifying..." : "Verify Email"}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={handleResendCode}
              disabled={isVerifying}
            >
              Didn't receive a code? Resend
            </Button>
          </div>
        </form>

        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/auth/v2/register")}
          >
            Back to registration
          </Button>
        </div>
      </div>
    </div>
  );
}
