export interface Transaction {
  id: number;
  amount: string;
  transaction_type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  type_display: string;
}