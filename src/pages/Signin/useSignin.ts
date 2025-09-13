import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { schema } from "./schema";
import { useApi } from "@/hooks/useApi";
import { ApiError } from "@/utils/types";
import { useAuth } from "@/context/AuthContext";
import { logger } from "@/utils/logger";

export const useSignin = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const { apiCall, loading, error, setToken } = useApi();

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

        if (data.accessToken && data.user) {
          // Salvar token nos cookies via setToken
          setToken(data.accessToken);
          
          // Definir autenticação (dados do usuário também vão para cookies)
          setAuth(data.user, data.accessToken);
          
          logger.auth('Login realizado com sucesso via API customizada');
          toast.success("Login realizado com sucesso!");
          navigate("/");
        } else {
          toast.error("Resposta da API inválida");
        }
      } catch (error: unknown) {
        const apiError = error as ApiError;
        toast.error(
          apiError.message || "Erro ao fazer login. Verifique suas credenciais."
        );
        logger.error('Erro no processo de login:', error);
      }
    },
  });

  return {
    error,
    formik,
    loading,
  };
};
