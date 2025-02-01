import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const GoBackButton = () => {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.back()} // Navigate to the previous page
      className="mb-4"
    >
      Go Back
    </Button>
  );
};

export default GoBackButton;
