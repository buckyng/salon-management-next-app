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
  note?: string | null | undefined;
  createdAt: string;
  paid: boolean | undefined;
}

export interface RouteRolePermission {
  name: string;
  route: string;
}
export interface Client {
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  numberOfVisits?: number;
  lastVisitRating?: number; // 1 to 5
  agreeToTerms: boolean;
  checkIns: CheckIn[];
  feedbacks: Feedback[];
}

export type SaveClientInput = Pick<
  Client,
  'firstName' | 'lastName' | 'phone' | 'email' | 'agreeToTerms' | 'id'
>;

export interface CheckIn {
  id: string; // Unique identifier for the check-in record
  clientId: string; // ID of the client associated with the check-in
  organizationId: string; // ID of the organization associated with the check-in
  createdAt: string; //date and time of checkin
  createdDate: string; //date of checkin only
  isInService: boolean; // Current status of the check-in
}

export type SaveCheckInParams = Pick<CheckIn, 'organizationId' | 'clientId'>;

export interface Feedback {
  id: string;
  clientId: string;
  organizationId: string;
  createdAt: string; //date and time of checkin
  rating: number; // 1 to 5
  comment?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: Date;
}

export interface EndOfDayReport {
  organizationId: string;
  cash: number;
  debit: number;
  serviceDiscount: number;
  giftcardBuy: number;
  giftcardRedeem: number;
  otherIncome: number;
  incomeNote?: string;
  expense: number;
  expenseNote?: string;
  totalSale: number;
  result: number;
  createdAt: string; // ISO string for the submission time
}
