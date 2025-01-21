'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'react-toastify';
import { useGroup } from '@/context/GroupContext';
import { SaleData } from '@/lib/types';
import {
  fetchOrganizationSales,
  updateSaleStatus,
} from '@/services/saleService';
import { getCurrentLocalDate } from '@/lib/utils/dateUtils';
import { useCheckEodReport } from '@/lib/hooks/useCheckEodReport';

const HistoryCashierPage = () => {
  const { activeGroup } = useGroup();

  const [sales, setSales] = useState<SaleData[]>([]);
  const [loading, setLoading] = useState(false);
  const currentDate = getCurrentLocalDate();

  const { eodExists, isEodLoading } = useCheckEodReport({
    groupId: activeGroup?.id || null,
    date: currentDate,
  });

  useEffect(() => {
    if (!activeGroup) return;

    const loadSales = async () => {
      if (!activeGroup?.id) return;

      setLoading(true);
      try {
        const salesData = await fetchOrganizationSales({
          groupId: activeGroup.id,
          date: currentDate,
          paid: true,
        });

        setSales(salesData);
      } catch (error) {
        console.error('Error fetching sales:', error);
        toast.error('Failed to fetch sales data.');
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, [activeGroup, currentDate]);

  const handleMarkUnpaid = async (saleId: string) => {
    try {
      await updateSaleStatus({
        saleId,
        updates: { paid: false },
      });

      setSales((prev) => prev.filter((sale) => sale.id !== saleId));
      toast.success('Sale marked as unpaid!');
    } catch (error) {
      console.error('Error marking sale as unpaid:', error);
      toast.error('Failed to mark sale as unpaid.');
    }
  };

  const columns: ColumnDef<SaleData>[] = [
    {
      header: 'Time',
      accessorKey: 'created_at',
      cell: ({ row }) =>
        new Date(row.getValue<string>('created_at')).toLocaleTimeString(),
    },
    { header: 'Employee Name', accessorKey: 'userName' },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: ({ row }) => `$${row.getValue<number>('amount').toFixed(2)}`,
    },
    {
      header: 'Combo',
      accessorKey: 'combo_num',
      cell: ({ row }) => `${row.getValue<number>('combo_num') || ''}`,
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: ({ row }) => (
        <Button onClick={() => handleMarkUnpaid(row.original.id)}>
          Mark Unpaid
        </Button>
      ),
    },
  ];

  if (loading) {
    return <p className="text-center">Loading sales...</p>;
  }

  if (!activeGroup) {
    return <p>Loading group...</p>;
  }

  if (isEodLoading) {
    return <p className="text-center mt-4">Loading...</p>;
  }
  
  if (eodExists) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <p className="text-2xl font-bold text-red-500 text-center">
          An End-of-Day Report for {currentDate} has already been submitted.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-6">
      <h1 className="text-2xl font-bold">History - {activeGroup.name}</h1>
      <p className="mb-4 text-gray-600">Date: {currentDate}</p>
      <DataTable columns={columns} data={sales} />
    </div>
  );
};

export default HistoryCashierPage;
