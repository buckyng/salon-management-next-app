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

export interface ExportedEmployeeSummary {
  employeeId: string;
  employeeName: string;
  totalSale: number;
  date: string;
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
  totalAmount: number | null;
}

export interface OwnerReport {
  date: string; // The date for the report in 'YYYY-MM-DD' format
  totalSales: number; // Total sales for the organization on that date
}

export type EodReport = Tables<'eod_reports'>;

export type CheckIn = Tables<'check_ins'>;

export type EnrichedCheckIn = CheckIn & {
  clientName: string;
  clientPhone: string;
  visitsBeforeToday: number;
  lastVisitRating: number | null;
  clients: {
    first_name: string;
    last_name: string;
    phone: string;
    client_group_details: {
      number_of_visits: number;
      last_visit_rating: number | null;
    }[];
  };
};

export type EnrichedTurn = Tables<'employee_turns'>;


