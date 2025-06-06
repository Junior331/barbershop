import { useState } from "react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { schema } from "./schema";
import { supabase } from "@/lib/supabase";

export const useSignin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      setLoading(true);

      try {
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) throw error;

        // Verificar se o usuário está na tabela public.users
        const { data: publicUser, error: publicUserError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user?.id)
          .single();

        if (publicUserError || !publicUser) {
          await supabase.auth.signOut();
          throw new Error('Perfil de usuário não encontrado');
        }

        toast.success("Login realizado com sucesso!");
        
        // Redirecionar baseado no role
        if (publicUser.role === 'admin' || publicUser.role === 'barber') {
          navigate('/barber/dashboard');
        } else {
          navigate('/');
        }

      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erro ao fazer login. Verifique suas credenciais.";

        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
  });

  return {
    formik,
    loading,
    setLoading,
  };
};