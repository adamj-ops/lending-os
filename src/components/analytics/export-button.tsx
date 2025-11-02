"use client";

import { Button } from "@/components/ui/button";
import { IconDownload } from "@tabler/icons-react";
import { exportAnalyticsToCsv, exportKpisToCsv } from "@/lib/csv-export";

interface ExportButtonProps {
  data: any;
  filename: string;
  variant?: "primary" | "outline" | "ghost";
  size?: "xs" | "sm" | "md" | "lg" | "icon";
  exportKpis?: boolean;
  label?: string;
}

export function ExportButton({ 
  data, 
  filename, 
  variant = "outline", 
  size = "md",
  exportKpis = false,
  label
}: ExportButtonProps) {
  const handleExport = () => {
    if (!data) {
      console.warn('No data to export');
      return;
    }

    if (exportKpis && data.kpis) {
      // Export KPIs specifically
      exportKpisToCsv(data.kpis, filename);
    } else {
      // Export series data (default behavior)
      exportAnalyticsToCsv(data, filename);
    }
  };

  const buttonLabel = label || (exportKpis ? "Export KPIs" : "Export CSV");

  return (
    <Button 
      variant={variant}
      size={size}
      onClick={handleExport}
      className="gap-2"
    >
      <IconDownload size={20} stroke={2} className="h-4 w-4" />
      {buttonLabel}
    </Button>
  );
}

