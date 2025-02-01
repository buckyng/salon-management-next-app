'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { EmployeeSummary, SaleData } from '@/lib/types';
import { fetchReportDetails } from '@/services/reportService';
import { ColumnDef } from '@tanstack/react-table';
import { useReport } from '@/context/ReportContext';
import BackButton from '@/components/global/BackButton';
import ReportSummary from '@/components/global/ReportSummary';
import LoadingSpinner from '@/components/global/LoadingSpinner';
import EmployeeSalesDrawer from '@/components/global/EmployeeSalesDrawer';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';

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

  // Drawer State
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedSales, setSelectedSales] = useState<SaleData[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { selectedReport } = useReport();

  useEffect(() => {
    if (!groupId || !date) return;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await fetchReportDetails(groupId, date);
        setEmployeeSummaries(data);
      } catch (error) {
        console.error('Error fetching report details:', error);
        toast.error('Failed to fetch employee details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [groupId, date]);

  const handleOpenDrawer = (employeeName: string, sales: SaleData[]) => {
    setSelectedEmployee(employeeName);
    setSelectedSales(sales);
    setIsDrawerOpen(true);
  };

  const columns: ColumnDef<EmployeeSummary>[] = [
    { header: 'Employee Name', accessorKey: 'employeeName' },
    {
      header: 'Total Sale',
      accessorKey: 'totalSale',
      cell: ({ getValue }) => `$${getValue<number>().toFixed(2)}`,
    },
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
      <h2 className="text-2xl font-semibold mb-4">Report for {date}</h2>
      <div className="mt-4 mb-4">
        <ReportSummary report={selectedReport || null} />
      </div>
      <DataTable columns={columns} data={employeeSummaries} />

      {/* Employee Sales Drawer */}
      <EmployeeSalesDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        sales={selectedSales}
        selectedDate={date}
        employeeName={selectedEmployee || ''}
      />
    </div>
  );
};

export default ReportByDatePage;
