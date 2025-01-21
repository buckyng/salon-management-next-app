'use client';

import React from 'react';
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover';
import { SaleData } from '@/lib/types';
import { Button } from '@/components/ui/button';

interface EmployeeSalesPopoverProps {
  employeeName: string;
  sales: SaleData[];
}

export const EmployeeSalesPopover: React.FC<EmployeeSalesPopoverProps> = ({
  employeeName,
  sales,
}) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>View Details</Button>
      </PopoverTrigger>
      <PopoverContent>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">
            Sales Details - {employeeName}
          </h3>
          <table className="w-full border">
            <thead>
              <tr>
                <th className="border px-2 py-1 text-left">Time</th>
                <th className="border px-2 py-1 text-left">Amount</th>
                <th className="border px-2 py-1 text-left">Note</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale: SaleData, index: number) => (
                <tr key={index}>
                  <td className="border px-2 py-1">
                    {new Date(sale.created_at || '').toLocaleTimeString()}
                  </td>
                  <td className="border px-2 py-1">
                    ${sale.amount.toFixed(2)}
                  </td>
                  <td className="border px-2 py-1">{sale.note || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PopoverContent>
    </Popover>
  );
};
