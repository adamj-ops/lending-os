/**
 * Utility functions for exporting data to CSV format
 */

export function exportToCsv(data: any[], filename: string) {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0] || {});
  
  // Convert data to rows
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Handle null/undefined values
      if (value === null || value === undefined) {
        return '';
      }
      // Handle objects and arrays
      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      // Escape commas and quotes in strings
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    })
  );
  
  // Combine headers and rows into CSV string
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Transform KPI object into CSV-ready array format
 */
export function transformKpisToCsvFormat(kpis: Record<string, any>): Array<{ Metric: string; Value: string | number | null }> {
  return Object.keys(kpis).map(key => {
    // Convert camelCase/snake_case to Title Case for display
    const metricName = key
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .replace(/^\w/, c => c.toUpperCase())
      .trim();
    
    return {
      Metric: metricName,
      Value: kpis[key]
    };
  });
}

/**
 * Generate CSV from API response data
 * Useful for exporting analytics data
 */
export function exportAnalyticsToCsv(data: any, filename: string) {
  // Extract series data if it exists
  const seriesData = data.series || data.series || [];
  
  if (seriesData.length === 0) {
    // If no series, export kpis as single row
    const kpis = data.kpis || {};
    const kpiData = transformKpisToCsvFormat(kpis);
    exportToCsv(kpiData, filename);
    return;
  }
  
  exportToCsv(seriesData, filename);
}

/**
 * Export KPIs as CSV
 */
export function exportKpisToCsv(kpis: Record<string, any>, filename: string) {
  const kpiData = transformKpisToCsvFormat(kpis);
  exportToCsv(kpiData, filename);
}

