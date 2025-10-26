"use client";

import { FileUpload, type UploadedFile } from "@/components/ui/file-upload";
import { useWizardStore } from "@/lib/wizard-state";

interface DocumentsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function DocumentsStep({ onNext }: DocumentsStepProps) {
  const { documents, setDocuments } = useWizardStore();

  const handleUpload = (files: UploadedFile[]) => {
    setDocuments(files);
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
        onUpload={handleUpload}
        folder="loan-documents"
        maxFiles={10}
        maxSize={25}
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

