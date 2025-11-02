'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { IconCurrencyDollar, IconCalendar, IconMapPin, IconUser, IconExternalLink, IconTrendingUp, IconTrendingDown, IconChartBar } from "@tabler/icons-react";
import Link from 'next/link';
import type { DrillDownModalProps, EntityDetails, SnapshotData } from '@/types/analytics';

export function DrillDownModal({ isOpen, onClose, entityType, entityId }: DrillDownModalProps) {
  const [entity, setEntity] = useState<EntityDetails | SnapshotData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && entityId) {
      fetchEntityDetails();
    }
  }, [isOpen, entityId, entityType]);

  const fetchEntityDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = getEndpoint(entityType, entityId);
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch ${entityType} details`);
      }
      
      const data = await response.json();
      setEntity(data.data || data);
    } catch (err: any) {
      setError(err.message);
      console.error(`Error fetching ${entityType} details:`, err);
    } finally {
      setLoading(false);
    }
  };

  const getEndpoint = (type: string, id: string): string => {
    switch (type) {
      case 'loan':
        return `/api/v1/loans/${id}`;
      case 'payment':
        return `/api/v1/payments/${id}`;
      case 'inspection':
        return `/api/v1/inspections/${id}`;
      case 'fund':
        return `/api/v1/funds/${id}`;
      case 'snapshot':
        return `/api/v1/analytics/snapshots/${id}`;
      default:
        return '';
    }
  };

  const getViewLink = (type: string, id: string): string => {
    switch (type) {
      case 'loan':
        return `/dashboard/loans/${id}`;
      case 'payment':
        return `/dashboard/payments/${id}`;
      case 'inspection':
        return `/dashboard/inspections/${id}`;
      case 'fund':
        return `/dashboard/funds/${id}`;
      case 'snapshot':
        return `/analytics?date=${id}`;
      default:
        return '#';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="capitalize">{entityType} Details</span>
            {entity && (
              <Link href={getViewLink(entityType, entityId)} target="_blank">
                <Button variant="outline" size="sm" className="gap-2">
                  View Full Details
                  <IconExternalLink size={20} stroke={2} className="h-4 w-4" />
                </Button>
              </Link>
            )}
          </DialogTitle>
          <DialogDescription>
            Detailed information and historical trends
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950">
            <CardContent className="p-6">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        {entity && !loading && (
          <div className="space-y-6">
            {/* Loan Details */}
            {entityType === 'loan' && (
              <LoanDetails loan={entity} />
            )}

            {/* Payment Details */}
            {entityType === 'payment' && (
              <PaymentDetails payment={entity} />
            )}

            {/* Inspection Details */}
            {entityType === 'inspection' && (
              <InspectionDetails inspection={entity} />
            )}

            {/* Fund Details */}
            {entityType === 'fund' && (
              <FundDetails fund={entity} />
            )}

            {/* Snapshot Details */}
            {entityType === 'snapshot' && (
              <SnapshotDetails snapshot={entity as SnapshotData} snapshotDate={entityId} />
            )}

            {/* Historical Trends Mini-Chart - only show for non-snapshot types */}
            {entityType !== 'snapshot' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Historical Trends</CardTitle>
                  <CardDescription>Recent activity and patterns</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-muted rounded flex items-center justify-center">
                    <p className="text-muted-foreground">Mini-chart placeholder for {entityType}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Records */}
            {entityType !== 'snapshot' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Related Records</CardTitle>
                  <CardDescription>Connected entities and dependencies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Related records will be displayed here based on relationships
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function LoanDetails({ loan }: { loan: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Loan Amount</p>
            <p className="text-lg font-semibold flex items-center gap-2">
              <IconCurrencyDollar size={20} stroke={2} className="h-4 w-4" />
              {loan.loanAmount ? parseFloat(loan.loanAmount).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge className="capitalize">{loan.status || 'Unknown'}</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Interest Rate</p>
            <p className="text-lg font-semibold">{loan.interestRate || 'N/A'}%</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Term</p>
            <p className="text-lg font-semibold">{loan.termMonths || 'N/A'} months</p>
          </div>
          {loan.propertyAddress && (
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Property</p>
              <p className="text-lg font-semibold flex items-center gap-2">
                <IconMapPin size={20} stroke={2} className="h-4 w-4" />
                {loan.propertyAddress}
              </p>
            </div>
          )}
          {loan.fundedDate && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Funded Date</p>
              <p className="text-lg font-semibold flex items-center gap-2">
                <IconCalendar size={20} stroke={2} className="h-4 w-4" />
                {new Date(loan.fundedDate).toLocaleDateString()}
              </p>
            </div>
          )}
          {loan.maturityDate && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Maturity Date</p>
              <p className="text-lg font-semibold flex items-center gap-2">
                <IconCalendar size={20} stroke={2} className="h-4 w-4" />
                {new Date(loan.maturityDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentDetails({ payment }: { payment: any }) {
  const isLate = payment.status === 'pending' && 
    payment.paymentDate && 
    new Date(payment.paymentDate) < new Date();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Amount</p>
            <p className="text-lg font-semibold flex items-center gap-2">
              <IconCurrencyDollar size={20} stroke={2} className="h-4 w-4" />
              {payment.amount ? parseFloat(payment.amount).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge className="capitalize" variant={isLate ? 'destructive' : 'success'}>
              {payment.status || 'Unknown'}
              {isLate && ' (Late)'}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Payment Date</p>
            <p className="text-lg font-semibold flex items-center gap-2">
              <IconCalendar size={20} stroke={2} className="h-4 w-4" />
              {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          {payment.receivedDate && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Received Date</p>
              <p className="text-lg font-semibold flex items-center gap-2">
                <IconCalendar size={20} stroke={2} className="h-4 w-4" />
                {new Date(payment.receivedDate).toLocaleDateString()}
              </p>
            </div>
          )}
          {payment.paymentType && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <Badge variant="outline" className="capitalize">{payment.paymentType}</Badge>
            </div>
          )}
          {payment.paymentMethod && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Method</p>
              <Badge variant="outline" className="capitalize">{payment.paymentMethod}</Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function InspectionDetails({ inspection }: { inspection: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inspection Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge className="capitalize">{inspection.status || 'Unknown'}</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Inspection Type</p>
            <Badge variant="outline" className="capitalize">{inspection.inspectionType || 'N/A'}</Badge>
          </div>
          {inspection.scheduledDate && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Scheduled Date</p>
              <p className="text-lg font-semibold flex items-center gap-2">
                <IconCalendar size={20} stroke={2} className="h-4 w-4" />
                {new Date(inspection.scheduledDate).toLocaleDateString()}
              </p>
            </div>
          )}
          {inspection.completedDate && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed Date</p>
              <p className="text-lg font-semibold flex items-center gap-2">
                <IconCalendar size={20} stroke={2} className="h-4 w-4" />
                {new Date(inspection.completedDate).toLocaleDateString()}
              </p>
            </div>
          )}
          {inspection.inspector && (
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Inspector</p>
              <p className="text-lg font-semibold flex items-center gap-2">
                <IconUser size={20} stroke={2} className="h-4 w-4" />
                {inspection.inspector}
              </p>
            </div>
          )}
          {inspection.notes && (
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Notes</p>
              <p className="text-sm">{inspection.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function FundDetails({ fund }: { fund: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fund Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Fund Name</p>
            <p className="text-lg font-semibold">{fund.name || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Fund Type</p>
            <Badge variant="outline" className="capitalize">{fund.fundType || 'N/A'}</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <Badge className="capitalize">{fund.status || 'Unknown'}</Badge>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Capacity</p>
            <p className="text-lg font-semibold flex items-center gap-2">
              <IconCurrencyDollar size={20} stroke={2} className="h-4 w-4" />
              {fund.totalCapacity ? parseFloat(fund.totalCapacity).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Committed</p>
            <p className="text-lg font-semibold flex items-center gap-2">
              <IconCurrencyDollar size={20} stroke={2} className="h-4 w-4" />
              {fund.totalCommitted ? parseFloat(fund.totalCommitted).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Deployed</p>
            <p className="text-lg font-semibold flex items-center gap-2">
              <IconCurrencyDollar size={20} stroke={2} className="h-4 w-4" />
              {fund.totalDeployed ? parseFloat(fund.totalDeployed).toLocaleString() : 'N/A'}
            </p>
          </div>
          {fund.inceptionDate && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Inception Date</p>
              <p className="text-lg font-semibold flex items-center gap-2">
                <IconCalendar size={20} stroke={2} className="h-4 w-4" />
                {new Date(fund.inceptionDate).toLocaleDateString()}
              </p>
            </div>
          )}
          {fund.closingDate && (
            <div>
              <p className="text-sm font-medium text-muted-foreground">Closing Date</p>
              <p className="text-lg font-semibold flex items-center gap-2">
                <IconCalendar size={20} stroke={2} className="h-4 w-4" />
                {new Date(fund.closingDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SnapshotDetails({ snapshot, snapshotDate }: { snapshot: SnapshotData; snapshotDate: string }) {
  const fundSnapshot = snapshot?.snapshots?.fund;
  const loanSnapshot = snapshot?.snapshots?.loan;
  const paymentSnapshot = snapshot?.snapshots?.payment;
  const inspectionSnapshot = snapshot?.snapshots?.inspection;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconChartBar size={20} stroke={2} className="h-5 w-5" />
            Snapshot Overview - {new Date(snapshotDate).toLocaleDateString()}
          </CardTitle>
          <CardDescription>Comprehensive analytics snapshot for this date</CardDescription>
        </CardHeader>
      </Card>

      {/* Fund Snapshot */}
      {fundSnapshot && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Fund Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Commitments</p>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <IconCurrencyDollar size={20} stroke={2} className="h-4 w-4" />
                  {fundSnapshot.totalCommitments ? parseFloat(fundSnapshot.totalCommitments).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Capital Deployed</p>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <IconCurrencyDollar size={20} stroke={2} className="h-4 w-4" />
                  {fundSnapshot.capitalDeployed ? parseFloat(fundSnapshot.capitalDeployed).toLocaleString() : 'N/A'}
                </p>
              </div>
              {fundSnapshot.avgInvestorYield && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Investor Yield</p>
                  <p className="text-lg font-semibold">{parseFloat(fundSnapshot.avgInvestorYield).toFixed(2)}%</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loan Snapshot */}
      {loanSnapshot && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Loan Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Loans</p>
                <p className="text-lg font-semibold">{loanSnapshot.activeCount || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Delinquent Loans</p>
                <p className="text-lg font-semibold text-red-600">{loanSnapshot.delinquentCount || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Principal</p>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <IconCurrencyDollar size={20} stroke={2} className="h-4 w-4" />
                  {loanSnapshot.totalPrincipal ? parseFloat(loanSnapshot.totalPrincipal).toLocaleString() : 'N/A'}
                </p>
              </div>
              {loanSnapshot.avgLtv && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Average LTV</p>
                  <p className="text-lg font-semibold">{parseFloat(loanSnapshot.avgLtv).toFixed(1)}%</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Snapshot */}
      {paymentSnapshot && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount Received</p>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <IconCurrencyDollar size={20} stroke={2} className="h-4 w-4" />
                  {paymentSnapshot.amountReceived ? parseFloat(paymentSnapshot.amountReceived).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount Scheduled</p>
                <p className="text-lg font-semibold flex items-center gap-2">
                  <IconCurrencyDollar size={20} stroke={2} className="h-4 w-4" />
                  {paymentSnapshot.amountScheduled ? parseFloat(paymentSnapshot.amountScheduled).toLocaleString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Late Payments</p>
                <p className="text-lg font-semibold">{paymentSnapshot.lateCount || 0}</p>
              </div>
              {paymentSnapshot.avgCollectionDays && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Collection Days</p>
                  <p className="text-lg font-semibold">{parseFloat(paymentSnapshot.avgCollectionDays).toFixed(1)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inspection Snapshot */}
      {inspectionSnapshot && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inspection Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                <p className="text-lg font-semibold">{inspectionSnapshot.scheduledCount || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-lg font-semibold">{inspectionSnapshot.completedCount || 0}</p>
              </div>
              {inspectionSnapshot.avgCompletionHours && (
                <div className="col-span-2">
                  <p className="text-sm font-medium text-muted-foreground">Avg Completion Hours</p>
                  <p className="text-lg font-semibold">{parseFloat(inspectionSnapshot.avgCompletionHours).toFixed(1)}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Historical Trends */}
      {snapshot?.trends && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historical Trends</CardTitle>
            <CardDescription>60-day trend centered on snapshot date</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-muted rounded flex items-center justify-center">
              <p className="text-muted-foreground">
                Trend visualization: {snapshot.trends.fund?.length || 0} fund points,{' '}
                {snapshot.trends.loan?.length || 0} loan points,{' '}
                {snapshot.trends.payment?.length || 0} payment points
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

