import { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabase";
import { PUBLIC_ROUTES } from "@/utils/emptys";
import { useAuth } from "@/context/AuthContext";

export const useAuthListener = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isPublicRoute = useMemo(
      () => PUBLIC_ROUTES.some((route) => pathname.startsWith(route)),
      [pathname]
    );
    
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setAuth(session.user);
        if (isPublicRoute) {
          navigate("/");
        }
      } else {
        setAuth(null);
        // Só redireciona se estiver em rota privada
        if (!isPublicRoute) {
          navigate("/");
        }
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
};
