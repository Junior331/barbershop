import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { PUBLIC_ROUTES } from "@/utils/emptys";

export const useAuthSessionUser = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  useEffect(() => {
    if (!isLoading) {
      if (user && isPublicRoute) {
        navigate("/");
      } else if (!user && !isPublicRoute) {
        navigate("/signin");
      }
    }
  }, [user, isLoading, isPublicRoute, navigate, pathname]);

  return { isLoading };
};
