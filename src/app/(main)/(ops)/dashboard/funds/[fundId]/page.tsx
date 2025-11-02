"use client";

import { use } from "react";
import { IconArrowLeft } from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFund } from "@/hooks/useFunds";
import { OverviewTab } from "./_components/overview-tab";
import { CommitmentsTab } from "./_components/commitments-tab";
import { CallsTab } from "./_components/calls-tab";
import { AllocationsTab } from "./_components/allocations-tab";
import { DistributionsTab } from "./_components/distributions-tab";

interface FundDetailPageProps {
  params: Promise<{ fundId: string }>;
}

export default function FundDetailPage({ params }: FundDetailPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { data: fund, isLoading, error } = useFund(resolvedParams.fundId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !fund) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <IconArrowLeft size={20} stroke={2} className="mr-2 size-4" />
          Back
        </Button>
        <div className="flex h-64 items-center justify-center">
          <p className="text-destructive">Failed to load fund. Please try again.</p>
        </div>
      </div>
    );
  }

  const statusVariant = fund.status === "active" ? "success" : fund.status === "closed" ? "secondary" : "destructive";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <IconArrowLeft size={20} stroke={2} className="size-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{fund.name}</h1>
              <Badge variant={statusVariant}>{fund.status}</Badge>
            </div>
            <p className="text-muted-foreground">
              {fund.fundType.charAt(0).toUpperCase() + fund.fundType.slice(1)} Fund
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="commitments">
            Commitments
            {fund.investorCount > 0 && (
              <Badge variant="secondary" className="ml-2">{fund.investorCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="calls">
            Capital Calls
            {fund.activeCallCount > 0 && (
              <Badge variant="outline" className="ml-2">{fund.activeCallCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="allocations">
            Allocations
            {fund.allocationCount > 0 && (
              <Badge variant="secondary" className="ml-2">{fund.allocationCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="distributions">Distributions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab fund={fund} />
        </TabsContent>

        <TabsContent value="commitments" className="space-y-4">
          <CommitmentsTab fundId={fund.id} />
        </TabsContent>

        <TabsContent value="calls" className="space-y-4">
          <CallsTab fundId={fund.id} />
        </TabsContent>

        <TabsContent value="allocations" className="space-y-4">
          <AllocationsTab fundId={fund.id} />
        </TabsContent>

        <TabsContent value="distributions" className="space-y-4">
          <DistributionsTab fundId={fund.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

