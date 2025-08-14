import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { schema } from "./schema";
import { useApi } from "@/hooks/useApi";
import { ApiError } from "@/utils/types";
import { useAuth } from "@/context/AuthContext";

export const useSignin = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const { apiCall, setToken, loading, error } = useApi();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      try {
        const data = await apiCall("/auth/login", "POST", {
          email: values.email,
          password: values.password,
        });

        if (data.accessToken) {
          setToken(data.accessToken);
          setAuth(data.user);
          navigate("/");
        }
      } catch (error: unknown) {
        const apiError = error as ApiError;
        toast.error(
          apiError.message || "Erro ao fazer login. Verifique suas credenciais."
        );
      }
    },
  });

  return {
    error,
    formik,
    loading,
  };
};
