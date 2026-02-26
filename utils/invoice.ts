import { LineItem, BankDetail } from '../types';

const CURRENCY_LOCALE_MAP: Record<string, string> = {
  MYR: 'en-MY',
  USD: 'en-US',
  EUR: 'de-DE',
};

export function formatCurrency(amount: number, currency: string): string {
  try {
    const locale = CURRENCY_LOCALE_MAP[currency] || 'en-US';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function calculateSubtotal(items: LineItem[]): number {
  return (items || []).reduce((sum, item) => sum + (item.amount || 0), 0);
}

export function calculateTax(subtotal: number, taxRate: number): number {
  return subtotal * ((taxRate || 0) / 100);
}

export function calculateTotal(items: LineItem[], taxRate: number): number {
  const subtotal = calculateSubtotal(items);
  return subtotal + calculateTax(subtotal, taxRate);
}

export function createNewBank(): BankDetail {
  return {
    id: crypto.randomUUID(),
    paymentMethod: 'Bank Transfer',
    bankName: '',
    accountName: '',
    accountNo: '',
  };
}
