import { z } from 'zod';

export const EditUserProfileSchema = z.object({
  email: z.string().email('Required'),
  name: z.string().min(1, 'Required'),
});

export const WorkflowFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  description: z.string().min(1, 'Required'),
});

export const inviteUserSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
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

export type UpdateClientInput = Pick<
  Client,
  'firstName' | 'lastName' | 'email' | 'agreeToTerms'
>;

export interface SaveClientParams {
  organizationId: string;
  clientData: SaveClientInput | UpdateClientInput;
  clientId?: string; //optional for update
}

export interface CheckIn {
  id: string; // Unique identifier for the check-in record
  clientId: string; // ID of the client associated with the check-in
  organizationId: string; // ID of the organization associated with the check-in
  createdAt: string; //date and time of checkin
  isInService: boolean; // Current status of the check-in
}

export interface CheckInExtra {
  id: string;
  createdAt: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  checkInHistory: { createdAt: string }[];
  numberOfVisits: number;
  lastCheckInRating: number;
  isInService: boolean;
}

// Define the structure of a CheckIn with Client details
export interface CheckInClientDetails {
  id: string;
  createdAt: Date | null;
  clientId: string;
  isInService: boolean;
  Client: {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string | null;
    numberOfVisits: number | null;
    lastVisitRating: number | null;
    CheckIn: {
      createdAt: Date | null;
    }[];
  };
}

// Return type of the formatted response
export interface FormattedCheckInResponse {
  id: string;
  createdAt: Date | null;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string | null;
  numberOfVisits: number;
  lastCheckInRating: number | null;
  isInService: boolean;
  checkInHistory: {
    createdAt: Date | null;
  }[];
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
