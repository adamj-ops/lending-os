"use client";

import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { IconAlertCircle } from "@tabler/icons-react";
import { CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motionPresets } from "@/features/loan-builder/motion.config";
import type { CreateLoanFormData } from "@/features/loan-builder/types";

interface ReviewStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function ReviewStep({ onBack }: ReviewStepProps) {
  const { watch } = useFormContext<CreateLoanFormData>();

  const loanCategory = watch("loanCategory");
  const borrower = watch("borrower");
  const lender = watch("lender");
  const property = watch("property");
  const investment = watch("investment");
  const terms = watch("terms");
  const documents = watch("documents");
  const collateral = watch("collateral");

  const formatCurrency = (value: number | undefined) => {
    if (!value) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getCategoryLabel = () => {
    switch (loanCategory) {
      case "asset_backed":
        return "Asset-Backed Loan";
      case "yield_note":
        return "Yield Note";
      case "hybrid":
        return "Hybrid Loan";
      default:
        return "Loan";
    }
  };

  return (
    <motion.div className="space-y-6" {...motionPresets.fadeInUp}>
      <motion.div
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
        >
          <CheckCircle2 className="text-primary size-6" />
        </motion.div>
        <h2 className="text-2xl font-bold">Review Loan Details</h2>
      </motion.div>

      <motion.div
        className="border-primary/50 bg-primary/5 rounded-lg border p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className="font-medium">{getCategoryLabel()}</p>
        <p className="text-muted-foreground text-sm">Review all information before creating the loan</p>
      </motion.div>

      {/* Staggered Cards */}
      <motion.div className="space-y-4" variants={motionPresets.staggerContainer} initial="hidden" animate="show">
        {/* Loan Category */}
        <motion.div variants={motionPresets.staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Loan Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline" className="text-base">
                {getCategoryLabel()}
              </Badge>
            </CardContent>
          </Card>
        </motion.div>

        {/* Borrower (Asset-Backed/Hybrid) */}
        {(loanCategory === "asset_backed" || loanCategory === "hybrid") && borrower && (
          <motion.div variants={motionPresets.staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Borrower</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {borrower.type === "individual" ? (
                  <>
                    <p className="font-medium">
                      {borrower.firstName} {borrower.lastName}
                    </p>
                    <p className="text-muted-foreground text-sm">{borrower.email}</p>
                    {borrower.phone && <p className="text-muted-foreground text-sm">{borrower.phone}</p>}
                    {borrower.creditScore && <p className="text-sm">Credit Score: {borrower.creditScore}</p>}
                  </>
                ) : (
                  <>
                    <p className="font-medium">{borrower.name}</p>
                    <p className="text-muted-foreground text-sm">{borrower.email}</p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Lender (Yield Note/Hybrid) */}
        {(loanCategory === "yield_note" || loanCategory === "hybrid") && lender && (
          <motion.div variants={motionPresets.staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Investor/Lender</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{lender.name}</p>
                <p className="text-muted-foreground text-sm">Type: {lender.type?.replace("_", " ").toUpperCase()}</p>
                <p className="text-muted-foreground text-sm">{lender.contactEmail}</p>
                {lender.contactPhone && <p className="text-muted-foreground text-sm">{lender.contactPhone}</p>}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Property (Asset-Backed/Hybrid) */}
        {(loanCategory === "asset_backed" || loanCategory === "hybrid") && property && (
          <motion.div variants={motionPresets.staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Property</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="font-medium">{property.address}</p>
                <p className="text-muted-foreground text-sm">
                  {property.city}, {property.state} {property.zip}
                </p>
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="font-medium capitalize">{property.propertyType?.replace("_", " ")}</p>
                  </div>
                  {property.purchasePrice && (
                    <div>
                      <p className="text-muted-foreground">Purchase Price</p>
                      <p className="font-medium">{formatCurrency(property.purchasePrice)}</p>
                    </div>
                  )}
                  {property.estimatedValue && (
                    <div>
                      <p className="text-muted-foreground">Estimated Value</p>
                      <p className="font-medium">{formatCurrency(property.estimatedValue)}</p>
                    </div>
                  )}
                  {property.occupancy && (
                    <div>
                      <p className="text-muted-foreground">Occupancy</p>
                      <p className="font-medium capitalize">{property.occupancy.replace("_", " ")}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Investment (Yield Note/Hybrid) */}
        {(loanCategory === "yield_note" || loanCategory === "hybrid") && investment && (
          <motion.div variants={motionPresets.staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Investment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid gap-2 text-sm md:grid-cols-2">
                  <div>
                    <p className="text-muted-foreground">Investment Type</p>
                    <p className="font-medium capitalize">{investment.investmentType?.replace("_", " ")}</p>
                  </div>
                  {investment.committedAmount && (
                    <div>
                      <p className="text-muted-foreground">Committed Amount</p>
                      <p className="font-medium">{formatCurrency(investment.committedAmount)}</p>
                    </div>
                  )}
                  {investment.returnRate && (
                    <div>
                      <p className="text-muted-foreground">Return Rate</p>
                      <p className="font-medium">{investment.returnRate}%</p>
                    </div>
                  )}
                  {investment.compounding && (
                    <div>
                      <p className="text-muted-foreground">Compounding</p>
                      <p className="font-medium capitalize">{investment.compounding}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Loan Terms */}
        {terms && (
          <motion.div variants={motionPresets.staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Loan Terms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-muted-foreground text-sm">Principal</p>
                    <p className="font-medium">{formatCurrency(terms.principal)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Interest Rate</p>
                    <p className="font-medium">{terms.rate}%</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Term</p>
                    <p className="font-medium">{terms.termMonths} months</p>
                  </div>
                  {terms.paymentType && (
                    <div>
                      <p className="text-muted-foreground text-sm">Payment Type</p>
                      <p className="font-medium capitalize">{terms.paymentType.replace("_", " ")}</p>
                    </div>
                  )}
                  {terms.paymentFrequency && (
                    <div>
                      <p className="text-muted-foreground text-sm">Payment Frequency</p>
                      <p className="font-medium capitalize">{terms.paymentFrequency}</p>
                    </div>
                  )}
                  {terms.escrowEnabled && (
                    <div>
                      <p className="text-muted-foreground text-sm">Escrow</p>
                      <p className="font-medium">Enabled</p>
                    </div>
                  )}
                </div>

                {(terms.originationFeeBps || terms.lateFeeBps || terms.defaultInterestBps) && (
                  <div className="mt-4 space-y-2 rounded-lg border p-3">
                    <p className="text-sm font-medium">Fees</p>
                    <div className="grid gap-2 text-sm md:grid-cols-3">
                      {terms.originationFeeBps && (
                        <div>
                          <p className="text-muted-foreground">Origination</p>
                          <p>
                            {terms.originationFeeBps} BPS ({(terms.originationFeeBps / 100).toFixed(2)}%)
                          </p>
                        </div>
                      )}
                      {terms.lateFeeBps && (
                        <div>
                          <p className="text-muted-foreground">Late Fee</p>
                          <p>
                            {terms.lateFeeBps} BPS ({(terms.lateFeeBps / 100).toFixed(2)}%)
                          </p>
                        </div>
                      )}
                      {terms.defaultInterestBps && (
                        <div>
                          <p className="text-muted-foreground">Default Interest</p>
                          <p>
                            {terms.defaultInterestBps} BPS ({(terms.defaultInterestBps / 100).toFixed(2)}%)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Collateral (Asset-Backed/Hybrid) */}
        {(loanCategory === "asset_backed" || loanCategory === "hybrid") && collateral && (
          <motion.div variants={motionPresets.staggerItem}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Collateral</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {collateral.lienPosition && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Lien Position: </span>
                    <span className="font-medium">{collateral.lienPosition}</span>
                  </p>
                )}
                {collateral.description && (
                  <p className="text-sm">
                    <span className="text-muted-foreground">Description: </span>
                    <span>{collateral.description}</span>
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Documents */}
        <motion.div variants={motionPresets.staggerItem}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {documents && Array.isArray(documents) && documents.length > 0
                  ? `${documents.length} document(s) ready to upload`
                  : "No documents uploaded (optional)"}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Ready to Submit - Animated */}
      <motion.div
        className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
      >
        <div className="flex gap-2">
          <IconAlertCircle size={20} stroke={2} className="size-5 text-brand-accent dark:text-amber-400" />
          <div className="flex-1">
            <p className="font-medium text-amber-900 dark:text-amber-100">Ready to Create Loan</p>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Click "Create Loan" to submit. You can add more documents and details after creation.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
