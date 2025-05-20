import { supabase } from "@/lib/supabase";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/signup");
      return;
    }

    // Verifica periodicamente se o usuário confirmou o e-mail
    const interval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.confirmed_at) {
        clearInterval(interval);
        navigate("/signin");
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [email, navigate]);

  return (
    <div className="flex flex-col items-center justify-center p-5">
      <h2 className="text-2xl font-bold mb-4">Verifique seu e-mail</h2>
      <p className="mb-4">
        Enviamos um link de confirmação para <strong>{email}</strong>
      </p>
      <p>Por favor, verifique sua caixa de entrada e clique no link para confirmar seu e-mail.</p>
    </div>
  );
};