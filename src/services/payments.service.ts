import api from './api';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'credit_card' | 'debit_card' | 'pix' | 'cash';
  enabled: boolean;
}

export interface Payment {
  id: string;
  appointmentId: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDto {
  appointmentId: string;
  amount: number;
  paymentMethodId: string;
}

class PaymentsService {
  private baseUrl = '/payments';

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    try {
      const response = await api.get(`${this.baseUrl}/methods`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  }

  async processPayment(paymentData: CreatePaymentDto): Promise<Payment> {
    try {
      const response = await api.post(this.baseUrl, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  }

  async getPaymentById(id: string): Promise<Payment> {
    try {
      const response = await api.get(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  }

  async getPaymentsByAppointment(appointmentId: string): Promise<Payment[]> {
    try {
      const response = await api.get(`${this.baseUrl}/appointment/${appointmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payments by appointment:', error);
      throw error;
    }
  }
}

export const paymentsService = new PaymentsService();