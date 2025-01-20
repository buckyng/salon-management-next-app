import { Tables } from './database.types';

export interface Membership {
  id: string;
  user_id: string;
  role: string;
  created_at: string | null;
  profiles: {
    name: string | null;
    email: string | null;
  };
}

export interface Role {
  name: string;
}

export type SaleData = Tables<'sales'>;

export interface EmployeeReport {
  date: string; // The date of the report in 'yyyy-MM-dd' format
  totalSales: number; // The total sales amount for the specified date
  sales?: SaleData[]; // Optional: An array of detailed sales for the date
}

export interface EmployeeSummary {
  employeeId: string;
  employeeName: string;
  totalSale: number;
  sales: SaleData[]; // Array of sales
}

export interface EmployeeSales {
  total: number;
  sales: SaleData[]; // Assuming SaleData is already defined
}

export type EndOfDayReport = Tables<'eod_reports'>;

export type EndOfDayReportData = Partial<EndOfDayReport>;

export interface EnrichedSales extends SaleData {
  userName: string; // Enriched property
}

export interface GroupedSale {
  comboNum?: number | null;
  sales: EnrichedSales[];
  totalAmount: number;
}
