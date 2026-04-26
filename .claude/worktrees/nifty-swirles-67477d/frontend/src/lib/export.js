/**
 * Export utilities for CSV and Excel
 */

// Convert array of objects to CSV string
export const arrayToCSV = (data, columns) => {
  if (!data || data.length === 0) return '';

  // Use column definitions if provided, otherwise use object keys
  const headers = columns ? columns.map((col) => col.label || col.key) : Object.keys(data[0]);
  const keys = columns ? columns.map((col) => col.key) : Object.keys(data[0]);

  // Create CSV header row
  const csvHeader = headers.map((header) => `"${header}"`).join(',');

  // Create CSV data rows
  const csvRows = data.map((row) => {
    return keys
      .map((key) => {
        const value = columns
          ? columns.find((col) => col.key === key)?.exportValue?.(row) ?? row[key]
          : row[key];

        // Handle different data types
        if (value === null || value === undefined) {
          return '""';
        } else if (typeof value === 'string') {
          // Escape quotes and wrap in quotes
          return `"${value.replace(/"/g, '""')}"`;
        } else if (typeof value === 'object') {
          // Convert objects/arrays to JSON string
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        } else {
          return `"${value}"`;
        }
      })
      .join(',');
  });

  return [csvHeader, ...csvRows].join('\n');
};

// Download CSV file
export const downloadCSV = (data, filename = 'export.csv', columns) => {
  const csv = arrayToCSV(data, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Convert array of objects to HTML table (for Excel)
const arrayToHTMLTable = (data, columns) => {
  if (!data || data.length === 0) return '';

  const headers = columns ? columns.map((col) => col.label || col.key) : Object.keys(data[0]);
  const keys = columns ? columns.map((col) => col.key) : Object.keys(data[0]);

  const headerRow = `<tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr>`;

  const dataRows = data
    .map((row) => {
      const cells = keys
        .map((key) => {
          const value = columns
            ? columns.find((col) => col.key === key)?.exportValue?.(row) ?? row[key]
            : row[key];

          if (value === null || value === undefined) {
            return '<td></td>';
          } else if (typeof value === 'object') {
            return `<td>${JSON.stringify(value)}</td>`;
          } else {
            return `<td>${value}</td>`;
          }
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  return `
    <table border="1">
      <thead>${headerRow}</thead>
      <tbody>${dataRows}</tbody>
    </table>
  `;
};

// Download Excel file (using HTML table method)
export const downloadExcel = (data, filename = 'export.xls', columns) => {
  const htmlTable = arrayToHTMLTable(data, columns);
  const blob = new Blob([htmlTable], {
    type: 'application/vnd.ms-excel',
  });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

// Export button component helper
export const formatExportData = (data, columns) => {
  return data.map((row) => {
    const exportRow = {};
    columns.forEach((col) => {
      const value = col.exportValue ? col.exportValue(row) : row[col.key];
      exportRow[col.label || col.key] = value;
    });
    return exportRow;
  });
};

// Generate filename with timestamp
export const generateFilename = (prefix, extension = 'csv') => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
  return `${prefix}_${timestamp}.${extension}`;
};

export default {
  arrayToCSV,
  downloadCSV,
  downloadExcel,
  formatExportData,
  generateFilename,
};
