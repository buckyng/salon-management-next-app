import {
  EndOfDayReportData,
  EnrichedSales,
  GroupedSale,
  SaleData,
} from '@/lib/types';

interface SaleDataQuery extends SaleData {
  profiles: { name: string };
}

export const fetchOrganizationSales = async ({
  groupId,
  date,
  paid,
}: {
  groupId: string;
  date: string;
  paid?: boolean;
}) => {
  const queryParams = new URLSearchParams({ groupId, date });
  if (paid !== undefined) queryParams.append('paid', paid.toString());

  const res = await fetch(
    `/api/sales/fetch-group-sale?${queryParams.toString()}`
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error('Failed to fetch sales data.');
  }

  // Enrich data with userName on the client side
  const enrichedSales: EnrichedSales[] = data.map((sale: SaleDataQuery) => ({
    ...sale,
    userName: sale.profiles?.name || 'Unknown User',
  }));

  return enrichedSales;
};

export const groupSales = (salesData: EnrichedSales[]) => {
  // Group sales by comboNum
  const groupedSales = salesData.reduce((acc, sale) => {
    // Find the group for the current sale
    const comboGroup = acc.find((group) => group.comboNum === sale.combo_num);

    if (comboGroup) {
      // Add the sale to the existing group
      comboGroup.sales.push(sale);
      comboGroup.totalAmount += sale.amount;
    } else {
      // Create a new group for the combo
      acc.push({
        comboNum: sale.combo_num || null,
        sales: [sale],
        totalAmount: sale.amount,
      });
    }

    return acc;
  }, [] as GroupedSale[]); // Explicitly set the accumulator type

  // Sort the groups: Place "No Combo" at the end
  groupedSales.sort((a, b) => {
    if (a.comboNum === null) return 1; // "No Combo" goes last
    if (b.comboNum === null) return -1; // Other combos come first
    return (a.comboNum || 0) - (b.comboNum || 0); // Sort by comboNum
  });

  return groupedSales;
};

export const updateSaleStatus = async ({
  saleId,
  updates,
}: {
  saleId: string;
  updates: Partial<{
    amount: number;
    combo_num: number | null;
    note: string | null;
    paid: boolean;
    updated_at: string;
  }>;
}) => {
  const res = await fetch('/api/sales/update-sale', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ saleId, updates }),
  });

  if (!res.ok) {
    throw new Error('Failed to update sale.');
  }

  return res.json();
};

export const saveEndOfDayReport = async (
  reportData: EndOfDayReportData
): Promise<void> => {
  try {
    const response = await fetch('/api/reports/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save the EOD report.');
    }
  } catch (error) {
    console.error('Error saving EOD report:', error);
    throw new Error('Failed to save the EOD report.');
  }
};

export const fetchSalesByUser = async ({
  activeGroupId,
  userId,
  date,
}: {
  activeGroupId: string;
  userId: string;
  date: string;
}) => {
  const response = await fetch(
    `/api/sales/fetch-today?groupId=${activeGroupId}&userId=${userId}&date=${date}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error('Failed to fetch sales data.');
  }

  return data;
};

export const addSale = async ({
  groupId,
  userId,
  amount,
  comboNum,
  note,
}: {
  groupId: string;
  userId: string;
  amount: number;
  comboNum: number | null;
  note: string | null;
}) => {
  const res = await fetch('/api/sales/add-sale', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupId, userId, amount, comboNum, note }),
  });

  if (!res.ok) {
    throw new Error('Failed to add sale.');
  }

  return res.json();
};

export const fetchEmployeeReport = async ({
  groupId,
  employeeId,
  startDate,
  endDate,
}: {
  groupId: string;
  employeeId: string;
  startDate: string;
  endDate: string;
}) => {
  const response = await fetch(
    `/api/reports/employee?groupId=${groupId}&employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}`
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error('Failed to fetch employee report.');
  }

  return data;
};
