/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { schema } from "./schema";

export const useSignup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShowPassword, setIsShowPassword] = useState(false);
  const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);
  
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
        // Registrar no backend
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: values.name,
              email: values.email,
              password: values.password,
              provider: "LOCAL",
            }),
          }
        );

        const data = await response.json();

        if (response.status === 201) {
          // Salva o token no cookie
          document.cookie = `accessToken=${data.accessToken}; path=/; secure; SameSite=Strict`;

          toast.success("Usuário cadastrado com sucesso!");
          navigate("/signin");
        } else {
          throw new Error(data.message || "Erro ao registrar usuário");
        }
      } catch (error: any) {
        console.log("error signup :", error);
        toast.error(error.message || "Erro ao realizar o cadastro.");
        setError(error.message);
      } finally {
        setLoading(false);
      }
    },
  });

  return {
    error,
    formik,
    loading,
    isShowPassword,
    setIsShowPassword,
    isShowConfirmPassword,
    setIsShowConfirmPassword,
  };
};
