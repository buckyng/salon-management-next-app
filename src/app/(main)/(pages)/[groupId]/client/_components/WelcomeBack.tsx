import { Button } from '@/components/ui/button';
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
    <div className="container mx-auto px-6 py-10 sm:px-8 lg:px-10">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6">
        Welcome Back, {client.first_name}!
      </h2>
      <div className="max-w-md mx-auto space-y-6 bg-white p-6 shadow-md rounded-lg">
        {/* First Name Input */}
        <div>
          <label
            htmlFor="first_name"
            className="block text-sm font-medium mb-2"
          >
            First Name
          </label>
          <input
            id="first_name"
            type="text"
            value={formData.first_name || ''}
            onChange={(e) => handleInputChange('first_name', e.target.value)}
            placeholder="First Name"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading} // Disable input while loading
          />
        </div>

        {/* Last Name Input */}
        <div>
          <label htmlFor="last_name" className="block text-sm font-medium mb-2">
            Last Name
          </label>
          <input
            id="last_name"
            type="text"
            value={formData.last_name || ''}
            onChange={(e) => handleInputChange('last_name', e.target.value)}
            placeholder="Last Name"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading} // Disable input while loading
          />
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Email"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading} // Disable input while loading
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          className={`w-full py-3 text-white font-semibold rounded-lg ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-500'
          }`}
          disabled={loading} // Disable button while loading
        >
          {loading ? <Loader2 className="animate-spin" /> : 'Check In'}
        </Button>
      </div>
    </div>
  );
};

export default WelcomeBack;
