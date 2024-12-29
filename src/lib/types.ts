import { z } from 'zod';

export const EditUserProfileSchema = z.object({
  email: z.string().email('Required'),
  name: z.string().min(1, 'Required'),
});

export const WorkflowFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
});

export interface UserType {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
  photoURL?: string;
}

export interface SaleData {
  id: string;
  orgId: string;
  employeeId: string;
  employeeName?: string;
  amount: number;
  comboNum?: number;
  note?: string | null;
  createdAt: string;
  paid?: boolean;
}

export interface RouteRolePermission {
  name: string;
  route: string;
}