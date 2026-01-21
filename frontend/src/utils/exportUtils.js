import * as XLSX from 'xlsx';
import moment from 'moment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

/**
 * Export data to Excel format
 * @param {Array} data - Data to export
 * @param {string} filename - Output filename
 * @param {string} sheetName - Sheet name
 */
export const exportToExcel = (data, filename = 'export', sheetName = 'Sheet1') => {
  try {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${filename}_${moment().format('YYYY-MM-DD')}.xlsx`);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};

/**
 * Export data to PDF format
 * @param {Array} data - Data to export
 * @param {string} filename - Output filename
 * @param {string} title - PDF title
 * @param {Array} columns - Column configuration
 */
export const exportToPDF = (data, filename = 'export', title = 'Report', columns = []) => {
  try {
    if (!data || data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(title, 14, 15);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${moment().format('MMMM DD YYYY, hh:mm:ss A')}`, 14, 25);
    
    // Add table using autoTable
    try {
      const tableColumns = columns.length > 0 ? columns : Object.keys(data[0]);
      const tableData = data.map(row => 
        tableColumns.map(col => {
          const value = row[col];
          // Handle different data types
          if (value === null || value === undefined) return '-';
          if (typeof value === 'object') return JSON.stringify(value);
          return String(value);
        })
      );
      
      if (typeof doc.autoTable === 'function') {
        doc.autoTable({
          head: [tableColumns],
          body: tableData,
          startY: 35,
          theme: 'grid',
          headerStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold'
          },
          alternateRowStyles: {
            fillColor: [245, 245, 245]
          }
        });
      } else {
        // Fallback: manual table creation
        let yPosition = 35;
        doc.setFontSize(10);
        
        // Headers
        const colWidth = 180 / tableColumns.length;
        tableColumns.forEach((col, index) => {
          doc.text(String(col), 14 + index * colWidth, yPosition);
        });
        
        // Data rows
        yPosition += 7;
        tableData.forEach(row => {
          row.forEach((cell, index) => {
            doc.text(String(cell).substring(0, 20), 14 + index * colWidth, yPosition);
          });
          yPosition += 7;
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
        });
      }
    } catch (tableError) {
      console.warn('Error adding table, creating basic PDF:', tableError);
      // Create basic text-based report if table fails
      doc.setFontSize(12);
      doc.text('Data Summary:', 14, 35);
      doc.setFontSize(10);
      doc.text(`Total Records: ${data.length}`, 14, 45);
    }
    
    doc.save(`${filename}_${moment().format('YYYY-MM-DD')}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    alert('Error generating PDF. Please try again.');
  }
};

/**
 * Download CSV file
 * @param {Array} data - Data to export
 * @param {string} filename - Output filename
 */
export const exportToCSV = (data, filename = 'export') => {
  try {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape values containing commas or quotes
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value || '';
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${moment().format('YYYY-MM-DD')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw error;
  }
};
