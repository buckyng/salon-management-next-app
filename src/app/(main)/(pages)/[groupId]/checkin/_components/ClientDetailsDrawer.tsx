'use client';

import React, { useEffect, useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EnrichedCheckIn } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useGroup } from '@/context/GroupContext';
import { updateClientInfo } from '@/services/clientService';
import { toast } from 'react-toastify';

interface ClientDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  client: EnrichedCheckIn | null;
}

const ClientDetailsDrawer: React.FC<ClientDetailsDrawerProps> = ({
  isOpen,
  onClose,
  client,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { activeGroup } = useGroup();

  // Sync client data into state when opening the drawer
  useEffect(() => {
    if (client) {
      setFirstName(client.clients?.first_name || '');
      setLastName(client.clients?.last_name || '');
      setPhone(client.clients?.phone || '');
    }
  }, [client]);

  const handleSaveClient = async () => {
    if (!client?.id || !activeGroup?.id) {
      toast.error('Missing client or group ID.');
      return;
    }

    setLoading(true);

    const success = await updateClientInfo({
      clientId: client.client_id,
      updatedClient: {
        first_name: firstName,
        last_name: lastName,
        phone: phone,
      },
    });

    setLoading(false);

    if (success) {
      toast.success('Client information updated successfully.');
      onClose();
    } else {
      toast.error('Failed to update client information.');
    }
  };

  const handleViewHistory = () => {
    if (!client?.client_id) return;
    router.push(
      `/${activeGroup?.id}/clients/${client.client_id}/check-in-history`
    );
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit Client Info</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-4">
          <label className="block">
            <span className="text-gray-700 dark:text-gray-300">First Name</span>
            <Input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First Name"
            />
          </label>
          <label className="block">
            <span className="text-gray-700 dark:text-gray-300">Last Name</span>
            <Input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last Name"
            />
          </label>
          <label className="block">
            <span className="text-gray-700 dark:text-gray-300">Phone</span>
            <Input
              type="tel"
              value={phone}
              readOnly
              className="bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
            />
          </label>
          <Button variant="outline" onClick={handleViewHistory}>
            View Check-in History
          </Button>
          <div className="flex justify-end space-x-2">
            <DrawerClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DrawerClose>
            <Button onClick={handleSaveClient} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default ClientDetailsDrawer;
