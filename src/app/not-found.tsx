'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

const Custom404 = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-black text-center">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
        Sorry, we couldn&apos;t find the page you were looking for.
      </p>
      <Link href="/">
        <Button className="px-6 py-2">Go Back to Home</Button>
      </Link>
    </div>
  );
};

export default Custom404;
