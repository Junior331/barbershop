import { useState } from "react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { schema } from "./schema";
import { supabase } from "@/lib/supabase";

export const useSignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      if (values.password !== values.confirmPassword) {
        setError("As senhas não coincidem");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { error: signUpError } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              name: values.name,
            },
            emailRedirectTo: `${window.location.origin}/signin`,
          },
        });

        if (signUpError) throw signUpError;

        const { error: rpcError } = await supabase
          .rpc('register_user_with_role', {
            name: values.name,
            email: values.email,
            password: values.password,
            role: 'client'
          });

        if (rpcError) throw rpcError;

        toast.success("Usuário cadastrado com sucesso! Verifique seu e-mail para confirmação.");
        navigate("/signin");
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Erro ao realizar o cadastrado.";

        toast.error(errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
  });

  return {
    error,
    formik,
    loading,
  };
};