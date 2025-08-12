import { useState } from "react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { schema } from "./schema";
import { useApi } from "@/hooks/useApi";
import { ApiError } from "@/utils/types";

export const useSignup = () => {
  const navigate = useNavigate();
  const { apiCall, loading, setToken } = useApi();
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
        return;
      }

      try {
        const data = await apiCall("/auth/register", "POST", {
          name: values.name,
          email: values.email,
          password: values.password,
          provider: "LOCAL",
        });

        if (data.accessToken) {
          setToken(data.accessToken);
          toast.success("Usuário registrado com sucesso!");
          navigate("/signin");
        }
      } catch (error: unknown) {
        const apiError = error as ApiError;
        toast.error(apiError.message || "Erro ao realizar o cadastro.");
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
