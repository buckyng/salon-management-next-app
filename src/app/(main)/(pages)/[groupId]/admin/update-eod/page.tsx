'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useGroup } from '@/context/GroupContext';
import {
  checkEodReportExists,
  fetchEodReport,
  removeEndOfDayReport,
} from '@/services/reportService';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmDialog from '@/components/global/ConfirmDialog';
import ReportCashier from '@/components/global/ReportCashier';

const AdminEodReportPage: React.FC = () => {
  const { activeGroup } = useGroup();

  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const [eodExists, setEodExists] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [initialData, setInitialData] = useState({
    cash: '',
    debit: '',
    service_discount: '',
    giftcard_buy: '',
    giftcard_redeem: '',
    other_income: '',
    income_note: '',
    expense: '',
    expense_note: '',
  });

  const handleFetchReport = async () => {
    if (!activeGroup?.id || !date) {
      toast.error('Group or Date is not specified.');
      return;
    }

    setIsLoading(true);
    try {
      const exists = await checkEodReportExists({
        groupId: activeGroup.id,
        date,
      });
      setChecked(true);
      setEodExists(exists);
      toast.success(
        `EOD report ${exists ? 'exists' : 'does not exist'} for ${date}.`
      );
    } catch (error) {
      console.error('Error checking EOD report existence:', error);
      toast.error('Failed to check EOD report.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveReport = async () => {
    setIsLoading(true);
    try {
      await removeEndOfDayReport(activeGroup?.id || '', date);
      handleSuccess();
      toast.success('EOD Report removed successfully!');
      setShowConfirmDialog(false);
    } catch (error) {
      console.error('Error removing EOD report:', error);
      toast.error('Failed to remove EOD report.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditReport = async () => {
    try {
      setIsLoading(true);
      const data = await fetchEodReport(activeGroup?.id || '', date);
      setInitialData(data); // Set the fetched data
      setEditing(true);
    } catch (error) {
      console.error('Error fetching EOD report:', error);
      toast.error('Failed to load EOD report data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    setChecked(false);
    setEodExists(false);
    setEditing(false);
    setAdding(false);
  };

  const handleSuccess = () => {
    setAdding(false);
    setEditing(false);
    setDate('');
    setChecked(false);
    setEodExists(false);
  };

  if (!activeGroup) {
    return <p>Loading group...</p>;
  }

  return (
    <div className="container mx-auto mt-6 mb-6">
      <h1 className="text-2xl font-bold">Admin: Manage EOD Reports</h1>

      <div className="mt-4">
        <Label>Select Date</Label>
        <Input
          type="date"
          value={date}
          onChange={handleDateChange}
          disabled={isLoading}
        />
        <Button
          className="mt-4"
          onClick={handleFetchReport}
          disabled={!date || isLoading}
        >
          {checked ? 'Date Selected' : 'Check Report'}
        </Button>
      </div>

      {checked && (
        <div className="mt-6">
          {eodExists ? (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                Report Exists for {date}
              </h2>
              {/* Edit Button */}
              <div className="space-y-4">
                <Button onClick={handleEditReport} disabled={isLoading}>
                  {isLoading ? <Loader2 /> : 'Edit Report'}
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 /> : 'Remove Report'}
                </Button>
              </div>

              {/* Show ReportCashier only when editing */}
              {editing && (
                <div className="mt-4 container mx-auto h-full overflow-y-auto">
                  <ReportCashier
                    date={date}
                    groupId={activeGroup?.id}
                    existingReport={true}
                    initialData={initialData} // Pass the initial data for the report
                    onSubmitSuccess={handleSuccess}
                  />
                </div>
              )}

              {/* Confirmation Dialog */}
              <ConfirmDialog
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                title="Confirm Deletion"
                message={`Are you sure you want to delete the End-of-Day report for ${date}? This action cannot be undone.`}
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={handleRemoveReport}
                isLoading={isLoading}
              />
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-semibold mb-4">
                No Report Found for {date}
              </h2>
              {/* Add Button */}
              <Button onClick={() => setAdding(true)} disabled={isLoading}>
                {isLoading ? <Loader2 /> : 'Add Report'}
              </Button>

              {/* Show ReportCashier only when adding */}
              {adding && (
                <div className="mt-4 container mx-auto h-full overflow-y-auto">
                  <ReportCashier
                    date={date}
                    groupId={activeGroup?.id}
                    existingReport={false}
                    onSubmitSuccess={handleSuccess}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminEodReportPage;
