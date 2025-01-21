'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { DatePicker } from '@/components/ui/date-picker';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useGroup } from '@/context/GroupContext';
import { EodReport } from '@/lib/types';
import { fetchOwnerReport } from '@/services/reportService';
import { useReport } from '@/context/ReportContext';
import GoBackButton from '@/components/ui/GoBackButton';

const OwnerReportPage = () => {
  const { activeGroup } = useGroup();
  const router = useRouter();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reportData, setReportData] = useState<EodReport[]>([]);
  const [loading, setLoading] = useState(false);

  const { setSelectedReport } = useReport();

  const columns: ColumnDef<EodReport>[] = [
    { header: 'Date', accessorKey: 'date' },
    {
      header: 'Total Sales',
      accessorKey: 'total_sale',
      cell: ({ getValue }) => `$${getValue<number>().toFixed(2)}`,
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
    if (!activeGroup?.id || !startDate || !endDate) return;

    setLoading(true);
    try {
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

      const report = await fetchOwnerReport(
        activeGroup.id,
        formattedStartDate,
        formattedEndDate
      );

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

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date);
  };

  if (!activeGroup) {
    return <p>Loading group...</p>;
  }

  return (
    <div className="container mx-auto mt-6">
      <GoBackButton />
      <h1 className="mb-4 text-2xl font-bold">Report - {activeGroup.name}</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

      {loading ? (
        <p className="text-center">Loading report...</p>
      ) : (
        <DataTable columns={columns} data={reportData} />
      )}
    </div>
  );
};

export default OwnerReportPage;
