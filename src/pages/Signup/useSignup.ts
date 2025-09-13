import { useState } from "react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { schema } from "./schema";
import { useApi } from "@/hooks/useApi";
import { ApiError } from "@/utils/types";
import { logger } from "@/utils/logger";

export const useSignup = () => {
  const navigate = useNavigate();
  const { apiCall, loading } = useApi();
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
        toast.error("As senhas não coincidem!");
        return;
      }

      try {
        await apiCall("/auth/register", "POST", {
          name: values.name,
          email: values.email,
          password: values.password,
          provider: "LOCAL",
        });

        logger.auth('Signup realizado com sucesso via API customizada');
        toast.success("Usuário registrado com sucesso!");
        navigate("/signin");
      } catch (error: unknown) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Erro ao realizar o cadastro.");
        logger.error('Erro no processo de signup:', error);
      }
    },
  });

  return {
    formik,
    loading,
    isShowPassword,
    setIsShowPassword,
    isShowConfirmPassword,
    setIsShowConfirmPassword,
  };
};
