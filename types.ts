
export interface LineItem {
  id: string;
  description: string;
  period: string;
  amount: number;
}

export interface BankDetail {
  id: string;
  paymentMethod: string;
  bankName: string;
  accountName: string;
  accountNo: string;
}

export interface UserProfile {
  name: string;
  email: string;
  address: string;
  banks: BankDetail[];
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  senderName: string;
  senderEmail: string;
  senderAddress: string;
  clientName: string;
  clientAddress: string;
  items: LineItem[];
  taxRate: number;
  currency: string;
  notes: string;
  status: 'draft' | 'sent' | 'paid';
  createdAt: number;
  banks: BankDetail[];
  signature?: string;
  signatureSize?: number;
  signatureVerticalPosition?: number;
  signatureHorizontalPosition?: number;
}

export type View = 'dashboard' | 'list' | 'create' | 'edit' | 'view' | 'profile' | 'banks';
