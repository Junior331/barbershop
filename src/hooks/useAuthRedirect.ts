import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { PUBLIC_ROUTES } from "../utils/emptys";

export const useAuthRedirect = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [isLoading, setIsLoading] = useState(true);
  const isPublicRoute = useMemo(
    () => PUBLIC_ROUTES.some((route) => pathname.startsWith(route)),
    [pathname]
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        if (isPublicRoute) {
          navigate("/");
        }
      } else {
        setAuth(null);
        if (!isPublicRoute) {
          navigate("/signin");
        }
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();

      const { data: customUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.session?.user.id)
        .single();

      setAuth(customUser);

      if (!data.session && !isPublicRoute) {
        navigate("/signin");
      }
      setIsLoading(false);
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isLoading };
};
