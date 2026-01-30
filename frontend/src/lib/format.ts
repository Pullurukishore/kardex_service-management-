import { format, isValid } from 'date-fns';

export const formatCrLakh = (value: number | null | undefined): string => {
  const num = Number(value || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num);
};

export const formatINRFull = (value: number | null | undefined, fractionDigits: number = 0): string => {
  const num = Number(value || 0);
  return new Intl.NumberFormat('en-IN', { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits }).format(num).replace(/^/, '₹');
};

export const formatDateSafe = (date: any, formatStr: string = 'MMM dd, yyyy'): string => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (!isValid(d)) return 'N/A';
  return format(d, formatStr);
};
