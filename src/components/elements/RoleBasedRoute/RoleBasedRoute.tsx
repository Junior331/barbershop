import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loading } from "../Loading";

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
  redirectTo?: string;
  fallbackPath?: string;
}

export const RoleBasedRoute = ({
  children,
  allowedRoles,
  redirectTo = "/signin",
  fallbackPath = "/"
}: RoleBasedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Verificar se o usuário tem um dos papéis permitidos
  const hasPermission = allowedRoles.includes(user.role!);

  if (!hasPermission) {
    // Redirecionar baseado no papel do usuário
    const roleBasedRedirect = getRoleBasedRedirect(user.role!);
    return <Navigate to={roleBasedRedirect || fallbackPath} replace />;
  }

  return <>{children}</>;
};

// Função para obter redirecionamento baseado no papel
function getRoleBasedRedirect(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'BARBER':
      return '/barber';
    case 'CLIENT':
      return '/';
    default:
      return '/';
  }
}