'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const RootPage = () => {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/sign-in');
  };

  const handleDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center">
        <h1 className="text-xl font-bold">Salon Management App</h1>
        <nav>
          {isSignedIn ? (
            <Button variant="ghost" onClick={handleDashboard}>
              Go to Dashboard
            </Button>
          ) : (
            <Button variant="outline" onClick={handleSignIn}>
              Sign In
            </Button>
          )}
        </nav>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-semibold">
            Welcome to the Salon Management App
          </h2>
          <p className="mt-2 text-gray-600">
            Manage your salon effortlessly with our user-friendly platform.
          </p>
          {!isSignedIn && (
            <Button className="mt-4" onClick={handleSignIn}>
              Get Started
            </Button>
          )}
        </div>
      </main>
    </div>
  );
};

export default RootPage;
