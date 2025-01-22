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
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        {/* Header */}
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">
            Welcome to{' '}
            <span className="text-blue-500">Salon Management App</span>
          </CardTitle>
        </CardHeader>

        {/* Login Form */}
        <CardContent>
          <form className="space-y-4" action={handleClickLoginButton}>
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
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="animate-spin mr-2" /> : 'Log in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default LoginPage;
