"use client";

import { useState, useEffect } from "react";
import { IconCheck, IconLoader2 } from "@tabler/icons-react";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useLoans } from "@/hooks/useLoans";
import { useLenderLoans, useSyncLenderLoans } from "@/hooks/useLenders";

interface LenderLoanSelectorProps {
  lenderId: string;
  onSuccess?: () => void;
}

export function LenderLoanSelector({ lenderId, onSuccess }: LenderLoanSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedLoanIds, setSelectedLoanIds] = useState<string[]>([]);

  const { data: allLoans, isLoading: isLoadingAllLoans } = useLoans();
  const { data: lenderLoans, isLoading: isLoadingLenderLoans } = useLenderLoans(lenderId);
  const syncLenderLoans = useSyncLenderLoans();

  // Initialize selected loans from existing relationships
  useEffect(() => {
    if (lenderLoans) {
      setSelectedLoanIds(lenderLoans.map((loan: any) => loan.id));
    }
  }, [lenderLoans]);

  const handleToggleLoan = (loanId: string) => {
    setSelectedLoanIds((prev) =>
      prev.includes(loanId) ? prev.filter((id) => id !== loanId) : [...prev, loanId]
    );
  };

  // Auto-save on changes
  useEffect(() => {
    if (!isLoadingLenderLoans && lenderLoans) {
      const currentIds = lenderLoans.map((loan: any) => loan.id).sort().join(',');
      const newIds = selectedLoanIds.sort().join(',');

      if (currentIds !== newIds) {
        syncLenderLoans.mutate({ lenderId, loanIds: selectedLoanIds });
      }
    }
  }, [selectedLoanIds]);

  const isLoading = isLoadingAllLoans || isLoadingLenderLoans;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <IconLoader2 size={20} stroke={2} className="size-4 animate-spin" />
      </div>
    );
  }

  const selectedLoans = allLoans?.filter((loan: any) => selectedLoanIds.includes(loan.id)) || [];

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Associated Loans</label>
        <p className="text-muted-foreground text-sm">Select the loans funded by this lender</p>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedLoanIds.length > 0
              ? `${selectedLoanIds.length} loan(s) selected`
              : "Select loans..."}
            <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search loans..." />
            <CommandList>
              <CommandEmpty>No loans found.</CommandEmpty>
              <CommandGroup>
                {allLoans?.map((loan: any) => (
                  <CommandItem
                    key={loan.id}
                    value={loan.id}
                    onSelect={() => handleToggleLoan(loan.id)}
                  >
                    <IconCheck size={20} stroke={2} className={cn(
                        "mr-2 size-4",
                        selectedLoanIds.includes(loan.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex flex-1 items-center justify-between">
                      <span>{loan.propertyAddress || `Loan #${loan.id.slice(0, 8)}`}</span>
                      <span className="text-muted-foreground text-sm">
                        ${parseFloat(loan.principal || 0).toLocaleString()}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedLoans.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedLoans.map((loan: any) => (
            <Badge key={loan.id} variant="secondary">
              {loan.propertyAddress || `Loan #${loan.id.slice(0, 8)}`}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
