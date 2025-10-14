import { useCallback } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const useExportPdf = () => {
  const exportToPdf = useCallback(
    (filename: string, data: unknown[], headers?: string[], title?: string) => {
      if (!data || data.length === 0) {
        alert('No data to export');
        return;
      }

      // eslint-disable-next-line new-cap
      const doc = new jsPDF();

      // Add title if provided
      if (title) {
        doc.setFontSize(18);
        doc.text(title, 14, 22);
      }

      // Get headers from first object if not provided
      const tableHeaders = headers || Object.keys(data[0] as Record<string, unknown>);

      // Prepare table data
      const tableData = data.map((row) =>
        tableHeaders.map((header) => {
          const value = (row as Record<string, unknown>)[header];
          return String(value ?? '');
        })
      );

      // Generate table
      autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        startY: title ? 30 : 10,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [11, 99, 211] }, // Primary blue color
      });

      // Save the PDF
      doc.save(`${filename}.pdf`);
    },
    []
  );

  return { exportToPdf };
};

export default useExportPdf;

