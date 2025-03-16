import { ReactNode } from "react";

export interface AccountHeaderProps {
  title: string;
  imageSrc: string;
  imageAlt: string;
  subtitle: string;
  children: ReactNode;
}
