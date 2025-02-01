'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { EmployeeSummary, EodReport, SaleData } from '@/lib/types';
import {
  checkEodReportExists,
  fetchEodReport,
  fetchReportDetails,
} from '@/services/reportService';
import { ColumnDef } from '@tanstack/react-table';
import BackButton from '@/components/global/BackButton';
import { useGroup } from '@/context/GroupContext';
import { toast } from 'react-toastify';
import { getCurrentLocalDate } from '@/lib/utils/dateUtils';

import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils/formatUtils';
import ReportSummary from '@/components/global/ReportSummary';
import LoadingSpinner from '@/components/global/LoadingSpinner';
import EmployeeSalesDrawer from '@/components/global/EmployeeSalesDrawer';
import { Button } from '@/components/ui/button';

const TodayReport = () => {
  const [employeeSummaries, setEmployeeSummaries] = useState<EmployeeSummary[]>(
    []
  );
  const date = getCurrentLocalDate();
  const [eodExists, setEodExists] = useState(false);
  const [eodData, setEodData] = useState<EodReport>();
  const [checked, setChecked] = useState(false);
  const [totalSale, setTotalSale] = useState(0);
  const [loading, setLoading] = useState(false);
  const { activeGroup } = useGroup();

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedSales, setSelectedSales] = useState<SaleData[] | null>(null);

  const handleFetchReport = useCallback(async () => {
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
  }, [activeGroup?.id, date]);

  // Fetch report when the component mounts
  useEffect(() => {
    if (activeGroup?.id) {
      handleFetchReport();
    }
  }, [activeGroup?.id, handleFetchReport]);

  const handleOpenDrawer = (employeeName: string, sales: SaleData[]) => {
    setSelectedEmployee(employeeName);
    setSelectedSales(sales);
    setIsDrawerOpen(true);
  };

  const columns: ColumnDef<EmployeeSummary>[] = [
    { header: 'Employee Name', accessorKey: 'employeeName' },
    { header: 'Total Sale', accessorKey: 'totalSale' },
    {
      header: 'Details',
      cell: ({ row }) => (
        <Button
          onClick={() =>
            handleOpenDrawer(
              row.original.employeeName,
              row.original.sales || []
            )
          }
        >
          View Sales
        </Button>
      ),
    },
  ];

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="container mx-auto mt-6">
      <BackButton />
      {checked && (
        <div className="mt-6">
          {eodExists ? (
            <div>
              <h1 className="text-2xl font-bold mb-4">Report for {date}</h1>
              <ReportSummary report={eodData || null} />
            </div>
          ) : (
            <p>No EOD report found for {date}</p>
          )}
          <Separator className="my-4" />
          {employeeSummaries.length !== 0 ? (
            <div className="mt-4">
              <h1 className="text-highlight">
                Total Sales from employee sales: {formatCurrency(totalSale)}
              </h1>
              <div className="pb-20">
                <DataTable columns={columns} data={employeeSummaries} />
              </div>
            </div>
          ) : (
            <p>No sales data found for {date}</p>
          )}
        </div>
      )}

      {/* Employee Sales Drawer */}
      <EmployeeSalesDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        employeeName={selectedEmployee || 'Unknown'}
        selectedDate={date}
        sales={selectedSales || []}
      />
    </div>
  );
};

export default TodayReport;
