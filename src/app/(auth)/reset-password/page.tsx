'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'react-toastify';
import { updatePassword } from '@/lib/supabase/servers/auth';
import { Loader2 } from 'lucide-react';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsPending(true);

    try {
      const { errorMessage } = await updatePassword(newPassword);

      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.success('Password updated successfully!');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('Failed to update password.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        {/* Header */}
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Reset Password</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Set a new password for your account.
          </p>
        </CardHeader>

        {/* Form */}
        <CardContent>
          <div className="space-y-4">
            <label
              htmlFor="new_password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              New Password
            </label>
            <Input
              id="new_password"
              type="password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isPending}
              required
            />

            <label
              htmlFor="confirm_password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Confirm Password
            </label>
            <Input
              id="confirm_password"
              type="password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isPending}
              required
            />

            <Button
              onClick={handleResetPassword}
              className="w-full"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                'Reset Password'
              )}
            </Button>
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Go back to{' '}
            <a
              href="/login"
              className="text-blue-500 hover:underline dark:text-blue-400"
            >
              Login
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
