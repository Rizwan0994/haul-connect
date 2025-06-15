const XLSX = require('xlsx');
const jsPDF = require('jspdf').jsPDF;
require('jspdf-autotable');

class ReportGenerator {
  // Generate Excel report
  static generateExcelReport(data, filename = 'attendance-report') {
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();
      
      // Prepare data for Excel
      const excelData = data.map((record, index) => ({
        'Sr No': index + 1,
        'Employee ID': record.employee_id,
        'Employee Name': record.employee?.username || 'N/A',
        'Email': record.employee?.email || 'N/A',
        'Department/Role': record.employee?.role || 'N/A',
        'Date': record.date,
        'Check In Time': record.check_in_time || 'N/A',
        'Check Out Time': record.check_out_time || 'N/A',
        'Status': this.formatStatus(record.status),
        'Notes': record.notes || 'N/A',
        'Marked By': record.marked_by || 'System',
        'Created At': new Date(record.created_at).toLocaleDateString(),
      }));
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      
      // Set column widths
      const columnWidths = [
        { wch: 8 },   // Sr No
        { wch: 12 },  // Employee ID
        { wch: 20 },  // Employee Name
        { wch: 25 },  // Email
        { wch: 15 },  // Department/Role
        { wch: 12 },  // Date
        { wch: 12 },  // Check In Time
        { wch: 12 },  // Check Out Time
        { wch: 18 },  // Status
        { wch: 25 },  // Notes
        { wch: 12 },  // Marked By
        { wch: 15 },  // Created At
      ];
      worksheet['!cols'] = columnWidths;
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');
      
      // Generate buffer
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      return buffer;
    } catch (error) {
      console.error('Error generating Excel report:', error);
      throw new Error('Failed to generate Excel report');
    }
  }
    // Generate PDF report
  static generatePDFReport(data, startDate, endDate, filename = 'attendance-report') {
    try {
      const doc = new jsPDF();
      
      // Check if autoTable is available
      if (!doc.autoTable) {
        throw new Error('autoTable plugin not loaded');
      }
      
      // Add title
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('Employee Attendance Report', 20, 20);
      
      // Add date range
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Period: ${startDate} to ${endDate}`, 20, 30);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 38);
      
      // Prepare table data
      const tableHeaders = [
        'Sr No',
        'Employee',
        'Date',
        'Check In',
        'Check Out',
        'Status',
        'Notes'
      ];
      
      const tableData = data.map((record, index) => [
        index + 1,
        record.employee?.username || 'N/A',
        record.date,
        record.check_in_time || 'N/A',
        record.check_out_time || 'N/A',
        this.formatStatus(record.status),
        (record.notes || 'N/A').substring(0, 30) + (record.notes && record.notes.length > 30 ? '...' : '')      ]);
      
      // Simple table without autoTable
      let yPosition = 50;
      
      // Add table headers
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Sr', 20, yPosition);
      doc.text('Employee', 35, yPosition);
      doc.text('Date', 80, yPosition);
      doc.text('Check In', 110, yPosition);
      doc.text('Check Out', 135, yPosition);
      doc.text('Status', 165, yPosition);
      
      // Add line under headers
      yPosition += 3;
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 5;
      
      // Add data rows
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9);
      
      tableData.forEach((row, index) => {
        if (yPosition > 270) { // Add new page if needed
          doc.addPage();
          yPosition = 20;
          
          // Repeat headers on new page
          doc.setFont(undefined, 'bold');
          doc.text('Sr', 20, yPosition);
          doc.text('Employee', 35, yPosition);
          doc.text('Date', 80, yPosition);
          doc.text('Check In', 110, yPosition);
          doc.text('Check Out', 135, yPosition);
          doc.text('Status', 165, yPosition);
          yPosition += 3;
          doc.line(20, yPosition, 190, yPosition);
          yPosition += 5;
          doc.setFont(undefined, 'normal');
        }
        
        doc.text(String(row[0]), 20, yPosition);
        doc.text(String(row[1]).substring(0, 12), 35, yPosition);
        doc.text(String(row[2]), 80, yPosition);
        doc.text(String(row[3]), 110, yPosition);
        doc.text(String(row[4]), 135, yPosition);
        doc.text(String(row[5]), 165, yPosition);
        
        yPosition += 7;
      });
      
      // Add summary if data exists
      if (data.length > 0) {
        const summary = this.generateSummary(data);
        yPosition += 10;
        
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Summary', 20, yPosition);
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(`Total Records: ${summary.total}`, 20, yPosition + 10);
        doc.text(`Present: ${summary.present}`, 20, yPosition + 18);
        doc.text(`Absent: ${summary.absent}`, 20, yPosition + 26);
        doc.text(`Late: ${summary.late}`, 20, yPosition + 34);
        doc.text(`Not Marked: ${summary.notMarked}`, 20, yPosition + 42);
      }
      
      // Return PDF buffer
      return Buffer.from(doc.output('arraybuffer'));
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw new Error('Failed to generate PDF report');
    }
  }
  
  // Helper method to format status
  static formatStatus(status) {
    const statusMap = {
      'present': 'Present',
      'absent': 'Absent',
      'late': 'Late',
      'late_present': 'Late Present',
      'half_day': 'Half Day',
      'late_without_notice': 'Late Without Notice',
      'leave_without_notice': 'Leave Without Notice',
      'not_marked': 'Not Marked'
    };
    return statusMap[status] || status;
  }
  
  // Helper method to generate summary
  static generateSummary(data) {
    const summary = {
      total: data.length,
      present: 0,
      absent: 0,
      late: 0,
      notMarked: 0
    };
    
    data.forEach(record => {
      switch (record.status) {
        case 'present':
          summary.present++;
          break;
        case 'absent':
          summary.absent++;
          break;
        case 'late':
        case 'late_present':
        case 'late_without_notice':
          summary.late++;
          break;
        case 'not_marked':
          summary.notMarked++;
          break;
      }
    });
    
    return summary;
  }
}

module.exports = ReportGenerator;
