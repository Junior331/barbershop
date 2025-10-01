import { api } from './api';

export interface WalletTransaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REFUND' | 'EARNING';
  amount: number;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  fee?: number;
  netAmount?: number;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  recentTransactions: WalletTransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTransactions {
  data: WalletTransaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export const walletService = {
  // Dados da carteira
  async getWallet(): Promise<Wallet> {
    const response = await api.get('/wallets/my-wallet');
    return response.data;
  },

  // Histórico de transações
  async getTransactions(page = 1, limit = 20, type?: string): Promise<PaginatedTransactions> {
    const response = await api.get('/wallets/my-wallet/transactions', {
      params: { page, limit, type }
    });
    return response.data;
  },

  // Depositar dinheiro
  async deposit(amount: number, paymentMethod: string): Promise<{
    message: string;
    transaction: WalletTransaction;
    newBalance: number;
  }> {
    const response = await api.post('/wallets/deposit', {
      amount,
      paymentMethod
    });
    return response.data;
  },

  // Sacar dinheiro (barbeiros)
  async withdraw(amount: number, instantWithdraw = false): Promise<{
    message: string;
    transaction: WalletTransaction;
    newBalance: number;
    fee: number;
    instantWithdraw: boolean;
  }> {
    const response = await api.post('/wallets/withdraw', {
      amount,
      instantWithdraw
    });
    return response.data;
  },
};