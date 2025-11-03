import { dark } from '@clerk/themes';
import type { Appearance } from '@clerk/types';

/**
 * Clerk Appearance Configuration
 * Matches Midday UI design system with semantic colors
 */
export const clerkAppearance: Appearance = {
  baseTheme: dark,
  variables: {
    // Color tokens matching Midday theme
    colorPrimary: 'hsl(var(--primary))',
    colorBackground: 'hsl(var(--background))',
    colorInputBackground: 'hsl(var(--background))',
    colorInputText: 'hsl(var(--foreground))',
    colorText: 'hsl(var(--foreground))',
    colorTextSecondary: 'hsl(var(--muted-foreground))',
    colorDanger: 'hsl(var(--destructive))',
    colorSuccess: 'hsl(var(--success-accent))',
    colorWarning: 'hsl(var(--warning-accent))',

    // Border and radius
    borderRadius: '0.5rem',
    colorNeutral: 'hsl(var(--muted))',

    // Typography
    fontFamily: 'var(--font-geist-sans)',
    fontSize: '0.875rem',
  },
  elements: {
    rootBox: 'mx-auto',

    // Card styling
    card: 'bg-card border border-border shadow-none',
    cardBox: 'shadow-none',

    // Form elements
    formButtonPrimary:
      'bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors',
    formFieldInput:
      'bg-background border-border focus:border-primary focus:ring-1 focus:ring-primary',
    formFieldLabel: 'text-foreground font-medium',

    // Footer
    footer: 'hidden',
    footerAction: 'hidden',

    // Divider
    dividerLine: 'bg-border',
    dividerText: 'text-muted-foreground',

    // Social buttons
    socialButtonsBlockButton:
      'border-border hover:bg-accent hover:text-accent-foreground transition-colors',
    socialButtonsBlockButtonText: 'text-foreground font-medium',

    // Header
    headerTitle: 'text-foreground font-semibold text-2xl',
    headerSubtitle: 'text-muted-foreground',

    // Links
    identityPreviewText: 'text-muted-foreground',
    identityPreviewEditButton: 'text-primary hover:text-primary/80',

    // Form field error
    formFieldErrorText: 'text-destructive text-sm',

    // Alert
    alertText: 'text-sm',

    // Avatar
    avatarBox: 'size-12',

    // Navbar
    navbar: 'hidden',
    navbarButton: 'text-foreground hover:bg-accent',

    // Badge
    badge: 'bg-primary/10 text-primary border-primary/20',

    // Code
    codeBox: 'bg-muted border-border',

    // Spinner
    spinner: 'text-primary',
  },
};

/**
 * Light theme variant (optional)
 */
export const clerkAppearanceLight: Appearance = {
  variables: {
    colorPrimary: 'hsl(var(--primary))',
    colorBackground: 'hsl(var(--background))',
    colorInputBackground: 'hsl(var(--background))',
    colorInputText: 'hsl(var(--foreground))',
    colorText: 'hsl(var(--foreground))',
    colorTextSecondary: 'hsl(var(--muted-foreground))',
    colorDanger: 'hsl(var(--destructive))',
    colorSuccess: 'hsl(var(--success-accent))',
    colorWarning: 'hsl(var(--warning-accent))',
    borderRadius: '0.5rem',
    fontFamily: 'var(--font-geist-sans)',
    fontSize: '0.875rem',
  },
  elements: {
    rootBox: 'mx-auto',
    card: 'bg-card border border-border shadow-sm',
    formButtonPrimary:
      'bg-primary text-primary-foreground hover:bg-primary/90',
    formFieldInput:
      'bg-background border-border focus:border-primary',
    socialButtonsBlockButton:
      'border-border hover:bg-accent',
  },
};
