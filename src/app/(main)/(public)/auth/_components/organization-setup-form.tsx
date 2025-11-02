"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const FormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Organization name must be at least 2 characters." })
    .max(100, { message: "Organization name must be less than 100 characters." })
    .regex(/^[a-zA-Z0-9\s\-_&.]+$/, {
      message: "Organization name can only contain letters, numbers, spaces, hyphens, underscores, ampersands, and periods.",
    }),
});

type FormValues = z.infer<typeof FormSchema>;

export function OrganizationSetupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [existingOrgs, setExistingOrgs] = useState<Array<{ id: string; name: string }>>([]);
  const [checkingOrgs, setCheckingOrgs] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
    },
  });

  // Handle hydration mismatch from browser extensions
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const { user: clerkUser } = useUser();

  // Check for existing organizations on mount
  useEffect(() => {
    async function checkOrganizations() {
      if (!clerkUser) {
        setCheckingOrgs(false);
        return;
      }

      try {
        // Fetch user's organizations from our API
        const response = await fetch("/api/auth/organizations");
        if (response.ok) {
          const data = await response.json();
          if (data.organizations && data.organizations.length > 0) {
            setExistingOrgs(data.organizations);
          }
        }
      } catch (error) {
        console.error("Error checking organizations:", error);
      } finally {
        setCheckingOrgs(false);
      }
    }

    if (clerkUser) {
      checkOrganizations();
    }
  }, [clerkUser]);

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);

    try {
      // Create organization and assign portal access via API
      const response = await fetch("/api/auth/create-organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: data.name }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error("Failed to create organization", {
          description: errorData.error || "An error occurred while creating your organization.",
        });
        setIsLoading(false);
        return;
      }

      const result = await response.json();

      toast.success("Organization created successfully", {
        description: "Redirecting to dashboard...",
      });

      // Invalidate cache and wait for session to update, then redirect
      // Use a longer delay to ensure database transaction commits
      setTimeout(() => {
        // Force full page reload to ensure fresh data
        window.location.href = "/dashboard";
      }, 1500);
    } catch (error) {
      console.error("Error creating organization:", error);
      toast.error("Failed to create organization", {
        description: "An unexpected error occurred. Please try again.",
      });
      setIsLoading(false);
    }
  };

  const handleSelectOrganization = async (organizationId: string) => {
    setIsLoading(true);

    try {
      // Assign portal access for selected organization
      const portalAccessResponse = await fetch("/api/auth/setup-organization", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ organizationId }),
      });

      if (!portalAccessResponse.ok) {
        const errorData = await portalAccessResponse.json();
        toast.error("Failed to assign portal access", {
          description: errorData.error || "Couldn't assign portal access.",
        });
        setIsLoading(false);
        return;
      }

      toast.success("Organization selected", {
        description: "Redirecting to dashboard...",
      });

      // Invalidate cache and wait for session to update, then redirect
      // Use a longer delay to ensure database transaction commits
      setTimeout(() => {
        // Force full page reload to ensure fresh data
        window.location.href = "/dashboard";
      }, 1500);
    } catch (error) {
      console.error("Error selecting organization:", error);
      toast.error("Failed to select organization", {
        description: "An unexpected error occurred. Please try again.",
      });
      setIsLoading(false);
    }
  };

  // Don't render until hydrated
  if (!isHydrated || checkingOrgs) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-muted animate-pulse rounded"></div>
          <div className="h-10 bg-muted animate-pulse rounded"></div>
        </div>
        <div className="h-10 bg-muted animate-pulse rounded"></div>
      </div>
    );
  }

  // If user has existing organizations, show selection UI
  if (existingOrgs.length > 0) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Select an Organization</h3>
          <p className="text-sm text-muted-foreground">
            You belong to {existingOrgs.length} organization{existingOrgs.length > 1 ? "s" : ""}. Select one to continue.
          </p>
        </div>
        <div className="space-y-2">
          {existingOrgs.map((org) => (
            <Button
              key={org.id}
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleSelectOrganization(org.id)}
              disabled={isLoading}
            >
              {org.name}
            </Button>
          ))}
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or</span>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Create New Organization</h3>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="org-name-new">Organization Name</FormLabel>
                  <FormControl>
                    <Input
                      id="org-name-new"
                      type="text"
                      placeholder="My Company"
                      autoComplete="organization"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Creating organization..." : "Create Organization"}
            </Button>
          </form>
        </Form>
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
              <FormLabel htmlFor="org-name">Organization Name</FormLabel>
              <FormControl>
                  <Input
                    id="org-name"
                    type="text"
                    placeholder="My Company"
                    autoComplete="organization"
                    {...field}
                  />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full" type="submit" disabled={isLoading}>
          {isLoading ? "Creating organization..." : "Create Organization"}
        </Button>
      </form>
    </Form>
  );
}
