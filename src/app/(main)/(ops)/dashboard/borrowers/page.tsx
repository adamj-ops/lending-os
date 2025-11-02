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
import { useBorrowers } from "@/hooks/useBorrowers";
import { BorrowerForm } from "@/components/borrowers/BorrowerForm";
import { createColumns } from "./_components/columns";
import type { Borrower } from "@/types/borrower";

export default function BorrowersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: borrowers, isLoading, error } = useBorrowers();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBorrower, setSelectedBorrower] = useState<Borrower | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get("type") || "all");

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (typeFilter && typeFilter !== "all") params.set("type", typeFilter);

    const newUrl = params.toString() ? `?${params.toString()}` : "/dashboard/borrowers";
    router.replace(newUrl, { scroll: false });
  }, [searchQuery, typeFilter, router]);

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setIsEditDialogOpen(false);
    setSelectedBorrower(null);
  };

  const handleEdit = (borrower: Borrower) => {
    setSelectedBorrower(borrower);
    setIsEditDialogOpen(true);
  };

  // Filter and search borrowers
  const filteredBorrowers = useMemo(() => {
    if (!borrowers) return [];

    return borrowers.filter((borrower) => {
      // Type filter
      if (typeFilter !== "all" && borrower.type !== typeFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const name = borrower.type === "individual"
          ? `${borrower.firstName || ""} ${borrower.lastName || ""}`.trim()
          : borrower.name || "";
        const email = borrower.email?.toLowerCase() || "";

        return name.toLowerCase().includes(query) || email.includes(query);
      }

      return true;
    });
  }, [borrowers, searchQuery, typeFilter]);

  const columns = createColumns(handleEdit);

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Borrowers</h1>
            <p className="text-muted-foreground">Manage borrower profiles and relationships</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex h-32 flex-col items-center justify-center gap-2">
              <p className="text-destructive">Failed to load borrowers. Please try again.</p>
              <p className="text-sm text-muted-foreground">{error?.message || "Unknown error"}</p>
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
            <h1 className="text-3xl font-bold">Borrowers</h1>
            <p className="text-muted-foreground">Manage borrower profiles and relationships</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <IconPlus size={20} stroke={2} className="mr-2 size-4" />
            New Borrower
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Borrowers</CardTitle>
            <CardDescription>View and manage all borrowers in your system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <IconSearch size={20} stroke={2} className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="entity">Entity</SelectItem>
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
            ) : filteredBorrowers && filteredBorrowers.length > 0 ? (
              <DataTable columns={columns} data={filteredBorrowers} />
            ) : borrowers && borrowers.length > 0 ? (
              <div className="flex h-32 flex-col items-center justify-center gap-2">
                <p className="text-muted-foreground">No borrowers match your filters</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setTypeFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            ) : (
              <div className="flex h-32 flex-col items-center justify-center gap-2">
                <p className="text-muted-foreground">No borrowers found</p>
                <Button variant="outline" size="sm" onClick={() => setIsCreateDialogOpen(true)}>
                  <IconPlus size={20} stroke={2} className="mr-2 size-4" />
                  Add your first borrower
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
              <DrawerTitle>Create New Borrower</DrawerTitle>
              <DrawerDescription>
                Add a new borrower to your system. Fill in the required information below.
              </DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-4">
              <BorrowerForm onSuccess={handleDialogClose} />
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DrawerContent className="h-[75vh] max-h-[75vh]">
          <div className="mx-auto w-full max-w-4xl">
            <DrawerHeader>
              <DrawerTitle>Edit Borrower</DrawerTitle>
              <DrawerDescription>
                Update borrower information and manage loan associations.
              </DrawerDescription>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-4">
              {selectedBorrower && (
                <BorrowerForm borrower={selectedBorrower} onSuccess={handleDialogClose} />
              )}
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
