import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "Lending OS",
  version: packageJson.version,
  copyright: `© ${currentYear}, Lending OS.`,
  meta: {
    title: "Lending OS - Modern Loan Management Platform",
    description:
      "Lending OS is a next-generation loan management platform for private and hard-money lenders. Manage the full loan lifecycle—from origination to payoff—with a modern, intuitive interface built on Next.js 16, Drizzle ORM, and Shadcn UI.",
  },
};
