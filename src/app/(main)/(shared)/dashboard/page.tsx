import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/clerk-server";

/**
 * Shared dashboard root - redirects to portfolio
 * Accessible by ops, investor, and borrower portals
 */
export default async function DashboardPage() {
  await requireAuth();
  redirect("/dashboard/portfolio");
}

