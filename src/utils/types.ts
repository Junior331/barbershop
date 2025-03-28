export type styleGenericProps = {
  type?: string;
  size?: string;
  color?: string;
  filter?: string;
  height?: string;
  status?: string;
  margin?: string;
  active?: boolean;
  content?: string;
  maxWidth?: string;
  fontSize?: number;
  disabled?: boolean;
  textAlign?: string;
  selected?: boolean;
  secondary?: boolean;
  textShadow?: string;
  lineHeight?: string;
  fontWeight?: string;
  fontFamily?: string;
  background?: string;
  textTransform?: string;
  letterSpacing?: string;
};

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

export type Service = {
  id: number;
  name: string;
  time: number;
  icon: string;
  price: number;
  checked?: boolean;
};

export type BarberType = {
  id: number,
  cuts: number,
  type: string,
  name: string,
  image: string,
  rating: number,
  location: string,
  checked?: boolean;
};

export interface Order {
  id: string;
  total: number;
  discount: number;
  subTotal: number;
  paymentFee: number;
  date: string | null;
  barber: BarberType;
  services: Service[];
  status: "pending" | "confirmed" | "canceled";
  paymentMethod: "pix" | "credit_card" | "debit_card" | string;
  location: string;
}

export interface CurrentOrder extends Omit<Order, "id" | "status"> {
  id: string;
  status: "pending" | "confirmed" | "canceled";
}

export interface OrderActions {
  addOrder: (order: Order) => void;
  setBarber: (barber: BarberType) => void;
  setDiscount: (discount: number) => void;
  toggleService: (service: Service) => void;
  setDate: (dateTime: string | null) => void;
  setPaymentMethod: (method: string) => void;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
}

export interface OrderStore {
  orders: Order[];
  actions: OrderActions;
  currentOrder: CurrentOrder;
}
