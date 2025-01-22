'use client';

import React, { useEffect, useState } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'react-toastify';
import { useGroup } from '@/context/GroupContext';
import {
  fetchOrganizationSales,
  groupSales,
  updateSaleStatus,
} from '@/services/saleService';
import { formatToLocalTime, getCurrentLocalDate } from '@/lib/utils/dateUtils';
import { EnrichedSales, GroupedSale, SaleData } from '@/lib/types';
import subscribeToSales from '@/lib/supabase/services/realtimeSales';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCheckEodReport } from '@/lib/hooks/useCheckEodReport';

const CashierPage: React.FC = () => {
  const { activeGroup } = useGroup();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingSale, setEditingSale] = useState<SaleData | null>(null);
  const [newAmount, setNewAmount] = useState<string>('');

  const [sales, setSales] = useState<GroupedSale[]>([]); // Properly typed state
  const [loading, setLoading] = useState<boolean>(false); // Properly typed state
  const currentDate = getCurrentLocalDate();

  const { eodExists, isEodLoading } = useCheckEodReport({
    groupId: activeGroup?.id || null,
    date: currentDate,
  });

  useEffect(() => {
    if (!activeGroup) return;

    const groupId = activeGroup.id;

    // Fetch initial sales and subscribe to real-time updates
    const fetchInitialSales = async () => {
      setLoading(true);
      try {
        const initialSales = await fetchOrganizationSales({
          groupId,
          date: currentDate,
          paid: false,
        });
        const groupedSales = groupSales(initialSales);

        setSales(groupedSales);
      } catch (error) {
        console.error('Error fetching initial sales:', error);
        toast.error('Failed to load sales.');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialSales();

    const unsubscribe = subscribeToSales(activeGroup.id, (newSale) => {
      handleNewSale(newSale); // Handle the new sale and update the state
    });

    return () => {
      unsubscribe();
    };
  }, [activeGroup, currentDate]);

  const handleNewSale = (newSale: EnrichedSales) => {
    setSales((prev) => {
      // Check if a group already exists for this comboNum
      const existingGroup = prev.find(
        (group) => group.comboNum === newSale.combo_num
      );

      if (existingGroup) {
        // Update the existing group by adding the new sale
        const updatedGroup = {
          ...existingGroup,
          sales: [...existingGroup.sales, newSale],
          totalAmount: existingGroup.totalAmount + newSale.amount,
        };

        // Replace the updated group in the list
        return prev.map((group) =>
          group.comboNum === newSale.combo_num ? updatedGroup : group
        );
      } else {
        // Create a new group for this comboNum
        return [
          ...prev,
          {
            comboNum: newSale.combo_num,
            sales: [newSale],
            totalAmount: newSale.amount,
          },
        ];
      }
    });
  };
  const handleMarkPaid = async (saleId: string, comboNum: number | null) => {
    try {
      await updateSaleStatus({
        saleId,
        updates: { paid: true },
      });

      // Update UI
      setSales((prev) => {
        return prev
          .map((group) => {
            if (group.comboNum === comboNum) {
              const updatedSales = group.sales.filter(
                (sale) => sale.id !== saleId
              );
              return updatedSales.length > 0
                ? {
                    ...group,
                    sales: updatedSales,
                    totalAmount: updatedSales.reduce(
                      (total, sale) => total + sale.amount,
                      0
                    ),
                  }
                : null;
            }
            return group;
          })
          .filter((group) => group !== null) as GroupedSale[]; // Remove empty groups
      });

      toast.success('Sale marked as paid!');
    } catch (error) {
      console.error('Error marking sale as paid:', error);
      toast.error('Failed to mark sale.');
    }
  };

  const handleMarkPaidAll = async (group: GroupedSale) => {
    try {
      // Mark all sales in the group as paid
      await Promise.all(
        group.sales.map((sale) =>
          updateSaleStatus({
            saleId: sale.id,
            updates: { paid: true },
          })
        )
      );

      // Update UI
      setSales((prev) => prev.filter((g) => g.comboNum !== group.comboNum));

      toast.success(
        `All sales for Combo ${group.comboNum || 'No Combo'} marked as paid!`
      );
    } catch (error) {
      console.error('Error marking all sales as paid:', error);
      toast.error('Failed to mark all sales as paid.');
    }
  };

  const handleEditSale = (sale: SaleData) => {
    setEditingSale(sale);
    setNewAmount(sale.amount.toString());
    setIsEditing(true); // Open the dialog
  };

  const handleSaveAmount = async () => {
    if (!editingSale || !newAmount) return;

    try {
      await updateSaleStatus({
        saleId: editingSale.id,
        updates: {
          amount: parseFloat(newAmount),
          updated_at: new Date().toISOString(),
        },
      });

      setSales((prev) =>
        prev.map((group) => {
          if (group.comboNum === editingSale.combo_num) {
            return {
              ...group,
              sales: group.sales.map((s) =>
                s.id === editingSale.id
                  ? { ...s, amount: parseFloat(newAmount) }
                  : s
              ),
              totalAmount: group.sales.reduce(
                (total, s) =>
                  s.id === editingSale.id
                    ? total + parseFloat(newAmount) - s.amount
                    : total + s.amount,
                0
              ),
            };
          }
          return group;
        })
      );

      toast.success('Sale updated successfully!');
    } catch (error) {
      console.error('Error updating sale:', error);
      toast.error('Failed to update sale.');
    } finally {
      setIsEditing(false);
      setEditingSale(null);
    }
  };

  const columns: ColumnDef<SaleData>[] = [
    {
      header: 'Time',
      accessorKey: 'created_at',
      cell: ({ getValue }) => formatToLocalTime(getValue<string>()),
    },
    { header: 'Employee Name', accessorKey: 'userName' },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: ({ getValue }) => `$${getValue<number>().toFixed(2)}`,
    },
    {
      header: 'Actions',
      accessorKey: 'id',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button onClick={() => handleEditSale(row.original)}>Edit</Button>
          <Button
            onClick={() =>
              handleMarkPaid(row.original.id, row.original.combo_num || null)
            }
          >
            Mark Paid
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <p className="text-center">Loading sales...</p>;
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
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold text-center">
        Cashier - {activeGroup?.name || 'Loading...'}
      </h1>
      <p className="text-center text-gray-600">Date: {currentDate}</p>

      {sales.length === 0 ? (
        <div className="p-4 text-center text-gray-500 bg-gray-100 rounded-md">
          <p>No sales to display for today.</p>
        </div>
      ) : (
        sales.map((group) => (
          <div
            key={group.comboNum || 'no-combo'}
            className="mb-6 border p-4 rounded-md"
          >
            <div className="flex flex-wrap items-center justify-between">
              <h2 className="text-lg font-bold">
                Combo {group.comboNum || 'No Combo'} - Total: $
                {group.totalAmount.toFixed(2)}
              </h2>
              {group.comboNum && (
                <Button
                  variant="destructive"
                  onClick={() => handleMarkPaidAll(group)}
                  size="sm"
                >
                  Mark Paid All
                </Button>
              )}
            </div>
            <DataTable
              columns={columns}
              data={group.sales}
              enablePagination={false}
            />
          </div>
        ))
      )}

      {isEditing && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Sale Amount</DialogTitle>
              <DialogDescription>
                Update the sale amount for the selected item.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              type="number"
              placeholder="Enter new amount"
              className="w-full"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAmount}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CashierPage;
