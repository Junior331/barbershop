import { User } from "@supabase/supabase-js";
import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

export interface AccountHeaderProps {
  title?: string;
  imageSrc: string;
  imageAlt: string;
  subtitle?: string;
  children?: ReactNode;
}

export interface AccountItem {
  id: number;
  alt: string;
  icon: string;
  title: string;
  path?: string;
  subtitle: string;
  children: ReactNode;
  handleAction?: () => void;
}

export interface AccountItems {
  setAuth: (user: User | null) => void;
  navigate: ReturnType<typeof useNavigate>;
}
