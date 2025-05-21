'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { ColumnDef } from '@tanstack/react-table';
import { useUser } from '@/context/UserContext';
import { useGroup } from '@/context/GroupContext';
import { formatToLocalTime, getCurrentLocalDate } from '@/lib/utils/dateUtils';
import { SaleData } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { fetchSalesByUser } from '@/services/saleService';
import { sortByKey } from '@/lib/utils/funcUtils';
import { formatCurrency } from '@/lib/utils/formatUtils';

const EmployeeHomePage = () => {
  const { user } = useUser();
  const { activeGroup } = useGroup();

  const [sales, setSales] = useState<SaleData[]>([]);
  const [totalSales, setTotalSales] = useState<number>(0);
  const [numOfSales, setNumOfSales] = useState<number>(0);
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      try {
        const salesData = await fetchSalesByUser({
          activeGroupId: activeGroup.id,
          userId: user.id,
          date: currentDate,
        });

        const sortedByCreatedAt = sortByKey(
          salesData,
          'created_at',
          'asc'
        ) as SaleData[];

        setSales(sortedByCreatedAt);
        setNumOfSales(sortedByCreatedAt.length);

        const total = salesData.reduce(
          (sum: number, sale: SaleData) => sum + sale.amount!,
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
        <h2 className="text-highlight">
          Total Sales: {formatCurrency(totalSales)}
        </h2>
        <p className="text-center mb-4">Number of sales: {numOfSales}</p>
      </div>

      <div className="mt-4 overflow-x-auto">
        {loading ? <Loader2 /> : <DataTable columns={columns} data={sales} />}
      </div>
    </div>
  );
};

export default EmployeeHomePage;
