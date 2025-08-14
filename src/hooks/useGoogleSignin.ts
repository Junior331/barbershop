import { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabase";

// useGoogleSignin.ts
export const useGoogleSignin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const signInWithGoogle = async () => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Verifica periodicamente se o usuário está logado (para o caso do OAuth)
      const checkUser = setInterval(async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          clearInterval(checkUser);

          // Verifica se o usuário já existe na tabela users
          const { data: userData } = await supabase
            .from("users")
            .select("*")
            .eq("email", user.email)
            .single();

          // Se não existir, cria o registro com os dados do Google
          if (!userData && user) {
            await supabase.from("users").upsert({
              email: user.email,
              name: user.user_metadata?.full_name || "",
              avatarUrl: user.user_metadata?.avatar_url || "",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              // Outros campos do Google podem ser adicionados aqui
            });
          }

          navigate("/");
        }
      }, 500);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao fazer login com Google. Tente novamente.";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    signInWithGoogle,
    loading,
  };
};
