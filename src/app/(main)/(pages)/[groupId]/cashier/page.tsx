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
import { useEodReport } from '@/context/EodReportContext';
import LoadingSpinner from '@/components/global/LoadingSpinner';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/formatUtils';
import { Label } from '@/components/ui/label';

const CashierPage: React.FC = () => {
  const { activeGroup } = useGroup();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingSale, setEditingSale] = useState<SaleData | null>(null);
  const [newAmount, setNewAmount] = useState<string>('');
  const [newComboNum, setNewComboNum] = useState<string>('');

  const [sales, setSales] = useState<GroupedSale[]>([]); // Properly typed state
  const [loading, setLoading] = useState<boolean>(false); // Properly typed state
  const currentDate = getCurrentLocalDate();

  const { eodExists, checkAndSetEodExists } = useEodReport();

  useEffect(() => {
    if (activeGroup?.id) {
      checkAndSetEodExists(activeGroup.id, currentDate);
    }
  }, [activeGroup, currentDate, checkAndSetEodExists]);

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

        // 🔹 Sort sales from most recent to oldest before grouping
        const sortedSales = initialSales.sort(
          (a, b) =>
            new Date(b.created_at!).getTime() -
            new Date(a.created_at!).getTime()
        );
        const groupedSales = groupSales(sortedSales);

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
          sales: [newSale, ...existingGroup.sales],
          totalAmount: existingGroup.totalAmount! + newSale.amount!,
        };

        // Replace the updated group in the list
        return prev.map((group) =>
          group.comboNum === newSale.combo_num ? updatedGroup : group
        );
      } else {
        // Create a new group for this comboNum
        return [
          {
            comboNum: newSale.combo_num,
            sales: [newSale],
            totalAmount: newSale.amount,
          },
          ...prev,
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
                      (total, sale) => total + sale.amount!,
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
    setNewAmount(sale.amount!.toString());
    setNewComboNum(sale.combo_num?.toString() || '');
    setIsEditing(true); // Open the dialog
  };

  const handleSaveAmount = async () => {
    if (!editingSale || !newAmount) return;

    const parsedComboNum =
      newComboNum.trim() !== '' ? parseInt(newComboNum, 10) : null;
    const parsedAmount = parseFloat(newAmount);

    try {
      await updateSaleStatus({
        saleId: editingSale.id,
        updates: {
          amount: parsedAmount,
          combo_num: parsedComboNum,
          updated_at: new Date().toISOString(),
        },
      });

      // 🔹 Find `userName` before updating state
      const existingSale = sales
        .flatMap((group) => group.sales)
        .find((sale) => sale.id === editingSale.id);
      const userName = existingSale ? existingSale.userName : 'Unknown';

      // 🔹 Create the updated sale object
      const updatedSale: EnrichedSales = {
        ...editingSale,
        amount: parsedAmount,
        combo_num: parsedComboNum,
        userName, // ✅ Ensure userName exists
      };

      // 🔹 Update state using `groupSales`
      setSales((prevSales) => {
        // Remove the old sale from previous sales
        const updatedSales = prevSales
          .flatMap((group) => group.sales)
          .filter((s) => s.id !== editingSale.id);

        // Add the updated sale
        updatedSales.push(updatedSale);

        // Use the helper function to **rebuild the groups correctly**
        return groupSales(updatedSales);
      });

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
    return <LoadingSpinner fullScreen />;
  }

  if (eodExists) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-lg font-bold text-red-500 text-center">
          An End-of-Day Report for {currentDate} has already been submitted.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-center">
        {activeGroup?.name || 'Loading...'} - {currentDate}
      </h1>
      {sales.length === 0 ? (
        <div className="text-center text-gray-500 bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
          <p>No sales to display for today.</p>
        </div>
      ) : (
        sales.map((group) => (
          <div
            key={group.comboNum || 'no-combo'}
            className="bg-white dark:bg-gray-700 border rounded-md p-4 shadow"
          >
            <div className="flex flex-wrap items-center justify-between">
              <h2
                className={cn(
                  'text-lg font-semibold mb-2',
                  group.comboNum ? 'text-red-500' : ''
                )}
              >
                Combo {group.comboNum || 'No Combo'} - Total:
                {formatCurrency(group.totalAmount)}
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
              data={group.sales.sort(
                (a, b) =>
                  new Date(b.created_at!).getTime() -
                  new Date(a.created_at!).getTime()
              )}
            />
          </div>
        ))
      )}

      {isEditing && (
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent>
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold text-gray-800 dark:text-gray-100">
                Edit Sale Amount
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                Update the sale amount for the selected item.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Label htmlFor="newAmount">New Amount</Label>
              <Input
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                type="number"
                placeholder="Enter new amount"
                className="w-full"
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="newComboNum">New combo Number</Label>
              <Input
                value={newComboNum}
                onChange={(e) => setNewComboNum(e.target.value)}
                type="number"
                placeholder="Enter new combo number"
                className="w-full"
              />
            </div>
            <DialogFooter className="mt-6 flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAmount} className="px-4 py-2">
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CashierPage;
