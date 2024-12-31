import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const GoBackButton = () => {
  const router = useRouter();

  return (
    <Button
      variant="secondary"
      onClick={() => router.back()} // Navigate to the previous page
      className="mt-4"
    >
      Go Back
    </Button>
  );
};

export default GoBackButton;
