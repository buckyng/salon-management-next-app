'use client';

import React, { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import { useGroup } from '@/context/GroupContext';
import { EmployeeSummary, EodReport } from '@/lib/types';
import { fetchOwnerReport, fetchReportDetails } from '@/services/reportService';
import { useReport } from '@/context/ReportContext';
import GoBackButton from '@/components/ui/GoBackButton';
import { DateRange } from 'react-day-picker';
import DateRangePicker from '@/components/ui/DateRangePicker';
import { formatCurrency } from '@/lib/utils/formatUtils';
import LoadingSpinner from '@/components/global/LoadingSpinner';
import { Loader2 } from 'lucide-react';
import ReportByDatePage from './[date]/page';
import { toast } from 'react-toastify';

const OwnerReportPage = () => {
  const { activeGroup } = useGroup();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [reportData, setReportData] = useState<EodReport[]>([]);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Selected report details
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [employeeSummaries, setEmployeeSummaries] = useState<EmployeeSummary[]>(
    []
  );
  const [fetchingDetails, setFetchingDetails] = useState(false);

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
          {fetchingDetails && selectedDate === row.original.date
            ? 'Loading...'
            : 'View Details'}
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

      setReportData(report);

      const total = report.reduce(
        (sum: number, sale: EodReport) => sum + sale.total_sale,
        0
      );

      setTotalSales(total);
    } catch (error) {
      console.error('Error fetching owner report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (date: string, eodReport: EodReport) => {
    setSelectedReport(eodReport);
    setSelectedDate(date);
    setFetchingDetails(true);

    if (!activeGroup) return;

    try {
      const employeeData = await fetchReportDetails(activeGroup.id, date);
      setEmployeeSummaries(employeeData);
    } catch (error) {
      console.error('Error fetching employee details:', error);
      toast.error('Failed to fetch employee details.');
    } finally {
      setFetchingDetails(false);
    }
  };

  const handleExportToSheets = async () => {
    if (!activeGroup?.id || !dateRange?.from || !dateRange?.to) {
      toast.error('Missing group or date range.');
      return;
    }

    setExporting(true);

    try {
      const formattedStartDate = format(dateRange.from, 'yyyy-MM-dd');
      const formattedEndDate = format(dateRange.to, 'yyyy-MM-dd');
      // Fetch data for export
      const eodReports = await fetchOwnerReport(
        activeGroup.id,
        formattedStartDate,
        formattedEndDate
      );
      const employeeSales = await Promise.all(
        eodReports.map(async (report) => {
          const employees = await fetchReportDetails(
            activeGroup.id,
            report.date
          );
          return { date: report.date, employees };
        })
      );

      // Send data to Google Sheets API
      const response = await fetch('/api/reports/export-to-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: activeGroup.id,
          eodReports,
          employeeSales,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success('Exported successfully!');
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      console.error('Error exporting sale:', error);
      toast.error('Failed to export data.');
    } finally {
      setExporting(false);
    }
  };

  if (!activeGroup) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="container mx-auto mt-6">
      <GoBackButton />
      <h1 className="mb-4 text-2xl font-bold">Report - {activeGroup.name}</h1>

      <div className="flex flex-col">
        <div>
          <label className="block mb-2 text-sm font-medium">
            Select Date Range
          </label>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
        <div className="mt-6 flex space-x-4">
          <Button onClick={fetchReport} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : 'Fetch Report'}
          </Button>
          <Button
            onClick={handleExportToSheets}
            disabled={exporting || reportData.length === 0}
          >
            {exporting ? 'Exporting...' : 'Export to Google Sheets'}
          </Button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner fullScreen />
      ) : (
        <>
          {reportData.length > 0 && (
            <>
              <h2 className="mt-6 font-bold text-highlight">
                Total Sales for selected periods: {formatCurrency(totalSales)}
              </h2>
              <div className="pb-20">
                <DataTable columns={columns} data={reportData} />
                {selectedDate && (
                  <ReportByDatePage
                    employeeSummaries={employeeSummaries}
                    date={selectedDate}
                  />
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default OwnerReportPage;
