'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import {
  fetchOrganizationSales,
  saveEndOfDayReport,
} from '@/services/saleService';
import { SaleData } from '@/lib/types';
import { updateEndOfDayReport } from '@/services/reportService';
import { useEodReport } from '@/context/EodReportContext';

interface InitialDataProps {
  cash?: string;
  debit?: string;
  service_discount?: string;
  giftcard_buy?: string;
  giftcard_redeem?: string;
  other_income?: string;
  income_note?: string;
  expense?: string;
  expense_note?: string;
}

interface ReportCashierProps {
  date: string;
  groupId: string;
  existingReport?: boolean;
  initialData?: InitialDataProps;
  onSubmitSuccess?: () => void;
}

const ReportCashier: React.FC<ReportCashierProps> = ({
  date,
  groupId,
  existingReport = false,
  initialData = {},
  onSubmitSuccess,
}) => {
  const [cash, setCash] = useState(initialData.cash || '');
  const [debit, setDebit] = useState(initialData.debit || '');
  const [serviceDiscount, setServiceDiscount] = useState(
    initialData.service_discount || ''
  );
  const [giftcardBuy, setGiftcardBuy] = useState(
    initialData.giftcard_buy || ''
  );
  const [giftcardRedeem, setGiftcardRedeem] = useState(
    initialData.giftcard_redeem || ''
  );
  const [otherIncome, setOtherIncome] = useState(
    initialData.other_income || ''
  );
  const [incomeNote, setIncomeNote] = useState(initialData.income_note || '');
  const [expense, setExpense] = useState(initialData.expense || '');
  const [expenseNote, setExpenseNote] = useState(
    initialData.expense_note || ''
  );
  const [resultCheck, setResultCheck] = useState<number>(0);
  const [resultMessage, setResultMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { setEodExists } = useEodReport();

  const handlePreCheck = async () => {
    if (!groupId) return;

    setIsLoading(true);
    try {
      const totalSale = await fetchTotalSale();

      const cashNum = parseFloat(cash) || 0;
      const debitNum = parseFloat(debit) || 0;
      const discountNum = parseFloat(serviceDiscount) || 0;
      const gcBuy = parseFloat(giftcardBuy) || 0;
      const gcRedeem = parseFloat(giftcardRedeem) || 0;
      const expenseNum = parseFloat(expense) || 0;
      const otherIncomeNum = parseFloat(otherIncome) || 0;

      const result =
        cashNum +
        debitNum / 1.13 -
        (totalSale -
          discountNum +
          gcBuy / 1.13 -
          gcRedeem / 1.13 -
          expenseNum +
          otherIncomeNum);
      setResultCheck(result);

      if (result > 60) setResultMessage('Double check over!');
      else if (result < 0)
        setResultMessage(`Miss $${(result * -1).toFixed(2)}`);
      else setResultMessage('OK');
    } catch (error) {
      console.error('Error during pre-check:', error);
      toast.error('Failed to perform pre-check.');
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const fetchTotalSale = async (): Promise<number> => {
    try {
      const sales = await fetchOrganizationSales({ groupId, date });
      return sales.reduce(
        (sum: number, sale: SaleData) => sum + sale.amount!,
        0
      );
    } catch (error) {
      console.error('Error fetching sales data:', error);
      toast.error('Failed to fetch total sales data.');
      return 0;
    }
  };

  const handleSubmit = async () => {
    if (otherIncome && !incomeNote) {
      toast.error('Income note is required when other income has value.');
      return;
    }
    if (expense && !expenseNote) {
      toast.error('Expense note is required when expense has value.');
      return;
    }

    setIsLoading(true);
    try {
      const totalSale = await fetchTotalSale();

      if (existingReport) {
        await updateEndOfDayReport({
          group_id: groupId,
          date,
          cash: parseFloat(cash) || 0,
          debit: parseFloat(debit) || 0,
          service_discount: parseFloat(serviceDiscount) || 0,
          giftcard_buy: parseFloat(giftcardBuy) || 0,
          giftcard_redeem: parseFloat(giftcardRedeem) || 0,
          other_income: parseFloat(otherIncome) || 0,
          income_note: incomeNote || null,
          expense: parseFloat(expense) || 0,
          expense_note: expenseNote || null,
          total_sale: totalSale,
          result: resultCheck,
        });
        toast.success('End-of-Day Report updated successfully!');
      } else {
        await saveEndOfDayReport({
          group_id: groupId,
          date,
          cash: parseFloat(cash) || 0,
          debit: parseFloat(debit) || 0,
          service_discount: parseFloat(serviceDiscount) || 0,
          giftcard_buy: parseFloat(giftcardBuy) || 0,
          giftcard_redeem: parseFloat(giftcardRedeem) || 0,
          other_income: parseFloat(otherIncome) || 0,
          income_note: incomeNote || null,
          expense: parseFloat(expense) || 0,
          expense_note: expenseNote || null,
          total_sale: totalSale,
          result: resultCheck,
        });
        toast.success('End-of-Day Report submitted successfully!');
      }
      // Update EOD context after successful submission
      setEodExists(true);
      onSubmitSuccess?.();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Fields Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Cash</Label>
          <Input
            value={cash}
            onChange={(e) => setCash(e.target.value)}
            disabled={isLoading}
            placeholder="Enter cash amount"
            className="mt-1"
            type="number"
          />
        </div>
        <div>
          <Label>Debit</Label>
          <Input
            value={debit}
            onChange={(e) => setDebit(e.target.value)}
            disabled={isLoading}
            placeholder="Enter debit amount"
            className="mt-1"
            type="number"
          />
        </div>
        <div>
          <Label>Service Discount</Label>
          <Input
            value={serviceDiscount}
            onChange={(e) => setServiceDiscount(e.target.value)}
            disabled={isLoading}
            placeholder="Enter discount amount"
            className="mt-1"
            type="number"
          />
        </div>
        <div>
          <Label>Giftcard Buy</Label>
          <Input
            value={giftcardBuy}
            onChange={(e) => setGiftcardBuy(e.target.value)}
            disabled={isLoading}
            placeholder="Enter gift card purchases"
            className="mt-1"
            type="number"
          />
        </div>
        <div>
          <Label>Giftcard Redeem</Label>
          <Input
            value={giftcardRedeem}
            onChange={(e) => setGiftcardRedeem(e.target.value)}
            disabled={isLoading}
            placeholder="Enter gift card redemptions"
            className="mt-1"
            type="number"
          />
        </div>
        <div>
          <Label>Other Income</Label>
          <Input
            value={otherIncome}
            onChange={(e) => setOtherIncome(e.target.value)}
            disabled={isLoading}
            placeholder="Enter other income"
            className="mt-1"
            type="number"
          />
        </div>
        {otherIncome && (
          <div className="md:col-span-2">
            <Label>Income Note</Label>
            <Input
              value={incomeNote}
              onChange={(e) => setIncomeNote(e.target.value)}
              disabled={isLoading}
              placeholder="Enter note for other income"
              className="mt-1"
            />
          </div>
        )}
        <div>
          <Label>Expense</Label>
          <Input
            value={expense}
            onChange={(e) => setExpense(e.target.value)}
            disabled={isLoading}
            placeholder="Enter expense amount"
            className="mt-1"
            type="number"
          />
        </div>
        {expense && (
          <div className="md:col-span-2">
            <Label>Expense Note</Label>
            <Input
              value={expenseNote}
              onChange={(e) => setExpenseNote(e.target.value)}
              disabled={isLoading}
              placeholder="Enter note for expenses"
              className="mt-1"
            />
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col items-center space-y-4">
        <Button
          onClick={handlePreCheck}
          disabled={isLoading}
          className="w-full md:w-auto"
        >
          {isLoading ? <Loader2 /> : 'Pre-Check'}
        </Button>
        <p className="text-center text-lg font-semibold text-gray-700 dark:text-gray-300">
          {resultMessage}
        </p>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full md:w-auto"
          variant="destructive"
        >
          {isLoading ? <Loader2 /> : 'Submit Report'}
        </Button>
      </div>
    </div>
  );
};

export default ReportCashier;
