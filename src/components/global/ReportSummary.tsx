import { formatCurrency } from '@/lib/utils/formatUtils';
import React from 'react';

interface ReportSummaryProps {
  report: {
    total_sale?: number | null;
    cash?: number | null;
    debit?: number | null;
    other_income?: number | null;
    income_note?: string | null;
    expense?: number | null;
    expense_note?: string | null;
    service_discount?: number | null;
    giftcard_buy?: number | null;
    giftcard_redeem?: number | null;
    result?: number | null;
  } | null; // Allow null values
}

const ReportSummary: React.FC<ReportSummaryProps> = ({ report }) => {
  if (!report)
    return <p className="text-red-500 font-bold">No report data available.</p>;

  return (
    <div className="mt-4">
      <p className="text-highlight">
        Total Sales: {formatCurrency(report.total_sale ?? 0)}
      </p>
      <p>Cash: {formatCurrency(report.cash ?? 0)}</p>
      <p>Debit: {formatCurrency(report.debit ?? 0)}</p>
      <p>Other Income: {formatCurrency(report.other_income ?? 0)}</p>
      <p>Income Note: {report.income_note}</p>
      <p>Expense: {formatCurrency(report.expense ?? 0)}</p>
      <p>Expense Note: {report.expense_note}</p>
      <p>Service Discount: {formatCurrency(report.service_discount ?? 0)}</p>
      <p>Giftcard Buy: {formatCurrency(report.giftcard_buy ?? 0)}</p>
      <p>Giftcard Redeem: {formatCurrency(report.giftcard_redeem ?? 0)}</p>
      <p className="text-highlight">
        Result: {formatCurrency(report.result ?? 0)}
      </p>
    </div>
  );
};

export default ReportSummary;
