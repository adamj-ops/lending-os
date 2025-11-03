import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: {
            50: 'oklch(98% 0.02 180)',
            100: 'oklch(95% 0.04 180)',
            200: 'oklch(90% 0.06 180)',
            300: 'oklch(82% 0.09 180)',
            400: 'oklch(74% 0.12 180)',
            500: 'oklch(66% 0.15 180)',  // #14b8a6 teal (Colosseum)
            600: 'oklch(60% 0.15 180)',
            700: 'oklch(54% 0.14 180)',
            800: 'oklch(48% 0.12 180)',
            900: 'oklch(42% 0.10 180)',
            950: 'oklch(36% 0.08 180)',
            DEFAULT: 'oklch(66% 0.15 180)',
          },
          accent: {
            50: 'oklch(97% 0.03 40)',
            100: 'oklch(94% 0.06 40)',
            200: 'oklch(90% 0.10 40)',
            300: 'oklch(84% 0.14 40)',
            400: 'oklch(78% 0.18 40)',
            500: 'oklch(72% 0.22 40)',  // #f97316 orange
            600: 'oklch(66% 0.22 40)',
            700: 'oklch(60% 0.21 40)',
            800: 'oklch(54% 0.19 40)',
            900: 'oklch(48% 0.17 40)',
            950: 'oklch(42% 0.15 40)',
            DEFAULT: 'oklch(72% 0.22 40)',
          },
          success: {
            50: 'oklch(98% 0.02 150)',
            100: 'oklch(95% 0.04 150)',
            200: 'oklch(90% 0.07 150)',
            300: 'oklch(84% 0.10 150)',
            400: 'oklch(76% 0.13 150)',
            500: 'oklch(68% 0.16 150)',  // #10b981
            600: 'oklch(62% 0.15 150)',
            700: 'oklch(56% 0.14 150)',
            800: 'oklch(50% 0.12 150)',
            900: 'oklch(44% 0.10 150)',
            950: 'oklch(38% 0.08 150)',
            DEFAULT: 'oklch(68% 0.16 150)',
          },
          danger: {
            50: 'oklch(98% 0.03 25)',
            100: 'oklch(95% 0.06 25)',
            200: 'oklch(90% 0.10 25)',
            300: 'oklch(84% 0.15 25)',
            400: 'oklch(76% 0.19 25)',
            500: 'oklch(68% 0.23 25)',  // #ef4444
            600: 'oklch(62% 0.22 25)',
            700: 'oklch(56% 0.20 25)',
            800: 'oklch(50% 0.18 25)',
            900: 'oklch(44% 0.16 25)',
            950: 'oklch(38% 0.14 25)',
            DEFAULT: 'oklch(68% 0.23 25)',
          },
          // Simplified flat aliases for backwards compatibility
          bg: '#0a0a0a',
          surface: '#111827',
          text: '#f1f5f9',
          muted: '#64748b',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Oxygen',
          'Ubuntu',
          'Cantarell',
          '"Fira Sans"',
          '"Droid Sans"',
          '"Helvetica Neue"',
          'sans-serif',
        ],
        mono: [
          '"SFMono-Regular"',
          'Consolas',
          '"Liberation Mono"',
          'Menlo',
          'monospace',
        ],
      },
      borderRadius: {
        sm: "4px",
        md: "6px",
        lg: "8px",
      },
    },
  },
} satisfies Config;
