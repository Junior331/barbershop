import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { PUBLIC_ROUTES } from "../utils/emptys";

export const useAuthRedirect = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentPath = window.location.pathname;
      const isCurrentPublic = PUBLIC_ROUTES.some((route) => currentPath.startsWith(route));

      if (session) {
        if (isCurrentPublic) {
          navigate("/", { replace: true });
        }
      } else {
        setAuth(null);
        if (!isCurrentPublic) {
          navigate("/signin", { replace: true });
        }
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();

      const { data: customUser } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.session?.user.id)
        .single();

      setAuth(customUser);

      const currentPath = window.location.pathname;
      const isCurrentPublic = PUBLIC_ROUTES.some((route) => currentPath.startsWith(route));

      if (!data.session && !isCurrentPublic) {
        navigate("/signin", { replace: true });
      }
      setIsLoading(false);
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isLoading };
};
