'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';

interface CheckIn {
  id: string;
  createdAt: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  checkInHistory: { createdAt: string; isInService: boolean }[];
  numberOfVisits: number;
  lastCheckInRating: number;
  isInService: boolean;
}

interface CheckInTableProps {
  checkIns: CheckIn[];
  onToggle: (checkInId: string, isInService: boolean) => void;
}

export const CheckInTable: React.FC<CheckInTableProps> = ({
  checkIns,
  onToggle,
}) => {
  const { orgId } = useAuth();
  const router = useRouter();

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Time</TableHead>
          <TableHead>Client Name</TableHead>
          <TableHead>Number of Visits</TableHead>
          <TableHead>Last Rating</TableHead>
          <TableHead>In Service</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {checkIns.map((checkIn) => (
          <TableRow key={checkIn.id} className="cursor-pointer">
            <TableCell>
              {new Date(checkIn.createdAt).toLocaleTimeString()}
            </TableCell>
            <TableCell
              onClick={() =>
                router.push(`/dashboard/${orgId}/client/${checkIn.clientId}`)
              }
            >
              {checkIn.clientName}
            </TableCell>
            <TableCell>{checkIn.numberOfVisits}</TableCell>
            <TableCell>{checkIn.lastCheckInRating || 'N/A'}</TableCell>
            <TableCell>
              <Switch
                checked={checkIn.isInService}
                onCheckedChange={(value) => onToggle(checkIn.id, value)}
                onClick={(e) => e.stopPropagation()} // Prevent modal open on toggle click
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
