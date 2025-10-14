import { useCallback } from 'react';

export const useExportCsv = () => {
  const exportToCsv = useCallback((filename: string, data: unknown[], headers?: string[]) => {
    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    // Get headers from first object if not provided
    const csvHeaders = headers || Object.keys(data[0] as Record<string, unknown>);

    // Create CSV content
    const csvContent = [
      csvHeaders.join(','), // Headers
      ...data.map((row) =>
        csvHeaders
          .map((header) => {
            const value = (row as Record<string, unknown>)[header];
            // Escape commas and quotes in values
            const stringValue = String(value ?? '');
            return stringValue.includes(',') || stringValue.includes('"')
              ? `"${stringValue.replace(/"/g, '""')}"`
              : stringValue;
          })
          .join(',')
      ),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return { exportToCsv };
};

export default useExportCsv;

