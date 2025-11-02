"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { SimpleDataTable as DataTable } from "@/components/data-table/simple-data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useFunds } from "@/hooks/useFunds";
import { FundForm } from "@/components/funds/FundForm";
import { createColumns } from "./_components/columns";
import type { Fund } from "@/types/fund";

export default function FundsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: funds, isLoading, error } = useFunds();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get("status") || "all");
  const [fundTypeFilter, setFundTypeFilter] = useState<string>(searchParams.get("type") || "all");

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (statusFilter && statusFilter !== "all") params.set("status", statusFilter);
    if (fundTypeFilter && fundTypeFilter !== "all") params.set("type", fundTypeFilter);

    const newUrl = params.toString() ? `?${params.toString()}` : "/dashboard/funds";
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, statusFilter, fundTypeFilter, router]);

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedFund(null);
  };

  const handleEdit = (fund: Fund) => {
    setSelectedFund(fund);
    setIsEditDialogOpen(true);
  };

  const handleView = (fund: Fund) => {
    router.push(`/dashboard/funds/${fund.id}`);
  };

  // Filter and search funds
  const filteredFunds = useMemo(() => {
    if (!funds) return [];

    return funds.filter((fund) => {
      // Status filter
      if (statusFilter !== "all" && fund.status !== statusFilter) {
        return false;
      }

      // Fund type filter
      if (fundTypeFilter !== "all" && fund.fundType !== fundTypeFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const name = fund.name?.toLowerCase() || "";
        const strategy = fund.strategy?.toLowerCase() || "";

        return name.includes(query) || strategy.includes(query);
      }

      return true;
    });
  }, [funds, searchQuery, statusFilter, fundTypeFilter]);

  const columns = createColumns(handleEdit, handleView);

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Funds</h1>
            <p className="text-muted-foreground">Manage investment funds and capital</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex h-32 items-center justify-center">
              <p className="text-destructive">Failed to load funds. Please try again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Funds</h1>
            <p className="text-muted-foreground">Manage investment funds and capital</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <IconPlus size={20} stroke={2} className="mr-2 size-4" />
            New Fund
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Funds</CardTitle>
            <CardDescription>View and manage all investment funds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <IconSearch size={20} stroke={2} className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  placeholder="Search by name or strategy..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="liquidated">Liquidated</SelectItem>
                </SelectContent>
              </Select>
              <Select value={fundTypeFilter} onValueChange={setFundTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="syndicated">Syndicated</SelectItem>
                  <SelectItem value="institutional">Institutional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : filteredFunds && filteredFunds.length > 0 ? (
              <DataTable columns={columns} data={filteredFunds} />
            ) : funds && funds.length > 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2">
                <p className="text-muted-foreground">No funds match your filters</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setFundTypeFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="flex h-32 flex-col items-center justify-center gap-2">
                <p className="text-muted-foreground">No funds found</p>
                <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                  <IconPlus size={20} stroke={2} className="mr-2 size-4" />
                  Create your first fund
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Drawer open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DrawerContent className="h-[75vh] max-h-[75vh]">
          <div className="mx-auto w-full max-w-4xl">
            <DrawerHeader>
              <DrawerTitle>Create New Fund</DrawerTitle>
              <DrawerDescription>
                Create a new investment fund. Fill in the required information below.
              </DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-4">
              <FundForm onSuccess={handleDialogClose} />
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DrawerContent className="h-[75vh] max-h-[75vh]">
          <div className="mx-auto w-full max-w-4xl">
            <DrawerHeader>
              <DrawerTitle>Edit Fund</DrawerTitle>
              <DrawerDescription>
                Update fund information and manage settings.
              </DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-4">
              {selectedFund && (
                <FundForm fund={selectedFund} onSuccess={handleDialogClose} />
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

