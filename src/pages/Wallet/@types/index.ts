export interface PaymentMethod {
  id: string;
  created_at: string;
  card_brand?: string;
  is_default: boolean;
  card_last_four?: string;
  method_type: 'debit_card'| 'credit_card' | 'apple_pay' | 'google_pay' | 'pix' | 'other';
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  barber_name: string;
  service_name: string;
  payment_method: string;
  status: "completed" | "pending" | "failed";
}

export interface WalletData {
  id: string;
  balance: number;
  transactions: Transaction[];
  payment_methods: PaymentMethod[];
}
