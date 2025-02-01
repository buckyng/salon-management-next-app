'use client';

import React, { useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { EmployeeSummary, SaleData } from '@/lib/types';
import { ColumnDef } from '@tanstack/react-table';
import { useReport } from '@/context/ReportContext';
import ReportSummary from '@/components/global/ReportSummary';
import EmployeeSalesDrawer from '@/components/global/EmployeeSalesDrawer';
import { Button } from '@/components/ui/button';

interface ReportByDateProps {
  employeeSummaries: EmployeeSummary[];
  date: string | null;
}

const ReportByDatePage: React.FC<ReportByDateProps> = ({
  employeeSummaries,
  date,
}) => {
  // Drawer State
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedSales, setSelectedSales] = useState<SaleData[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { selectedReport } = useReport();

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

  // if (loading) {
  //   return <LoadingSpinner fullScreen />;
  // }

  return (
    <div className="container mx-auto mt-6">
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
        selectedDate=""
        employeeName={selectedEmployee || ''}
      />
    </div>
  );
};

export default ReportByDatePage;
