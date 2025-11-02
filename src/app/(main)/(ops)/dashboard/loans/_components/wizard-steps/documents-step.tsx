"use client";

import { FileUpload } from "@/components/ui/file-upload";
import { useWizardStore } from "@/lib/wizard-state";

interface DocumentsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function DocumentsStep({ onNext }: DocumentsStepProps) {
  const { documents, setDocuments } = useWizardStore();

  const handleUpload = (files: File[]) => {
    // Convert File[] to the expected format
    // In a real implementation, you would upload to S3 and get URLs
    const uploadedFiles = files.map((file) => ({
      file,
      url: `placeholder-url-${file.name}`,
      name: file.name,
      size: file.size,
    }));
    setDocuments(uploadedFiles);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 text-lg font-semibold">Upload Initial Documents</h3>
        <p className="text-sm text-muted-foreground">
          Upload any initial loan documents. You can add more documents later from the loan detail page.
        </p>
      </div>

      <FileUpload
        onChange={handleUpload}
      />

      <div className="rounded-lg border border-dashed p-4">
        <p className="text-sm text-muted-foreground">
          {documents.length > 0
            ? `${documents.length} document(s) ready to upload`
            : "No documents uploaded (optional)"}
        </p>
      </div>
    </div>
  );
}

