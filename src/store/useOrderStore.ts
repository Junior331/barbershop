import { create } from "zustand";

import { OrderStore } from "@/utils/types";

const calculatePaymentFee = (method: string, amount: number): number => {
  if (method === "pix") return amount * 0.01;
  if (method === "credit_card") return amount * 0.084;
  return 0;
};

export const useOrderStore = create<OrderStore>((set) => ({
  currentOrder: {
    id: "",
    total: 0,
    date: null,
    barber: '',
    subTotal: 0,
    discount: 0,
    services: [],
    paymentFee: 0,
    status: "pending",
    paymentMethod: "",
  },
  orders: [],
  actions: {
    addOrder: (order) =>
      set((state) => ({
        orders: [...state.orders, order],
        currentOrder: {
          id: "",
          total: 0,
          barber: '',
          date: null,
          discount: 0,
          subTotal: 0,
          services: [],
          paymentFee: 0,
          paymentMethod: "",
          status: "pending",
        },
      })),

    updateOrderStatus: (orderId, status) =>
      set((state) => ({
        orders: state.orders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        ),
      })),

    setDate: (date) =>
      set((state) => ({
        currentOrder: { ...state.currentOrder, date },
      })),
    toggleService: (service) =>
      set((state) => {
        const exists = state.currentOrder.services.some(
          (s) => s.id === service.id
        );
        const newServices = exists
          ? state.currentOrder.services.filter((s) => s.id !== service.id)
          : [...state.currentOrder.services, service];

        const subTotal = newServices.reduce((sum, s) => sum + s.price, 0);
        const paymentFee = calculatePaymentFee(
          state.currentOrder.paymentMethod,
          subTotal
        );
        const total = subTotal - state.currentOrder.discount + paymentFee;

        return {
          currentOrder: {
            ...state.currentOrder,
            services: newServices,
            subTotal,
            paymentFee,
            total,
          },
        };
      }),
    setDiscount: (discount) =>
      set((state) => {
        const total =
          state.currentOrder.subTotal -
          discount +
          state.currentOrder.paymentFee;
        return {
          currentOrder: {
            ...state.currentOrder,
            discount,
            total,
          },
        };
      }),
    setPaymentMethod: (method) =>
      set((state) => {
        const paymentFee = calculatePaymentFee(
          method,
          state.currentOrder.subTotal
        );
        const total =
          state.currentOrder.subTotal -
          state.currentOrder.discount +
          paymentFee;

        return {
          currentOrder: {
            ...state.currentOrder,
            paymentMethod: method,
            paymentFee,
            total,
          },
        };
      }),
  },
}));

export const useOrder = () => useOrderStore((state) => state.currentOrder);
export const useOrderActions = () => useOrderStore((state) => state.actions);
