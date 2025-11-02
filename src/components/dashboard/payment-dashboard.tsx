"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardLayout, MetricCard, StatusMetric, QuickStats, METRIC_CONFIGS } from "@/components/shared/dashboard-layout";
import { PaymentHistoryTable } from "@/app/(main)/(ops)/loans/payments/_components/payment-history-table";
import { PaymentSummaryCard } from "@/components/payments/payment-summary-card";
import { PaymentScheduleGenerator } from "@/components/payment-schedules/payment-schedule-generator";
import { PaymentDrawCalendar } from "@/components/shared/payment-draw-calendar";
import { WorkflowViewer, WorkflowStatus, WorkflowLegend } from "@/components/workflows";
import { IconCurrencyDollar, IconTrendingUp, IconAlertCircle, IconCircleCheck, IconClock, IconCalendar, IconPlus, IconFilter, IconGitBranch } from "@tabler/icons-react";
import { Payment, PaymentSummary, PaymentSchedule, PaymentStatus } from "@/types/payment";
import { CalendarEvent } from "@/components/shared/payment-draw-calendar";
import { useLoanPayments, usePaymentSummary, usePaymentSchedule, useUpdatePayment } from "@/hooks/usePayments";
import { PageLoader } from "@/components/shared/page-loader";

interface PaymentDashboardProps {
  loanId: string;
  className?: string;
}

export function PaymentDashboard({ loanId, className }: PaymentDashboardProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  
  // Use custom hooks for data fetching
  const { data: payments = [], isLoading: paymentsLoading, error: paymentsError } = useLoanPayments(loanId);
  const { data: paymentSummary, isLoading: summaryLoading, error: summaryError } = usePaymentSummary(loanId);
  const { data: paymentSchedule, isLoading: scheduleLoading, error: scheduleError } = usePaymentSchedule(loanId);

  const isLoading = paymentsLoading || summaryLoading || scheduleLoading;
  const error = paymentsError || summaryError || scheduleError;

  const typedPayments = useMemo(
    () => payments.map((payment) => payment as unknown as Payment),
    [payments],
  );

  const completedPayments = useMemo(
    () => typedPayments.filter((payment) => payment.status === PaymentStatus.COMPLETED),
    [typedPayments],
  );
  const pendingPayments = useMemo(
    () => typedPayments.filter((payment) => payment.status === PaymentStatus.PENDING),
    [typedPayments],
  );
  const failedPayments = useMemo(
    () => typedPayments.filter((payment) => payment.status === PaymentStatus.FAILED),
    [typedPayments],
  );

  // Generate calendar events from payments and schedule
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Add completed payments
    typedPayments.forEach((payment) => {
      // Map PaymentStatus enum to CalendarEvent status string literal
      const statusMap: Record<PaymentStatus, 'pending' | 'completed' | 'overdue' | 'cancelled'> = {
        [PaymentStatus.PENDING]: 'pending',
        [PaymentStatus.COMPLETED]: 'completed',
        [PaymentStatus.FAILED]: 'cancelled',
        [PaymentStatus.CANCELLED]: 'cancelled',
      };

      const amountValue = Number(payment.amount ?? 0);
      
      events.push({
        id: `payment-${payment.id}`,
        title: `Payment: $${amountValue.toLocaleString()}`,
        start: payment.paymentDate,
        type: 'payment',
        status: statusMap[payment.status as PaymentStatus] || 'pending',
        amount: amountValue,
        description: `${payment.paymentType} payment`,
        loanId: payment.loanId
      });
    });

    // Add scheduled payments
    if (paymentSchedule) {
      paymentSchedule.scheduleData.forEach((item: PaymentSchedule['scheduleData'][number]) => {
        const totalAmount = Number(item.principalAmount ?? 0) + Number(item.interestAmount ?? 0);
        events.push({
          id: `scheduled-${paymentSchedule.loanId}-${item.paymentNumber}`,
          title: `Scheduled: $${totalAmount.toLocaleString()}`,
          start: item.dueDate,
          type: 'payment',
          status: 'pending',
          amount: totalAmount,
          description: `Scheduled payment #${item.paymentNumber}`,
          loanId: paymentSchedule.loanId
        });
      });
    }

    return events;
  }, [typedPayments, paymentSchedule]);

  const updatePaymentMutation = useUpdatePayment();

  const handlePaymentComplete = async (paymentId: string) => {
    updatePaymentMutation.mutate({ 
      id: paymentId, 
      data: { status: 'completed' } 
    });
  };

  const handleEventClick = (event: CalendarEvent) => {
    console.log('Event clicked:', event);
    // Could open a modal or navigate to payment details
  };

  const handleDateSelect = (date: Date) => {
    console.log('Date selected:', date);
    // Could open a form to create a new payment
  };

  // Calculate metrics
  const totalPaid = completedPayments.reduce((sum, p) => sum + Number(p.amount ?? 0), 0);

  const totalScheduled = paymentSchedule?.scheduleData
    .reduce(
      (sum: number, item: PaymentSchedule['scheduleData'][number]) =>
        sum + Number(item.totalAmount ?? 0),
      0,
    ) || 0;

  const overduePayments = typedPayments.filter(p => 
    p.status === PaymentStatus.PENDING && 
    p.paymentDate && 
    new Date(p.paymentDate) < new Date()
  ).length;

  const upcomingPayments = typedPayments.filter(p => 
    p.status === PaymentStatus.PENDING && 
    p.paymentDate &&
    new Date(p.paymentDate) >= new Date() &&
    new Date(p.paymentDate) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  ).length;

  const quickStats = [
    {
      label: "Total Paid",
      value: `$${totalPaid.toLocaleString()}`,
      icon: <IconCurrencyDollar size={20} stroke={2} className="h-5 w-5" />,
      color: "text-green-600 bg-green-100"
    },
    {
      label: "Scheduled",
      value: `$${totalScheduled.toLocaleString()}`,
      icon: <IconCalendar size={20} stroke={2} className="h-5 w-5" />,
      color: "text-blue-600 bg-blue-100"
    },
    {
      label: "Overdue",
      value: overduePayments,
      icon: <IconAlertCircle size={20} stroke={2} className="h-5 w-5" />,
      color: "text-red-600 bg-red-100"
    },
    {
      label: "Due This Week",
      value: upcomingPayments,
      icon: <IconClock size={20} stroke={2} className="h-5 w-5" />,
      color: "text-yellow-600 bg-yellow-100"
    }
  ];

  const paymentStatusBreakdown = [
    {
      label: "Completed",
      value: completedPayments.length,
      color: "bg-green-100 text-green-800",
      icon: <IconCircleCheck size={20} stroke={2} className="h-4 w-4" />
    },
    {
      label: "Pending",
      value: pendingPayments.length,
      color: "bg-yellow-100 text-yellow-800",
      icon: <IconClock size={20} stroke={2} className="h-4 w-4" />
    },
    {
      label: "Failed",
      value: failedPayments.length,
      color: "bg-red-100 text-red-800",
      icon: <IconAlertCircle size={20} stroke={2} className="h-4 w-4" />
    }
  ];

  const totalPaymentsCount = typedPayments.length;
  const successRateDisplay = totalPaymentsCount
    ? `${((completedPayments.length / totalPaymentsCount) * 100).toFixed(1)}%`
    : "0.0%";
  const averagePaymentDisplay = completedPayments.length
    ? `$${(totalPaid / completedPayments.length).toFixed(0)}`
    : "$0";

  return (
    <PageLoader 
      isLoading={isLoading} 
      error={error instanceof Error ? error : (error ? new Error(String(error)) : null)}
      isEmpty={!typedPayments.length && !paymentSummary && !paymentSchedule}
    >
      <DashboardLayout 
      title="Payment Dashboard" 
      subtitle={`Loan ${loanId}`}
      actions={
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <IconPlus size={20} stroke={2} className="h-4 w-4 mr-2" />
            New Payment
          </Button>
        </div>
      }
      className={className}
    >
      {/* Quick Stats */}
      <QuickStats stats={quickStats} />

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Payments"
          value={totalPaymentsCount}
          change={{
            value: 12.5,
            type: 'increase',
            period: 'last month'
          }}
          icon={METRIC_CONFIGS.payment.icon}
        />
        
        <MetricCard
          title="Success Rate"
          value={successRateDisplay}
          change={{
            value: 2.1,
            type: 'increase',
            period: 'last month'
          }}
          icon={<IconTrendingUp size={20} stroke={2} className="h-4 w-4" />}
        />

        <StatusMetric
          title="Payment Status"
          total={totalPaymentsCount}
          breakdown={paymentStatusBreakdown}
        />

        <MetricCard
          title="Average Payment"
          value={averagePaymentDisplay}
          description="Per completed payment"
          icon={METRIC_CONFIGS.payment.icon}
        />
      </div>

      {/* Payment Summary and Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paymentSummary && (
          <PaymentSummaryCard 
            summary={paymentSummary}
            onPaymentAction={handlePaymentComplete}
          />
        )}
        
        {paymentSchedule && (
          <Card>
            <CardHeader>
              <CardTitle>Payment Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <PaymentScheduleGenerator
                loanId={loanId}
                onScheduleGenerated={() => {
                  // TODO: refresh schedule data after generation
                }}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* Calendar View */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentDrawCalendar
            events={calendarEvents}
            onEventClick={handleEventClick}
            onDateSelect={handleDateSelect}
          />
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentHistoryTable
            loanId={loanId}
          />
        </CardContent>
      </Card>

      {/* Workflow Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconGitBranch size={20} stroke={2} className="h-5 w-5" />
                Payment Workflow
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WorkflowViewer workflowType="payment" />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <WorkflowStatus 
            workflowType="payment"
            currentStep="process_payment"
            progress={75}
          />
          <WorkflowLegend />
        </div>
      </div>
      </DashboardLayout>
    </PageLoader>
  );
}
