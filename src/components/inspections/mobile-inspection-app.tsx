"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedPhotoUploader, InspectionPhoto } from "@/components/inspections/enhanced-photo-uploader";
import { IconCamera, IconMapPin, IconWifi, IconWifiOff, IconDeviceFloppy, IconUpload, IconCircleCheck, IconAlertCircle } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface InspectionData {
  id: string;
  loanId: string;
  drawId?: string;
  inspectorName: string;
  inspectionDate: string;
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  checklist: InspectionChecklistItem[];
  photos: InspectionPhoto[];
  notes: string;
  weatherConditions?: string;
  temperature?: number;
  completedAt?: string;
  synced: boolean;
}

export interface InspectionChecklistItem {
  id: string;
  category: string;
  item: string;
  status: 'pending' | 'pass' | 'fail' | 'n/a';
  notes?: string;
  photos?: string[];
}

interface MobileInspectionAppProps {
  inspectionId?: string;
  loanId: string;
  onSave?: (inspection: InspectionData) => void;
  onComplete?: (inspection: InspectionData) => void;
  className?: string;
}

export function MobileInspectionApp({
  inspectionId,
  loanId,
  onSave,
  onComplete,
  className
}: MobileInspectionAppProps) {
  const [inspection, setInspection] = useState<InspectionData | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize inspection data
  useEffect(() => {
    if (inspectionId) {
      // Load existing inspection
      loadInspection(inspectionId);
    } else {
      // Create new inspection
      const newInspection: InspectionData = {
        id: `inspection-${Date.now()}`,
        loanId,
        inspectorName: '',
        inspectionDate: new Date().toISOString().split('T')[0],
        location: { address: '' },
        status: 'scheduled',
        checklist: getDefaultChecklist(),
        photos: [],
        notes: '',
        synced: false
      };
      setInspection(newInspection);
    }
  }, [inspectionId, loanId]);

  // Get current location
  const getCurrentLocation = async (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          resolve({ latitude, longitude });
        },
        (error) => {
          console.error('Error getting location:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  const loadInspection = async (id: string) => {
    try {
      const response = await fetch(`/api/v1/inspections/${id}`);
      if (response.ok) {
        const data = await response.json();
        setInspection(data);
      }
    } catch (error) {
      console.error('Error loading inspection:', error);
      // Try to load from local storage as fallback
      const localData = localStorage.getItem(`inspection-${id}`);
      if (localData) {
        setInspection(JSON.parse(localData));
        setIsOfflineMode(true);
      }
    }
  };

  const getDefaultChecklist = (): InspectionChecklistItem[] => [
    { id: '1', category: 'Foundation', item: 'Foundation walls straight and plumb', status: 'pending' },
    { id: '2', category: 'Foundation', item: 'No cracks or damage visible', status: 'pending' },
    { id: '3', category: 'Framing', item: 'Framing members properly installed', status: 'pending' },
    { id: '4', category: 'Framing', item: 'No warping or damage to lumber', status: 'pending' },
    { id: '5', category: 'Electrical', item: 'Electrical rough-in complete', status: 'pending' },
    { id: '6', category: 'Plumbing', item: 'Plumbing rough-in complete', status: 'pending' },
    { id: '7', category: 'HVAC', item: 'HVAC rough-in complete', status: 'pending' },
    { id: '8', category: 'Insulation', item: 'Insulation properly installed', status: 'pending' },
    { id: '9', category: 'Drywall', item: 'Drywall installation quality', status: 'pending' },
    { id: '10', category: 'Finishes', item: 'Paint and finishes quality', status: 'pending' }
  ];

  const updateInspection = (updates: Partial<InspectionData>) => {
    if (inspection) {
      const updated = { ...inspection, ...updates };
      setInspection(updated);
      
      // Save to local storage for offline support
      localStorage.setItem(`inspection-${updated.id}`, JSON.stringify(updated));
    }
  };

  const updateChecklistItem = (itemId: string, updates: Partial<InspectionChecklistItem>) => {
    if (inspection) {
      const updatedChecklist = inspection.checklist.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      );
      updateInspection({ checklist: updatedChecklist });
    }
  };

  const handlePhotosChange = (photos: InspectionPhoto[]) => {
    updateInspection({ photos });
  };

  const handleSave = async () => {
    if (!inspection) return;

    setIsSaving(true);
    
    try {
      if (isOnline) {
        // Save to server
        const response = await fetch(`/api/v1/inspections${inspectionId ? `/${inspectionId}` : ''}`, {
          method: inspectionId ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(inspection)
        });

        if (response.ok) {
          updateInspection({ synced: true });
          onSave?.(inspection);
        } else {
          throw new Error('Failed to save inspection');
        }
      } else {
        // Save locally for offline sync
        updateInspection({ synced: false });
        localStorage.setItem(`inspection-${inspection.id}`, JSON.stringify(inspection));
        
        // Register for background sync
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
          const registration = await navigator.serviceWorker.ready;
          // Background Sync API - TypeScript doesn't have built-in types for this
          await (registration as any).sync.register('inspection-sync');
        }
      }
    } catch (error) {
      console.error('Error saving inspection:', error);
      // Still save locally
      updateInspection({ synced: false });
      localStorage.setItem(`inspection-${inspection.id}`, JSON.stringify(inspection));
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!inspection) return;

    const completedInspection = {
      ...inspection,
      status: 'completed' as const,
      completedAt: new Date().toISOString()
    };

    updateInspection(completedInspection);
    await handleSave();
    onComplete?.(completedInspection);
  };

  if (!inspection) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading inspection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("max-w-md mx-auto p-4 space-y-4", className)}>
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Inspection #{inspection.id.slice(-6)}</CardTitle>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <IconWifi size={16} stroke={2} className="h-4 w-4 text-green-600" />
              ) : (
                <IconWifiOff size={16} stroke={2} className="h-4 w-4 text-red-600" />
              )}
              {!inspection.synced && (
                <Badge variant="outline" className="text-xs">
                  Offline
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700">Inspector Name</label>
            <Input
              value={inspection.inspectorName}
              onChange={(e) => updateInspection({ inspectorName: e.target.value })}
              placeholder="Enter your name"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Inspection Date</label>
            <Input
              type="date"
              value={inspection.inspectionDate}
              onChange={(e) => updateInspection({ inspectionDate: e.target.value })}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">Location</label>
            <div className="flex gap-2">
              <Input
                value={inspection.location.address}
                onChange={(e) => updateInspection({ 
                  location: { ...inspection.location, address: e.target.value }
                })}
                placeholder="Property address"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                className="px-3"
              >
                <IconMapPin size={20} stroke={2} className="h-4 w-4" />
              </Button>
            </div>
            {location && (
              <p className="text-xs text-gray-500 mt-1">
                GPS: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inspection Checklist</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {inspection.checklist.map((item) => (
            <div key={item.id} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-sm">{item.item}</p>
                  <p className="text-xs text-gray-500">{item.category}</p>
                </div>
                <Select
                  value={item.status}
                  onValueChange={(value: any) => updateChecklistItem(item.id, { status: value })}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="pass">Pass</SelectItem>
                    <SelectItem value="fail">Fail</SelectItem>
                    <SelectItem value="n/a">N/A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {item.status === 'fail' && (
                <Textarea
                  placeholder="Add notes about the issue..."
                  value={item.notes || ''}
                  onChange={(e) => updateChecklistItem(item.id, { notes: e.target.value })}
                  className="text-sm"
                  rows={2}
                />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Photos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Photos</CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedPhotoUploader
            photos={inspection.photos}
            onPhotosChange={handlePhotosChange}
            onLocationCapture={getCurrentLocation}
          />
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={inspection.notes}
            onChange={(e) => updateInspection({ notes: e.target.value })}
            placeholder="Additional notes about the inspection..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-2 sticky bottom-4">
        <Button
          variant="outline"
          onClick={handleSave}
          disabled={isSaving}
          className="flex-1"
        >
          {isSaving ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
          ) : (
            <IconDeviceFloppy size={20} stroke={2} className="h-4 w-4 mr-2" />
          )}
          {isOnline ? 'Save' : 'Save Offline'}
        </Button>
        
        <Button
          onClick={handleComplete}
          disabled={isSaving || inspection.status === 'completed'}
          className="flex-1"
        >
          <IconCircleCheck size={20} stroke={2} className="h-4 w-4 mr-2" />
          Complete
        </Button>
      </div>

      {/* Status Indicator */}
      {!isOnline && (
        <div className="fixed top-4 left-4 right-4 bg-yellow-100 border border-yellow-400 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <IconAlertCircle size={20} stroke={2} className="h-4 w-4 text-yellow-600" />
            <p className="text-sm text-yellow-800">
              You're offline. Data will sync when connection is restored.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
