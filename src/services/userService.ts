export const fetchEmployeeNames = async (
  employeeIds: string[]
): Promise<Record<string, string>> => {
  if (!employeeIds.length) return {};

  try {
    const response = await fetch('/api/employees/names', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeIds }),
    });

    if (!response.ok) {
      console.error('Failed to fetch employee names');
      return {};
    }

    const data = await response.json();
    return data || {};
  } catch (error) {
    console.error('Error fetching employee names:', error);
    return {};
  }
};
