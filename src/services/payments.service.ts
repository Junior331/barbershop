import { api, ApiUtils } from './api';
import { AxiosError } from 'axios';
import { logger } from '@/utils/logger';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'CREDIT' | 'DEBIT' | 'PIX' | 'WALLET';
  enabled: boolean;
  description?: string;
  icon?: string;
}

export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  method: 'CREDIT' | 'DEBIT' | 'PIX' | 'WALLET';
  transactionId?: string;
  pixQrCode?: string;
  pixCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentData {
  appointmentId: string;
  method: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'WALLET';
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface MercadoPagoPaymentResponse {
  id: string;
  gatewayPaymentId: string;
  status: string;
  amount: number;
  currency: string;
  method: string;
  gateway: string;
  paymentUrl?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  qrCodeData?: string;
  fees: {
    amount: number;
    percentage: number;
  };
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface PaymentStatusResponse {
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  transactionId?: string;
  message?: string;
}

export interface CreatePixPaymentData {
  appointmentId: string;
  amount: number;
  description?: string;
}

export interface CreateCardPaymentData {
  appointmentId: string;
  amount: number;
  cardToken?: string;
  cardNumber?: string;
  securityCode?: string;
  expirationMonth?: number;
  expirationYear?: number;
  cardholderName?: string;
  installments?: number;
  saveCard?: boolean;
  description?: string;
}

export const paymentsService = {
  // ===== CHECKOUT TRANSPARENTE (Novo - Recomendado) =====

  /**
   * Criar pagamento automaticamente baseado no método escolhido
   * - PIX → createPixPayment (mostra QR Code no site)
   * - CREDIT_CARD/DEBIT_CARD → createCardPayment (processa no site)
   */
  async createPaymentAutomatic(data: CreatePaymentData & Partial<CreateCardPaymentData>): Promise<MercadoPagoPaymentResponse> {
    try {
      logger.info('Criando pagamento automático:', {
        appointmentId: data.appointmentId,
        method: data.method,
        amount: data.amount,
      });

      // PIX → usa createPixPayment
      if (data.method === 'PIX') {
        return await this.createPixPayment({
          appointmentId: data.appointmentId,
          amount: data.amount,
          description: data.description,
        });
      }

      // Cartão → usa createCardPayment
      if (data.method === 'CREDIT_CARD' || data.method === 'DEBIT_CARD') {
        return await this.createCardPayment({
          appointmentId: data.appointmentId,
          amount: data.amount,
          cardToken: data.cardToken,
          cardNumber: data.cardNumber,
          securityCode: data.securityCode,
          expirationMonth: data.expirationMonth,
          expirationYear: data.expirationYear,
          cardholderName: data.cardholderName,
          installments: data.installments || 1,
          saveCard: data.saveCard || false,
          description: data.description,
        });
      }

      throw new Error(`Método de pagamento não suportado: ${data.method}`);
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'paymentsService.createPaymentAutomatic');
      throw error;
    }
  },

  /**
   * Criar pagamento PIX com QR Code (Checkout Transparente)
   * Retorna QR Code para exibir na tela, sem redirecionamento
   */
  async createPixPayment(data: CreatePixPaymentData): Promise<MercadoPagoPaymentResponse> {
    try {
      logger.info('Criando pagamento PIX (Checkout Transparente):', {
        appointmentId: data.appointmentId,
        amount: data.amount,
      });

      const response = await api.post('/payments/pix/create', data);

      logger.info('Pagamento PIX criado com sucesso:', {
        paymentId: response.data.id,
        qrCodeAvailable: !!response.data.qrCode,
        status: response.data.status,
      });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'paymentsService.createPixPayment');
      throw error;
    }
  },

  /**
   * Criar pagamento com cartão (Checkout Transparente)
   * Processa cartão diretamente sem redirecionamento
   */
  async createCardPayment(data: CreateCardPaymentData): Promise<MercadoPagoPaymentResponse> {
    try {
      logger.info('Criando pagamento com cartão (Checkout Transparente):', {
        appointmentId: data.appointmentId,
        amount: data.amount,
        installments: data.installments || 1,
        saveCard: data.saveCard || false,
      });

      const response = await api.post('/payments/card/create', data);

      logger.info('Pagamento com cartão criado:', {
        paymentId: response.data.id,
        status: response.data.status,
      });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'paymentsService.createCardPayment');
      throw error;
    }
  },

  // ===== CHECKOUT PRO (Legacy - com redirecionamento) =====

  /**
   * @deprecated Use createPixPayment() ou createCardPayment() ao invés
   * Criar preferência de pagamento MercadoPago (Checkout Pro)
   * Redireciona para página do MercadoPago (mostra "Saldo em conta")
   */
  async createPreference(data: CreatePaymentData): Promise<MercadoPagoPaymentResponse> {
    try {
      logger.info('Criando preferência de pagamento MercadoPago:', {
        appointmentId: data.appointmentId,
        method: data.method,
        amount: data.amount,
      });

      const response = await api.post('/payments/create-preference', {
        ...data,
        currency: data.currency || 'BRL',
      });

      logger.info('Preferência criada com sucesso:', {
        paymentId: response.data.id,
        paymentUrl: response.data.paymentUrl,
        preferenceId: response.data.gatewayPaymentId,
      });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'paymentsService.createPreference');
      throw error;
    }
  },

  // Criar pagamento real com Mercado Pago (legacy - direct payment API)
  async createRealPayment(data: CreatePaymentData): Promise<MercadoPagoPaymentResponse> {
    try {
      logger.info('Criando pagamento real com Mercado Pago:', {
        appointmentId: data.appointmentId,
        method: data.method,
        amount: data.amount,
      });

      const response = await api.post('/payments/create', {
        ...data,
        currency: data.currency || 'BRL',
      });

      logger.info('Pagamento Mercado Pago criado:', {
        paymentId: response.data.id,
        status: response.data.status,
        method: response.data.method,
        gateway: response.data.gateway,
      });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'paymentsService.createRealPayment');
      throw error;
    }
  },

  // Confirmar pagamento (para cartões)
  async confirmPayment(paymentId: string, confirmationData?: any): Promise<any> {
    try {
      logger.info('Confirmando pagamento:', { paymentId });

      const response = await api.patch(`/payments/${paymentId}/confirm`, confirmationData || {});

      logger.info('Pagamento confirmado:', {
        paymentId: response.data.id,
        status: response.data.status,
      });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'paymentsService.confirmPayment');
      throw error;
    }
  },

  // Cancelar pagamento
  async cancelPayment(paymentId: string, reason?: string): Promise<any> {
    try {
      logger.info('Cancelando pagamento:', { paymentId, reason });

      const response = await api.delete(`/payments/${paymentId}/cancel`, {
        data: { reason }
      });

      logger.info('Pagamento cancelado:', {
        paymentId: response.data.id,
        status: response.data.status,
      });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'paymentsService.cancelPayment');
      throw error;
    }
  },

  // Processar pagamento (legacy - mock)
  async create(data: CreatePaymentData): Promise<Payment> {
    try {
      logger.info('Processando pagamento mock:', {
        appointmentId: data.appointmentId,
        method: data.method,
        amount: data.amount,
      });

      const response = await api.post('/payments/mock', data);

      logger.info('Pagamento mock processado:', {
        paymentId: response.data.id,
        status: response.data.status,
        method: response.data.method,
      });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'paymentsService.create');
      throw error;
    }
  },

  // Obter pagamento por ID
  async getById(id: string): Promise<Payment> {
    try {
      logger.info('Buscando pagamento por ID:', { id });

      const response = await api.get(`/payments/${id}`);

      logger.info('Pagamento encontrado:', {
        paymentId: response.data.id,
        status: response.data.status,
        amount: response.data.amount,
      });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'paymentsService.getById');
      throw error;
    }
  },

  // Obter pagamentos de um agendamento
  async getByAppointment(appointmentId: string): Promise<Payment[]> {
    try {
      logger.info('Buscando pagamentos do agendamento:', { appointmentId });

      const response = await api.get(`/payments/appointment/${appointmentId}`);

      logger.info(`Encontrados ${response.data.length} pagamentos para o agendamento ${appointmentId}`);

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'paymentsService.getByAppointment');
      throw error;
    }
  },

  // Obter pagamento mais recente de um agendamento
  async getByAppointmentId(appointmentId: string): Promise<any> {
    try {
      logger.info('Buscando pagamento por appointmentId:', { appointmentId });

      const response = await api.get(`/payments/appointment/${appointmentId}`);

      logger.info('Pagamento encontrado:', {
        paymentId: response.data.id,
        status: response.data.status,
        amount: response.data.amount,
      });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'paymentsService.getByAppointmentId');
      throw error;
    }
  },

  // Verificar status do pagamento
  async checkStatus(paymentId: string): Promise<PaymentStatusResponse> {
    try {
      logger.info('Verificando status do pagamento:', { paymentId });

      const response = await api.get(`/payments/${paymentId}/status`);

      logger.info('Status do pagamento:', {
        paymentId,
        status: response.data.status,
        transactionId: response.data.transactionId,
      });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'paymentsService.checkStatus');
      throw error;
    }
  },

  // Cancelar/Estornar pagamento
  async refund(paymentId: string, reason?: string): Promise<Payment> {
    try {
      logger.info('Solicitando estorno:', { paymentId, reason });

      const response = await api.post(`/payments/${paymentId}/refund`, { reason });

      logger.info('Estorno processado:', {
        paymentId: response.data.id,
        status: response.data.status,
      });

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'paymentsService.refund');
      throw error;
    }
  },

  // Obter métodos de pagamento disponíveis
  async getAvailableMethods(): Promise<PaymentMethod[]> {
    try {
      logger.info('Buscando métodos de pagamento disponíveis');

      const response = await api.get('/payments/methods');

      logger.info(`Encontrados ${response.data.length} métodos de pagamento disponíveis`);

      return response.data;
    } catch (error) {
      ApiUtils.logError(error as AxiosError, 'paymentsService.getAvailableMethods');
      throw error;
    }
  },

  // Função utilitária para formatar status de pagamento
  getStatusDisplay(status: string): { label: string; color: string; bgColor: string } {
    const statusMap = {
      PENDING: { label: 'Pendente', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
      COMPLETED: { label: 'Concluído', color: 'text-green-700', bgColor: 'bg-green-100' },
      FAILED: { label: 'Falhou', color: 'text-red-700', bgColor: 'bg-red-100' },
      REFUNDED: { label: 'Estornado', color: 'text-gray-700', bgColor: 'bg-gray-100' },
    };

    return statusMap[status as keyof typeof statusMap] || statusMap.PENDING;
  },

  // Função utilitária para formatar método de pagamento
  getMethodDisplay(method: string): { label: string; icon: string } {
    const methodMap = {
      CREDIT: { label: 'Cartão de Crédito', icon: '💳' },
      DEBIT: { label: 'Cartão de Débito', icon: '💳' },
      PIX: { label: 'PIX', icon: '📱' },
      WALLET: { label: 'Carteira Digital', icon: '👛' },
    };

    return methodMap[method as keyof typeof methodMap] || { label: 'Desconhecido', icon: '❓' };
  },

  // Verificar se pagamento pode ser estornado
  canRefund(payment: Payment): boolean {
    return payment.status === 'COMPLETED';
  },

  // Calcular taxa de cancelamento (se aplicável)
  calculateCancellationFee(amount: number, method: string): number {
    // Lógica de cálculo de taxa baseada no método
    switch (method) {
      case 'CREDIT':
        return amount * 0.03; // 3% para cartão de crédito
      case 'DEBIT':
        return amount * 0.02; // 2% para cartão de débito
      case 'PIX':
        return 0; // PIX sem taxa
      case 'WALLET':
        return amount * 0.01; // 1% para carteira digital
      default:
        return 0;
    }
  },
};