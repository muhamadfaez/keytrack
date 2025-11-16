import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { utils, writeFile } from 'xlsx';
import { ReportSummary } from '@shared/types';
import { format } from 'date-fns';
// Extend the jsPDF interface to include the autoTable method
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}
const addHeaderAndFooter = (doc: jsPDF, title: string) => {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    // Header
    doc.setFontSize(16);
    doc.setTextColor(40);
    doc.setFont('helvetica', 'bold');
    doc.text('KeyTrack - Reports', pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text(title, pageWidth / 2, 22, { align: 'center' });
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text(`Generated on: ${format(new Date(), 'PPP p')}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
  }
};
export const exportToPdf = (reportData: ReportSummary) => {
  const doc = new jsPDF();
  const title = "Key Management Summary";
  // Status Distribution Table
  doc.autoTable({
    startY: 30,
    head: [['Key Status Distribution']],
    body: [
      ['Status', 'Count']
    ].concat(reportData.statusDistribution.map(item => [item.name, item.value.toString()])),
    theme: 'grid',
    headStyles: { fillColor: [22, 163, 74], fontStyle: 'bold' },
  });
  // Department Activity Table
  doc.autoTable({
    head: [['Keys Issued by Department']],
    body: [
      ['Department', 'Keys Issued']
    ].concat(reportData.departmentActivity.map(item => [item.name, item.keys.toString()])),
    theme: 'grid',
    headStyles: { fillColor: [37, 99, 235], fontStyle: 'bold' },
  });
  // Overdue Keys Table
  if (reportData.overdueKeys.length > 0) {
    doc.autoTable({
      head: [['Overdue Keys Report']],
      body: [
        ['Key Number', 'Assigned To', 'Department', 'Due Date']
      ].concat(reportData.overdueKeys.map(item => [
        item.keyNumber,
        item.personName,
        item.department,
        format(new Date(item.dueDate), 'MMM dd, yyyy')
      ])),
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38], fontStyle: 'bold' },
    });
  } else {
    doc.autoTable({
      body: [['No overdue keys to report.']],
      theme: 'grid',
    });
  }
  addHeaderAndFooter(doc, title);
  doc.save(`KeyTrack_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
export const exportToExcel = (reportData: ReportSummary) => {
  const wb = utils.book_new();
  // Status Distribution Sheet
  const wsStatus = utils.json_to_sheet(
    reportData.statusDistribution.map(item => ({ Status: item.name, Count: item.value }))
  );
  utils.book_append_sheet(wb, wsStatus, 'Key Status Distribution');
  // Department Activity Sheet
  const wsDept = utils.json_to_sheet(
    reportData.departmentActivity.map(item => ({ Department: item.name, 'Keys Issued': item.keys }))
  );
  utils.book_append_sheet(wb, wsDept, 'Department Activity');
  // Overdue Keys Sheet
  if (reportData.overdueKeys.length > 0) {
    const wsOverdue = utils.json_to_sheet(
      reportData.overdueKeys.map(item => ({
        'Key Number': item.keyNumber,
        'Room/Area': item.roomNumber,
        'Assigned To': item.personName,
        'Department': item.department,
        'Due Date': format(new Date(item.dueDate), 'yyyy-MM-dd'),
      }))
    );
    utils.book_append_sheet(wb, wsOverdue, 'Overdue Keys');
  }
  writeFile(wb, `KeyTrack_Report_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};