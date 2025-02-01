'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'react-toastify';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { login } from '@/lib/supabase/servers/auth';

function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClickLoginButton = (formData: FormData) => {
    startTransition(async () => {
      const { errorMessage } = await login(formData);

      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        router.push('/group-picker');
        toast.success('Log in successfully');
      }
    });
  };

  return (
    <div className="flex items-center justify-center h-screen dark:bg-gray-900">
      <Card className="w-full max-w-md p-6 shadow-lg rounded-lg bg-white dark:bg-gray-800">
        {/* Header */}
        <CardHeader className="text-center mb-4">
          <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">
            Welcome to{' '}
            <span className="text-blue-500 dark:text-blue-400">
              Salon Management App
            </span>
          </CardTitle>
        </CardHeader>

        {/* Login Form */}
        <CardContent>
          <form className="space-y-6" action={handleClickLoginButton}>
            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                disabled={isPending}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                disabled={isPending}
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              />
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-500 hover:underline dark:text-blue-400"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className={`w-full py-3 font-semibold rounded-lg ${
                isPending ? 'bg-gray-400 cursor-not-allowed' : 'focus:ring-2'
              }`}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="animate-spin mr-2" /> : 'Log in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
