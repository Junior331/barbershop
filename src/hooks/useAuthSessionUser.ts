import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { PUBLIC_ROUTES } from "@/utils/emptys";

export const useAuthSessionUser = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [isLoading, setIsLoading] = useState(true);

  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const authUser = session.user;

        const { data: customUser, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", authUser.id)
          .single();

          console.log("customUser ::", customUser)

        if (error) {
          console.error("Erro ao buscar dados adicionais:", error.message);
        }

        setAuth({
          ...authUser,
          ...customUser,
        });

        if (isPublicRoute) navigate("/");
      } else {
        setAuth(null);
        if (!isPublicRoute) navigate("/signin");
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session && !isPublicRoute) {
        navigate("/signin");
      }

      setIsLoading(false);
    };

    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isLoading };
};
