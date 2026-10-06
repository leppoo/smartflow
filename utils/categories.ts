import { FinancialLiability } from '../types';

export const EXPENSE_CATEGORIES = [
  'Rent',
  'Utilities',
  'Salaries',
  'Software',
  'Marketing',
  'Travel',
  'Supplies',
  'Insurance',
] as const;

export const ASSET_CATEGORIES = [
  'Property',
  'Equipment',
  'Vehicle',
  'Investment',
] as const;

export const LIABILITY_TYPES: FinancialLiability['type'][] = ['Loan', 'Credit Card', 'Payable'];

export const OTHER_CATEGORY = 'Other';
