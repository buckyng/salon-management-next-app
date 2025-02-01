'use client';

import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { SaleData } from '@/lib/types';
import { formatToLocalTime } from '@/lib/utils/dateUtils';
import { formatCurrency } from '@/lib/utils/formatUtils';
import { Button } from '@/components/ui/button';

interface EmployeeSalesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  sales: SaleData[];
  selectedDate: string | null;
  employeeName: string; // Added employee name prop
}

const EmployeeSalesDrawer: React.FC<EmployeeSalesDrawerProps> = ({
  isOpen,
  onClose,
  sales,
  selectedDate,
  employeeName,
}) => {
  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            Sales Details - {selectedDate} ({employeeName})
          </DrawerTitle>
        </DrawerHeader>
        <div className="p-4">
          <div className="mt-4">
            {sales.length > 0 ? (
              <table className="w-full border">
                <thead>
                  <tr>
                    <th className="border px-2 py-1 text-left">Time</th>
                    <th className="border px-2 py-1 text-left">Amount</th>
                    <th className="border px-2 py-1 text-left">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale, index) => (
                    <tr key={index}>
                      <td className="border px-2 py-1">
                        {formatToLocalTime(sale.created_at)}
                      </td>
                      <td className="border px-2 py-1">
                        {formatCurrency(sale.amount)}
                      </td>
                      <td className="border px-2 py-1">{sale.note || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-500">No sales found.</p>
            )}
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default EmployeeSalesDrawer;
