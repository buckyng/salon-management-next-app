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
import { sendPasswordResetEmail } from '@/lib/supabase/servers/auth';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isPending, setIsPending] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email.');
      return;
    }

    setIsPending(true);

    try {
      const { errorMessage } = await sendPasswordResetEmail(email);

      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.success('Password reset email sent. Please check your inbox.');
      }
    } catch (error) {
      console.error('Error sending password reset email:', error);
      toast.error('Failed to send password reset email.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen  dark:bg-gray-900">
      <Card className="w-full max-w-md">
        {/* Header */}
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Forgot Password</CardTitle>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Enter your email to reset your password.
          </p>
        </CardHeader>

        {/* Form */}
        <CardContent>
          <div className="space-y-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              required
            />
            <Button
              onClick={handleForgotPassword}
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
            Remembered your password?{' '}
            <Link
              href="/login"
              className="text-blue-500 hover:underline dark:text-blue-400"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
