"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface DocumentSigningFormProps {
  organizationId: string;
  documentType: "loan_agreement" | "ppm" | "subscription_agreement" | "compliance_disclosure";
  documentId?: string;
  loanId?: string;
  fundId?: string;
  onSuccess?: () => void;
}

export function DocumentSigningForm({
  organizationId,
  documentType,
  documentId,
  loanId,
  fundId,
  onSuccess,
}: DocumentSigningFormProps) {
  const [signers, setSigners] = useState<Array<{ email: string; name: string; role: string }>>([
    { email: "", name: "", role: "signer" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addSigner = () => {
    setSigners([...signers, { email: "", name: "", role: "signer" }]);
  };

  const removeSigner = (index: number) => {
    setSigners(signers.filter((_, i) => i !== index));
  };

  const updateSigner = (index: number, field: string, value: string) => {
    const updated = [...signers];
    updated[index] = { ...updated[index], [field]: value };
    setSigners(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/v1/compliance/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId,
          documentType,
          documentId,
          loanId,
          fundId,
          signers: signers.filter((s) => s.email && s.name),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create signature envelope");
      }

      toast.success("Signature envelope created successfully");

      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create signature envelope");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        {signers.map((signer, index) => (
          <div key={index} className="flex gap-2 items-end">
            <div className="flex-1">
              <Label>Signer {index + 1} Name</Label>
              <Input
                value={signer.name}
                onChange={(e) => updateSigner(index, "name", e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>
            <div className="flex-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={signer.email}
                onChange={(e) => updateSigner(index, "email", e.target.value)}
                placeholder="john@example.com"
                required
              />
            </div>
            <div className="w-32">
              <Label>Role</Label>
              <Select
                value={signer.role}
                onValueChange={(value) => updateSigner(index, "role", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="signer">Signer</SelectItem>
                  <SelectItem value="borrower">Borrower</SelectItem>
                  <SelectItem value="lender">Lender</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {signers.length > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => removeSigner(index)}
                size="sm"
              >
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={addSigner}>
          Add Signer
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Signature Envelope"}
        </Button>
      </div>
    </form>
  );
}


