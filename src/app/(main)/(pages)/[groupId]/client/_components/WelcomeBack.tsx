import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tables } from '@/lib/database.types';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'react-toastify';

type Client = Tables<'clients'>;

interface WelcomeBackProps {
  client: Client;
  onUpdate: (updatedClient: Client) => Promise<void>; // Updated to match the async function
}

const WelcomeBack: React.FC<WelcomeBackProps> = ({ client, onUpdate }) => {
  const [formData, setFormData] = useState<Client>(client);
  const [loading, setLoading] = useState(false); // Loading state

  const handleInputChange = (
    field: keyof Client,
    value: string | null | undefined
  ) => {
    if (value !== null) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSubmit = async () => {
    if (!formData.first_name || !formData.last_name) {
      toast.error('First and last names are required!');
      return;
    }

    setLoading(true);
    try {
      await onUpdate(formData); // Pass the updated client to onUpdate
      toast.success('Check-in successful!');
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">
        Welcome Back, {client.first_name}!
      </h2>
      <div className="space-y-4">
        <Label>First Name</Label>
        <Input
          value={formData.first_name || ''}
          onChange={(e) => handleInputChange('first_name', e.target.value)}
          disabled={loading}
        />
        <Label>Last Name</Label>
        <Input
          value={formData.last_name || ''}
          onChange={(e) => handleInputChange('last_name', e.target.value)}
          disabled={loading}
        />
        <Label>Email</Label>
        <Input
          value={formData.email || ''}
          onChange={(e) => handleInputChange('email', e.target.value)}
          disabled={loading}
        />
        <Button
          onClick={handleSubmit}
          className={`w-full py-2 font-semibold ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
          disabled={loading}
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Check In'}
        </Button>
      </div>
    </div>
  );
};

export default WelcomeBack;
