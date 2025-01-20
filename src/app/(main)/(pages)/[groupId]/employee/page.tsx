'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useUser } from '@/context/UserContext';
import { useGroup } from '@/context/GroupContext';
import { formatToLocalTime, getCurrentLocalDate } from '@/lib/utils/dateUtils';
import { SaleData } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const EmployeeHomePage = () => {
  const { user } = useUser();
  const { activeGroup } = useGroup();

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
    <div className="container mx-auto mt-4 px-4 sm:px-6 lg:px-8">
      <h1 className="text-xl font-bold text-center sm:text-2xl mb-4">
        {activeGroup?.name
          ? `${activeGroup.name} - Today's Sales`
          : "Today's Sales"}
      </h1>
      <p className="text-center mb-4">Date: {currentDate}</p>

      <div className="my-4 text-center">
        <h2 className="text-lg font-bold">
          Total Sales: ${totalSales.toFixed(2)}
        </h2>
      </div>

      <div className="mt-4 overflow-x-auto">
        {loading ? (
          <Loader2 />
        ) : (
          <DataTable columns={columns} data={sales} pageSize={5} />
        )}
      </div>
    </div>
  );
};

export default EmployeeHomePage;
