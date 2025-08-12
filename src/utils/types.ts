import { User } from "@supabase/supabase-js";

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

export type UseAvatarOptions = {
  size?: number;
  rounded?: boolean;
  textColor?: string | "auto";
  backgroundColors?: string[];
};

export interface IService {
  id: string;
  name: string;
  price: number;
  discount: number;
  image_url: string;
  is_active: boolean;
  created_at: string;
  description?: string;
  duration_minutes: number;
}

export interface BarberService {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  image_url: string | null;
  description: string | null;
}
export interface BarberDetails {
  id: string;
  is_active: boolean;
  barber_rating: number;
  // cuts_completed?: number;
  description: string | null;
}

export interface IBarber {
  id: string;
  name: string;
  services: string[];
  email: string | null;
  phone: string | null;
  total_price?: number;
  role: "barber" | "admin";
  avatar_url: string | null;
  barber_details: BarberDetails;
  services_full: BarberService[];
}

export interface IOrderState {
  id: string;
  total: number;
  subtotal: number;
  discount: number;
  date: Date | null;
  paymentFee: number;
  barber: IBarber | null;
  services: IService[];
  notes: string | null;
  clearOrder: () => void;
  startTime: string | null;
  clearServices: () => void;
  calculateTotals: () => void;
  promotionCode: string | null;
  paymentMethod: string | null;
  setBarber: (barber: IBarber) => void;
  setNotes: (notes: string) => void;
  setPaymentMethod: (method: string) => void;
  toggleService: (service: IService) => void;
  setPromotionCode: (code: string | null) => void;
  setDateTime: (date: Date, startTime: string) => void;
}

export interface IUserData extends User {
  role: string;
  name: string;
  city: string;
  state: string;
  email: string;
  phone: string;
  street: string;
  auth_id: string;
  country: string;
  biography: string;
  is_verified: true;
  created_at: string;
  avatar_url: string;
  birth_date: string;
  updated_at: string;
  postal_code: string;
  neighborhood: string;
  password_hash: string;
}

export interface BarberResponse {
  barber_id: string;
  barber_name: string;
  total_price: number;
  barber_rating: number;
  barber_email: string | null;
  barber_phone: string | null;
  services_info: BarberService[];
  barber_description: string | null;
  barber_avatar_url: string | null;
}

export interface UseBarbersResult {
  loading: boolean;
  barbers: IBarber[];
  error: string | null;
  refetch: () => Promise<void>;
}

export interface IOrder {
  id: string;
  date: Date;
  notes: null;
  status: string;
  end_time: string;
  client_id: string;
  barber_id: string;
  start_time: string;
  created_at: string;
  updated_at: string;
  barber_name: string;
  service_name: string;
  final_amount: number;
  promotion_id: string;
  discount_amount: number;
  services: [
    {
      service_id: string;
      service_name: string;
      service_icon: string;
      service_price: number;
      service_duration: number;
    }
  ];
  barber: {
    id: string;
    name: string;
  };
  isCompleted: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success: boolean;
}
