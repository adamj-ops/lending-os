import { redirect } from "next/navigation";

/**
 * Shared dashboard root - redirects to portfolio
 * Accessible by ops, investor, and borrower portals
 */
export default function DashboardPage() {
  redirect("/dashboard/portfolio");
}

