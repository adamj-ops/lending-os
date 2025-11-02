import { notFound } from "next/navigation";
import { requireOrganization } from "@/lib/clerk-server";
import { BorrowerService } from "@/services/borrower.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { KYCStatusBadge } from "@/components/borrowers/KYCStatusBadge";
import { IconUser, IconMail, IconPhone, IconMapPin, IconTrendingUp, IconBuildingBank } from "@tabler/icons-react";

/**
 * Borrower Detail Page
 * 
 * Displays detailed information about a borrower including KYC status.
 * Server component that fetches borrower data with organization ownership check.
 */

interface BorrowerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BorrowerDetailPage({ params }: BorrowerDetailPageProps) {
  const session = await requireOrganization();
  const { id } = await params;

  // Fetch borrower data with org check
  const borrower = await BorrowerService.getBorrowerById(id);

  // Verify borrower exists and belongs to user's organization
  if (!borrower || borrower.organizationId !== session.organizationId) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          {borrower.type === "individual" && borrower.firstName && borrower.lastName
            ? `${borrower.firstName} ${borrower.lastName}`
            : borrower.name || "Borrower Details"}
        </h1>
        <p className="text-muted-foreground">
          {borrower.type === "individual" ? "Individual Borrower" : "Entity Borrower"}
        </p>
      </div>

      {/* Basic Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Contact and identity information</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {/* Name */}
          <div className="flex items-start gap-3">
            <IconUser size={20} stroke={2} className="mt-1 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                {borrower.type === "individual" ? "Full Name" : "Entity Name"}
              </p>
              <p className="mt-1 text-base font-semibold">
                {borrower.type === "individual" && borrower.firstName && borrower.lastName
                  ? `${borrower.firstName} ${borrower.lastName}`
                  : borrower.name || "—"}
              </p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-start gap-3">
            <IconMail size={20} stroke={2} className="mt-1 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="mt-1 text-base">{borrower.email}</p>
            </div>
          </div>

          {/* Phone */}
          {borrower.phone && (
            <div className="flex items-start gap-3">
              <IconPhone size={20} stroke={2} className="mt-1 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="mt-1 text-base">{borrower.phone}</p>
              </div>
            </div>
          )}

          {/* Address */}
          {borrower.address && (
            <div className="flex items-start gap-3">
              <IconMapPin size={20} stroke={2} className="mt-1 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="mt-1 text-base">{borrower.address}</p>
              </div>
            </div>
          )}

          {/* Credit Score (for individuals) */}
          {borrower.type === "individual" && borrower.creditScore && (
            <div className="flex items-start gap-3">
              <IconTrendingUp size={20} stroke={2} className="mt-1 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Credit Score</p>
                <p className="mt-1 text-base font-semibold">{borrower.creditScore}</p>
              </div>
            </div>
          )}

          {/* Company Name (deprecated, for backward compatibility) */}
          {borrower.companyName && (
            <div className="flex items-start gap-3">
              <IconBuildingBank size={20} stroke={2} className="mt-1 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Company</p>
                <p className="mt-1 text-base">{borrower.companyName}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* KYC Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>Know Your Customer verification status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Verification Status</p>
              <KYCStatusBadge status={(borrower as any).kycStatus} showIcon={true} />
            </div>
          </div>
          
          {(borrower as any).kycStatus === "pending" && (
            <div className="mt-4 rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground">
                KYC verification has not been initiated for this borrower. 
                Verification will be required before loan approval.
              </p>
            </div>
          )}
          
          {(borrower as any).kycStatus === "in_progress" && (
            <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-950 p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                KYC verification is currently in progress. 
                This typically takes 1-2 business days to complete.
              </p>
            </div>
          )}
          
          {(borrower as any).kycStatus === "approved" && (
            <div className="mt-4 rounded-lg bg-green-50 dark:bg-green-950 p-4">
              <p className="text-sm text-green-900 dark:text-green-100">
                KYC verification has been approved. 
                This borrower is eligible for loan applications.
              </p>
            </div>
          )}
          
          {(borrower as any).kycStatus === "rejected" && (
            <div className="mt-4 rounded-lg bg-red-50 dark:bg-red-950 p-4">
              <p className="text-sm text-red-900 dark:text-red-100">
                KYC verification was rejected. 
                Please review the verification requirements and resubmit.
              </p>
            </div>
          )}
          
          {(borrower as any).kycStatus === "requires_review" && (
            <div className="mt-4 rounded-lg bg-yellow-50 dark:bg-yellow-950 p-4">
              <p className="text-sm text-yellow-900 dark:text-yellow-100">
                KYC verification requires manual review. 
                A compliance officer will review this case shortly.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metadata Card */}
      <Card>
        <CardHeader>
          <CardTitle>Record Information</CardTitle>
          <CardDescription>Creation and update timestamps</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Created At</p>
            <p className="mt-1 text-base">
              {new Date(borrower.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
            <p className="mt-1 text-base">
              {new Date(borrower.updatedAt).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

