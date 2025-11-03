"use client";

import { useState } from "react";

import { useSignIn, useSignUp } from "@clerk/nextjs";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  safeSetActive,
  handleSessionError,
} from "@/lib/clerk-session-utils";

interface AuthFlowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: "investor" | "borrower";
  mode?: "signin" | "signup";
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateCode = (code: string): boolean => {
  return code.length === 6 && /^\d+$/.test(code);
};

const getRedirectUrl = (role: "investor" | "borrower"): string => {
  return role === "investor" ? "/dashboard" : "/onboarding";
};

export function AuthFlow({
  open,
  onOpenChange,
  role,
  mode: initialMode = "signin",
}: AuthFlowProps) {
  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isLoaded = mode === "signin" ? signInLoaded : signUpLoaded;

  const resetForm = () => {
    setStep(1);
    setEmail("");
    setCode("");
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    resetForm();
  };

  const redirectToPortal = () => {
    const redirectUrl = getRedirectUrl(role);
    window.location.href = redirectUrl;
  };

  const handleEmailSubmit = async () => {
    if (!validateEmail(email)) {
      toast.error("Invalid email", {
        description: "Please enter a valid email address.",
      });
      return;
    }

    if (!isLoaded) {
      toast.error("Not ready", {
        description: "Authentication system is loading. Please wait.",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "signin") {
        await handleSignInEmailSubmit();
      } else {
        await handleSignUpEmailSubmit();
      }
    } catch (error) {
      handleAuthError(error, "Email submission failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInEmailSubmit = async () => {
    if (!signIn) {
      throw new Error("Sign in not available");
    }

    await signIn.create({
      identifier: email,
      strategy: "email_code",
    });

    toast.success("Code sent", {
      description: "Check your email for the verification code.",
    });
    setStep(2);
  };

  const handleSignUpEmailSubmit = async () => {
    if (!signUp) {
      throw new Error("Sign up not available");
    }

    await signUp.create({
      emailAddress: email,
    });

    await signUp.prepareEmailAddressVerification({
      strategy: "email_code",
    });

    toast.success("Code sent", {
      description: "Check your email for the verification code.",
    });
    setStep(2);
  };

  const handleCodeSubmit = async () => {
    if (!validateCode(code)) {
      toast.error("Invalid code", {
        description: "Please enter a 6-digit verification code.",
      });
      return;
    }

    if (!isLoaded) {
      toast.error("Not ready", {
        description: "Authentication system is loading. Please wait.",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "signin") {
        await handleSignInCodeSubmit();
      } else {
        await handleSignUpCodeSubmit();
      }
    } catch (error) {
      handleAuthError(error, "Verification failed");
    }
  };

  const handleSignInCodeSubmit = async () => {
    if (!signIn || !setSignInActive) {
      throw new Error("Sign in not available");
    }

    const result = await signIn.attemptFirstFactor({
      strategy: "email_code",
      code,
    });

    if (result.status !== "complete" || !result.createdSessionId) {
      toast.error("Verification incomplete", {
        description: "Please try again.",
      });
      setIsLoading(false);
      return;
    }

    await activateSession(setSignInActive, result.createdSessionId, "Sign in successful");
  };

  const handleSignUpCodeSubmit = async () => {
    if (!signUp || !setSignUpActive) {
      throw new Error("Sign up not available");
    }

    const result = await signUp.attemptEmailAddressVerification({
      code,
    });

    if (result.status !== "complete" || !result.createdSessionId) {
      toast.error("Verification incomplete", {
        description: "Please try again.",
      });
      setIsLoading(false);
      return;
    }

    await activateSession(setSignUpActive, result.createdSessionId, "Sign up successful");
  };

  const activateSession = async (
    setActiveFunc: (params: { session: string }) => Promise<void>,
    sessionId: string,
    successMessage: string
  ) => {
    const { success, error } = await safeSetActive(setActiveFunc, sessionId, {
      onConflict: () => {
        console.log("Session already active, redirecting");
      },
      onError: (err) => {
        console.error("setActive error:", err);
      },
    });

    if (!success && error) {
      handleSessionError(error, {
        onConflict: redirectToPortal,
        onOtherError: (message) => {
          toast.error("Authentication error", {
            description: message,
          });
          setIsLoading(false);
        },
      });
      return;
    }

    toast.success(successMessage, {
      description: "Redirecting...",
    });

    handleClose();
    redirectToPortal();
  };

  const handleAuthError = (error: unknown, defaultMessage: string) => {
    console.error("Auth error:", error);
    handleSessionError(error, {
      onConflict: () => {
        toast.info("Already signed in", {
          description: "Redirecting...",
        });
        handleClose();
        setTimeout(redirectToPortal, 500);
      },
      onNetworkError: () => {
        toast.error("Network error", {
          description: "Please check your connection and try again.",
        });
        setIsLoading(false);
      },
      onOtherError: (message) => {
        toast.error(defaultMessage, {
          description: message || "Please try again.",
        });
        setIsLoading(false);
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-[var(--bg-primary)] w-full sm:max-w-md"
      >
        <SheetHeader>
          <SheetTitle className="text-[var(--text-primary)]">
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </SheetTitle>
          <SheetDescription className="text-[var(--text-secondary)]">
            {step === 1
              ? "Enter your email address to continue"
              : "Enter the 6-digit code sent to your email"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6">
          <Card className="bg-[var(--surface)] border border-[var(--border-primary)]">
            <CardContent className="pt-6">
              {step === 1 ? (
                <EmailStep
                  email={email}
                  setEmail={setEmail}
                  isLoading={isLoading}
                  isLoaded={isLoaded}
                  onSubmit={handleEmailSubmit}
                  mode={mode}
                  onToggleMode={toggleMode}
                />
              ) : (
                <CodeStep
                  code={code}
                  setCode={setCode}
                  email={email}
                  isLoading={isLoading}
                  isLoaded={isLoaded}
                  onSubmit={handleCodeSubmit}
                  onBack={() => {
                    setStep(1);
                    setCode("");
                  }}
                  mode={mode}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface EmailStepProps {
  email: string;
  setEmail: (email: string) => void;
  isLoading: boolean;
  isLoaded: boolean;
  onSubmit: () => void;
  mode: "signin" | "signup";
  onToggleMode: () => void;
}

function EmailStep({
  email,
  setEmail,
  isLoading,
  isLoaded,
  onSubmit,
  mode,
  onToggleMode,
}: EmailStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="auth-email" className="text-[var(--text-primary)]">
          Email Address
        </Label>
        <Input
          id="auth-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLoading) {
              onSubmit();
            }
          }}
          disabled={isLoading}
          autoComplete="email"
          className="bg-[var(--bg-primary)] text-[var(--text-primary)] border-[var(--border-primary)]"
        />
      </div>

      <Button
        variant="primary"
        className="w-full"
        onClick={onSubmit}
        disabled={isLoading || !isLoaded}
      >
        {isLoading ? "Sending code..." : "Continue"}
      </Button>

      <div className="text-center text-sm text-[var(--text-muted)]">
        {mode === "signin" ? (
          <>
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] font-medium"
            >
              Sign up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={onToggleMode}
              className="text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] font-medium"
            >
              Sign in
            </button>
          </>
        )}
      </div>
    </div>
  );
}

interface CodeStepProps {
  code: string;
  setCode: (code: string) => void;
  email: string;
  isLoading: boolean;
  isLoaded: boolean;
  onSubmit: () => void;
  onBack: () => void;
  mode: "signin" | "signup";
}

function CodeStep({
  code,
  setCode,
  email,
  isLoading,
  isLoaded,
  onSubmit,
  onBack,
  mode,
}: CodeStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="auth-code" className="text-[var(--text-primary)]">
          Verification Code
        </Label>
        <Input
          id="auth-code"
          type="text"
          placeholder="000000"
          value={code}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, "");
            if (value.length <= 6) {
              setCode(value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isLoading) {
              onSubmit();
            }
          }}
          disabled={isLoading}
          autoComplete="one-time-code"
          maxLength={6}
          className="bg-[var(--bg-primary)] text-[var(--text-primary)] border-[var(--border-primary)] text-center text-2xl tracking-widest"
        />
        <p className="text-xs text-[var(--text-muted)]">Code sent to {email}</p>
      </div>

      <Button
        variant="primary"
        className="w-full"
        onClick={onSubmit}
        disabled={isLoading || !isLoaded || code.length !== 6}
      >
        {isLoading ? "Verifying..." : mode === "signin" ? "Sign In" : "Sign Up"}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-[var(--accent-primary)] hover:text-[var(--accent-primary-hover)] font-medium"
          disabled={isLoading}
        >
          Use a different email
        </button>
      </div>
    </div>
  );
}
