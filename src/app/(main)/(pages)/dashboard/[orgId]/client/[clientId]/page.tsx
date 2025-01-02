'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Client } from '@/lib/types';
import { getClientDetails } from '@/lib/client/clientService';
import { useOrganizationContext } from '@/context/OrganizationContext';
import GoBackButton from '@/components/ui/GoBackButton';

const ClientPage = () => {
  const { clientId } = useParams();
  const { dbOrganizationId } = useOrganizationContext(); // Use organizationId from context
  const [clientData, setClientData] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dbOrganizationId || !clientId) {
      setError('Invalid organization or client ID.');
      setLoading(false);
      return;
    }

    const fetchClientData = async () => {
      try {
        const data = await getClientDetails(
          clientId as string,
          dbOrganizationId
        );
        if (!data) {
          setError('Client not found.');
        } else {
          setClientData(data);
        }
      } catch (err) {
        console.error('Error fetching client details:', err);
        setError('Failed to fetch client details.');
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [dbOrganizationId, clientId]);

  if (loading) {
    return <p>Loading client details...</p>;
  }

  if (!clientData) {
    return <p>Client not found</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="container mx-auto mt-10 p-6">
      <div className="pb-6">
        <GoBackButton />
      </div>
      <h1 className="text-3xl font-bold mb-4">
        Client: {clientData.firstName} {clientData.lastName}
      </h1>
      <p>Phone: {clientData.phone}</p>
      <p>Email: {clientData.email || 'N/A'}</p>
      <p>Number of Visits: {clientData.numberOfVisits}</p>
      <p>Last Visit Rating: {clientData.lastVisitRating || 'N/A'}</p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">Check-In History</h2>
      {clientData.checkIns && clientData.checkIns.length > 0 ? (
        <ul>
          {clientData.checkIns.map((checkIn) => (
            <li key={checkIn.id}>
              {new Date(checkIn.createdAt).toLocaleString()}
            </li>
          ))}
        </ul>
      ) : (
        <p>No check-in history available.</p>
      )}

      <h2 className="text-2xl font-semibold mt-6 mb-2">Feedback</h2>
      <ul>
        {clientData.feedbacks.map((feedback) => (
          <li key={feedback.id}>
            {new Date(feedback.createdAt).toLocaleString()} - Rating:{' '}
            {feedback.rating}/5 - {feedback.comment || 'No comment'}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ClientPage;
