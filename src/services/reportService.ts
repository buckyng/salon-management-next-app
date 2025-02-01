import {
  EmployeeSummary,
  EnrichedSales,
  EodReport,
  SaleData,
} from '@/lib/types';
import { fetchUserNames } from './userService';
import { fetchWithParams } from '@/lib/utils/serverUtils';
import { API_ROUTES } from '@/lib/constants/routes';

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

export const fetchOwnerReport = async (
  groupId: string,
  startDate: string,
  endDate: string
): Promise<EodReport[]> => {
  const queryParams = fetchWithParams({
    groupId,
    startDate,
    endDate,
  });

  const res = await fetch(`/api/reports/owner?${queryParams}`);
  const rawData = await res.json();

  if (!res.ok) {
    throw new Error('Failed to fetch owner report');
  }

  return rawData;
};

export const fetchReportDetails = async (
  groupId: string,
  date: string
): Promise<EmployeeSummary[]> => {
  const queryParams = new URLSearchParams({ groupId, date });

  const res = await fetch(
    `/api/reports/owner/details?${queryParams.toString()}`
  );
  const data = await res.json();

  if (!res.ok) {
    throw new Error('Failed to fetch report details.');
  }

  // Enrich sales data with user names
  const employeeIds = Array.from(
    new Set(data.map((sale: EnrichedSales) => sale.user_id))
  );
  const userNames = await fetchUserNames(employeeIds as string[]);

  const employeeMap: Record<string, EmployeeSummary> = {};

  data.forEach((sale: EnrichedSales) => {
    const employeeName = userNames[sale.user_id] || 'Unknown User';

    if (!employeeMap[sale.user_id]) {
      employeeMap[sale.user_id] = {
        employeeId: sale.user_id,
        employeeName,
        totalSale: 0,
        sales: [],
      };
    }

    employeeMap[sale.user_id].totalSale += sale.amount!;
    employeeMap[sale.user_id].sales.push(sale);
  });

  return Object.values(employeeMap).sort((a, b) => b.totalSale - a.totalSale);
};

export const fetchSalesForEmployee = async ({
  groupId,
  date,
  employeeId,
}: {
  groupId: string;
  date: string;
  employeeId: string;
}): Promise<SaleData[]> => {
  const queryParams = fetchWithParams({ groupId, date, employeeId });

  const res = await fetch(`/api/reports/sales-for-employee?${queryParams}`);

  if (!res.ok) {
    throw new Error('Failed to fetch sales for the employee.');
  }

  return res.json();
};

export async function updateEndOfDayReport(data: {
  group_id: string;
  date: string;
  [key: string]: string | number | null;
}): Promise<void> {
  const res = await fetch(API_ROUTES.UPDATE_EOD_REPORT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || 'Failed to update the EOD report');
  }
}

export async function removeEndOfDayReport(
  groupId: string,
  date: string
): Promise<void> {
  const res = await fetch(API_ROUTES.DELETE_EOD_REPORT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ group_id: groupId, date }),
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || 'Failed to delete the EOD report');
  }
}

export async function fetchEodReport(groupId: string, date: string) {
  try {
    const response = await fetch(`/api/reports/eod/${groupId}/${date}`);
    if (!response.ok) {
      throw new Error('Failed to fetch EOD report data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching EOD report:', error);
    throw error;
  }
}
