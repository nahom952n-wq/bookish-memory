import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface ReportFilters {
  startDate: string;
  endDate: string;
  categories?: string[];
  type?: 'income' | 'expense' | 'all';
}

export interface TransactionForReport {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  transaction_date: string;
  category_name?: string;
}

export const generateCSVReport = (transactions: TransactionForReport[], filename: string = 'financial-report.csv') => {
  const csv = Papa.unparse({
    fields: ['Date', 'Description', 'Category', 'Type', 'Amount'],
    data: transactions.map(t => [
      t.transaction_date,
      t.description,
      t.category_name || 'Uncategorized',
      t.type.toUpperCase(),
      t.amount.toFixed(2)
    ])
  });

  const link = document.createElement('a');
  link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
  link.download = filename;
  link.click();
};

export const generatePDFReport = (transactions: TransactionForReport[], summary: any, filters: ReportFilters, filename: string = 'financial-report.pdf') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Title
  doc.setFontSize(20);
  doc.text('Financial Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Date range
  doc.setFontSize(10);
  doc.text(`Period: ${filters.startDate} to ${filters.endDate}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Summary section
  doc.setFontSize(12);
  doc.text('Summary', 20, yPosition);
  yPosition += 8;

  doc.setFontSize(10);
  const summaryData = [
    ['Total Income', `$${summary.income.toFixed(2)}`],
    ['Total Expenses', `$${summary.expenses.toFixed(2)}`],
    ['Net Balance', `$${(summary.income - summary.expenses).toFixed(2)}`],
  ];

  (doc as any).autoTable({
    startY: yPosition,
    head: [['Metric', 'Amount']],
    body: summaryData,
    margin: { left: 20, right: 20 },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  // Transactions table
  doc.setFontSize(12);
  doc.text('Transactions', 20, yPosition);
  yPosition += 8;

  const tableData = transactions.slice(0, 50).map(t => [
    t.transaction_date,
    t.description,
    t.category_name || 'Uncategorized',
    t.type.toUpperCase(),
    `$${t.amount.toFixed(2)}`
  ]);

  (doc as any).autoTable({
    startY: yPosition,
    head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
    body: tableData,
    margin: { left: 20, right: 20 },
  });

  doc.save(filename);
};

export const generateTaxReport = (transactions: TransactionForReport[], year: number) => {
  const yearTransactions = transactions.filter(t => t.transaction_date.startsWith(year.toString()));
  
  const deductions = yearTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const income = yearTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const taxableIncome = income - deductions;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  doc.setFontSize(16);
  doc.text(`Tax Report - ${year}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  doc.setFontSize(12);
  const taxData = [
    ['Total Income', `$${income.toFixed(2)}`],
    ['Total Deductions', `$${deductions.toFixed(2)}`],
    ['Taxable Income', `$${taxableIncome.toFixed(2)}`],
  ];

  (doc as any).autoTable({
    startY: yPosition,
    head: [['Category', 'Amount']],
    body: taxData,
    margin: { left: 20, right: 20 },
  });

  doc.save(`tax-report-${year}.pdf`);
};
