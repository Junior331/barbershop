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
  role: "barber" | "admin";
  name: string;
  services: string[];
  email: string | null;
  phone: string | null;
  total_price?: number;
  avatar_url: string | null;
  barber_details: BarberDetails;
  services_full: BarberService[];
}

export interface IOrderState {
  date: Date | null;
  time: string | null;
  services: IService[];
  barber: IBarber | null;
  clearOrder: () => void;
  clearServices: () => void;
  toggleService: (service: IService) => void;
  setBarber: (barber: IBarber) => void;
  setDateTime: (date: Date | null, time: string | null) => void;
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
