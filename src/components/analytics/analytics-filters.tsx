'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { IconCalendar, IconFilter, IconX, IconChevronDown } from "@tabler/icons-react";
import { format, subDays, subMonths, startOfYear, startOfQuarter } from 'date-fns';
import { cn } from '@/lib/utils';
import { useFunds } from '@/hooks/useFunds';
import { useLoans } from '@/hooks/useLoans';
import { useProperties } from '@/hooks/useProperties';
import type { AnalyticsFilters, AnalyticsFiltersProps, FilterPreset } from '@/types/analytics';

interface Loan {
  id: string;
  loanAmount: string;
  propertyAddress?: string;
}

interface Property {
  id: string;
  address: string;
}

interface Fund {
  id: string;
  name: string;
  fundType?: string;
}

export function AnalyticsFilters({ onFilterChange, initialFilters }: AnalyticsFiltersProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    initialFilters?.startDate ? new Date(initialFilters.startDate) : undefined
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    initialFilters?.endDate ? new Date(initialFilters.endDate) : undefined
  );
  const [selectedLoanIds, setSelectedLoanIds] = useState<string[]>(initialFilters?.loanIds || []);
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>(initialFilters?.propertyIds || []);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(initialFilters?.statuses || []);
  const [selectedFundIds, setSelectedFundIds] = useState<string[]>(initialFilters?.fundIds || []);
  const [activePreset, setActivePreset] = useState<FilterPreset | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Use custom hooks per UI standards
  const { data: loans = [], isLoading: loansLoading } = useLoans();
  const { data: properties = [], isLoading: propertiesLoading } = useProperties();
  const { data: funds = [], isLoading: fundsLoading } = useFunds();

  // Initialize collapsed state: expanded if filters are active, collapsed if none
  useEffect(() => {
    const hasActiveFilters = 
      startDate || 
      endDate || 
      selectedLoanIds.length > 0 || 
      selectedPropertyIds.length > 0 || 
      selectedStatuses.length > 0 || 
      selectedFundIds.length > 0;
    setIsCollapsed(!hasActiveFilters);
  }, []); // Only on mount

  // Detect active preset based on current dates
  useEffect(() => {
    if (!startDate || !endDate) {
      setActivePreset(null);
      return;
    }

    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');
    
    // Check if end date is today (within reason)
    if (endDateStr !== todayStr) {
      setActivePreset('custom');
      return;
    }

    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const sevenDaysAgo = format(subDays(today, 7), 'yyyy-MM-dd');
    const thirtyDaysAgo = format(subDays(today, 30), 'yyyy-MM-dd');
    const ninetyDaysAgo = format(subDays(today, 90), 'yyyy-MM-dd');
    const quarterStart = format(startOfQuarter(subMonths(today, 1)), 'yyyy-MM-dd');
    const yearStart = format(startOfYear(today), 'yyyy-MM-dd');

    if (startDateStr === sevenDaysAgo) {
      setActivePreset('7d');
    } else if (startDateStr === thirtyDaysAgo) {
      setActivePreset('30d');
    } else if (startDateStr === ninetyDaysAgo) {
      setActivePreset('90d');
    } else if (startDateStr === quarterStart) {
      setActivePreset('quarter');
    } else if (startDateStr === yearStart) {
      setActivePreset('year');
    } else {
      setActivePreset('custom');
    }
  }, [startDate, endDate]);

  // Data fetching is now handled by hooks - no manual fetch needed
  const loading = loansLoading || propertiesLoading || fundsLoading;

  const handleApply = () => {
    const filters: AnalyticsFilters = {
      startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
      endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
      loanIds: selectedLoanIds.length > 0 ? selectedLoanIds : undefined,
      propertyIds: selectedPropertyIds.length > 0 ? selectedPropertyIds : undefined,
      statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
      fundIds: selectedFundIds.length > 0 ? selectedFundIds : undefined,
    };
    onFilterChange(filters);
  };

  const handleReset = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setSelectedLoanIds([]);
    setSelectedPropertyIds([]);
    setSelectedStatuses([]);
    setSelectedFundIds([]);
    onFilterChange({});
  };

  const toggleLoan = (loanId: string) => {
    setSelectedLoanIds(prev =>
      prev.includes(loanId) ? prev.filter(id => id !== loanId) : [...prev, loanId]
    );
  };

  const toggleProperty = (propertyId: string) => {
    setSelectedPropertyIds(prev =>
      prev.includes(propertyId) ? prev.filter(id => id !== propertyId) : [...prev, propertyId]
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const removeLoan = (loanId: string) => {
    setSelectedLoanIds(prev => prev.filter(id => id !== loanId));
  };

  const removeProperty = (propertyId: string) => {
    setSelectedPropertyIds(prev => prev.filter(id => id !== propertyId));
  };

  const removeStatus = (status: string) => {
    setSelectedStatuses(prev => prev.filter(s => s !== status));
  };

  const toggleFund = (fundId: string) => {
    setSelectedFundIds(prev =>
      prev.includes(fundId) ? prev.filter(id => id !== fundId) : [...prev, fundId]
    );
  };

  const removeFund = (fundId: string) => {
    setSelectedFundIds(prev => prev.filter(id => id !== fundId));
  };

  const applyPreset = (preset: FilterPreset) => {
    const today = new Date();
    let newStartDate: Date | undefined;
    let newEndDate: Date = today;

    switch (preset) {
      case '7d':
        newStartDate = subDays(today, 7);
        break;
      case '30d':
        newStartDate = subDays(today, 30);
        break;
      case '90d':
        newStartDate = subDays(today, 90);
        break;
      case 'quarter':
        newStartDate = startOfQuarter(subMonths(today, 1));
        break;
      case 'year':
        newStartDate = startOfYear(today);
        break;
      case 'all':
        newStartDate = undefined;
        newEndDate = today;
        break;
      case 'custom':
        // Keep current dates
        return;
    }

    setStartDate(newStartDate);
    setEndDate(newEndDate);
    setActivePreset(preset);
    
    // Auto-apply preset
    if (newStartDate) {
      const filters: AnalyticsFilters = {
        startDate: format(newStartDate, 'yyyy-MM-dd'),
        endDate: format(newEndDate, 'yyyy-MM-dd'),
        loanIds: selectedLoanIds.length > 0 ? selectedLoanIds : undefined,
        propertyIds: selectedPropertyIds.length > 0 ? selectedPropertyIds : undefined,
        statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
        fundIds: selectedFundIds.length > 0 ? selectedFundIds : undefined,
      };
      onFilterChange(filters);
    } else {
      handleReset();
    }
  };

  const activeFilterCount = [
    startDate ? 1 : 0,
    endDate ? 1 : 0,
    selectedLoanIds.length,
    selectedPropertyIds.length,
    selectedStatuses.length,
    selectedFundIds.length,
  ].reduce((a, b) => a + b, 0);

  const presets: { value: FilterPreset; label: string }[] = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: 'quarter', label: 'Last quarter' },
    { value: 'year', label: 'Last year' },
    { value: 'all', label: 'All time' },
  ];

  return (
    <Collapsible open={!isCollapsed} onOpenChange={(open) => setIsCollapsed(!open)}>
      <div className="space-y-4">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between cursor-pointer hover:bg-muted/50 rounded-lg p-2 -m-2 transition-colors">
            <div className="flex items-center gap-2">
              <IconFilter size={20} stroke={2} className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Filters</h3>
              {activeFilterCount > 0 && (
                <Badge variant="secondary">{activeFilterCount}</Badge>
              )}
              {isCollapsed && activeFilterCount > 0 && (
                <span className="text-sm text-muted-foreground">
                  {startDate && endDate && `${format(new Date(startDate), 'MMM d')} - ${format(new Date(endDate), 'MMM d')}`}
                  {selectedFundIds.length > 0 && ` • ${selectedFundIds.length} fund${selectedFundIds.length > 1 ? 's' : ''}`}
                  {selectedLoanIds.length > 0 && ` • ${selectedLoanIds.length} loan${selectedLoanIds.length > 1 ? 's' : ''}`}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isCollapsed && (
                <>
                  <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleReset(); }}>
                    Reset
                  </Button>
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); handleApply(); }}>
                    Apply
                  </Button>
                </>
              )}
              <IconChevronDown 
                size={20} 
                stroke={2} 
                className={cn("h-4 w-4 transition-transform", !isCollapsed && "rotate-180")} 
              />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4">
          {/* Quick Presets */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Presets</Label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <Button
                  key={preset.value}
                  variant={activePreset === preset.value ? "primary" : "outline"}
                  size="sm"
                  onClick={() => applyPreset(preset.value)}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
              {activePreset === 'custom' && (
                <Button
                  variant="primary"
                  size="sm"
                  className="text-xs"
                  disabled
                >
                  Custom Range
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Filter Sections */}
          <div className="space-y-6">
            {/* Section 1: Date Range */}
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <IconCalendar size={18} stroke={2} className="h-4 w-4" />
                <Label className="text-base font-semibold">Date Range</Label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !startDate && 'text-muted-foreground'
                      )}
                    >
                      <IconCalendar size={16} stroke={2} />
                      {startDate ? format(startDate, 'MMM dd, yyyy') : 'Start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !endDate && 'text-muted-foreground'
                      )}
                    >
                      <IconCalendar size={16} stroke={2} />
                      {endDate ? format(endDate, 'MMM dd, yyyy') : 'End date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Section 2: Entity Filters */}
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <Label className="text-base font-semibold">Entity Filters</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Loan Filter */}
                <div className="space-y-2">
                  <Label>Loans</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {selectedLoanIds.length > 0
                          ? `${selectedLoanIds.length} selected`
                          : 'Select loans'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0">
                      <ScrollArea className="h-[300px]">
                        <div className="p-4 space-y-2">
                          {loading ? (
                            <div className="text-sm text-muted-foreground">Loading...</div>
                          ) : loans.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No loans available</div>
                          ) : (
                            loans.map((loan: Loan) => (
                              <div key={loan.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`loan-${loan.id}`}
                                  checked={selectedLoanIds.includes(loan.id)}
                                  onCheckedChange={() => toggleLoan(loan.id)}
                                />
                                <Label
                                  htmlFor={`loan-${loan.id}`}
                                  className="text-sm font-normal cursor-pointer flex-1"
                                >
                                  ${parseFloat(loan.loanAmount).toLocaleString()}
                                  {loan.propertyAddress && (
                                    <span className="text-muted-foreground ml-1">
                                      - {loan.propertyAddress}
                                    </span>
                                  )}
                                </Label>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                  {selectedLoanIds.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedLoanIds.map(loanId => {
                        const loan: Loan | undefined = loans.find((l: Loan) => l.id === loanId);
                        return (
                          <Badge key={loanId} variant="secondary" className="gap-1">
                            ${loan ? parseFloat(loan.loanAmount).toLocaleString() : loanId}
                            <IconX size={20} stroke={2} className="h-3 w-3 cursor-pointer"
                              onClick={() => removeLoan(loanId)}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Property Filter */}
                <div className="space-y-2">
                  <Label>Properties</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {selectedPropertyIds.length > 0
                          ? `${selectedPropertyIds.length} selected`
                          : 'Select properties'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0">
                      <ScrollArea className="h-[300px]">
                        <div className="p-4 space-y-2">
                          {loading ? (
                            <div className="text-sm text-muted-foreground">Loading...</div>
                          ) : properties.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No properties available</div>
                          ) : (
                            properties.map(property => (
                              <div key={property.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`property-${property.id}`}
                                  checked={selectedPropertyIds.includes(property.id)}
                                  onCheckedChange={() => toggleProperty(property.id)}
                                />
                                <Label
                                  htmlFor={`property-${property.id}`}
                                  className="text-sm font-normal cursor-pointer flex-1"
                                >
                                  {property.address}
                                </Label>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                  {selectedPropertyIds.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedPropertyIds.map(propertyId => {
                        const property = properties.find(p => p.id === propertyId);
                        return (
                          <Badge key={propertyId} variant="secondary" className="gap-1">
                            {property?.address || propertyId}
                            <IconX size={20} stroke={2} className="h-3 w-3 cursor-pointer"
                              onClick={() => removeProperty(propertyId)}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Fund Filter */}
                <div className="space-y-2">
                  <Label>Funds</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        {selectedFundIds.length > 0
                          ? `${selectedFundIds.length} selected`
                          : 'Select funds'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0">
                      <ScrollArea className="h-[300px]">
                        <div className="p-4 space-y-2">
                          {fundsLoading || loading ? (
                            <div className="text-sm text-muted-foreground">Loading...</div>
                          ) : funds.length === 0 ? (
                            <div className="text-sm text-muted-foreground">No funds available</div>
                          ) : (
                            funds.map(fund => (
                              <div key={fund.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`fund-${fund.id}`}
                                  checked={selectedFundIds.includes(fund.id)}
                                  onCheckedChange={() => toggleFund(fund.id)}
                                />
                                <Label
                                  htmlFor={`fund-${fund.id}`}
                                  className="text-sm font-normal cursor-pointer flex-1"
                                >
                                  {fund.name}
                                  {fund.fundType && (
                                    <span className="text-muted-foreground ml-1 capitalize">
                                      - {fund.fundType}
                                    </span>
                                  )}
                                </Label>
                              </div>
                            ))
                          )}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                  {selectedFundIds.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedFundIds.map(fundId => {
                        const fund = funds.find(f => f.id === fundId);
                        return (
                          <Badge key={fundId} variant="secondary" className="gap-1">
                            {fund?.name || fundId}
                            <IconX size={20} stroke={2} className="h-3 w-3 cursor-pointer"
                              onClick={() => removeFund(fundId)}
                            />
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Status Filters */}
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <Label className="text-base font-semibold">Status Filters</Label>
              <div className="space-y-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full md:w-auto justify-start text-left font-normal">
                      {selectedStatuses.length > 0
                        ? `${selectedStatuses.length} selected`
                        : 'Select status'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-0">
                    <div className="p-4 space-y-2">
                      {['active', 'delinquent', 'completed', 'cancelled'].map(status => (
                        <div key={status} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={selectedStatuses.includes(status)}
                            onCheckedChange={() => toggleStatus(status)}
                          />
                          <Label
                            htmlFor={`status-${status}`}
                            className="text-sm font-normal cursor-pointer capitalize"
                          >
                            {status}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                {selectedStatuses.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedStatuses.map(status => (
                      <Badge key={status} variant="secondary" className="gap-1 capitalize">
                        {status}
                        <IconX size={20} stroke={2} className="h-3 w-3 cursor-pointer"
                          onClick={() => removeStatus(status)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              Reset All
            </Button>
            <Button size="sm" onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

