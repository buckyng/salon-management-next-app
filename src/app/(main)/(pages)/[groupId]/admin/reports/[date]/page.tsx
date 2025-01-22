'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { EmployeeSummary } from '@/lib/types';
import { fetchReportDetails } from '@/services/reportService';
import { ColumnDef } from '@tanstack/react-table';
import { useReport } from '@/context/ReportContext';
import { EmployeeSalesPopover } from './_components/EmployeeSalesPopover';
import BackButton from '@/components/global/BackButton';

const ReportByDatePage = () => {
  const params = useParams();
  const groupId = Array.isArray(params.groupId)
    ? params.groupId[0]
    : params.groupId;
  const date = Array.isArray(params.date) ? params.date[0] : params.date;

  const [employeeSummaries, setEmployeeSummaries] = useState<EmployeeSummary[]>(
    []
  );
  const [loading, setLoading] = useState(false);

  const { selectedReport } = useReport();

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await fetchReportDetails(groupId, date);
        setEmployeeSummaries(data);
      } catch (error) {
        console.error('Error fetching report details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [groupId, date]);

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
      <h1 className="text-2xl font-bold mb-4">Report for {date}</h1>
      <div className="mt-4">
        <p>Total Sales: ${selectedReport?.total_sale}</p>
        <p>Cash: ${selectedReport?.cash}</p>
        <p>Debit: ${selectedReport?.debit}</p>
        <p>Other Income: ${selectedReport?.other_income}</p>
        <p>Income Note: ${selectedReport?.income_note}</p>
        <p>Expense: ${selectedReport?.expense}</p>
        <p>Expense Note: ${selectedReport?.expense_note}</p>
        <p>Service Discount: ${selectedReport?.service_discount}</p>
        <p>Giftcard Buy: ${selectedReport?.giftcard_buy}</p>
        <p>Giftcard Redeem: ${selectedReport?.giftcard_redeem}</p>
        <p>Result: ${selectedReport?.result}</p>
      </div>
      <DataTable columns={columns} data={employeeSummaries} />
    </div>
  );
};

export default ReportByDatePage;
