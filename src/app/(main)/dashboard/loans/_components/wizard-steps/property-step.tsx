"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWizardStore } from "@/lib/wizard-state";

interface PropertyStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function PropertyStep({ onNext }: PropertyStepProps) {
  const { property, isNewProperty, setProperty } = useWizardStore();
  const [mode, setMode] = useState<"existing" | "new">(isNewProperty ? "new" : "existing");
  const [searchTerm, setSearchTerm] = useState("");
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any>(property);
  const [newPropertyData, setNewPropertyData] = useState({
    address: property?.address || "",
    city: property?.city || "",
    state: property?.state || "",
    zip: property?.zip || "",
    propertyType: property?.propertyType || "",
    purchasePrice: property?.purchasePrice?.toString() || "",
  });

  useEffect(() => {
    if (mode === "existing") {
      fetchProperties();
    }
  }, [mode]);

  const fetchProperties = async () => {
    try {
      const response = await fetch("/api/v1/properties");
      const result = await response.json();
      if (result.success) {
        setProperties(result.data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    }
  };

  const handleContinue = () => {
    if (mode === "existing" && selectedProperty) {
      setProperty({ id: selectedProperty.id }, false);
      onNext();
    } else if (mode === "new" && newPropertyData.address && newPropertyData.city && newPropertyData.state) {
      setProperty(
        {
          address: newPropertyData.address,
          city: newPropertyData.city,
          state: newPropertyData.state,
          zip: newPropertyData.zip,
          propertyType: newPropertyData.propertyType,
          purchasePrice: newPropertyData.purchasePrice ? parseFloat(newPropertyData.purchasePrice) : undefined,
        },
        true
      );
      onNext();
    }
  };

  const filteredProperties = properties.filter((p) =>
    `${p.address} ${p.city}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Tabs value={mode} onValueChange={(v) => setMode(v as "existing" | "new")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="existing">Select Existing</TabsTrigger>
          <TabsTrigger value="new">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search">Search Properties</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="max-h-[300px] space-y-2 overflow-y-auto">
            {filteredProperties.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProperty(p)}
                className={`cursor-pointer rounded-lg border p-3 transition-all ${
                  selectedProperty?.id === p.id
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
              >
                <p className="font-medium">{p.address}</p>
                <p className="text-sm text-muted-foreground">
                  {p.city}, {p.state} {p.zip}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={newPropertyData.address}
                onChange={(e) => setNewPropertyData({ ...newPropertyData, address: e.target.value })}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={newPropertyData.city}
                  onChange={(e) => setNewPropertyData({ ...newPropertyData, city: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={newPropertyData.state}
                  onChange={(e) => setNewPropertyData({ ...newPropertyData, state: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={newPropertyData.zip}
                  onChange={(e) => setNewPropertyData({ ...newPropertyData, zip: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="propertyType">Property Type</Label>
                <Select
                  value={newPropertyData.propertyType}
                  onValueChange={(v) => setNewPropertyData({ ...newPropertyData, propertyType: v })}
                >
                  <SelectTrigger id="propertyType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_family">Single Family</SelectItem>
                    <SelectItem value="multi_family">Multi Family</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="purchasePrice">Purchase Price</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  value={newPropertyData.purchasePrice}
                  onChange={(e) => setNewPropertyData({ ...newPropertyData, purchasePrice: e.target.value })}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

