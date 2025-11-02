"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSignIn, useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  safeSetActive, 
  handleSessionError, 
  getRedirectPath
} from "@/lib/clerk-session-utils";

const FormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  remember: z.boolean().optional(),
});

export function LoginForm() {
  const router = useRouter();
  const { isLoaded, signIn, setActive } = useSignIn();
  const { user, isLoaded: isUserLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  // Redirect if already signed in - prevent showing login form
  useEffect(() => {
    if (isUserLoaded && user) {
      // User is already signed in, redirect immediately
      const urlParams = new URLSearchParams(window.location.search);
      const fromParam = urlParams.get("from");
      const redirectTo = getRedirectPath(fromParam);
      window.location.href = redirectTo;
    }
  }, [user, isUserLoaded]);

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    // Prevent submission if already authenticated
    if (user) {
      const urlParams = new URLSearchParams(window.location.search);
      const fromParam = urlParams.get("from");
      const redirectTo = getRedirectPath(fromParam);
      window.location.href = redirectTo;
      return;
    }

    if (!isLoaded || !signIn) {
      return;
    }

    // Prevent duplicate submissions
    if (isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
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
              // Session already active - this is fine, just redirect
              console.log("Session already active, redirecting");
            },
            onError: (err) => {
              console.error("setActive error:", err);
            }
          }
        );

        if (!success && error) {
          // If setActive failed with non-conflict error, handle it
          handleSessionError(error, {
            onConflict: () => {
              // This shouldn't happen since safeSetActive handles conflicts
              const urlParams = new URLSearchParams(window.location.search);
              const fromParam = urlParams.get("from");
              const redirectTo = getRedirectPath(fromParam);
              window.location.href = redirectTo;
            },
            onOtherError: (message) => {
              toast.error("Login error", {
                description: message,
              });
              setIsLoading(false);
            }
          });
          return;
        }

        toast.success("Login successful", {
          description: "Redirecting to dashboard...",
        });

        // Get redirect destination
        const urlParams = new URLSearchParams(window.location.search);
        const fromParam = urlParams.get("from");
        const redirectTo = getRedirectPath(fromParam);

        // Use href for full page reload - this ensures middleware runs with new session
        window.location.href = redirectTo;
      } else {
        // Handle incomplete sign-in (e.g., MFA required)
        toast.error("Login incomplete", {
          description: "Additional verification may be required.",
        });
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle session conflicts and other errors
      handleSessionError(error, {
        onConflict: () => {
          // User is already signed in, redirect to dashboard
          toast.info("Already signed in", {
            description: "Redirecting to dashboard...",
          });
          const urlParams = new URLSearchParams(window.location.search);
          const fromParam = urlParams.get("from");
          const redirectTo = getRedirectPath(fromParam);
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
          toast.error("Login failed", {
            description: message || "Invalid email or password",
          });
          setIsLoading(false);
        }
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" suppressHydrationWarning>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor="login-email">Email Address</FormLabel>
              <FormControl>
                <Input 
                  id="login-email" 
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
              <FormLabel htmlFor="login-password">Password</FormLabel>
              <FormControl>
                <Input 
                  id="login-password" 
                  type="password" 
                  placeholder="••••••••" 
                  autoComplete="current-password" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="remember"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center">
              <FormControl suppressHydrationWarning>
                <Checkbox
                  id="login-remember"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="size-4"
                />
              </FormControl>
              <FormLabel htmlFor="login-remember" className="text-muted-foreground ml-1 text-sm font-medium">
                Remember me for 30 days
              </FormLabel>
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit" disabled={isLoading || !isLoaded}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
    </Form>
  );
}
