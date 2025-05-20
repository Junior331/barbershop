import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { supabase } from "./lib/supabase";
import { Loading } from "./components/elements";
import { useAuth } from "./context/AuthContext";
import { PUBLIC_ROUTES } from "./utils/emptys";

export const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [isLoading, setIsLoading] = useState(true);
    const isPublicRoute = useMemo(
        () => PUBLIC_ROUTES.some((route) => pathname.startsWith(route)),
        [pathname]
      );

      console.log(`pathname ::`, pathname)
      console.log(`isPublicRoute ::`, isPublicRoute)

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
        if (!isPublicRoute) {
          navigate("/");
        }
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (isLoading) {
    return (
      <Loading />
    );
  }

  return <>{children}</>;
};
