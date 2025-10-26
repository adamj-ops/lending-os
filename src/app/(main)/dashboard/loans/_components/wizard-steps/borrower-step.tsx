"use client";

import { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWizardStore } from "@/lib/wizard-state";

interface BorrowerStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function BorrowerStep({ onNext }: BorrowerStepProps) {
  const { borrower, isNewBorrower, setBorrower } = useWizardStore();
  const [mode, setMode] = useState<"existing" | "new">(isNewBorrower ? "new" : "existing");
  const [searchTerm, setSearchTerm] = useState("");
  const [borrowers, setBorrowers] = useState<any[]>([]);
  const [selectedBorrower, setSelectedBorrower] = useState<any>(borrower);
  const [newBorrowerData, setNewBorrowerData] = useState({
    firstName: borrower?.firstName || "",
    lastName: borrower?.lastName || "",
    email: borrower?.email || "",
    phone: borrower?.phone || "",
    companyName: borrower?.companyName || "",
    creditScore: borrower?.creditScore || "",
  });

  useEffect(() => {
    if (mode === "existing") {
      fetchBorrowers();
    }
  }, [mode]);

  const fetchBorrowers = async () => {
    try {
      const response = await fetch("/api/v1/borrowers");
      const result = await response.json();
      if (result.success) {
        setBorrowers(result.data);
      }
    } catch (error) {
      console.error("Error fetching borrowers:", error);
    }
  };

  const handleContinue = () => {
    if (mode === "existing" && selectedBorrower) {
      setBorrower({ id: selectedBorrower.id }, false);
      onNext();
    } else if (mode === "new" && newBorrowerData.firstName && newBorrowerData.lastName && newBorrowerData.email) {
      setBorrower(
        {
          firstName: newBorrowerData.firstName,
          lastName: newBorrowerData.lastName,
          email: newBorrowerData.email,
          phone: newBorrowerData.phone,
          companyName: newBorrowerData.companyName,
          creditScore: newBorrowerData.creditScore ? parseInt(newBorrowerData.creditScore.toString()) : undefined,
        },
        true
      );
      onNext();
    }
  };

  const filteredBorrowers = borrowers.filter((b) =>
    `${b.firstName} ${b.lastName} ${b.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isValid =
    (mode === "existing" && selectedBorrower) ||
    (mode === "new" && newBorrowerData.firstName && newBorrowerData.lastName && newBorrowerData.email);

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={(v) => setMode(v as "existing" | "new")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing">Select Existing</TabsTrigger>
          <TabsTrigger value="new">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Borrowers</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="max-h-[300px] space-y-2 overflow-y-auto">
            {filteredBorrowers.map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedBorrower(b)}
                className={`cursor-pointer rounded-lg border p-3 transition-all ${
                  selectedBorrower?.id === b.id
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
              >
                <p className="font-medium">
                  {b.firstName} {b.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{b.email}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={newBorrowerData.firstName}
                onChange={(e) => setNewBorrowerData({ ...newBorrowerData, firstName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={newBorrowerData.lastName}
                onChange={(e) => setNewBorrowerData({ ...newBorrowerData, lastName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newBorrowerData.email}
                onChange={(e) => setNewBorrowerData({ ...newBorrowerData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={newBorrowerData.phone}
                onChange={(e) => setNewBorrowerData({ ...newBorrowerData, phone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={newBorrowerData.companyName}
                onChange={(e) => setNewBorrowerData({ ...newBorrowerData, companyName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="creditScore">Credit Score</Label>
              <Input
                id="creditScore"
                type="number"
                min="300"
                max="850"
                value={newBorrowerData.creditScore}
                onChange={(e) => setNewBorrowerData({ ...newBorrowerData, creditScore: e.target.value })}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

