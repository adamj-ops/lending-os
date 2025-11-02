import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      borderRadius: {
        sm: "4px",    // Midday's exact card radius
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
      },
    },
  },
} satisfies Config;


