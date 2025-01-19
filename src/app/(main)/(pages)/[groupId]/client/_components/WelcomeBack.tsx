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
    <div className="p-6">
      <h2 className="text-lg font-bold">Welcome Back, {client.first_name}!</h2>
      <div className="space-y-4">
        <input
          type="text"
          value={formData.first_name || ''}
          onChange={(e) => handleInputChange('first_name', e.target.value)}
          placeholder="First Name"
          className="w-full p-2 mt-2 border rounded"
          disabled={loading} // Disable input while loading
        />
        <input
          type="text"
          value={formData.last_name || ''}
          onChange={(e) => handleInputChange('last_name', e.target.value)}
          placeholder="Last Name"
          className="w-full p-2 mt-2 border rounded"
          disabled={loading} // Disable input while loading
        />
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="Email"
          className="w-full p-2 mt-2 border rounded"
          disabled={loading} // Disable input while loading
        />
        <button
          onClick={handleSubmit}
          className={`px-4 py-2 mt-4 text-white rounded ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600'
          }`}
          disabled={loading} // Disable button while loading
        >
          {loading ? <Loader2 /> : 'Check In'}
        </button>
      </div>
    </div>
  );
};

export default WelcomeBack;
