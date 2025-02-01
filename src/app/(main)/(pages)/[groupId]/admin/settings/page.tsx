'use client';

import React, { useState, useEffect } from 'react';
import { useGroup } from '@/context/GroupContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import BackButton from '@/components/global/BackButton';

const GoogleSheetSettings = () => {
  const { activeGroup } = useGroup();
  const [sheetId, setSheetId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!activeGroup?.id) return;

    const fetchSheetId = async () => {
      try {
        const res = await fetch(`/api/groups/${activeGroup.id}/google-sheet`);
        const data = await res.json();
        if (res.ok) {
          setSheetId(data.googleSheetId || '');
        }
      } catch (error) {
        console.error('Error fetching Google Sheet ID:', error);
      }
    };

    fetchSheetId();
  }, [activeGroup]);

  const handleSave = async () => {
    if (!sheetId.trim()) {
      toast.error('Google Sheet ID cannot be empty.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/groups/${activeGroup?.id}/google-sheet`, {
        method: 'POST',
        body: JSON.stringify({ googleSheetId: sheetId }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        toast.success('Google Sheet ID updated successfully!');
      } else {
        toast.error('Failed to update Google Sheet ID.');
      }
    } catch (error) {
      console.error('Error updating Google Sheet ID:', error);
      toast.error('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto mt-6 p-4">
      <BackButton />
      <h1 className="text-2xl font-bold mb-4">Google Sheets Integration</h1>
      <p className="mb-2">Set the Google Sheet ID for exporting reports.</p>
      <Input
        type="text"
        value={sheetId}
        onChange={(e) => setSheetId(e.target.value)}
        placeholder="Enter Google Sheet ID"
        className="mb-4"
      />
      <Button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Google Sheet ID'}
      </Button>
    </div>
  );
};

export default GoogleSheetSettings;
