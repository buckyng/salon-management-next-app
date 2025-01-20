export const checkEodReportExists = async ({
  groupId,
  date,
}: {
  groupId: string;
  date: string;
}): Promise<boolean> => {
  const queryParams = new URLSearchParams({ groupId, date });

  const res = await fetch(`/api/reports/eod/check?${queryParams.toString()}`);

  if (!res.ok) {
    console.error('Failed to check EOD report existence.');
    return false;
  }

  const data = await res.json();
  return data.exists; // API should return { exists: true/false }
};
