import { ReactNode } from "react";

import { AuthProvider } from "@/context/AuthContext";

export const Provider = ({ children }: { children: ReactNode }) => {
  return <AuthProvider>{children}</AuthProvider>;
};
