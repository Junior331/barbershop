export type formatterProps = {
  type?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  style?: keyof Intl.NumberFormatOptionsStyleRegistry;
};

export type lang = {
  id: number;
  flag: string;
  code: string;
  label: string;
};

export type randomMessage = {
  id: number;
  title: string;
  message: string;
};

// export type Service = {
//   id: number;
//   name: string;
//   time: number;
//   icon: string;
//   price: number;
//   public: boolean;
//   discount: number;
//   checked?: boolean;
//   created_at: string;
//   description?: string;
// };

// export type BarberSchedule = {
//   endTime: string; // "18:00"
//   weekday: number; // 0 (domingo) a 6 (sábado)
//   startTime: string; // "08:00"
// };

// export type BarberType = {
//   id: string;
//   type: string;
//   cuts: number;
//   name: string;
//   image: string;
//   rating: number;
//   location: string;
//   checked?: boolean;
//   schedule?: BarberSchedule[];
// };

// export interface Order {
//   id: string;
//   total: number;
//   discount: number;
//   subTotal: number;
//   location: string;
//   duration: number;
//   barber_id: string;
//   client_id: string;
//   date_time: string;
//   service_id: string;
//   paymentFee: number;
//   created_at: string;
//   barber: BarberType;
//   date: string | null;
//   services: Service[];
//   payment_fee: number;
//   total_price: number;
//   payment_method: string;
//   status: 'pending' | 'confirmed' | 'canceled' | 'completed';
//   paymentMethod: "pix" | "credit_card" | "debit_card" | string;
// }

// export interface CurrentOrder extends Omit<Order, "id" | "status"> {
//   id: string;
//   status: "pending" | "confirmed" | "canceled";
// }

// export interface OrderActions {
//   addOrder: (order: Order) => void;
//   setBarber: (barber: BarberType) => void;
//   setDiscount: (discount: number) => void;
//   toggleService: (service: Service) => void;
//   setDate: (dateTime: string | null) => void;
//   setPaymentMethod: (method: string) => void;
//   updateOrderStatus: (orderId: string, status: Order["status"]) => void;
// }

// export interface OrderStore {
//   orders: Order[];
//   actions: OrderActions;
//   currentOrder: CurrentOrder;
// }

export type UseAvatarOptions = {
  size?: number;
  rounded?: boolean;
  textColor?: string | "auto";
  backgroundColors?: string[];
};

export interface IService {
  id: string;
  nome: string;
  preco: number;
  desconto: number;
  imagem_url: string;
  duracao_minutos: number;
  descricao: string;
  is_active: boolean;
  created_at: string;
}

export interface IOrderState {
  date: Date | null;
  time: string | null;
  services: IService[];
  clearOrder: () => void;
  clearServices: () => void;
  toggleService: (service: IService) => void;
  barber: { id: string; name: string } | null;
  setDateTime: (date: Date, time: string) => void;
  setBarber: (barber: { id: string; name: string }) => void;
}