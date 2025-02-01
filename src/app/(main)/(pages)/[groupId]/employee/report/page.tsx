'use client';

import React, { useState } from 'react';
import { useGroup } from '@/context/GroupContext';
import { useUser } from '@/context/UserContext';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { fetchEmployeeReport, fetchSalesByUser } from '@/services/saleService';
import { Loader2 } from 'lucide-react';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { formatCurrency } from '@/lib/utils/formatUtils';
import EmployeeSalesDrawer from '@/components/global/EmployeeSalesDrawer';
import { SaleData } from '@/lib/types';

type EmployeeReport = {
  date: string;
  totalSales: number;
};

const EmployeeReportPage = () => {
  const { activeGroup } = useGroup();
  const { user } = useUser();

  const [reports, setReports] = useState<EmployeeReport[]>([]);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [detailedSales, setDetailedSales] = useState<SaleData[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  const fetchReport = async () => {
    if (!activeGroup?.id || !user) return;

    setLoading(true);
    try {
      const formattedStartDate = dateRange?.from
        ? format(dateRange?.from, 'yyyy-MM-dd')
        : null;
      const formattedEndDate = dateRange?.to
        ? format(dateRange?.to, 'yyyy-MM-dd')
        : null;

      if (!formattedStartDate || !formattedEndDate) {
        console.error('Invalid date range');
        return;
      }

      const data = await fetchEmployeeReport({
        groupId: activeGroup.id,
        employeeId: user.id,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      });

      const total = data.reduce(
        (sum: number, sale: EmployeeReport) => sum + sale.totalSales,
        0
      );
      setTotalSales(total);

      setReports(data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = async (date: string) => {
    if (!activeGroup?.id || !user?.id) return;

    setSelectedDate(date);
    setIsDrawerOpen(true);
    try {
      const sales = await fetchSalesByUser({
        activeGroupId: activeGroup.id,
        userId: user.id,
        date,
      });

      setDetailedSales(sales);
    } catch (error) {
      console.error('Error fetching sales by date:', error);
    }
  };

  const columns: ColumnDef<EmployeeReport>[] = [
    {
      header: 'Date',
      accessorKey: 'date',
    },
    {
      header: 'Total Sales',
      accessorKey: 'totalSales',
      cell: ({ getValue }) => `${formatCurrency(getValue<number>())}`,
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
        <DateRangePicker value={dateRange} onChange={setDateRange} />
        <div className="mt-6">
          <Button onClick={fetchReport} disabled={loading}>
            {loading ? <Loader2 /> : 'Fetch Report'}
          </Button>
        </div>
      </div>

      <h2 className="mt-6 text-highlight">
        Total Sales for selected periods: {formatCurrency(totalSales)}
      </h2>

      <div className="mt-6 overflow-x-auto">
        <DataTable columns={columns} data={reports} />
      </div>

      {/* Employee Sales Drawer */}
      <EmployeeSalesDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sales={detailedSales || []}
        selectedDate={selectedDate}
        employeeName=""
      />
    </div>
  );
};

export default EmployeeReportPage;
