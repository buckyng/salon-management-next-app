'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useGroup } from '@/context/GroupContext';
import { EodReport } from '@/lib/types';
import { fetchOwnerReport } from '@/services/reportService';
import { useReport } from '@/context/ReportContext';
import GoBackButton from '@/components/ui/GoBackButton';
import { DateRange } from 'react-day-picker';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { formatCurrency } from '@/lib/utils/formatUtils';
import LoadingSpinner from '@/components/global/LoadingSpinner';
import { Loader2 } from 'lucide-react';

const OwnerReportPage = () => {
  const { activeGroup } = useGroup();
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [reportData, setReportData] = useState<EodReport[]>([]);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const { setSelectedReport } = useReport();

  const columns: ColumnDef<EodReport>[] = [
    { header: 'Date', accessorKey: 'date' },
    {
      header: 'Total Sales',
      accessorKey: 'total_sale',
      cell: ({ getValue }) => `${formatCurrency(getValue<number>())}`,
    },
    {
      header: 'Actions',
      id: 'actions',
      cell: ({ row }) => (
        <Button
          onClick={() => handleViewDetails(row.original.date, row.original)}
        >
          View Details
        </Button>
      ),
    },
  ];

  const fetchReport = async () => {
    if (!activeGroup?.id || !dateRange?.from || !dateRange?.to) return;

    setLoading(true);
    try {
      const formattedStartDate = format(dateRange.from, 'yyyy-MM-dd');
      const formattedEndDate = format(dateRange.to, 'yyyy-MM-dd');

      const report = await fetchOwnerReport(
        activeGroup.id,
        formattedStartDate,
        formattedEndDate
      );

      const total = report.reduce(
        (sum: number, sale: EodReport) => sum + sale.total_sale,
        0
      );

      setTotalSales(total);

      setReportData(report);
    } catch (error) {
      console.error('Error fetching owner report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (date: string, eodReport: EodReport) => {
    setSelectedReport(eodReport);
    router.push(`/${activeGroup?.id}/admin/reports/${date}`);
  };

  if (!activeGroup) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="container mx-auto mt-6">
      <GoBackButton />
      <h1 className="mb-4 text-2xl font-bold">Report - {activeGroup.name}</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <label className="block mb-2 text-sm font-medium">
            Select Date Range
          </label>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
        <div className="mt-6">
          <Button onClick={fetchReport} disabled={loading}>
            {loading ? <Loader2 /> : 'Fetch Report'}
          </Button>
        </div>
      </div>

      <h2 className="mt-6 font-bold text-highlight">
        Total Sales for selected periods: {formatCurrency(totalSales)}
      </h2>

      {loading ? (
        <LoadingSpinner fullScreen />
      ) : (
        <div className="pb-20">
          <DataTable columns={columns} data={reportData} />
        </div>
      )}
    </div>
  );
};

export default OwnerReportPage;
