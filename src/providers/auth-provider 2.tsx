"use client";

import { createContext, useContext, ReactNode } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";

export interface User {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Get Clerk user
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();

  // Fetch additional user data (organization, role) from our API
  const {
    data: user,
    isLoading: isApiLoading,
    refetch,
  } = useQuery({
    queryKey: ["auth", "me", clerkUser?.id],
    queryFn: async (): Promise<User | null> => {
      if (!clerkUser) {
        return null;
      }

      try {
        const response = await fetch("/api/auth/me");
        if (!response.ok) {
          // Not authenticated - return null instead of throwing
          return null;
        }
        const data = await response.json();
        return data.user;
      } catch (error) {
        // Network or other errors - return null
        console.debug("Auth check failed (user not logged in):", error);
        return null;
      }
    },
    enabled: !!clerkUser && isClerkLoaded,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    // Don't throw errors, just return null for unauthenticated users
    throwOnError: false,
    // Don't block rendering while loading auth state
    refetchOnMount: false,
  });

  const isLoading = !isClerkLoaded || isApiLoading;

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated: !!clerkUser && !!user,
    refetch,
  };

  // Always render children, don't block on auth check
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

