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
