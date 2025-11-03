"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/ui/file-upload";
import { IconCamera, IconUpload, IconX, IconMapPin, IconClock } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

export interface InspectionPhoto {
  id: string;
  file: File;
  preview: string;
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  description?: string;
  category: 'exterior' | 'interior' | 'damage' | 'progress' | 'other';
}

interface EnhancedPhotoUploaderProps {
  photos: InspectionPhoto[];
  onPhotosChange: (photos: InspectionPhoto[]) => void;
  onLocationCapture?: () => Promise<{ latitude: number; longitude: number }>;
  className?: string;
}

export function EnhancedPhotoUploader({
  photos,
  onPhotosChange,
  onLocationCapture,
  className
}: EnhancedPhotoUploaderProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureMode, setCaptureMode] = useState<'camera' | 'upload'>('upload');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      // Fallback to file upload
      setCaptureMode('upload');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0);

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return;

      const file = new File([blob], `inspection-photo-${Date.now()}.jpg`, {
        type: 'image/jpeg'
      });

      // Get current location if available
      let location: { latitude: number; longitude: number } | undefined;
      if (onLocationCapture) {
        try {
          location = await onLocationCapture();
        } catch (error) {
          console.error('Error capturing location:', error);
        }
      }

      const newPhoto: InspectionPhoto = {
        id: `photo-${Date.now()}`,
        file,
        preview: URL.createObjectURL(blob),
        timestamp: new Date(),
        location,
        category: 'other'
      };

      onPhotosChange([...photos, newPhoto]);
      stopCamera();
    }, 'image/jpeg', 0.8);
  };

  const handleFileUpload = (files: File[]) => {
    const newPhotos: InspectionPhoto[] = files.map(file => ({
      id: `photo-${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
      timestamp: new Date(),
      category: 'other' as const
    }));

    onPhotosChange([...photos, ...newPhotos]);
  };

  const removePhoto = (photoId: string) => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId);
    onPhotosChange(updatedPhotos);
  };

  const updatePhotoCategory = (photoId: string, category: InspectionPhoto['category']) => {
    const updatedPhotos = photos.map(photo =>
      photo.id === photoId ? { ...photo, category } : photo
    );
    onPhotosChange(updatedPhotos);
  };

  const categories = [
    { value: 'exterior', label: 'Exterior', color: 'bg-blue-100 text-blue-800' },
    { value: 'interior', label: 'Interior', color: 'bg-green-100 text-green-800' },
    { value: 'damage', label: 'Damage', color: 'bg-red-100 text-red-800' },
    { value: 'progress', label: 'Progress', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
  ];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Capture Mode Toggle */}
      <div className="flex gap-2">
        <Button
          variant={captureMode === 'camera' ? 'primary' : 'outline'}
          onClick={() => setCaptureMode('camera')}
          className="flex items-center gap-2"
        >
          <IconCamera size={16} stroke={2} className="h-4 w-4" />
          Camera
        </Button>
        <Button
          variant={captureMode === 'upload' ? 'primary' : 'outline'}
          onClick={() => setCaptureMode('upload')}
          className="flex items-center gap-2"
        >
          <IconUpload size={20} stroke={2} className="h-4 w-4" />
          Upload
        </Button>
      </div>

      {/* Camera Capture */}
      {captureMode === 'camera' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Camera Capture</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isCapturing ? (
              <Button onClick={startCamera} className="w-full">
                <IconCamera size={16} stroke={2} className="h-4 w-4 mr-2" />
                Start Camera
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={capturePhoto} className="flex-1">
                    Capture Photo
                  </Button>
                  <Button variant="outline" onClick={stopCamera}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* File Upload */}
      {captureMode === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">File Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload onChange={handleFileUpload} />
          </CardContent>
        </Card>
      )}

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Photos ({photos.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={photo.preview}
                      alt="Inspection documentation"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Photo Info Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg">
                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Badge variant="secondary" className="text-xs">
                        <IconClock size={20} stroke={2} className="h-3 w-3 mr-1" />
                        {photo.timestamp.toLocaleTimeString()}
                      </Badge>
                    </div>
                    
                    {photo.location && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge variant="secondary" className="text-xs">
                          <IconMapPin size={20} stroke={2} className="h-3 w-3 mr-1" />
                          GPS
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                    onClick={() => removePhoto(photo.id)}
                  >
                    <IconX size={20} stroke={2} className="h-3 w-3" />
                  </Button>

                  {/* Category Selector */}
                  <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <select
                      value={photo.category}
                      onChange={(e) => updatePhotoCategory(photo.id, e.target.value as InspectionPhoto['category'])}
                      className="w-full text-xs bg-white rounded px-2 py-1 border"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
