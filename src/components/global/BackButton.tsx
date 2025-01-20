'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

const BackButton = ({ fallbackUrl = '/' }: { fallbackUrl?: string }) => {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <Button onClick={handleBack} className="mb-4">
      Go Back
    </Button>
  );
};

export default BackButton;
