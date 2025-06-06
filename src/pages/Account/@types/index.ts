import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { IUserData } from "@/utils/types";

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
  setAuth: (user: IUserData | null) => void;
  navigate: ReturnType<typeof useNavigate>;
}
