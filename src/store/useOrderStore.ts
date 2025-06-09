import { create } from "zustand";
import { IOrderState } from "@/utils/types";

export const useOrder = create<IOrderState>((set, get) => ({
  id: '',
  total: 0,
  date: null,
  notes: null,
  subtotal: 0,
  discount: 0,
  barber: null,
  services: [],
  paymentFee: 0,
  startTime: null,
  promotionCode: null,
  paymentMethod: null,

  toggleService: (service) =>
    set((state) => {
      const existingIndex = state.services.findIndex(
        (s) => s.id === service.id
      );
      if (existingIndex >= 0) {
        return {
          services: [
            ...state.services.slice(0, existingIndex),
            ...state.services.slice(existingIndex + 1),
          ],
        };
      }
      return { services: [...state.services, service] };
    }),

  clearServices: () => set({ services: [] }),

  setBarber: (barber) => set({ barber }),

  setDateTime: (date, startTime) => set({ date, startTime }),

  setPromotionCode: (code) => set({ promotionCode: code }),

  setPaymentMethod: (method) => set({ paymentMethod: method }),

  setNotes: (notes) => set({ notes }),

  calculateTotals: () => {
    const { services, promotionCode, paymentMethod } = get();
    const subtotal = services.reduce((sum, service) => sum + service.price, 0);
    let discount = 0;
  
    // Cálculo do desconto (mantendo sua lógica atual)
    if (promotionCode) {
      discount = subtotal * 0.1; // 10% de desconto como exemplo
    }
  
    // Encontrar o método de pagamento selecionado e sua taxa
    const paymentMethods = [
      { id: "pix", fee: 0.01 },
      { id: "debit_card", fee: 0.03 },
      { id: "credit_card", fee: 0.084 },
      { id: "wallet", fee: 0 },
    ];
    
    const selectedMethod = paymentMethods.find(m => m.id === paymentMethod);
    const feeRate = selectedMethod ? selectedMethod.fee : 0;
    const feeAmount = (subtotal - discount) * feeRate;
  
    const total = subtotal - discount + feeAmount;
  
    set({ subtotal, discount, total, paymentFee: feeAmount });
  },

  clearOrder: () =>
    set({
      services: [],
      barber: null,
      date: null,
      startTime: null,
      promotionCode: null,
      paymentMethod: null,
      notes: null,
      subtotal: 0,
      discount: 0,
      total: 0,
    }),
}));
