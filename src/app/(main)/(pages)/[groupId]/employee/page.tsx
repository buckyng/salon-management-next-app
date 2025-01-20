'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { useUser } from '@/context/UserContext';
import { useGroup } from '@/context/GroupContext';
import { formatToLocalTime, getCurrentLocalDate } from '@/lib/utils/dateUtils';
import { SaleData } from '@/lib/types';


const EmployeeHomePage = () => {
  const { user } = useUser();
  const { activeGroup } = useGroup();
  const router = useRouter();

  const [sales, setSales] = useState<SaleData[]>([]);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [loading, setLoading] = useState(false); // Loading state

  const currentDate = getCurrentLocalDate();

  const columns: ColumnDef<SaleData>[] = [
    {
      header: 'Index',
      accessorFn: (_row, index) => index + 1,
      cell: ({ getValue }) => getValue(),
    },
    {
      header: 'Time',
      accessorKey: 'created_at',
      cell: ({ getValue }) => formatToLocalTime(getValue<string>()),
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: ({ getValue }) => `$${getValue<number>().toFixed(2)}`,
    },
    {
      header: 'Combo',
      accessorKey: 'combo_num',
      cell: ({ getValue }) => getValue() || '',
    },
    {
      header: 'Note',
      accessorKey: 'note',
      cell: ({ getValue }) => getValue() || '',
    },
  ];

  // Fetch sales data
  useEffect(() => {
    if (!user || !activeGroup?.id) return;

    const fetchSales = async () => {
      setLoading(true); // Start loading state
      try {
        const response = await fetch(
          `/api/sales/fetch-today?groupId=${activeGroup.id}&userId=${user.id}&date=${currentDate}`
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to fetch sales data.');
        }

        const salesData = await response.json();

        setSales(salesData);

        const total = salesData.reduce(
          (sum: number, sale: SaleData) => sum + sale.amount,
          0
        );
        setTotalSales(total);
      } catch (error) {
        console.error('Error fetching sales:', error);
      } finally {
        setLoading(false); // End loading state
      }
    };

    fetchSales();
  }, [user, activeGroup?.id, currentDate]);

  return (
    <div className="container mx-auto mt-4">
      <h1 className="text-2xl font-bold">
        {activeGroup?.name
          ? `${activeGroup.name} - Today's Sales`
          : "Today's Sales"}
      </h1>
      <p className="text-gray-600">Date: {currentDate}</p>

      <div className="my-4 flex gap-4">
        <Button
          onClick={() => router.push(`/${activeGroup?.id}/employee/add-sale`)}
          disabled={loading} // Disable button when loading
        >
          Add Sale
        </Button>

        <Button
          onClick={() => router.push(`/${activeGroup?.id}/employee/report`)}
          className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600"
          disabled={loading} // Disable button when loading
        >
          View Reports
        </Button>
      </div>

      <div className="my-4">
        <h2 className="text-lg font-bold">
          Total Sales: ${totalSales.toFixed(2)}
        </h2>
      </div>

      <div className="mt-4">
        <h3 className="mb-2 text-lg font-bold">Today&apos;s Sales</h3>
        {loading ? (
          <p>Loading sales data...</p>
        ) : (
          <DataTable columns={columns} data={sales} />
        )}
      </div>
    </div>
  );
};

export default EmployeeHomePage;
