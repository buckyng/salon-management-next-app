'use client';

import React, { useState } from 'react';
import { useGroup } from '@/context/GroupContext';
import { useUser } from '@/context/UserContext';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { formatToLocalTime } from '@/lib/utils/dateUtils';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';

type EmployeeReport = {
  date: string;
  totalSales: number;
};

type SaleData = {
  createdAt: string;
  amount: number;
  note?: string | null;
};

const EmployeeReportPage = () => {
  const { activeGroup } = useGroup();
  const { user } = useUser();

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [reports, setReports] = useState<EmployeeReport[]>([]);
  const [detailedSales, setDetailedSales] = useState<SaleData[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchReport = async () => {
    if (!activeGroup?.id || !user) return;

    setLoading(true);
    try {
      const formattedStartDate = startDate
        ? format(startDate, 'yyyy-MM-dd')
        : null;
      const formattedEndDate = endDate ? format(endDate, 'yyyy-MM-dd') : null;

      if (!formattedStartDate || !formattedEndDate) {
        console.error('Invalid date range');
        return;
      }

      const response = await fetch(
        `/api/reports/employee?groupId=${activeGroup.id}&employeeId=${user.id}&startDate=${formattedStartDate}&endDate=${formattedEndDate}`
      );
      const data = await response.json();

      setReports(data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (date: string) => {
    if (!activeGroup?.id || !user?.id) return;

    setSelectedDate(date); // Set the selected date for display

    try {
      const response = await fetch(
        `/api/reports/employee/sales?groupId=${activeGroup.id}&employeeId=${user.id}&date=${date}`
      );
      const sales = await response.json();
      setDetailedSales(sales);
    } catch (error) {
      console.error('Error fetching sales by date:', error);
    }
  };

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
  };

  const columns: ColumnDef<EmployeeReport>[] = [
    {
      header: 'Date',
      accessorKey: 'date',
    },
    {
      header: 'Total Sales',
      accessorKey: 'totalSales',
      cell: ({ getValue }) => `$${getValue<number>().toFixed(2)}`,
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }: { row: { original: EmployeeReport } }) => (
        <Button onClick={() => handleRowClick(row.original.date)}>
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col w-full max-w-4xl p-4 mx-auto">
      <h1 className="text-xl font-bold text-center">
        Employee Report - {activeGroup?.name || 'Your Group'}
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 mt-6">
        <div>
          <label className="block mb-2 text-sm font-medium">Start Date</label>
          <DatePicker value={startDate} onChange={handleStartDateChange} />
        </div>
        <div>
          <label className="block mb-2 text-sm font-medium">End Date</label>
          <DatePicker value={endDate} onChange={handleEndDateChange} />
        </div>
        <div className="mt-6">
          <Button onClick={fetchReport} disabled={loading}>
            {loading ? 'Loading...' : 'Fetch Report'}
          </Button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <DataTable columns={columns} data={reports} />
      </div>

      {detailedSales && (
        <div className="mt-6">
          <h2 className="mb-2 text-lg font-bold">
            Detailed Sales for {selectedDate}
          </h2>
          <DataTable
            columns={[
              {
                header: 'Time',
                accessorKey: 'created_at',
                cell: ({ getValue }) => formatToLocalTime(getValue<string>()),
              },
              { header: 'Amount', accessorKey: 'amount' },
              { header: 'Note', accessorKey: 'note' },
            ]}
            data={detailedSales}
          />
        </div>
      )}
    </div>
  );
};

export default EmployeeReportPage;
