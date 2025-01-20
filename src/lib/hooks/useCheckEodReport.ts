import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { checkEodReportExists } from '@/services/reportService';

interface UseCheckEodReportProps {
  groupId: string | null;
  date: string;
}

export const useCheckEodReport = ({
  groupId,
  date,
}: UseCheckEodReportProps) => {
  const [eodExists, setEodExists] = useState<boolean>(false);
  const [isEodLoading, setIsEodLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!groupId) return;

    const checkEod = async () => {
      try {
        setIsEodLoading(true);
        const exists = await checkEodReportExists({ groupId, date });
        setEodExists(exists);
      } catch (error) {
        console.error('Error checking EOD report existence:', error);
        toast.error('Failed to check End-of-Day report.');
      } finally {
        setIsEodLoading(false);
      }
    };

    checkEod();
  }, [groupId, date]);

  return { eodExists, isEodLoading };
};
