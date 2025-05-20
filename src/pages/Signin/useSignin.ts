import { useState } from "react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { supabase } from "@/lib/supabase";
import { schema } from "./schema";

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
        const { error: supabaseError } = await supabase.auth.signInWithPassword(
          {
            email: values.email,
            password: values.password,
          }
        );

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        toast.success("Login realizado com sucesso!");
        navigate("/");
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
