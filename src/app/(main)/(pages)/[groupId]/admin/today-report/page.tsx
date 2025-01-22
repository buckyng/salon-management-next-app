'use client';

import React, { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { EmployeeSummary, EodReport } from '@/lib/types';
import {
  checkEodReportExists,
  fetchEodReport,
  fetchReportDetails,
} from '@/services/reportService';
import { ColumnDef } from '@tanstack/react-table';
import BackButton from '@/components/global/BackButton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useGroup } from '@/context/GroupContext';
import { EmployeeSalesPopover } from '../reports/[date]/_components/EmployeeSalesPopover';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

const TodayReport = () => {
  const [employeeSummaries, setEmployeeSummaries] = useState<EmployeeSummary[]>(
    []
  );
  const [date, setDate] = useState('');
  const [eodExists, setEodExists] = useState(false);
  const [eodData, setEodData] = useState<EodReport>();
  const [checked, setChecked] = useState(false);
  const [totalSale, setTotalSale] = useState(0);
  const [loading, setLoading] = useState(false);
  const { activeGroup } = useGroup();

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    setChecked(false);
  };

  const handleFetchReport = async () => {
    setLoading(true);
    if (!activeGroup?.id || !date) {
      return;
    }
    try {
      const exists = await checkEodReportExists({
        groupId: activeGroup.id,
        date,
      });
      setEodExists(exists);

      if (exists) {
        //fetch eod report
        const eodData = await fetchEodReport(activeGroup.id || '', date);
        setEodData(eodData);
      }

      const data = await fetchReportDetails(activeGroup.id, date);
      setEmployeeSummaries(data);

      const total = data.reduce(
        (sum: number, sale: EmployeeSummary) => sum + sale.totalSale,
        0
      );
      setTotalSale(total);
      setChecked(true);
    } catch (error) {
      console.error('Error fetching report details:', error);
      toast.error(
        'Failed to check EOD report. || Failed to fetch report details.'
      );
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnDef<EmployeeSummary>[] = [
    { header: 'Employee Name', accessorKey: 'employeeName' },
    { header: 'Total Sale', accessorKey: 'totalSale' },
    {
      header: 'Details',
      cell: ({ row }) => (
        <EmployeeSalesPopover
          employeeName={row.original.employeeName}
          sales={row.original.sales}
        />
      ),
    },
  ];

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto mt-6">
      <BackButton />
      <div className="mt-4">
        <Label>Select Date</Label>
        <Input
          type="date"
          value={date}
          onChange={handleDateChange}
          disabled={loading}
        />
        <Button
          className="mt-4"
          onClick={handleFetchReport}
          disabled={!date || loading}
        >
          Check Report
        </Button>
      </div>

      {checked && (
        <div className="mt-6">
          {eodExists ? (
            <div>
              <h1 className="text-2xl font-bold mb-4">Report for {date}</h1>
              <div className="mt-4">
                <p>Total Sales: ${eodData?.total_sale}</p>
                <p>Cash: ${eodData?.cash}</p>
                <p>Debit: ${eodData?.debit}</p>
                <p>Other Income: ${eodData?.other_income}</p>
                <p>Income Note: ${eodData?.income_note}</p>
                <p>Expense: ${eodData?.expense}</p>
                <p>Expense Note: ${eodData?.expense_note}</p>
                <p>Service Discount: ${eodData?.service_discount}</p>
                <p>Giftcard Buy: ${eodData?.giftcard_buy}</p>
                <p>Giftcard Redeem: ${eodData?.giftcard_redeem}</p>
                <p>Result: ${eodData?.result}</p>
              </div>
            </div>
          ) : (
            <p>No EOD report found for {date}</p>
          )}

          {employeeSummaries.length !== 0 ? (
            <div className="mt-4">
              <h1 className="text-xl font-bold mb-4">
                Total Sales from employee sales: {totalSale}
              </h1>
              <DataTable columns={columns} data={employeeSummaries} />
            </div>
          ) : (
            <p>No sales data found for {date}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default TodayReport;
