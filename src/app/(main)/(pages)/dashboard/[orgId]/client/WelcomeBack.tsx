import { Client, SaveClientInput } from '@/lib/types';
import React from 'react';

interface WelcomeBackProps {
  client: SaveClientInput;
  onUpdate: (updatedClient: SaveClientInput) => Promise<void>; // Updated to match the async function
}

const WelcomeBack: React.FC<WelcomeBackProps> = ({ client, onUpdate }) => {
  const [formData, setFormData] = React.useState(client);

  const handleInputChange = (field: keyof Client, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      await onUpdate(formData); // Pass the updated client to onUpdate
    } catch (error) {
      console.error('Error updating client:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold">Welcome Back, {client.firstName}!</h2>
      <div className="space-y-4">
        <input
          type="text"
          value={formData.firstName}
          onChange={(e) => handleInputChange('firstName', e.target.value)}
          placeholder="First Name"
          className="w-full p-2 mt-2 border rounded"
        />
        <input
          type="text"
          value={formData.lastName}
          onChange={(e) => handleInputChange('lastName', e.target.value)}
          placeholder="Last Name"
          className="w-full p-2 mt-2 border rounded"
        />
        <input
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          placeholder="Email"
          className="w-full p-2 mt-2 border rounded"
        />
        <button
          onClick={handleSubmit}
          className="px-4 py-2 mt-4 text-white bg-green-500 rounded"
        >
          Check In
        </button>
      </div>
    </div>
  );
};

export default WelcomeBack;
