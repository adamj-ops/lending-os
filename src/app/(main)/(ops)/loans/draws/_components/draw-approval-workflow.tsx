"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconClock, IconFileText, IconSearch, IconCurrencyDollar, IconAlertCircle, IconLoader2 } from "@tabler/icons-react";
import { CheckCircle2, Circle, UserCheck, FileText, Search } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import {
  approveDrawSchema,
  rejectDrawSchema,
  type ApproveDrawInput,
  type RejectDrawInput,
} from "../schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { NumberInput } from "@/components/ui/number-input";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface DrawRequest {
  id: string;
  drawType: string;
  amount: string;
  requestedDate: Date | string;
  workDescription: string;
  percentComplete: number;
  status: string;
  budgetLineItems: Array<{
    description: string;
    budgetedAmount: number;
    requestedAmount: number;
    previousDraws: number;
  }>;
  contractorName?: string;
  inspectionRequired: boolean;
  inspectionStatus?: string;
  inspectionDate?: Date | string;
  inspectionFindings?: string;
  documentUrls?: string[];
}

interface DrawApprovalWorkflowProps {
  draw: DrawRequest;
  onApprove?: () => void;
  onReject?: () => void;
  onRequestMoreInfo?: () => void;
}

type WorkflowStep =
  | "review"
  | "inspection"
  | "verification"
  | "approval"
  | "complete";

const workflowSteps = [
  {
    id: "review" as WorkflowStep,
    title: "Initial Review",
    icon: FileText,
    description: "Review draw request details",
  },
  {
    id: "inspection" as WorkflowStep,
    title: "Inspection",
    icon: Search,
    description: "On-site inspection if required",
  },
  {
    id: "verification" as WorkflowStep,
    title: "Verification",
    icon: CheckCircle2,
    description: "Verify work completion and budget",
  },
  {
    id: "approval" as WorkflowStep,
    title: "Approval",
    icon: UserCheck,
    description: "Final approval decision",
  },
  {
    id: "complete" as WorkflowStep,
    title: "Complete",
    icon: IconCurrencyDollar,
    description: "Ready for disbursement",
  },
];

export function DrawApprovalWorkflow({
  draw,
  onApprove,
  onReject,
  onRequestMoreInfo,
}: DrawApprovalWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("review");
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const approveForm = useForm<ApproveDrawInput>({
    resolver: zodResolver(approveDrawSchema),
    defaultValues: {
      drawId: draw.id,
      approvedAmount: parseFloat(draw.amount),
      approvalDate: new Date(),
      approvalNotes: "",
      conditions: [],
    },
  });

  const rejectForm = useForm<RejectDrawInput>({
    resolver: zodResolver(rejectDrawSchema),
    defaultValues: {
      drawId: draw.id,
      rejectionDate: new Date(),
      rejectionReason: "",
      allowResubmission: true,
    },
  });

  const getCurrentStepIndex = () => {
    return workflowSteps.findIndex((step) => step.id === currentStep);
  };

  const handleApprove = async (data: ApproveDrawInput) => {
    setIsSubmitting(true);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Draw approved successfully");
      setShowApproveDialog(false);
      onApprove?.();
    } catch (error) {
      toast.error("Failed to approve draw");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (data: RejectDrawInput) => {
    setIsSubmitting(true);
    try {
      // API call would go here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Draw rejected");
      setShowRejectDialog(false);
      onReject?.();
    } catch (error) {
      toast.error("Failed to reject draw");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "review":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Draw Request Details</CardTitle>
              <CardDescription>
                Review the draw request information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Draw Type</p>
                  <p className="font-medium capitalize">{draw.drawType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Requested Amount</p>
                  <p className="text-2xl font-bold">
                    ${parseFloat(draw.amount).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Request Date</p>
                  <p className="font-medium">
                    {format(new Date(draw.requestedDate), "MMM dd, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Work Completion</p>
                  <p className="font-medium">{draw.percentComplete}%</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-2">Work Description</p>
                <p className="text-sm text-muted-foreground">
                  {draw.workDescription}
                </p>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-3">Budget Line Items</p>
                <div className="space-y-2">
                  {draw.budgetLineItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-xs text-muted-foreground">
                          Previous draws: $
                          {item.previousDraws.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          $
                          {item.requestedAmount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          of $
                          {item.budgetedAmount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {draw.contractorName && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Contractor</p>
                    <p className="text-sm">{draw.contractorName}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );

      case "inspection":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Inspection Status</CardTitle>
              <CardDescription>
                Review inspection requirements and results
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Inspection Required</p>
                  <p className="text-sm text-muted-foreground">
                    {draw.inspectionRequired ? "Yes" : "No"}
                  </p>
                </div>
                <Badge
                  variant={draw.inspectionRequired ? "outline" : "secondary"}
                >
                  {draw.inspectionStatus || "Not Required"}
                </Badge>
              </div>

              {draw.inspectionRequired && draw.inspectionDate && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Inspection Date
                    </p>
                    <p className="font-medium">
                      {format(new Date(draw.inspectionDate), "PPP")}
                    </p>
                  </div>
                </>
              )}

              {draw.inspectionFindings && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Findings</p>
                    <p className="text-sm text-muted-foreground">
                      {draw.inspectionFindings}
                    </p>
                  </div>
                </>
              )}

              {!draw.inspectionRequired && (
                <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
                  No inspection is required for this draw request.
                </div>
              )}
            </CardContent>
          </Card>
        );

      case "verification":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Verification Checklist</CardTitle>
              <CardDescription>
                Verify all requirements are met
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Work description provided</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Budget line items documented</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Amounts verified and balanced</span>
                </div>
                {draw.inspectionRequired && (
                  <div className="flex items-center gap-3">
                    {draw.inspectionStatus === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <IconClock size={20} stroke={2} className="h-5 w-5 text-orange-600" />
                    )}
                    <span className="text-sm">Inspection completed</span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Within budget limits</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case "approval":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Approval Decision</CardTitle>
              <CardDescription>
                Review and make final decision
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-start gap-3">
                  <IconAlertCircle size={20} stroke={2} className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Ready for Decision</p>
                    <p className="text-sm text-muted-foreground">
                      All verification steps are complete. Choose to approve or
                      reject this draw request.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={() => setShowApproveDialog(true)}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Approve Draw
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setShowRejectDialog(true)}
                >
                  <IconAlertCircle size={20} stroke={2} className="mr-2 h-4 w-4" />
                  Reject Draw
                </Button>
              </div>

              {onRequestMoreInfo && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onRequestMoreInfo}
                >
                  Request More Information
                </Button>
              )}
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Workflow</CardTitle>
          <CardDescription>Track progress through approval stages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Progress Bar */}
            <div className="absolute left-0 top-5 h-0.5 w-full bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: `${(getCurrentStepIndex() / (workflowSteps.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* Steps */}
            <div className="relative flex justify-between">
              {workflowSteps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = index < getCurrentStepIndex();
                const Icon = step.icon;

                return (
                  <div
                    key={step.id}
                    className="flex flex-col items-center gap-2 cursor-pointer"
                    onClick={() => setCurrentStep(step.id)}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background transition-colors",
                        isActive && "border-primary bg-primary text-primary-foreground",
                        isCompleted && "border-primary bg-primary text-primary-foreground",
                        !isActive && !isCompleted && "border-muted"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-center">
                      <p
                        className={cn(
                          "text-xs font-medium",
                          isActive && "text-primary",
                          !isActive && !isCompleted && "text-muted-foreground"
                        )}
                      >
                        {step.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => {
            const currentIndex = getCurrentStepIndex();
            if (currentIndex > 0) {
              setCurrentStep(workflowSteps[currentIndex - 1].id);
            }
          }}
          disabled={getCurrentStepIndex() === 0}
        >
          Previous
        </Button>
        <Button
          onClick={() => {
            const currentIndex = getCurrentStepIndex();
            if (currentIndex < workflowSteps.length - 1) {
              setCurrentStep(workflowSteps[currentIndex + 1].id);
            }
          }}
          disabled={getCurrentStepIndex() === workflowSteps.length - 1}
        >
          Next
        </Button>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Approve Draw Request</DialogTitle>
            <DialogDescription>
              Review and approve the draw request amount
            </DialogDescription>
          </DialogHeader>
          <Form {...approveForm}>
            <form
              onSubmit={approveForm.handleSubmit(handleApprove)}
              className="space-y-4"
            >
              <FormField
                control={approveForm.control}
                name="approvedAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approved Amount</FormLabel>
                    <FormControl>
                      <NumberInput
                        prefix="$"
                        thousandSeparator=","
                        decimalScale={2}
                        fixedDecimalScale
                        value={field.value}
                        onValueChange={field.onChange}
                        min={0}
                      />
                    </FormControl>
                    <FormDescription>
                      Amount can be adjusted from requested amount
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={approveForm.control}
                name="approvalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approval Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Optional notes about the approval..."
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowApproveDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <IconLoader2 size={20} stroke={2} className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Approve
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reject Draw Request</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this draw
            </DialogDescription>
          </DialogHeader>
          <Form {...rejectForm}>
            <form
              onSubmit={rejectForm.handleSubmit(handleReject)}
              className="space-y-4"
            >
              <FormField
                control={rejectForm.control}
                name="rejectionReason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rejection Reason</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Explain why this draw is being rejected (min 20 characters)..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={rejectForm.control}
                name="allowResubmission"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Allow Resubmission</FormLabel>
                      <FormDescription>
                        Borrower can address issues and resubmit
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRejectDialog(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <IconLoader2 size={20} stroke={2} className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Reject
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
