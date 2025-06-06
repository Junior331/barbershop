import { create } from "zustand";
import { IOrderState } from "@/utils/types";
 
export const useOrder = create<IOrderState>((set) => ({
  date: null,
  time: null,
  services: [],
  barber: null,
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
  setDateTime: (date, time) => set({ date, time }),
  clearOrder: () => set({ services: [], barber: null, date: null, time: null }),
}));
