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
              email: values.email,
            },
          },
        });
        
        if (signUpError) {
          if (signUpError.message.includes("User already registered")) {
            setError("Este e-mail já está cadastrado");
          } else {
            setError(signUpError.message);
          }
          setLoading(false);
          return;
        }

        if (signUpError) {
          throw signUpError;
        }

        toast.success("Usuário cadastrado com sucesso!");

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