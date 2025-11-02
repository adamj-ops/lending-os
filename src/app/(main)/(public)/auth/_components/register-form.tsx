"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { useSignUp, useUser } from "@clerk/nextjs";
import { 
  safeSetActive, 
  handleSessionError, 
  getRedirectPath 
} from "@/lib/clerk-session-utils";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const FormSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string().min(6, { message: "Confirm Password must be at least 6 characters." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export function RegisterForm() {
  const router = useRouter();
  const { isLoaded, signUp, setActive } = useSignUp();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Handle hydration mismatch from browser extensions
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Redirect if already signed in - prevent showing registration form
  useEffect(() => {
    if (isUserLoaded && user) {
      // User is already signed in, redirect to dashboard
      const redirectTo = getRedirectPath(null);
      window.location.href = redirectTo;
    }
  }, [user, isUserLoaded]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    // Prevent submission if already authenticated
    if (user) {
      const redirectTo = getRedirectPath(null);
      window.location.href = redirectTo;
      return;
    }

    if (!isLoaded || !signUp) {
      return;
    }

    // Prevent duplicate submissions
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      // Split name into firstName and lastName for Clerk
      const nameParts = data.name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const result = await signUp.create({
        emailAddress: data.email,
        password: data.password,
        firstName,
        lastName: lastName || undefined, // Optional if not provided
      });

      if (result.status === "complete") {
        if (!result.createdSessionId) {
          throw new Error("No session created");
        }
        
        // Use safe setActive to prevent session conflicts
        const { success, error } = await safeSetActive(
          setActive,
          result.createdSessionId,
          {
            onConflict: () => {
              // Session already active - redirect to dashboard
              console.log("Session already active during registration");
              const redirectTo = getRedirectPath(null);
              window.location.href = redirectTo;
            },
            onError: (err) => {
              console.error("setActive error during registration:", err);
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
              toast.error("Registration error", {
                description: message,
              });
              setIsLoading(false);
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
          // Continue anyway - defensive bootstrap in middleware/getSession will catch it
        }

        toast.success("Registration successful", {
          description: "Setting up your account...",
        });

        // Redirect to organization setup (new users need to set up organization)
        window.location.href = "/auth/setup-organization";
      } else if (result.status === "missing_requirements") {
        // Email verification required
        toast.info("Verification required", {
          description: "Please check your email to verify your account.",
        });

        // Store email for verification page
        sessionStorage.setItem('pendingVerificationEmail', data.email);

        // Redirect to verification page
        router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
      } else {
        // Other incomplete statuses
        toast.info("Please complete your registration", {
          description: "Additional steps are required to complete your account setup.",
        });
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
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
          setIsLoading(false);
        },
        onOtherError: (message) => {
          toast.error("Registration failed", {
            description: message || "An unexpected error occurred. Please try again.",
          });
          setIsLoading(false);
        }
      });
    }
  };

  // Don't render until hydrated to prevent mismatch
  if (!isHydrated) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded"></div>
          <div className="h-10 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded"></div>
          <div className="h-10 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded"></div>
          <div className="h-10 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded"></div>
          <div className="h-10 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="h-10 bg-muted animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="register-name">Full Name</FormLabel>
              <FormControl>
                <Input 
                  id="register-name"
                  type="text" 
                  placeholder="John Doe" 
                  autoComplete="name" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="register-email">Email Address</FormLabel>
              <FormControl>
                <Input 
                  id="register-email"
                  type="email" 
                  placeholder="you@example.com" 
                  autoComplete="email" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="register-password">Password</FormLabel>
              <FormControl>
                <Input 
                  id="register-password"
                  type="password" 
                  placeholder="••••••••" 
                  autoComplete="new-password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="register-confirm-password">Confirm Password</FormLabel>
              <FormControl>
                <Input 
                  id="register-confirm-password"
                  type="password" 
                  placeholder="••••••••" 
                  autoComplete="new-password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit" disabled={isLoading || !isLoaded}>
          {isLoading ? "Creating account..." : "Register"}
        </Button>
      </form>
    </Form>
  );
}
