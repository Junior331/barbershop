import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { schema } from "./schema";
import { useApi } from "@/hooks/useApi";
import { ApiError } from "@/utils/types";

export const useSignin = () => {
  const navigate = useNavigate();
  const { apiCall, setToken, loading, error } = useApi();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      console.log(`values ::`, values)
      try {
        const data = await apiCall("/auth/login", "POST", {
          email: values.email,
          password: values.password,
        });

        if (data.accessToken) {
          setToken(data.accessToken);

          toast.success("Login realizado com sucesso!");
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
