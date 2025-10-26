"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLenders } from "@/hooks/useLenders";
import { LenderForm } from "@/components/lenders/LenderForm";
import { createColumns } from "./_components/columns";
import type { Lender } from "@/types/lender";

export default function LendersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: lenders, isLoading, error } = useLenders();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedLender, setSelectedLender] = useState<Lender | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>(searchParams.get("type") || "all");

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (entityTypeFilter && entityTypeFilter !== "all") params.set("type", entityTypeFilter);

    const newUrl = params.toString() ? `?${params.toString()}` : "/dashboard/lenders";
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, entityTypeFilter, router]);

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedLender(null);
  };

  const handleEdit = (lender: Lender) => {
    setSelectedLender(lender);
    setIsEditDialogOpen(true);
  };

  // Filter and search lenders
  const filteredLenders = useMemo(() => {
    if (!lenders) return [];

    return lenders.filter((lender) => {
      // Entity type filter
      if (entityTypeFilter !== "all" && lender.entityType !== entityTypeFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const name = lender.name?.toLowerCase() || "";
        const email = lender.contactEmail?.toLowerCase() || "";

        return name.includes(query) || email.includes(query);
      }

      return true;
    });
  }, [lenders, searchQuery, entityTypeFilter]);

  const columns = createColumns(handleEdit);

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Lenders</h1>
            <p className="text-muted-foreground">Manage capital providers and investors</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex h-32 items-center justify-center">
              <p className="text-destructive">Failed to load lenders. Please try again.</p>
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
            <h1 className="text-3xl font-bold">Lenders</h1>
            <p className="text-muted-foreground">Manage capital providers and investors</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            New Lender
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Lenders</CardTitle>
            <CardDescription>View and manage all lenders and capital providers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                  <SelectItem value="fund">Fund</SelectItem>
                  <SelectItem value="ira">IRA</SelectItem>
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
            ) : filteredLenders && filteredLenders.length > 0 ? (
              <DataTable columns={columns} data={filteredLenders} />
            ) : lenders && lenders.length > 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2">
                <p className="text-muted-foreground">No lenders match your filters</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setEntityTypeFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="flex h-32 flex-col items-center justify-center gap-2">
                <p className="text-muted-foreground">No lenders found</p>
                <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="mr-2 size-4" />
                  Add your first lender
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Lender</DialogTitle>
            <DialogDescription>
              Add a new lender to your system. Fill in the required information below.
            </DialogDescription>
          </DialogHeader>
          <LenderForm onSuccess={handleDialogClose} />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Lender</DialogTitle>
            <DialogDescription>
              Update lender information and manage loan associations.
            </DialogDescription>
          </DialogHeader>
          {selectedLender && (
            <LenderForm lender={selectedLender} onSuccess={handleDialogClose} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
