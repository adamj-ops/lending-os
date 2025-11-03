/**
 * Clerk Session Utilities
 * 
 * Production-grade session management utilities for Clerk authentication.
 * Prevents "session already exists" errors and handles session conflicts gracefully.
 */

import type { SignInResource, SignUpResource } from "@clerk/types";

/**
 * Check if an error is related to session conflicts
 */
export function isSessionConflictError(error: any): boolean {
  if (!error) return false;

  const errorMessage = 
    error?.message?.toLowerCase() || 
    error?.errors?.[0]?.message?.toLowerCase() || 
    error?.clerkError?.message?.toLowerCase() ||
    "";

  const sessionConflictKeywords = [
    "session already exists",
    "already signed in",
    "active session",
    "session conflict",
    "already authenticated",
  ];

  return sessionConflictKeywords.some(keyword => 
    errorMessage.includes(keyword)
  );
}

/**
 * Check if an error is a network error
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error?.message?.toLowerCase() || "";
  return (
    errorMessage.includes("network") ||
    errorMessage.includes("fetch") ||
    errorMessage.includes("connection") ||
    errorMessage.includes("timeout")
  );
}

/**
 * Extract user-friendly error message from Clerk error
 */
export function extractErrorMessage(error: any): string {
  if (!error) return "An unexpected error occurred. Please try again.";

  // Try multiple error message locations
  const message = 
    error?.errors?.[0]?.message ||
    error?.clerkError?.message ||
    error?.message ||
    "An unexpected error occurred. Please try again.";

  return message;
}

/**
 * Safe wrapper for setActive that checks for existing sessions
 * Prevents "session already exists" errors
 */
export async function safeSetActive(
  setActive: (params: { session: string }) => Promise<void>,
  sessionId: string,
  options: {
    onConflict?: () => void | Promise<void>;
    onError?: (error: any) => void | Promise<void>;
  } = {}
): Promise<{ success: boolean; error?: any }> {
  try {
    await setActive({ session: sessionId });
    return { success: true };
  } catch (error: any) {
    // If it's a session conflict, handle gracefully
    if (isSessionConflictError(error)) {
      console.log("Session already active, skipping setActive");
      
      if (options.onConflict) {
        await options.onConflict();
      }
      
      return { success: true }; // Treat as success since session is already active
    }

    // For other errors, call error handler if provided
    if (options.onError) {
      await options.onError(error);
    }

    return { success: false, error };
  }
}

/**
 * Check if user should be redirected (already authenticated)
 */
export function getRedirectPath(fromParam: string | null): string {
  // Don't redirect to root - always use /dashboard instead
  return (fromParam && fromParam !== "/") ? fromParam : "/dashboard";
}

/**
 * Handle session errors consistently across auth flows
 */
export function handleSessionError(
  error: any,
  options: {
    onConflict?: () => void | Promise<void>;
    onNetworkError?: () => void | Promise<void>;
    onOtherError?: (message: string) => void | Promise<void>;
  } = {}
): void {
  if (isSessionConflictError(error)) {
    // Session conflict - user is already authenticated
    if (options.onConflict) {
      options.onConflict();
    }
    return;
  }

  if (isNetworkError(error)) {
    // Network error
    if (options.onNetworkError) {
      options.onNetworkError();
    } else if (options.onOtherError) {
      options.onOtherError("Network error. Please check your connection and try again.");
    }
    return;
  }

  // Other error
  const message = extractErrorMessage(error);
  if (options.onOtherError) {
    options.onOtherError(message);
  }
}

