import { ReactNode } from "react";

import type { Metadata, Viewport } from "next";

import { ClerkProvider } from "@clerk/nextjs";

import { Toaster } from "@/components/ui/sonner";
import { APP_CONFIG } from "@/config/app-config";
import { getPreference } from "@/server/server-actions";
import { PreferencesStoreProvider } from "@/stores/preferences/preferences-provider";
import { ReactQueryProvider } from "@/providers/query-client-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { THEME_MODE_VALUES, type ThemeMode } from "@/types/preferences/theme";

import "./globals.css";

export function generateViewport(): Viewport {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: "#3b82f6",
  };
}

export const metadata: Metadata = {
  title: APP_CONFIG.meta.title,
  description: APP_CONFIG.meta.description,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Lending OS Inspector",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const themeMode = await getPreference<ThemeMode>("theme_mode", THEME_MODE_VALUES, "dark");

  return (
    <ClerkProvider>
      <html
        lang="en"
        className={themeMode === "dark" ? "dark" : ""}
        suppressHydrationWarning
      >
        <body className="min-h-screen antialiased">
          <ReactQueryProvider>
            <AuthProvider>
              <PreferencesStoreProvider themeMode={themeMode}>
                {children}
                <Toaster />
              </PreferencesStoreProvider>
            </AuthProvider>
          </ReactQueryProvider>
        {/* Service Worker temporarily disabled due to browser extension conflicts */}
        {/* <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('ServiceWorker registration successful');
                    })
                    .catch(function(err) {
                      console.log('ServiceWorker registration failed');
                    });
                });
              }
            `,
          }}
        /> */}
        </body>
      </html>
    </ClerkProvider>
  );
}
